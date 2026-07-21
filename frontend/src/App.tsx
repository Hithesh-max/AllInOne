import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { DashboardLayout } from './components/DashboardLayout';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Internships } from './pages/Internships';
import { Hackathons } from './pages/Hackathons';
import { Scholarships } from './pages/Scholarships';
import { Resume } from './pages/Resume';
import { StudyPlanner } from './pages/StudyPlanner';
import { Finance } from './pages/Finance';
import { Shopping } from './pages/Shopping';
import { CalendarPage } from './pages/CalendarPage';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Contests } from './pages/Contests';
import { News } from './pages/News';
import type { ViewType } from './components/Sidebar';

export const App: React.FC = () => {
  const { token, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [view, setView] = useState<ViewType>('home');
  const [quickPrompt, setQuickPrompt] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-brand-violet/30 border-t-brand-purple rounded-full animate-spin" />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (view) {
      case 'home':
        return <Home setView={setView} onSetQuickPrompt={setQuickPrompt} />;
      case 'chat':
        return <Chat quickPrompt={quickPrompt} clearQuickPrompt={() => setQuickPrompt('')} />;
      case 'internships':
        return <Internships />;
      case 'hackathons':
        return <Hackathons />;
      case 'scholarships':
        return <Scholarships />;
      case 'contests':
        return <Contests />;
      case 'resume':
        return <Resume />;
      case 'study':
        return <StudyPlanner />;
      case 'finance':
        return <Finance />;
      case 'shopping':
        return <Shopping />;
      case 'calendar':
        return <CalendarPage />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'news':
        return <News />;
      default:
        return <Home setView={setView} onSetQuickPrompt={setQuickPrompt} />;
    }
  };

  const renderContent = () => {
    if (!token) {
      if (showLanding) {
        return <Landing onGetStarted={() => setShowLanding(false)} />;
      }
      return <Auth onBackToLanding={() => setShowLanding(true)} />;
    }

    return (
      <DashboardLayout currentView={view} setView={setView}>
        {renderActiveView()}
      </DashboardLayout>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default App;
