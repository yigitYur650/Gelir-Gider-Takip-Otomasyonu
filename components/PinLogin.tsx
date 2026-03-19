"use client";
import { useState, useEffect, useCallback } from "react";
import { Lock, Delete, CheckCircle2, X, HelpCircle, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";

interface PinLoginProps {
  onSuccess: () => void;
  isChangeMode?: boolean;
  onCancel?: () => void;
}

export default function PinLogin({ onSuccess, isChangeMode = false, onCancel }: PinLoginProps) {
  const [pin, setPin] = useState("");
  const [dbPin, setDbPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modlar: 'login', 'setup', 'recovery'
  const [mode, setMode] = useState<'login' | 'setup' | 'recovery'>('login');
  const [changeStep, setChangeStep] = useState<'old' | 'new'>(isChangeMode ? 'old' : 'new');

  // Kurtarma Verileri
  const [recQuestion, setRecQuestion] = useState("");
  const [recAnswer, setRecAnswer] = useState("");
  const [dbAnswer, setDbAnswer] = useState("");
  const [dbQuestion, setDbQuestion] = useState("");

  // 1. VERİ ÇEKME (Cascading Render Hatası Çözüldü)
  const fetchAuthSettings = useCallback(async () => {
    const { data } = await supabase.from("auth_settings").select("*").single();
    
    setTimeout(() => {
      if (data) {
        setDbPin(data.pin);
        setDbAnswer(data.recovery_answer);
        setDbQuestion(data.recovery_question);
        if (!isChangeMode) setMode('login');
      } else {
        setMode('setup');
      }
      setLoading(false);
    }, 0);
  }, [isChangeMode]);

  useEffect(() => {
    fetchAuthSettings();
  }, [fetchAuthSettings]);

  // 2. PIN DOĞRULAMA
  const handleVerifyPin = useCallback((enteredPin: string, correctPin: string) => {
    if (enteredPin === correctPin) {
      if (isChangeMode && changeStep === 'old') {
        // Eski şifre doğru, şimdi yeni kurulum moduna geç
        setPin("");
        setChangeStep('new');
        setMode('setup');
      } else {
        localStorage.setItem("isAuthorized", "true");
        onSuccess();
      }
    } else {
      alert("Hatalı PIN kanka!");
      setPin("");
    }
  }, [onSuccess, isChangeMode, changeStep]);

  // 3. KURULUM (Şifre + Soru + Cevap)
  const handleSetup = async () => {
    if (pin.length < 4 || !recQuestion || !recAnswer) {
      return alert("Tüm alanları doldur kanka, güvenlik şakaya gelmez!");
    }
    
    const { error } = await supabase.from("auth_settings").upsert({ 
      id: 1, 
      pin: pin, 
      recovery_question: recQuestion, 
      recovery_answer: recAnswer.toLowerCase().trim() 
    });

    if (!error) {
      alert(isChangeMode ? "Şifre ve güvenlik sorusu güncellendi!" : "Kurulum tamamlandı!");
      onSuccess();
    } else {
      alert("Bir hata oluştu kanka!");
    }
  };

  // 4. KURTARMA (Gizli Soru ile Şifre Kırma)
  const handleRecovery = () => {
    if (recAnswer.toLowerCase().trim() === dbAnswer.toLowerCase().trim()) {
      alert("Kimlik doğrulandı! Şimdi yeni şifreni belirle.");
      setMode('setup');
      setPin("");
      setRecAnswer("");
      setRecQuestion(""); // Yeni soru belirlemesi için temizliyoruz
    } else {
      alert("Cevap yanlış kanka, kapıyı açamam!");
    }
  };

  // PIN 4 haneye ulaşınca otomatik tetikle
  useEffect(() => {
    if (pin.length === 4 && mode === 'login') {
      const timer = setTimeout(() => {
        if (dbPin) handleVerifyPin(pin, dbPin);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pin, mode, dbPin, handleVerifyPin]);

  if (loading) return <div className="fixed inset-0 bg-[#F2F2F7] z-[100]" />;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F2F2F7] flex flex-col items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-500">
      {onCancel && (
        <button onClick={onCancel} className="absolute top-10 right-10 p-3 bg-white rounded-full shadow-sm text-gray-400">
          <X size={20} />
        </button>
      )}

      <div className="mb-8 text-center w-full max-w-xs">
        <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/10">
          {mode === 'recovery' ? <HelpCircle className="text-blue-400" /> : 
           mode === 'setup' ? <CheckCircle2 className="text-green-400" /> : 
           changeStep === 'old' ? <ShieldAlert className="text-blue-400" /> : <Lock className="text-white" />}
        </div>
        <h2 className="text-2xl font-black italic tracking-tight">
          {mode === 'recovery' ? "Şifre Kurtarma" : 
           mode === 'setup' ? (isChangeMode ? "Yeni PIN Ayarla" : "Dükkanı Kur") : 
           changeStep === 'old' ? "Eski Şifreyi Gir" : "Dükkan Kilidi"}
        </h2>
      </div>

      {mode === 'setup' ? (
        <div className="w-full max-w-xs space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-1 tracking-widest">4 Haneli Yeni PIN</label>
            <input 
              type="number" 
              placeholder="0000" 
              className="w-full p-4 rounded-2xl border-none font-black text-center text-3xl bg-white shadow-sm" 
              value={pin} 
              onChange={(e) => setPin(e.target.value.slice(0,4))} 
            />
          </div>

          <div className="space-y-3 bg-white/50 p-5 rounded-[32px] border border-white/40">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-blue-500 uppercase ml-1 tracking-widest">Kendi Kurtarma Sorun</label>
              <input 
                type="text" 
                placeholder="Örn: İlk makinem neydi?" 
                className="w-full p-3 rounded-xl border-none text-[11px] font-bold bg-white" 
                value={recQuestion} 
                onChange={(e) => setRecQuestion(e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-blue-500 uppercase ml-1 tracking-widest">Cevabı</label>
              <input 
                type="text" 
                placeholder="Gizli cevap..." 
                className="w-full p-4 rounded-2xl border-none font-bold text-sm bg-white" 
                value={recAnswer} 
                onChange={(e) => setRecAnswer(e.target.value)} 
              />
            </div>
          </div>
          
          <button onClick={handleSetup} className="w-full py-5 bg-black text-white rounded-[24px] font-black shadow-xl active:scale-95 transition-all mt-2">
            KAYDET VE KİLİTLE
          </button>
        </div>
      ) : mode === 'recovery' ? (
        <div className="w-full max-w-xs space-y-5 text-center animate-in slide-in-from-bottom-4">
          <div className="p-6 bg-white rounded-[32px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Senin Belirlediğin Soru:</p>
            <p className="text-sm font-bold text-gray-700 italic font-serif">
              &quot;{dbQuestion}&quot;
            </p>
          </div>
          <input 
            type="text" 
            placeholder="Cevabı yazın..." 
            className="w-full p-5 rounded-2xl border-none font-bold text-center bg-white shadow-sm" 
            value={recAnswer} 
            onChange={(e) => setRecAnswer(e.target.value)} 
          />
          <button onClick={handleRecovery} className="w-full py-5 bg-blue-500 text-white rounded-[24px] font-black shadow-xl">
            KİMLİĞİ DOĞRULA
          </button>
          <button onClick={() => setMode('login')} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vazgeç</button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-black transition-all duration-300 ${pin.length >= i ? 'bg-black scale-125 shadow-lg' : 'bg-transparent opacity-10'}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"].map((n, i) => (
              n !== "" ? (
                <button key={i} onClick={() => pin.length < 4 && setPin(p => p + n)} className="w-20 h-20 bg-white rounded-full text-2xl font-black shadow-sm active:bg-black active:text-white transition-all flex items-center justify-center border border-gray-100">{n}</button>
              ) : <div key={i} />
            ))}
            <button onClick={() => setPin(p => p.slice(0, -1))} className="w-20 h-20 flex items-center justify-center text-gray-300 active:text-black transition-all">
              <Delete size={24} />
            </button>
          </div>
          <button onClick={() => setMode('recovery')} className="mt-10 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Şifremi Unuttum</button>
        </>
      )}
    </div>
  );
}