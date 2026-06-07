import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelUpData, setLevelUpData] = useState(null);

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
      const newXP = (prev.xp || prev.total_xp || 0) + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const oldLevel = prev.level || prev.current_level || 1;
      if (newLevel > oldLevel) {
        setLevelUpData({ level: newLevel, previousLevel: oldLevel });
      }
      return { ...prev, xp: newXP, total_xp: newXP, level: newLevel, current_level: newLevel };
    });
  }, []);

  const clearLevelUp = useCallback(() => {
    setLevelUpData(null);
  }, []);

  return (
    <ProfileContext.Provider value={{ currentProfile, loading, login, logout, updateXP, levelUpData, clearLevelUp }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
