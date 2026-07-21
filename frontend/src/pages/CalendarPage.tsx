import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Clock } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import { initialContests } from '../data';

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
}

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [scholarships, setScholarships] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('General');

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/calendar');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllOpportunities = async () => {
    try {
      const [intRes, hackRes, scholRes] = await Promise.all([
        axios.get('/api/internships'),
        axios.get('/api/hackathons'),
        axios.get('/api/scholarships')
      ]);
      setInternships(intRes.data);
      setHackathons(hackRes.data);
      setScholarships(scholRes.data);
    } catch (err) {
      console.error("Failed to load calendar dependencies", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAllOpportunities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;

    try {
      await axios.post('/api/calendar', {
        title,
        description: description || null,
        start_time: startTime,
        end_time: endTime,
        event_type: type
      });
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      fetchEvents();
      fetchAllOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  const getEventBadgeClass = (eventType: string) => {
    switch (eventType) {
      case 'Exam': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'Interview': return 'bg-brand-cyan/15 border-brand-cyan/25 text-brand-cyan';
      case 'Study': return 'bg-brand-purple/15 border-brand-purple/25 text-brand-neon';
      case 'Travel': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Hackathon': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      default: return 'bg-white/5 border-white/5 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Unified Calendar Agenda</h2>
        <p className="text-xs text-slate-400 mt-1">Check scheduled exams, interviews, travel bookings, and study review hours</p>
      </div>

      {/* Month Calendar Grid */}
      <div className="glass-card p-6 border border-white/5">
        <CalendarView
          internships={internships}
          hackathons={hackathons}
          scholarships={scholarships}
          contests={initialContests}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm pl-1">Agenda Reminders List</h3>
          {events.map(event => (
            <div key={event.id} className="glass-card p-6 border border-white/5 flex gap-4 hover:border-brand-violet/20 transition-all justify-between items-start">
              <div className="space-y-1.5">
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getEventBadgeClass(event.event_type)}`}>
                  {event.event_type}
                </span>
                <h3 className="font-bold text-slate-200 text-base">{event.title}</h3>
                <p className="text-xs text-slate-400 leading-normal">{event.description}</p>
                <div className="flex gap-4 text-[10px] text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Start: {new Date(event.start_time).toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> End: {new Date(event.end_time).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500 italic text-sm">No scheduled events found on your agenda. Ask the AI: "Remind me to study next Wednesday".</div>
          )}
        </div>

        {/* Add Event Form */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-cyan" /> Add Calendar Task
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Meta Technical Interview"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Event Category</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="General">General</option>
                  <option value="Exam">Exam / Midterm</option>
                  <option value="Interview">Interview</option>
                  <option value="Study">Study Review</option>
                  <option value="Travel">Travel departure</option>
                  <option value="Hackathon">Hackathon Hack</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Focus on sliding window algorithms and database indexing queries."
                  className="glass-input text-xs h-20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Event
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
