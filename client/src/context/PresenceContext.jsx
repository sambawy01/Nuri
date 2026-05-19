import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useProfile } from './ProfileContext';

const PresenceContext = createContext(null);

export function PresenceProvider({ children }) {
  const { currentProfile } = useProfile();
  const [tier, setTier] = useState('off');
  const [loading, setLoading] = useState(false);

  // Load tier whenever profile changes
  useEffect(() => {
    const profileId = currentProfile?.id || currentProfile?._id;
    if (!profileId) {
      setTier('off');
      return;
    }
    let cancelled = false;
    setLoading(true);
    api(`/presence/tier/${profileId}`)
      .then((data) => {
        if (!cancelled) setTier(data?.tier || 'off');
      })
      .catch(() => {
        if (!cancelled) setTier('off');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentProfile]);

  const updateTier = useCallback(async (next) => {
    const profileId = currentProfile?.id || currentProfile?._id;
    if (!profileId) return;
    const data = await api(`/presence/tier/${profileId}`, {
      method: 'PUT',
      body: { tier: next },
    });
    setTier(data?.tier || next);
  }, [currentProfile]);

  return (
    <PresenceContext.Provider value={{ tier, loading, updateTier }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresenceConfig() {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    // Tolerate use outside provider (tests, isolated pages).
    return { tier: 'off', loading: false, updateTier: async () => {} };
  }
  return ctx;
}
