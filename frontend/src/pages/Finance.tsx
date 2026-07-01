import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Plus, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

export const Finance: React.FC = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      await axios.post('/api/expenses', {
        category,
        amount: parseFloat(amount),
        description: description || null
      });
      setAmount('');
      setDescription('');
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budget = profile?.budget || 500.0;
  const isOverBudget = totalExpense > budget;

  // Group by category for charts
  const categorySummaryMap = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categorySummaryMap).map(cat => ({
    name: cat,
    amount: categorySummaryMap[cat]
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Financial Ledger</h2>
        <p className="text-xs text-slate-400 mt-1">Track expenditures, verify monthly savings, and check allowance boundaries</p>
      </div>

      {isOverBudget && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex gap-3 text-amber-200 text-xs items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <span>**Overspending Alert**: Your current expenses (${totalExpense.toFixed(2)}) exceed your target monthly budget limit (${budget.toFixed(2)})! Consider scaling back non-essentials.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ledger logs & Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recharts Bar graph */}
          {chartData.length > 0 && (
            <div className="glass-card p-6 border border-white/5">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Spending by Category</h3>
              <div className="h-52 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0b0b0f', 
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px' 
                      }} 
                    />
                    <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Log Ledger List */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Transaction Records</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {expenses.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200">{item.category}</span>
                    <p className="text-[10px] text-slate-500">{item.description || 'No description'} • {item.date}</p>
                  </div>
                  <span className="font-extrabold text-red-400">-${item.amount.toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-center py-6 text-slate-500 italic text-xs">No transactions recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Transaction form */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-purple" /> Log Expense
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 15.50"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Food">Food</option>
                  <option value="Books">Books / Academic</option>
                  <option value="Rent">Rent / Lodging</option>
                  <option value="Travel">Travel / Transit</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Notebooks for CS class"
                  className="glass-input text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Transaction
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
