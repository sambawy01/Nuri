// client/src/pages/StickerBookPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RARITY_STYLES = {
  common: { border: 'border-gray-300', bg: 'bg-gray-50', glow: '' },
  uncommon: { border: 'border-green-400', bg: 'bg-green-50', glow: 'shadow-green-200' },
  rare: { border: 'border-blue-400', bg: 'bg-blue-50', glow: 'shadow-blue-200' },
  epic: { border: 'border-purple-400', bg: 'bg-purple-50', glow: 'shadow-purple-200' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-50', glow: 'shadow-yellow-200' },
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

export default function StickerBookPage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [allBadges, setAllBadges] = useState([]);
  const [earnedIds, setEarnedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeRarity, setActiveRarity] = useState('all');
  const [selectedSticker, setSelectedSticker] = useState(null);

  useEffect(() => {
    if (!profileLoading && !currentProfile) { navigate('/'); return; }
    if (currentProfile) fetchData();
  }, [currentProfile, profileLoading]);

  async function fetchData() {
    try {
      const pid = currentProfile._id || currentProfile.id;
      const [all, earned] = await Promise.all([
        api('/badges/all'),
        api(`/badges/${pid}`),
      ]);
      setAllBadges(all);
      setEarnedIds(new Set(earned.map(b => b.id)));
    } catch {
      setAllBadges([]);
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading || loading) return <LoadingSpinner text="Loading sticker book..." />;
  if (!currentProfile) return null;

  const filtered = activeRarity === 'all'
    ? allBadges
    : allBadges.filter(b => b.rarity === activeRarity);

  const earnedCount = allBadges.filter(b => earnedIds.has(b.id)).length;

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <motion.button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" whileHover={{ x: -4 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-2xl font-extrabold text-gray-800">Sticker Book</h1>
      </motion.div>

      {/* Progress */}
      <motion.div className="bg-white rounded-2xl shadow-lg p-4 mb-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-3xl font-extrabold gradient-text">{earnedCount}/{allBadges.length}</p>
        <p className="text-sm text-gray-500 font-semibold">stickers collected</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
          <motion.div className="h-full rounded-full gradient-bg" initial={{ width: 0 }} animate={{ width: `${(earnedCount / Math.max(allBadges.length, 1)) * 100}%` }} transition={{ duration: 0.8 }} />
        </div>
      </motion.div>

      {/* Rarity filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
        {['all', ...RARITY_ORDER].map(r => (
          <motion.button key={r} onClick={() => setActiveRarity(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap capitalize transition-colors ${activeRarity === r ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
            whileTap={{ scale: 0.95 }}
          >
            {r === 'all' ? 'All' : RARITY_LABELS[r]}
          </motion.button>
        ))}
      </div>

      {/* Sticker Grid */}
      <div className="grid grid-cols-4 gap-3">
        {filtered.map((badge) => {
          const earned = earnedIds.has(badge.id);
          const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
          return (
            <motion.button key={badge.id}
              onClick={() => setSelectedSticker(badge)}
              className={`relative rounded-2xl p-2 text-center border-2 transition-shadow ${earned ? `${style.border} ${style.bg} shadow-lg ${style.glow}` : 'border-gray-100 bg-gray-50'}`}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            >
              {!earned && <Lock size={10} className="absolute top-1 right-1 text-gray-300" />}
              <div className={`text-2xl ${earned ? '' : 'grayscale opacity-30'}`}>{badge.icon}</div>
              <p className={`text-[9px] font-bold mt-1 leading-tight ${earned ? 'text-gray-700' : 'text-gray-300'}`}>{badge.name}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSticker && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSticker(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div className="relative bg-white rounded-3xl shadow-2xl p-6 mx-6 text-center max-w-xs" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={e => e.stopPropagation()}>
              <div className={`text-5xl mb-3 ${earnedIds.has(selectedSticker.id) ? '' : 'grayscale opacity-40'}`}>{selectedSticker.icon}</div>
              <h3 className="text-lg font-extrabold text-gray-800">{selectedSticker.name}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize mt-1 ${RARITY_STYLES[selectedSticker.rarity]?.bg} ${RARITY_STYLES[selectedSticker.rarity]?.border} border`}>
                {selectedSticker.rarity}
              </span>
              <p className="text-sm text-gray-500 mt-2">{selectedSticker.description}</p>
              {earnedIds.has(selectedSticker.id) ? (
                <p className="text-xs text-green-600 font-bold mt-3">Collected!</p>
              ) : (
                <p className="text-xs text-gray-400 font-bold mt-3">Not yet earned</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
