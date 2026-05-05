import React, { useState, useRef, useEffect } from "react";
import { Send, TrendingUp, Flame } from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";

interface FinancePageProps {
  user: UserProfile;
}

interface Transaction {
  id: string;
  raw: string;
  income: number;
  expense: number;
  profit: number;
  margin: number;
  timestamp: string;
}

interface FinanceMessage {
  role: "user" | "system";
  content: string;
  transaction?: Transaction;
}

const parseTransaction = (text: string): Transaction | null => {
  const incomeMatch = text.match(/(\d+)\s*porsi.*?@\s*Rp?\s*(\d+(?:\.\d+)?(?:rb|ribu)?)/i);
  const expenseMatch = text.match(/[Bb]elanja.*?Rp?\s*(\d+(?:\.\d+)?(?:rb|ribu)?)/i);

  if (!incomeMatch && !expenseMatch) return null;

  const parseNum = (s: string) => {
    const n = s.replace(/\./g, "").replace(/rb|ribu/i, "000");
    return parseInt(n, 10) || 0;
  };

  const qty = incomeMatch ? parseInt(incomeMatch[1], 10) : 1;
  const price = incomeMatch ? parseNum(incomeMatch[2]) : 0;
  const income = qty * price;
  const expense = expenseMatch ? parseNum(expenseMatch[1]) : 0;
  const profit = income - expense;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

  return {
    id: Date.now().toString(),
    raw: text,
    income,
    expense,
    profit,
    margin,
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
};

const fmtRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const FinancePage: React.FC<FinancePageProps> = ({ user }) => {
  const [messages, setMessages] = useState<FinanceMessage[]>([
    {
      role: "system",
      content: `Halo ${user.name}! 💰 Ceritakan transaksi harianmu, misalnya:\n\n"Hari ini jual 20 porsi nasi @25rb. Belanja bahan 180rb."`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(12);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalIncome = messages
    .filter((m) => m.transaction)
    .reduce((sum, m) => sum + (m.transaction?.income ?? 0), 0);
  const totalExpense = messages
    .filter((m) => m.transaction)
    .reduce((sum, m) => sum + (m.transaction?.expense ?? 0), 0);
  const totalProfit = totalIncome - totalExpense;

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: FinanceMessage = { role: "user", content: text };
    const tx = parseTransaction(text);

    const reply: FinanceMessage = tx
      ? {
          role: "system",
          content: `Dicatat! ✅`,
          transaction: tx,
        }
      : {
          role: "system",
          content: `Hmm, aku belum bisa baca transaksi ini. Coba format seperti:\n"Jual 10 porsi @25rb, belanja bahan 80rb"`,
        };

    setMessages((prev) => [...prev, userMsg, reply]);
    if (tx) setStreak((s) => s + 1);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg">
            💰
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-xl">Financial Record</h2>
            <p className="text-gray-500 text-sm">Catat keuangan via chat, auto laporan bank</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-[10px] text-green-600 font-bold uppercase mb-1">Pemasukan</p>
            <p className="font-black text-green-700 text-sm">{fmtRp(totalIncome)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-[10px] text-red-600 font-bold uppercase mb-1">Pengeluaran</p>
            <p className="font-black text-red-700 text-sm">{fmtRp(totalExpense)}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Laba</p>
            <p className="font-black text-amber-700 text-sm">{fmtRp(totalProfit)}</p>
          </div>
        </div>

        {/* Streak */}
        <div className="mt-3 flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <Flame size={18} className="text-orange-500" />
          <p className="text-sm font-bold text-orange-700">
            🔥 Streak <span className="text-orange-500">{streak} hari</span> mencatat!
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col h-80 md:h-96">
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                      : "bg-gray-50 border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {msg.transaction && (
                <div className="mt-2 ml-0 bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Pemasukan</p>
                      <p className="font-black text-green-700">{fmtRp(msg.transaction.income)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bahan baku</p>
                      <p className="font-black text-red-600">{fmtRp(msg.transaction.expense)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Laba kotor</p>
                      <p className="font-black text-amber-700">{fmtRp(msg.transaction.profit)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Margin</p>
                      <p className="font-black text-amber-700">{msg.transaction.margin}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3 p-4 border-t border-amber-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ceritakan transaksi harimu..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white hover:shadow-lg transition-all disabled:opacity-40 shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};