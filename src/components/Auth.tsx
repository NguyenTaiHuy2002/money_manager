import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Auth error:", error);
      let msg = error.message;
      if (msg.includes("Email not confirmed")) {
        msg = "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  const isConfigMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 selection:bg-indigo-500/30">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" />

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl mb-6 border border-indigo-100 dark:border-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">SmartFin</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              {isLogin ? 'Vui lòng đăng nhập vào tài khoản của bạn' : 'Tham gia cộng đồng quản lý tài chính ngay'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || isConfigMissing}
              className={`w-full py-4 ${isLogin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/25 active:scale-[0.98] mt-2`}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isLogin ? (
                <>
                  Đăng nhập <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Đăng ký ngay <UserPlus className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-sm font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isLogin ? (
                <span>Bạn chưa có tài khoản? <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 ml-1">Đăng ký tham gia</span></span>
              ) : (
                <span>Bạn đã có tài khoản? <span className="text-zinc-900 dark:text-white underline underline-offset-4 ml-1">Đăng nhập tại đây</span></span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
