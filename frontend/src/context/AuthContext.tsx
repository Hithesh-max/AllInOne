import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserProfile {
  branch: string;
  cgpa: number;
  skills: string[];
  interests: string[];
  budget: number;
  preferred_companies: string[];
  favorite_domains: string[];
  health_goals: Record<string, any>;
  shopping_preferences: Record<string, any>;
  travel_preferences: Record<string, any>;
  resume_text: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Set default axios authorization header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const fetchUserData = async (activeToken: string) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
      const userRes = await axios.get('/api/auth/me');
      setUser(userRes.data);
      
      const profileRes = await axios.get('/api/auth/profile');
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Failed to load user session', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    await axios.post('/api/auth/signup', { email, password, full_name: fullName });
    // Automatically log in after sign up
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profileRes = await axios.get('/api/auth/profile');
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!token) return;
    const res = await axios.put('/api/auth/profile', updates);
    setProfile(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, profile, token, isLoading, login, signup, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
