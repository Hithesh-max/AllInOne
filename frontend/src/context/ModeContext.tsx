import React, { createContext, useContext, useState } from 'react';

export type WorkspaceMode = 'productivity' | 'tracker';

interface ModeContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<WorkspaceMode>(() => {
    const saved = localStorage.getItem('workspace_mode');
    return (saved as WorkspaceMode) || 'productivity';
  });

  const handleSetMode = (newMode: WorkspaceMode) => {
    setMode(newMode);
    localStorage.setItem('workspace_mode', newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within a ModeProvider');
  return context;
};
