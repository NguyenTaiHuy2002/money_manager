import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Calendar, 
  Users, 
  Camera, 
  Save, 
  ChevronLeft, 
  Loader2,
  CheckCircle2,
  Link as LinkIcon
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    birthday: '',
    gender: 'other',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        birthday: user.user_metadata?.birthday || '',
        gender: user.user_metadata?.gender || 'other',
        avatarUrl: user.user_metadata?.avatar_url || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          birthday: formData.birthday,
          gender: formData.gender,
          avatar_url: formData.avatarUrl
        }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 selection:bg-indigo-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 lg:p-12">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center overflow-hidden shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-zinc-800">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Hồ sơ cá nhân</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Quản lý các thông tin cơ bản</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Ngày sinh</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Giới tính</label>
              <div className="flex gap-4 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.gender === g 
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Ảnh đại diện (URL)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-4">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                  }`}
                >
                  {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {message.text}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
