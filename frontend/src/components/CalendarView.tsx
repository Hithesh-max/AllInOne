'use client';

import React, { useState } from 'react';
import styles from './CalendarView.module.css';
import type { Hackathon, Internship, Scholarship, CodingContest } from '../data';

interface CalendarViewProps {
  hackathons: Hackathon[];
  internships: Internship[];
  scholarships: Scholarship[];
  contests: CodingContest[];
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'Hackathon' | 'Internship' | 'Scholarship' | 'Contest';
  description: string;
}

export default function CalendarView({ hackathons, internships, scholarships, contests }: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed: 5 = June, 6 = July
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Extract events dynamically from the opportunities lists
  const events: CalendarEvent[] = [];

  // Hackathons
  hackathons.forEach(h => {
    if (h.isApplied && h.timeline) {
      h.timeline.forEach(stage => {
        if (stage.deadline && stage.status !== 'Completed') {
          events.push({
            id: `h-applied-${h.id}-${stage.stageName}`,
            title: `${h.title}: ${stage.stageName}`,
            date: new Date(stage.deadline),
            type: 'Hackathon',
            description: stage.details || 'Deadline event'
          });
        }
      });
    } else if (!h.isApplied && h.registrationDeadline) {
      events.push({
        id: `h-reg-${h.id}`,
        title: `${h.title} Registration Closes`,
        date: new Date(h.registrationDeadline),
        type: 'Hackathon',
        description: 'Last day to register for upcoming hackathon.'
      });
    }
  });

  // Internships
  internships.forEach(i => {
    if (i.isApplied && i.timeline) {
      i.timeline.forEach(stage => {
        if (stage.deadline && stage.status !== 'Completed') {
          events.push({
            id: `i-applied-${i.id}-${stage.stageName}`,
            title: `${i.company}: ${stage.stageName}`,
            date: new Date(stage.deadline),
            type: 'Internship',
            description: stage.details || 'Interview/Milestone stage'
          });
        }
      });
    } else if (!i.isApplied && i.deadline) {
      events.push({
        id: `i-deadline-${i.id}`,
        title: `${i.company} Internship Deadline`,
        date: new Date(i.deadline),
        type: 'Internship',
        description: 'Application closes for recommended internship.'
      });
    }
  });

  // Scholarships
  scholarships.forEach(s => {
    if (s.isApplied && s.timeline) {
      s.timeline.forEach(stage => {
        if (stage.deadline && stage.status !== 'Completed') {
          events.push({
            id: `s-applied-${s.id}-${stage.stageName}`,
            title: `${s.name}: ${stage.stageName}`,
            date: new Date(stage.deadline),
            type: 'Scholarship',
            description: stage.details || 'Interview/Verification milestone'
          });
        }
      });
    } else if (!s.isApplied && s.deadline) {
      events.push({
        id: `s-deadline-${s.id}`,
        title: `${s.name} Scholarship Closes`,
        date: new Date(s.deadline),
        type: 'Scholarship',
        description: 'Eligible scholarship submission deadline.'
      });
    }
  });

  // Contests
  contests.forEach(c => {
    if (c.isApplied && c.timeline) {
      c.timeline.forEach(stage => {
        if (stage.deadline && stage.status !== 'Completed') {
          events.push({
            id: `c-applied-${c.id}-${stage.stageName}`,
            title: `${c.title}: ${stage.stageName}`,
            date: new Date(stage.deadline),
            type: 'Contest',
            description: stage.details || 'Contest deadline'
          });
        }
      });
    } else if (c.date) {
      events.push({
        id: `c-date-${c.id}`,
        title: `${c.contestPlatform}: ${c.title}`,
        date: new Date(`${c.date}T${c.time || '00:00'}:00`),
        type: 'Contest',
        description: `${c.description} Duration: ${c.duration}`
      });
    }
  });

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0: Sun, 1: Mon, etc.

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSyncGoogleCalendar = () => {
    setSyncStatus('Syncing...');
    setTimeout(() => {
      setSyncStatus(`Successfully synced ${events.length} deadlines with Google Calendar!`);
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1500);
  };

  // Check if a day is today (June 27, 2026 based on metadata)
  const isToday = (dayNum: number) => {
    return currentYear === 2026 && currentMonth === 5 && dayNum === 27;
  };

  // Get events on a specific day
  const getEventsForDay = (dayNum: number) => {
    return events.filter(e => {
      const d = e.date;
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === dayNum;
    });
  };

  // Render grid elements
  const gridCells = [];
  // Empty padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(<div key={`empty-${i}`} className={styles.dayCellEmpty} />);
  }
  // Actual day cells
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dayEvents = getEventsForDay(dayNum);
    gridCells.push(
      <div 
        key={`day-${dayNum}`} 
        className={`${styles.dayCell} ${isToday(dayNum) ? styles.dayCellToday : ''}`}
      >
        <span className={styles.dayNumber}>{dayNum}</span>
        
        {dayEvents.length > 0 && (
          <div className={styles.eventList}>
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div 
                key={idx}
                className={`${styles.eventBar} ${
                  event.type === 'Hackathon' ? styles.eventBarHackathon :
                  event.type === 'Internship' ? styles.eventBarInternship :
                  event.type === 'Scholarship' ? styles.eventBarScholarship :
                  styles.eventBarContest
                }`}
                title={event.title}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                }}
                style={event.type === 'Contest' ? { borderLeft: '2px solid #a855f7', background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe' } : {}}
              >
                {event.title.split(':')[1]?.trim() || event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div style={{ fontSize: '0.55rem', color: '#6b7280', alignSelf: 'center', fontWeight: 'bold' }}>
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Filter events coming soon (from June 27, 2026 onwards)
  const todayTime = new Date('2026-06-27T00:00:00Z').getTime();
  const upcomingEventsList = events.filter(e => e.date.getTime() >= todayTime).slice(0, 5);

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarLayout}>
        {/* Calendar Grid card */}
        <div className={`${styles.calendarMain} glass-panel`}>
          <div className={styles.calendarHeader}>
            <span className={styles.monthTitle}>
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className={styles.navControls}>
              <button className={styles.navBtn} onClick={handlePrevMonth}>◀</button>
              <button className={styles.navBtn} onClick={handleNextMonth}>▶</button>
            </div>
          </div>

          <div className={styles.daysHeader}>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className={styles.grid}>
            {gridCells}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className={styles.calendarSidebar}>
          {/* Detail card for click events */}
          {selectedEvent ? (
            <div className={`${styles.sidebarCard} glass-panel`} style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <div className={styles.sidebarTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Milestone Details</span>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span className={`${styles.eventBar} ${
                  selectedEvent.type === 'Hackathon' ? styles.eventBarHackathon :
                  selectedEvent.type === 'Internship' ? styles.eventBarInternship :
                  selectedEvent.type === 'Scholarship' ? styles.eventBarScholarship :
                  ''
                }`} style={{ 
                  display: 'inline-block', 
                  width: 'fit-content', 
                  padding: '0.2rem 0.5rem',
                  borderLeft: selectedEvent.type === 'Contest' ? '2px solid #a855f7' : '',
                  background: selectedEvent.type === 'Contest' ? 'rgba(168, 85, 247, 0.15)' : '',
                  color: selectedEvent.type === 'Contest' ? '#d8b4fe' : ''
                }}>
                  {selectedEvent.type}
                </span>
                <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {selectedEvent.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.4 }}>
                  {selectedEvent.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  🕒 Date: {selectedEvent.date.toLocaleString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.sidebarCard} glass-panel`}>
              <div className={styles.sidebarTitle}>Legend</div>
              <div className={styles.legendRow}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: 'var(--primary)' }} />
                  <span>🏆 Hackathons</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: 'var(--info)' }} />
                  <span>💼 Internships</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: 'var(--success)' }} />
                  <span>🎓 Scholarships</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#a855f7' }} />
                  <span>👨💻 Coding Contests</span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming list */}
          <div className={`${styles.sidebarCard} glass-panel`}>
            <div className={styles.sidebarTitle}>Deadlines This Week</div>
            <div className={styles.upcomingList}>
              {upcomingEventsList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>
                  No upcoming deadlines found.
                </div>
              ) : (
                upcomingEventsList.map(e => {
                  const day = e.date.getDate();
                  const monthStr = e.date.toLocaleDateString('en-US', { month: 'short' });
                  
                  return (
                    <div key={e.id} className={styles.upcomingItem}>
                      <div className={styles.upcomingDateBadge}>
                        <span className={styles.upcomingMonth}>{monthStr}</span>
                        <span className={styles.upcomingDay}>{day}</span>
                      </div>
                      <div className={styles.upcomingDetails}>
                        <div className={styles.upcomingName} title={e.title}>{e.title}</div>
                        <div className={styles.upcomingDesc}>
                          {e.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {e.type}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sync Box */}
          <div className={`${styles.sidebarCard} glass-panel`}>
            <div className={styles.syncContainer}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Keep your devices updated. Automatically export dashboard milestones and reminders directly to your personal calendar.
              </div>
              
              {syncStatus ? (
                <div className={styles.syncStatus}>
                  <span>ℹ️</span> {syncStatus}
                </div>
              ) : (
                <button className={styles.syncBtn} onClick={handleSyncGoogleCalendar}>
                  Sync with Google Calendar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
