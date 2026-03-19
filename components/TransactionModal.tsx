"use client";
import { useState, useEffect } from "react";
import { X, Calendar, CreditCard, Banknote } from "lucide-react";

// DİKKAT: Supabase importunu kaldırdık!

export type TType = "income" | "expense" | "receivable" | "debt";
export type TMethod = "cash" | "card";

export interface Transaction {
  id: string;
  type: TType;
  amount: number;
  description: string;
  created_at: string;
  payment_method: TMethod;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TType;
  onSuccess: () => void;
  editData?: Transaction | null; 
}

export default function TransactionModal({ isOpen, onClose, type, onSuccess, editData }: ModalProps) {
  const [currentType, setCurrentType] = useState<TType>(type);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<TMethod>("cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (editData) {
          setAmount(editData.amount.toString());
          setDescription(editData.description);
          setDate(new Date(editData.created_at).toISOString().split('T')[0]);
          setMethod(editData.payment_method || "cash");
          setCurrentType(editData.type);
        } else {
          setAmount("");
          setDescription("");
          setDate(new Date().toISOString().split('T')[0]);
          setMethod("cash");
          setCurrentType(type);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editData, type]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!amount || !description) return alert("Lütfen miktar ve açıklama alanlarını eksiksiz doldurunuz.");
    
    setLoading(true);
    
    const payload = { 
      type: currentType, 
      amount: parseFloat(amount), 
      description, 
      created_at: date + "T12:00:00", // Sıralama bozulmasın diye saat ekledik
      payment_method: method 
    };

    // LOCALSTORAGE KAYIT MANTIĞI
    const rawData = localStorage.getItem("sandbox_transactions");
    let existingTransactions: Transaction[] = rawData ? JSON.parse(rawData) : [];

    if (editData) {
      // Güncelleme
      existingTransactions = existingTransactions.map(t => 
        t.id === editData.id ? { ...t, ...payload } : t
      );
    } else {
      // Yeni Ekleme (Sahte ID oluşturarak)
      const newTransaction: Transaction = {
        id: "local_" + Date.now().toString(),
        ...payload
      };
      existingTransactions.push(newTransaction);
    }

    localStorage.setItem("sandbox_transactions", JSON.stringify(existingTransactions));

    setLoading(false);
    onSuccess(); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
            {(["income", "expense", "receivable", "debt"] as TType[]).map((t) => (
              <button 
                key={t} 
                onClick={() => setCurrentType(t)}
                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${currentType === t ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                {t === 'income' ? 'Gelir' : t === 'expense' ? 'Gider' : t === 'receivable' ? 'Alacak' : 'Borç'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
            <button onClick={() => setMethod("cash")} className={`flex-1 py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all ${method === 'cash' ? 'bg-white shadow-sm border border-gray-100' : 'opacity-30'}`}><Banknote size={14}/> NAKİT</button>
            <button onClick={() => setMethod("card")} className={`flex-1 py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all ${method === 'card' ? 'bg-white shadow-sm border border-gray-100' : 'opacity-30'}`}><CreditCard size={14}/> KART</button>
          </div>
          <div className="space-y-1">
             <label className="text-[9px] font-bold text-gray-400 ml-1 uppercase">İşlem Tarihi</label>
             <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-black" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <input type="number" placeholder="Miktar" className="w-full p-5 bg-gray-50 rounded-2xl border-none text-3xl font-black text-black" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input type="text" placeholder="Açıklama" className="w-full p-5 bg-gray-50 rounded-2xl border-none font-bold text-black" value={description} onChange={(e) => setDescription(e.target.value)} />
          
          <button onClick={handleSave} disabled={loading} className="w-full py-5 rounded-[24px] bg-black text-white font-black shadow-xl active:scale-95 transition-all mt-2">
            {loading ? "İŞLENİYOR..." : "KAYDET"}
          </button>
          <button onClick={onClose} className="w-full text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2 hover:text-red-400">Vazgeç</button>
        </div>
      </div>
    </div>
  );
}