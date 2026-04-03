import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, Loader2, 
  ArrowRight, Target, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    api.get(`/insights?month=${now.getMonth() + 1}&year=${now.getFullYear()}`).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  const remainingBudget = data.remainingBudget ?? 0;
  const totalIncome = data.totalIncome ?? 0;
  const totalExpense = data.totalExpense ?? 0;
  const totalSaving = data.totalSaving ?? 0;
  const balance = data.balance ?? 0;
  const expensesByCategory = data.expensesByCategory ?? [];
  const goals = data.goals ?? [];
  const currentBudget = data.currentBudget ?? 0;
  const isOverBudget = totalExpense > currentBudget && currentBudget > 0;
  const overBudgetAmount = totalExpense - currentBudget;

  const trends = data.trends ?? [];

  const formatPrice = (val: number) => `${(val || 0).toLocaleString('vi-VN')}đ`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Overview Header - Premium Gradient */}
      <motion.div 
        variants={itemVariants}
        className={`relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-2xl transition-all duration-700 ${
          isOverBudget 
            ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-200 dark:shadow-none' 
            : 'bg-gradient-to-br from-indigo-600 to-violet-800 shadow-indigo-200 dark:shadow-none'
        }`}
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <p className="text-white/80 mb-2 font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
              <Wallet className="w-4 h-4" />
              Tài chính hiện tại
            </p>
            <h2 className="text-5xl font-black tracking-tighter mb-8 bg-black/0">
              {formatPrice(balance)}
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Thu nhập</p>
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-emerald-300" />
                  <p className="text-lg font-bold">{formatPrice(totalIncome)}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Chi tiêu</p>
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4 text-rose-300" />
                  <p className="text-lg font-bold">{formatPrice(totalExpense)}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Tiết kiệm</p>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-300" />
                  <p className="text-lg font-bold">{formatPrice(totalSaving)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="text-right hidden lg:block">
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isOverBudget ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className="text-xs font-bold uppercase tracking-tight">
                  {isOverBudget ? `Vượt hạn mức: ${formatPrice(overBudgetAmount)}` : 'Trạng thái: Đang ổn định'}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 mt-6 lg:mt-0">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-white/70">
                  {isOverBudget ? 'Vượt ngân sách' : 'Ngân sách còn lại'}
                </span>
                <span className="text-sm font-bold">
                  {isOverBudget ? 'Sử dụng quá' : `${Math.round((remainingBudget / (currentBudget || 1)) * 100)}% còn lại`}
                </span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isOverBudget ? '100%' : `${Math.min(100, (remainingBudget / (currentBudget || 1)) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full shadow-lg ${isOverBudget ? 'bg-rose-300 shadow-rose-500/50' : 'bg-white shadow-white/50'}`}
                />
              </div>
              <p className={`mt-3 text-2xl font-black italic ${isOverBudget ? 'text-rose-100' : 'text-white'}`}>
                {isOverBudget ? `-${formatPrice(overBudgetAmount)}` : formatPrice(remainingBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 h-72 bg-black/10 rounded-full blur-[80px]" />
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Chart - 8 cols */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Xu hướng tài chính</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">So sánh thu nhập và chi tiêu 5 tháng gần nhất</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-zinc-500">Thu nhập</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-zinc-500">Chi tiêu</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val.toLocaleString('vi-VN')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  formatter={(val: number, name: string) => [formatPrice(val), name]}
                  labelStyle={{ fontWeight: 'bold', color: '#18181b', marginBottom: '4px' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  name="Thu nhập"
                  type="monotone" 
                  dataKey="income" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  animationDuration={2000}
                />
                <Area 
                  name="Chi tiêu"
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories Pie - 4 cols */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Danh mục chi tiêu</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(val: number, name: string) => [formatPrice(val), name]}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {expensesByCategory.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.name}</span>
                </div>
                <span className="text-xs font-black text-zinc-900 dark:text-white">{formatPrice(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goals Summary - 12 cols */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-12 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Tiến độ mục tiêu</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Đừng bỏ cuộc, bạn đang làm rất tốt!</p>
            </div>
            <Link to="/goals" className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
              <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.length > 0 ? goals.slice(0, 3).map((goal: any, idx: number) => {
              const perc = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              return (
                <div key={idx} className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 relative overflow-hidden group hover:border-indigo-200 transition-all">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-bold text-zinc-900 dark:text-white truncate pr-4">{goal.name}</h4>
                    <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg h-fit">{perc}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${perc}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-zinc-400">
                    <span>{formatPrice(goal.current_amount)}</span>
                    <span>{formatPrice(goal.target_amount)}</span>
                  </div>
                </div>
              )
            }) : (
              <div className="col-span-full py-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-400">
                <Target className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Bạn chưa thiết lập mục tiêu nào</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Financial Wisdom Tip */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-12 p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 flex flex-col md:flex-row items-center gap-6"
        >
          <div className={`w-16 h-16 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-sm flex items-center justify-center shrink-0`}>
            {isOverBudget ? <AlertCircle className="w-8 h-8 text-rose-500" /> : <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Lời khuyên tài chính cho bạn</h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              {isOverBudget 
                ? `Cảnh báo! Ngài đang chi tiêu vượt hạn mức ngân sách ${formatPrice(overBudgetAmount)}. Hãy cân nhắc cắt giảm các khoản không cần thiết để duy trì sức khỏe tài chính.`
                : `Ngài Jarvis nhận thấy bạn đang duy trì tỷ lệ tiết kiệm rất tốt (${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%). Hãy tiếp tục duy trì và xem xét đầu tư vào các mục tiêu dài hạn nhé!`}
            </p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
