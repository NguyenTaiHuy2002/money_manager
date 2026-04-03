import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Wallet, AlertTriangle, Loader2, Save } from 'lucide-react';

export default function Budget() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const now = new Date();
    const [bRes, iRes] = await Promise.all([
      api.get(`/budgets`),
      api.get(`/insights?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
    ]);
    
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const currentBudget = bRes.data.find((b: any) => b.month === currentMonth && b.year === currentYear) || bRes.data[0];
    
    setBudget(currentBudget);
    if (currentBudget) {
      const val = currentBudget.amount.toString();
      setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    }
    setInsights(iRes.data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    await api.post('/budgets', {
      amount: parseFloat(amount.replace(/\./g, '')),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    </div>
  );

  const spent = insights?.totalExpense || 0;
  const budgetAmount = budget?.amount || 0;
  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
  const isOver = spent > budgetAmount && budgetAmount > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Ngân sách hàng tháng</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Thiết lập ngân sách</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Hạn mức hàng tháng (VNĐ)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
                }}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                placeholder="0"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="w-5 h-5" /> Lưu ngân sách
            </button>
          </form>
        </div>

        {/* Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Đã chi tiêu</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{spent.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Hạn mức ngân sách</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{budgetAmount.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-600 dark:text-zinc-400">Đã dùng {Math.round(percentage)}%</span>
                <span className="text-zinc-600 dark:text-zinc-400">Còn lại {Math.max(0, budgetAmount - spent).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isOver ? 'bg-red-600' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>

            {isOver && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-medium">Cảnh báo: Bạn đã vượt quá ngân sách hàng tháng!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
