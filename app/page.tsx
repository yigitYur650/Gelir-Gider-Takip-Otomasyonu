"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Filter, Banknote, CreditCard, Calendar, Settings, 
  LogOut, KeyRound, Pencil, Trash2, CheckCircle2, AlertCircle, Search 
} from "lucide-react";
import BalanceCard from "../components/BalanceCard";
import ActionButtons from "../components/ActionButtons";
import TransactionModal, { Transaction, TType } from "../components/TransactionModal";
import PinLogin from "../components/PinLogin";

// DİKKAT: Supabase importunu kaldırdık!

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Veri State'leri
  const [modalType, setModalType] = useState<TType>("income");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balances, setBalances] = useState({ total: 0, cash: 0, card: 0, rec: 0, debt: 0 });
  const [lists, setLists] = useState<{ history: Transaction[], recs: Transaction[], debts: Transaction[] }>({
    history: [], recs: [], debts: []
  });
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);

  // Filtreleme State'leri
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. GİRİŞ KONTROLÜ
  useEffect(() => {
    const auth = localStorage.getItem("isAuthorized");
    const timer = setTimeout(() => {
      setIsAuthorized(auth === "true");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. VERİ ÇEKME FONKSİYONU (LOCALSTORAGE UYARLAMASI)
  const fetchTransactions = useCallback(() => {
    // LocalStorage'dan verileri çek
    const rawData = localStorage.getItem("sandbox_transactions");
    let all: Transaction[] = rawData ? JSON.parse(rawData) : [];
    
    // Tarih filtresi ekleme
    if (startDate) {
      all = all.filter(t => t.created_at >= `${startDate}T00:00:00`);
    }
    if (endDate) {
      all = all.filter(t => t.created_at <= `${endDate}T23:59:59`);
    }

    // Tarihe göre yeniden eskiye sırala
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const history = all.filter(t => t.type === 'income' || t.type === 'expense');
    const recs = all.filter(t => t.type === 'receivable');
    const debts = all.filter(t => t.type === 'debt');

    let t = 0, c = 0, cr = 0, rSum = 0, dSum = 0;
    history.forEach(i => {
      const val = i.type === 'income' ? i.amount : -i.amount;
      t += val; 
      if (i.payment_method === 'cash') c += val; else cr += val;
    });
    recs.forEach(i => rSum += i.amount);
    debts.forEach(i => dSum += i.amount);

    setLists({ history, recs, debts });
    setBalances({ total: t, cash: c, card: cr, rec: rSum, debt: dSum });
  }, [startDate, endDate]);

  useEffect(() => {
    if (isAuthorized) {
      // Çakışmayı önlemek için setTimeout (asenkron yapı) kullanıyoruz
      const timer = setTimeout(() => {
        fetchTransactions();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthorized, fetchTransactions]);

  // 3. YARDIMCI FONKSİYONLAR (LOCALSTORAGE UYARLAMASI)
  const handleLogout = () => {
    localStorage.removeItem("isAuthorized");
    setIsAuthorized(false);
    setIsSettingsOpen(false);
  };

  const handleQuickTransition = (id: string, newType: TType) => {
    const rawData = localStorage.getItem("sandbox_transactions");
    let all: Transaction[] = rawData ? JSON.parse(rawData) : [];
    
    all = all.map(t => t.id === id ? { ...t, type: newType } : t);
    localStorage.setItem("sandbox_transactions", JSON.stringify(all));
    fetchTransactions();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu işlemi kalıcı olarak silmek istediğinize emin misiniz?")) {
      const rawData = localStorage.getItem("sandbox_transactions");
      let all: Transaction[] = rawData ? JSON.parse(rawData) : [];
      
      all = all.filter(t => t.id !== id);
      localStorage.setItem("sandbox_transactions", JSON.stringify(all));
      fetchTransactions();
    }
  };

  // ARAMA VE LİMİT MANTIĞI
  const filteredHistory = lists.history.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedHistory = searchTerm ? filteredHistory : filteredHistory.slice(0, 30);

  if (isAuthorized === null) return <div className="min-h-screen bg-[#F2F2F7]" />;
  if (!isAuthorized) return <PinLogin onSuccess={() => setIsAuthorized(true)} />;

  return (
    <main className="p-6 max-w-md mx-auto min-h-screen bg-[#F2F2F7] pb-24 relative">
      {/* HEADER */}
      <header className="pt-10 pb-6 flex justify-between items-center px-2">
        <h1 className="text-3xl font-black text-black italic tracking-tighter">Cüzdanım <span className="text-[10px] text-red-500 block not-italic">TEST ORTAMI</span></h1>
        <div className="flex gap-2 relative">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 active:scale-90 transition-all"
          >
            <Settings size={20} />
          </button>
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-[10px] border-2 border-white shadow-lg uppercase">YG</div>

          {isSettingsOpen && (
            <div className="absolute right-0 top-12 z-50 bg-white rounded-3xl shadow-2xl p-2 border border-gray-50 w-48 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => { setIsChangingPin(true); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 transition-colors">
                <KeyRound size={18} className="text-blue-500" /> Şifre Değiştir
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 hover:bg-red-50 rounded-2xl text-sm font-bold text-red-500 transition-colors">
                <LogOut size={18} /> Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </header>

      {isChangingPin && <PinLogin onSuccess={() => setIsChangingPin(false)} isChangeMode={true} onCancel={() => setIsChangingPin(false)} />}

      {/* BAKİYE KARTI */}
      <BalanceCard balance={balances.total} />
      
      {/* KASA & BANKA ÖZETİ */}
      <div className="grid grid-cols-2 gap-3 mt-3 px-1">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-white text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1 text-green-500">
            <Banknote size={12} />
            <p className="text-[8px] font-black text-gray-400 uppercase">KASA</p>
          </div>
          <p className="font-black text-sm">{balances.cash.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-white text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1 text-blue-500">
            <CreditCard size={12} />
            <p className="text-[8px] font-black text-gray-400 uppercase">BANKA</p>
          </div>
          <p className="font-black text-sm">{balances.card.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      <ActionButtons onOpenModal={(t) => { setModalType(t); setEditingItem(null); setIsModalOpen(true); }} />

      {/* 📅 TARİH FİLTRELEME */}
      <section className="mt-8 bg-white/50 p-4 rounded-3xl border border-white/40">
        <div className="flex items-center justify-between mb-3 px-1">
           <div className="flex items-center gap-2">
             <Filter size={12} className="text-gray-400" />
             <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filtrele</h3>
           </div>
           {(startDate || endDate) && (
             <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-[9px] font-black text-blue-500 uppercase">Sıfırla</button>
           )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="bg-white p-3 rounded-xl border-none text-[10px] font-bold text-black uppercase shadow-sm outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="bg-white p-3 rounded-xl border-none text-[10px] font-bold text-black uppercase shadow-sm outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </section>

      {/* ALACAKLAR VE BORÇLAR ÖZETİ */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <section>
          <h2 className="text-[10px] font-black text-blue-500 uppercase mb-3 px-1 flex items-center gap-1 tracking-tighter">
            <AlertCircle size={10} /> ALACAKLAR ({balances.rec.toLocaleString()}₺)
          </h2>
          <div className="space-y-2">
            {lists.recs.map((r) => (
              <div key={r.id} className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex justify-between items-center group">
                <div onClick={() => { setEditingItem(r); setIsModalOpen(true); }} className="flex-1 cursor-pointer">
                  <p className="text-[11px] font-bold text-blue-900 leading-none truncate w-24">{r.description}</p>
                  <p className="text-[8px] font-bold text-blue-300 mt-1">{r.amount}₺</p>
                </div>
                <button onClick={() => handleQuickTransition(r.id, 'income')} className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg active:scale-90 transition-all">
                  <CheckCircle2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-purple-500 uppercase mb-3 px-1 flex items-center gap-1 tracking-tighter">
             <AlertCircle size={10} /> BORÇLAR ({balances.debt.toLocaleString()}₺)
          </h2>
          <div className="space-y-2">
            {lists.debts.map((d) => (
              <div key={d.id} className="bg-purple-50 p-3 rounded-2xl border border-purple-100 flex justify-between items-center group">
                <div onClick={() => { setEditingItem(d); setIsModalOpen(true); }} className="flex-1 cursor-pointer">
                  <p className="text-[11px] font-bold text-purple-900 leading-none truncate w-24">{d.description}</p>
                  <p className="text-[8px] font-bold text-purple-300 mt-1">{d.amount}₺</p>
                </div>
                <button onClick={() => handleQuickTransition(d.id, 'expense')} className="p-1.5 bg-purple-500 text-white rounded-full shadow-lg active:scale-90 transition-all">
                  <CheckCircle2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 📜 İŞLEM GEÇMİŞİ VE ARAMA ÇUBUĞU */}
      <div className="mt-10">
        
        <div className="relative mb-6 px-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="İşlem açıklaması ara..." 
            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">SON İŞLEMLER</h2>
        <div className="space-y-3">
          {displayedHistory.length > 0 ? (
            displayedHistory.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-3xl shadow-sm flex justify-between items-center group border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${t.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                    {t.payment_method === 'card' ? <CreditCard size={20} /> : <Banknote size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-[13px] leading-tight">{t.description}</span>
                    <div className="flex items-center gap-1 mt-1 text-gray-400">
                      <Calendar size={10} />
                      <span className="text-[9px] font-semibold">{new Date(t.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-black tracking-tighter ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('tr-TR')} ₺
                    </span>
                    <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem(t); setIsModalOpen(true); }} className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-300 text-[10px] font-bold italic uppercase tracking-widest border border-dashed border-gray-200 rounded-[30px]">
              {searchTerm ? "Aradığınız kriterde işlem bulunamadı." : "Henüz işlem kaydı bulunmuyor."}
            </div>
          )}
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        type={modalType} 
        onSuccess={fetchTransactions} 
        editData={editingItem} 
      />
    </main>
  );
}