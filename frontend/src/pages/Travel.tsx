import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Compass, Plus, MapPin, Calendar, CheckSquare, Square } from 'lucide-react';

interface TravelPlan {
  id: number;
  destination: string;
  departure_date: string | null;
  return_date: string | null;
  budget: number;
  itinerary: Array<{ day: number; activities: string[] }>;
}

export const Travel: React.FC = () => {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [budget, setBudget] = useState('');

  const fetchPlans = async () => {
    try {
      const res = await axios.get('/api/travel');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;

    try {
      await axios.post('/api/travel', {
        destination,
        departure_date: departure || null,
        return_date: returnDate || null,
        budget: budget ? parseFloat(budget) : 0,
        itinerary: [
          { day: 1, activities: ['Arrival & Check-in', 'Evening local sightseeing'] },
          { day: 2, activities: ['Main monument visit', 'Local market walk'] }
        ]
      });
      setDestination('');
      setDeparture('');
      setReturnDate('');
      setBudget('');
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Travel & Vacation Itineraries</h2>
        <p className="text-xs text-slate-400 mt-1">Estimate holiday expenses, schedule itineraries, and map packing lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Travel Plans */}
        <div className="lg:col-span-2 space-y-6">
          {plans.map(plan => (
            <div key={plan.id} className="glass-card p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Compass className="h-4.5 w-4.5 text-brand-cyan" />
                  <h3 className="font-bold text-slate-200 text-base">{plan.destination}</h3>
                </div>
                <span className="text-[10px] text-brand-cyan font-bold bg-brand-cyan/15 px-2.5 py-0.5 rounded">
                  Budget: ${plan.budget}
                </span>
              </div>

              {/* Itinerary details */}
              <div className="space-y-3 pl-4 border-l border-white/10">
                {plan.itinerary && plan.itinerary.map((day, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">Day {day.day}</p>
                    <ul className="text-xs text-slate-400 list-disc pl-4 space-y-0.5 leading-relaxed">
                      {day.activities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500 italic text-sm">No vacations scheduled yet. Ask the AI: "Create an itinerary for my vacation in July".</div>
          )}
        </div>

        {/* Add Trip Form */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-cyan" /> Add Trip Target
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Hawaii"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Departure Date</label>
                <input
                  type="date"
                  value={departure}
                  onChange={e => setDeparture(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="e.g. 800"
                  className="glass-input text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Create Itinerary
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
