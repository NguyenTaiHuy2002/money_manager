import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Loader2, ArrowRight, ShieldCheck, Mail, Lock, User, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Supabase auto-logs in after signup if email confirm is off
      if (data.session) {
        navigate('/dashboard');
      } else {
        setError("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu có).");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 selection:bg-indigo-500/30 relative overflow-hidden">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all font-bold group z-10"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Trang chủ
      </button>

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] left-[10%] w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-600" />

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl mb-6 border border-emerald-100 dark:border-emerald-500/20">
              <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2 font-vietnam">Đăng ký</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Bắt đầu hành trình tài chính mới</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className={`text-sm font-bold p-4 rounded-xl border ${error.includes("thành công") ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Tạo tài khoản <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <Link 
              to="/login"
              className="text-sm font-bold text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Bạn đã có tài khoản? <span className="text-zinc-900 dark:text-white underline underline-offset-4 ml-1">Đăng nhập ngay</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
