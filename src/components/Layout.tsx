import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Receipt, Tag, Wallet, Target, LogOut, Moon, Sun, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // ... (giữ nguyên theme logic)
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'transactions', label: 'Giao dịch', icon: Receipt, path: '/transactions' },
    { id: 'goals', label: 'Mục tiêu', icon: Target, path: '/goals' },
    { id: 'categories', label: 'Danh mục', icon: Tag, path: '/categories' },
    { id: 'budget', label: 'Ngân sách', icon: Wallet, path: '/budget' },
    { id: 'profile', label: 'Hồ sơ', icon: User, path: '/profile' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-y-auto">
        <Link to="/" className="p-6 block hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">SmartFin</h1>
        </Link>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-zinc-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
