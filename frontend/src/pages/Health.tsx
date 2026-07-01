import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Plus, Droplet, Moon, Flame } from 'lucide-react';

interface HealthRecord {
  id: number;
  weight: number | null;
  water_intake: number;
  calories_burned: number;
  sleep_hours: number;
  date: string;
}

export const Health: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [weight, setWeight] = useState('');
  const [water, setWater] = useState('');
  const [calories, setCalories] = useState('');
  const [sleep, setSleep] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/health');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/health', {
        weight: weight ? parseFloat(weight) : null,
        water_intake: water ? parseFloat(water) : 0,
        calories_burned: calories ? parseInt(calories) : 0,
        sleep_hours: sleep ? parseFloat(sleep) : 0
      });
      setWeight('');
      setWater('');
      setCalories('');
      setSleep('');
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Health & Calorie Hub</h2>
        <p className="text-xs text-slate-400 mt-1">Monitor water levels, track sleep durations, and check calorie burns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {records.slice(-1).map((latest, idx) => (
              <React.Fragment key={idx}>
                {/* Water Card */}
                <div className="glass-card p-6 border border-white/5 space-y-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-brand-cyan">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Water Intake</span>
                    <Droplet className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-200">{latest.water_intake} Litres</h3>
                </div>

                {/* Sleep Card */}
                <div className="glass-card p-6 border border-white/5 space-y-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-brand-purple">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sleep Hours</span>
                    <Moon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-200">{latest.sleep_hours} Hours</h3>
                </div>

                {/* Calories Card */}
                <div className="glass-card p-6 border border-white/5 space-y-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-red-400">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calories Burned</span>
                    <Flame className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-200">{latest.calories_burned} kcal</h3>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* List of health journals */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Log History</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {records.map(record => (
                <div key={record.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                  <span>Logged Date: {record.date}</span>
                  <div className="flex gap-4">
                    <span>💧 {record.water_intake}L</span>
                    <span>😴 {record.sleep_hours}h</span>
                    <span>🔥 {record.calories_burned} kcal</span>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <p className="text-center py-6 text-slate-500 italic text-xs">No entries recorded. Log today's stats below.</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-purple" /> Add Health Entry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 70.5"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Water Intake (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={water}
                  onChange={e => setWater(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Calories Burned (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  placeholder="e.g. 350"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sleep duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleep}
                  onChange={e => setSleep(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="glass-input text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Health Entry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
