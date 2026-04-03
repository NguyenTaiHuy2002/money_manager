import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Tag, Loader2 } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/categories', { name, type });
    setName('');
    fetchCategories();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Danh mục</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Danh mục mới</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Loại</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500"
              >
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" /> Thêm danh mục
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cat.type === 'income' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{cat.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{cat.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</p>
                </div>
              </div>
              {cat.user_id && (
                <span className="text-xs text-zinc-400">Tùy chỉnh</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
