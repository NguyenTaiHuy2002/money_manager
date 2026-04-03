import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  PieChart, 
  Target, 
  Wallet,
  CheckCircle2,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      title: "Theo dõi chi tiêu",
      description: "Ghi chép giao dịch nhanh chóng với gợi ý thông minh dựa trên thói quen của bạn."
    },
    {
      icon: <PieChart className="w-6 h-6 text-blue-500" />,
      title: "Phân tích thông minh",
      description: "Biểu đồ trực quan giúp bạn hiểu rõ dòng tiền và các danh mục chi tiêu chính."
    },
    {
      icon: <Target className="w-6 h-6 text-purple-500" />,
      title: "Mục tiêu tài chính",
      description: "Thiết lập và theo dõi tiến độ tiết kiệm cho những dự định quan trọng trong tương lai."
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      title: "Bảo mật tuyệt đối",
      description: "Dữ liệu của bạn được mã hóa và bảo vệ an toàn với công nghệ mới nhất."
    }
  ];

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SmartFin
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-zinc-500" />
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden py-1 z-50"
                    >
                      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Tài khoản</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <button 
                        onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <User className="w-4 h-4" /> Cập nhật hồ sơ
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 dark:opacity-20 blur-[120px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100 dark:border-indigo-500/20">
              <Zap className="w-3 h-3 fill-current" /> Quản lý tài chính tương lai
            </span>
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 leading-[1.1]">
              Kiến tạo tự do<br />Tài chính của bạn.
            </h1>
            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed font-medium">
              Cách đơn giản nhất để làm chủ đồng tiền, lập kế hoạch chi tiêu và đạt được những cột mốc quan trọng trong cuộc đời.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/40 active:scale-95 group"
              >
                {user ? 'Sử dụng ngay' : 'Bắt đầu miễn phí'} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500 font-bold px-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Trải nghiệm không giới hạn
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tính năng vượt trội</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto underline-offset-4">
              Mọi công cụ bạn cần để quản lý tài chính cá nhân một cách chuyên nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl hover:shadow-zinc-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-indigo-600 p-12 lg:p-20 text-center text-white shadow-2xl shadow-indigo-500/20">
            {/* Shapes */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">Sẵn sàng để tối ưu hóa tài chính?</h2>
              <p className="text-indigo-100 mb-10 text-lg max-w-2xl mx-auto">
                Tham gia cùng hàng nghìn người đã thay đổi cách họ quản lý tiền bạc với SmartFin.
              </p>
              <button 
                onClick={handleStart}
                className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-zinc-100 transition-all shadow-xl active:scale-95"
              >
                Đăng ký ngay bây giờ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Wallet className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-tighter">SmartFin</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">
            © 2026 SmartFin. All rights reserved. Made for professional financial management.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors">Điều khoản</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors">Bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
