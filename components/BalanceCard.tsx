// components/BalanceCard.tsx
export default function BalanceCard({ balance }: { balance: number }) {
  return (
    <div className="bg-white p-6 rounded-[28px] shadow-sm mt-6 border border-gray-100 flex flex-col items-center">
      <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">GÜNCEL BAKİYE</span>
      <div className="flex items-baseline mt-2">
        <span className="text-4xl font-extrabold text-black tracking-tighter">
          {balance.toLocaleString('tr-TR')}
        </span>
        <span className="text-2xl font-bold text-gray-400 ml-2">₺</span>
      </div>
    </div>
  )
}