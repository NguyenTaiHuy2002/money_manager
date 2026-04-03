import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase Admin Client (for backend operations if needed)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid token" });

  req.user = user;
  next();
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Transactions API
app.get("/api/transactions", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*, categories(*)")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false });
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.post("/api/transactions", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .insert([{ ...req.body, user_id: req.user.id }])
    .select();
  
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

app.put("/api/transactions/:id", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .update(req.body)
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select();
  
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

app.delete("/api/transactions/:id", authenticateUser, async (req: any, res) => {
  const { error } = await supabaseAdmin
    .from("transactions")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  
  if (error) return res.status(400).json(error);
  res.json({ success: true });
});

// Categories API
app.get("/api/categories", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .or(`user_id.eq.${req.user.id},user_id.is.null`);
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.post("/api/categories", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert([{ ...req.body, user_id: req.user.id }])
    .select();
  
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

// Budgets API
app.get("/api/budgets", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("budgets")
    .select("*")
    .eq("user_id", req.user.id);
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.post("/api/budgets", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("budgets")
    .upsert([{ ...req.body, user_id: req.user.id }], { onConflict: 'user_id,month,year' })
    .select();
  
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

// Goals API
app.get("/api/goals", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("goals")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.post("/api/goals", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("goals")
    .insert([{ ...req.body, user_id: req.user.id }])
    .select();
  
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

app.put("/api/goals/:id", authenticateUser, async (req: any, res) => {
  const { data, error } = await supabaseAdmin
    .from("goals")
    .update(req.body)
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select();
  
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

app.delete("/api/goals/:id", authenticateUser, async (req: any, res) => {
  const { error } = await supabaseAdmin
    .from("goals")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  
  if (error) return res.status(400).json(error);
  res.json({ success: true });
});

app.post("/api/goals/:id/deposit", authenticateUser, async (req: any, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Số tiền không hợp lệ" });

  // 1. Lấy thông tin mục tiêu
  const { data: goal, error: getError } = await supabaseAdmin
    .from("goals")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .single();

  if (getError || !goal) {
    return res.status(400).json({ error: "Không tìm thấy mục tiêu" });
  }

  // 2. Tìm hoặc tạo danh mục 'Tiết kiệm'
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("*")
    .or(`user_id.eq.${req.user.id},user_id.is.null`);

  console.log("[Deposit] Found Categories:", categories?.map((c: any) => c.name).join(", "));

  let savingsCat = categories?.find((c: any) => 
    c.name.toLowerCase().includes("tiết kiệm")
  );
  
  if (!savingsCat) {
    console.log("[Deposit] Creating new 'Tiết kiệm' category for user...");
    const { data: newCat, error: catError } = await supabaseAdmin
      .from("categories")
      .insert([{ 
        name: "Tiết kiệm", 
        type: "expense",
        user_id: req.user.id 
      }])
      .select()
      .maybeSingle();
    
    if (catError) console.error("[Deposit] Category Insert Error:", catError);
    savingsCat = newCat;
  }

  console.log("[Deposit] Using Category ID:", savingsCat?.id, "Name:", savingsCat?.name);

  // 3. Cập nhật số tiền hiện tại của mục tiêu
  const newAmount = (Number(goal.current_amount) || 0) + Number(amount);
  const { error: updateError } = await supabaseAdmin
    .from("goals")
    .update({ current_amount: newAmount })
    .eq("id", req.params.id);

  if (updateError) {
    console.error("[Deposit] Goal Update Error:", updateError);
    return res.status(400).json(updateError);
  }

  // 4. Tạo một bản ghi giao dịch 'Tiết kiệm' (chi phí) để trừ vào số dư khả dụng
  const { error: transError } = await supabaseAdmin
    .from("transactions")
    .insert([{
      user_id: req.user.id,
      amount: Number(amount),
      type: 'expense',
      category_id: savingsCat?.id || null,
      note: `Tích lũy cho mục tiêu: ${goal.name}`,
      date: new Date().toISOString()
    }]);

  if (transError) {
    console.error("[Deposit] Transaction Insert Error:", transError);
    return res.status(400).json(transError);
  }

  res.json({ success: true, newAmount });
});

// Insights API
app.get("/api/insights", authenticateUser, async (req: any, res) => {
  const now = new Date();
  const currentMonth = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
  const currentYear = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

  const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
  
  // Lấy tất cả giao dịch để tính số dư tổng (lifetime balance)
  const { data: allTransactions, error: tError } = await supabaseAdmin
    .from("transactions")
    .select("*, categories(*)")
    .eq("user_id", req.user.id);

  if (tError) return res.status(400).json(tError);

  console.log("[Insights] Total Transactions:", allTransactions?.length);
  if (allTransactions && allTransactions.length > 0) {
    console.log("[Insights] Sample Transaction:", JSON.stringify(allTransactions[0], null, 2));
  }

  // Lấy ngân sách theo tháng/năm yêu cầu
  const { data: budgets, error: bError } = await supabaseAdmin
    .from("budgets")
    .select("*")
    .eq("user_id", req.user.id)
    .eq("month", currentMonth)
    .eq("year", currentYear);

  if (bError) console.error("Budget fetch error:", bError);
  
  const budgetData = budgets?.[0];
  const currentBudget = budgetData?.amount || 0;

  // 2. Lọc giao dịch tháng hiện tại
  const currentMonthTransactions = allTransactions?.filter((t: any) => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
  }) || [];

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Tách biệt: Chi tiêu thực tế (không bao gồm Tiết kiệm) và Tiền tiết kiệm
  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense' && !t.categories?.name?.toLowerCase().includes('tiết kiệm'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaving = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.categories?.name?.toLowerCase().includes('tiết kiệm'))
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategoryRaw = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const catName = t.categories?.name || 'Chưa phân loại';
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {});

  const expensesByCategory = Object.entries(expensesByCategoryRaw).map(([name, value]) => ({ name, value }));

  const lifetimeBalance = allTransactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);

  // Tính toán xu hướng 5 tháng gần nhất
  const trends = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const monthStart = `${y}-${String(m).padStart(2, '0')}-01`;
    const monthEnd = new Date(y, m, 0).toISOString().split('T')[0];
    
    const monthTransactions = allTransactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    trends.push({
      name: `Tháng ${m}`,
      income,
      expense
    });
  }

  // Lấy danh sách mục tiêu
  const { data: goals, error: gError } = await supabaseAdmin
    .from("goals")
    .select("*")
    .eq("user_id", req.user.id);

  if (gError) console.error("Goals fetch error:", gError);

  res.json({
    totalIncome, // Tháng này
    totalExpense, // Tháng này (đã trừ tiết kiệm)
    totalSaving, // Tháng này
    balance: lifetimeBalance, // Tổng cộng
    currentBudget,
    remainingBudget: Math.max(0, currentBudget - totalExpense),
    expensesByCategory,
    goals: goals || [],
    trends
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

if (process.env.NODE_ENV !== "production") {
  startServer();
}
