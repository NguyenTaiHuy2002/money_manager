import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Target, Plus, Trash2, Edit2, Loader2, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [depositValue, setDepositValue] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      target_amount: parseFloat(formData.target_amount.replace(/\./g, '')),
      current_amount: parseFloat(formData.current_amount.replace(/\./g, '')),
    };

    if (editingId) {
      await api.put(`/goals/${editingId}`, payload);
    } else {
      await api.post('/goals', payload);
    }

    closeModal();
    fetchGoals();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      deadline: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const openEditModal = (g: any) => {
    setEditingId(g.id);
    setFormData({
      name: g.name,
      target_amount: formatAmount(g.target_amount.toString()),
      current_amount: formatAmount(g.current_amount.toString()),
      deadline: g.deadline,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !depositValue) return;
    
    const amount = parseFloat(depositValue.replace(/\./g, ''));
    try {
      await api.post(`/goals/${selectedGoal.id}/deposit`, { amount });
      setShowDepositModal(false);
      setDepositValue('');
      fetchGoals();
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Có lỗi xảy ra khi nạp tiền');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Mục tiêu tài chính</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Quản lý và theo dõi các kế hoạch tiết kiệm của bạn</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none translate-y-0 hover:-translate-y-1 active:translate-y-0"
        >
          <Plus className="w-5 h-5" /> Thêm mục tiêu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {Array.isArray(goals) && goals.map((goal, index) => {
            const target = Number(goal.target_amount) || 0;
            const current = Number(goal.current_amount) || 0;
            const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const remaining = Math.max(0, target - current);
            
            let formattedDeadline = 'N/A';
            try {
              if (goal.deadline) {
                const date = new Date(goal.deadline);
                if (!isNaN(date.getTime())) {
                  formattedDeadline = format(date, 'dd/MM/yyyy');
                }
              }
            } catch (e) {
              console.error('Date format error:', e);
            }

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowDepositModal(true);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nạp tiền
                      </button>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(goal)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-600 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{goal.name || 'Mục tiêu không tên'}</h3>
                  
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {percentage}% hoàn thành
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Hạn: {formattedDeadline}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase font-black tracking-widest">Đã có</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{(current || 0).toLocaleString('vi-VN')}đ</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400 uppercase font-black tracking-widest">Mục tiêu</p>
                        <p className="text-lg font-bold text-indigo-600">{(target || 0).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  </div>

                  {remaining > 0 && (
                    <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Bạn cần thêm <span className="font-bold text-zinc-900 dark:text-white">{remaining.toLocaleString('vi-VN')}đ</span> để đạt được mục tiêu này.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Target className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Chưa có mục tiêu nào</h3>
            <p className="text-zinc-500 mb-8">Hãy bắt đầu lập kế hoạch cho những ước mơ của bạn!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Tạo mục tiêu đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-8">
                {editingId ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu mới'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Tên mục tiêu</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Mua nhà, Tiết kiệm du lịch..."
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Số tiền mục tiêu</label>
                    <input
                      type="text"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: formatAmount(e.target.value) })}
                      placeholder="0"
                      className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Đã có sẵn</label>
                    <input
                      type="text"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({ ...formData, current_amount: formatAmount(e.target.value) })}
                      placeholder="0"
                      className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Hạn chót</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 px-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    {editingId ? 'Cập nhật' : 'Tạo ngay'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Nạp tiền */}
      <AnimatePresence>
        {showDepositModal && selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDepositModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              <div className="mb-6">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">
                  Tích lũy cho mục tiêu
                </h3>
                <p className="text-indigo-600 font-bold">{selectedGoal.name}</p>
              </div>

              <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Số tiền muốn nạp</label>
                  <input
                    type="text"
                    value={depositValue}
                    onChange={(e) => setDepositValue(formatAmount(e.target.value))}
                    placeholder="0"
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-2xl"
                    autoFocus
                    required
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Số tiền này sẽ được trừ vào số dư tổng của bạn và ghi nhận là một khoản tiết kiệm.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 py-4 px-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    Xác nhận nạp
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
