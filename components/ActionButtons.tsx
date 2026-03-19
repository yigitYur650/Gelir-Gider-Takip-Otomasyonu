"use client";
import { Plus, Minus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface ActionProps {
  onOpenModal: (type: "income" | "expense" | "receivable" | "debt") => void;
}

export default function ActionButtons({ onOpenModal }: ActionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-8">
      <button onClick={() => onOpenModal("income")} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Plus size={20} /></div>
        <span className="text-xs font-black text-gray-800">GELİR</span>
      </button>

      <button onClick={() => onOpenModal("expense")} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><Minus size={20} /></div>
        <span className="text-xs font-black text-gray-800">GİDER</span>
      </button>

      <button onClick={() => onOpenModal("receivable")} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><ArrowUpRight size={20} /></div>
        <span className="text-xs font-black text-gray-800">ALACAK</span>
      </button>

      <button onClick={() => onOpenModal("debt")} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><ArrowDownLeft size={20} /></div>
        <span className="text-xs font-black text-gray-800">BORÇ</span>
      </button>
    </div>
  );
}