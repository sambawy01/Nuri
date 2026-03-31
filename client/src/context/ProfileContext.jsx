import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedId = localStorage.getItem('nuri_profile_id');
    if (savedId) {
      api(`/profiles/${savedId}`)
        .then((profile) => {
          setCurrentProfile(profile);
        })
        .catch(() => {
          localStorage.removeItem('nuri_profile_id');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('nuri_profile_id', profile._id || profile.id);
  }, []);

  const logout = useCallback(() => {
    setCurrentProfile(null);
    localStorage.removeItem('nuri_profile_id');
  }, []);

  const updateXP = useCallback((amount) => {
    setCurrentProfile((prev) => {
      if (!prev) return prev;
      const newXP = (prev.xp || 0) + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ currentProfile, loading, login, logout, updateXP }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
