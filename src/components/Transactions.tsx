import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Search, Filter, Trash2, Edit2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatAmount = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (val: string) => {
    setFormData({ ...formData, amount: formatAmount(val) });
  };

  const getSuggestions = () => {
    const rawValue = formData.amount.replace(/\./g, '');
    const num = parseInt(rawValue) || 0;
    if (num === 0) return [];

    let suggestions: number[] = [];
    
    if (num < 1000) {
      // Nếu nhập số nhỏ (vd: 25), gợi ý 25.000, 250.000, 2.500.000
      suggestions = [num * 1000, num * 10000, num * 100000];
    } else {
      // Nếu đã nhập số lớn (vd: 25.000), gợi ý 250.000, 2.500.000, 25.000.000
      suggestions = [num * 10, num * 100, num * 1000];
    }

    return suggestions.slice(0, 3).map(v => v.toString());
  };

  const suggestions = getSuggestions().slice(0, 3);

  useEffect(() => {
    fetchData();
  }, []);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories'),
      ]);
      setTransactions(tRes.data);
      setCategories(cRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount.replace(/\./g, '')),
    };

    if (editingId) {
      await api.put(`/transactions/${editingId}`, payload);
    } else {
      await api.post('/transactions', payload);
    }
    
    closeModal();
    fetchData();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      amount: '',
      type: 'expense',
      category_id: '',
      note: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setFormData({
      amount: formatAmount(t.amount.toString()),
      type: t.type,
      category_id: t.category_id,
      note: t.note || '',
      date: t.date,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    setDeletingId(null);
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Giao dịch</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" /> Thêm giao dịch
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white">Ngày</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white">Danh mục</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white">Ghi chú</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white text-right">Số tiền</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {format(new Date(t.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t.categories?.name || 'Chưa phân loại'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">{t.note || '-'}</td>
                <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')}đ
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="text-zinc-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(t.id)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
              {editingId ? 'Sửa giao dịch' : 'Thêm giao dịch'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Số tiền (VNĐ)</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                    required
                  />
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAmountChange(s)}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        +{formatAmount(s)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Loại</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
                  >
                    <option value="expense">Chi tiêu</option>
                    <option value="income">Thu nhập</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Danh mục</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.filter(c => c.type === formData.type).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ngày</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 text-center">Xác nhận xóa</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-center mb-6">
              Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
