import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { key: 'furniture',  label: 'Furniture',        color: '#3B82F6', bg: 'bg-blue-50',   border: 'border-blue-200'   },
  { key: 'decoration', label: 'Decorations',       color: '#10B981', bg: 'bg-green-50',  border: 'border-green-200'  },
  { key: 'accessory',  label: "Nuri's Accessories", color: '#A855F7', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'special',    label: 'Special Items',     color: '#F59E0B', bg: 'bg-amber-50',  border: 'border-amber-200'  },
];

export default function TreehousePage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();

  const [ownedItems, setOwnedItems]       = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [lockedItems, setLockedItems]     = useState([]);
  const [stats, setStats]                 = useState(null);
  const [totalItems, setTotalItems]       = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [equipping, setEquipping]         = useState(null);
  const [activeCategory, setActiveCategory] = useState('furniture');

  useEffect(() => {
    if (!profileLoading && !currentProfile) {
      navigate('/');
      return;
    }
    if (currentProfile) {
      fetchTreehouse();
    }
  }, [currentProfile, profileLoading, navigate]);

  async function fetchTreehouse() {
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api(`/treehouse/${pid}`);
      setOwnedItems(data.ownedItems || []);
      setAvailableItems(data.availableItems || []);
      setLockedItems(data.lockedItems || []);
      setStats(data.stats || null);
      setTotalItems(data.totalItems || 0);
      setCollectedCount(data.collectedCount || 0);
    } catch {
      setOwnedItems([]);
      setAvailableItems([]);
      setLockedItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleEquip(item, shouldEquip) {
    if (equipping) return;
    const pid = currentProfile._id || currentProfile.id;
    setEquipping(item.id);
    try {
      await api('/treehouse/equip', {
        method: 'POST',
        body: { profileId: pid, itemId: item.id, equipped: shouldEquip },
      });
      // Refresh
      await fetchTreehouse();
    } catch {
      // Silently fail
    } finally {
      setEquipping(null);
    }
  }

  if (profileLoading || loading) return <LoadingSpinner text="Loading your treehouse..." />;
  if (!currentProfile) return null;

  // Merge all items for current category view
  const allItemsByCategory = {};
  for (const cat of CATEGORIES) {
    allItemsByCategory[cat.key] = [
      ...ownedItems.filter(i => i.category === cat.key),
      ...availableItems.filter(i => i.category === cat.key),
      ...lockedItems.filter(i => i.category === cat.key),
    ];
  }

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);
  const displayItems = allItemsByCategory[activeCategory] || [];

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Treehouse Header / Illustration */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #86efac 0%, #6ee7b7 30%, #a3e635 60%, #84cc16 100%)',
          minHeight: 220,
        }}
      >
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #bfdbfe 0%, #86efac 60%)' }} />

        {/* Sun */}
        <div className="absolute top-4 right-8 w-14 h-14 rounded-full bg-yellow-300 shadow-lg" style={{ boxShadow: '0 0 30px 10px #fde68a' }} />

        {/* Clouds */}
        <div className="absolute top-6 left-6 flex gap-1 opacity-80">
          <div className="w-10 h-6 rounded-full bg-white" />
          <div className="w-14 h-8 rounded-full bg-white -ml-4 mt-1" />
          <div className="w-8 h-5 rounded-full bg-white -ml-3" />
        </div>

        {/* Tree trunk */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Canopy */}
          <div className="relative mb-1">
            <div className="w-40 h-28 rounded-full bg-green-500 shadow-xl" style={{ background: 'radial-gradient(ellipse at 40% 40%, #4ade80, #16a34a)' }} />
            <div className="absolute -top-6 left-8 w-28 h-24 rounded-full bg-green-400" style={{ background: 'radial-gradient(ellipse at 40% 40%, #86efac, #22c55e)' }} />
            <div className="absolute -top-3 right-4 w-20 h-20 rounded-full bg-green-500" style={{ background: 'radial-gradient(ellipse at 60% 40%, #4ade80, #15803d)' }} />

            {/* Treehouse platform */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 rounded-sm bg-amber-700 shadow-md" />

            {/* Treehouse cabin */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-24 h-14 rounded-sm bg-amber-600 shadow-lg flex items-center justify-center">
              {/* Window */}
              <div className="w-6 h-6 rounded bg-yellow-200 border-2 border-amber-800 flex items-center justify-center">
                <div className="text-xs">🦉</div>
              </div>
            </div>

            {/* Roof */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: 26 + 14,
                width: 0,
                height: 0,
                borderLeft: '50px solid transparent',
                borderRight: '50px solid transparent',
                borderBottom: '28px solid #b45309',
              }}
            />

            {/* Rope ladder */}
            <div className="absolute bottom-0 right-8 flex flex-col items-center gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-6 h-1 bg-amber-800 rounded-full" />
              ))}
            </div>
          </div>

          {/* Trunk */}
          <div className="w-10 h-16 bg-amber-800 rounded-b-lg" style={{ background: 'linear-gradient(90deg, #92400e, #b45309, #92400e)' }} />

          {/* Roots */}
          <div className="flex gap-3 -mt-1">
            <div className="w-5 h-4 bg-amber-900 rounded-b-full rotate-[-20deg]" />
            <div className="w-5 h-4 bg-amber-900 rounded-b-full rotate-[20deg]" />
          </div>
        </div>

        {/* Title overlay */}
        <div className="relative z-10 pt-4 px-4 flex items-center gap-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-700 shadow"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow">
            <h1 className="text-lg font-extrabold text-gray-800">Nuri's World</h1>
            <p className="text-xs text-gray-600 font-semibold">Virtual Treehouse</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Progress Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-extrabold text-purple-600">
                {collectedCount}/{totalItems}
              </p>
              <p className="text-xs text-gray-500 font-semibold">items collected</p>
            </div>
            {stats && (
              <div className="flex gap-3 text-center">
                <div>
                  <p className="text-lg font-extrabold text-blue-600">{stats.level}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Level</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-orange-500">{stats.streak}🔥</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Streak</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-yellow-500">{stats.badges}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Badges</p>
                </div>
              </div>
            )}
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F97316, #A855F7)' }}
              initial={{ width: 0 }}
              animate={{ width: `${totalItems > 0 ? (collectedCount / totalItems) * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeCategory === cat.key ? { backgroundColor: cat.color } : {}}
              whileTap={{ scale: 0.95 }}
            >
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Items Grid */}
        <motion.div
          key={activeCategory}
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, idx) => {
              const isOwned = ownedItems.some(o => o.id === item.id);
              const isAvailable = availableItems.some(a => a.id === item.id);
              const isLocked = !isOwned && !isAvailable;
              const isEquipped = isOwned && item.equipped;
              const isLoading = equipping === item.id;

              return (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={!isLocked ? { scale: 1.04, y: -3 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (isOwned || isAvailable) {
                      handleEquip(item, !isEquipped);
                    }
                  }}
                  disabled={isLocked || isLoading}
                  className={`relative rounded-2xl p-3 text-center transition-all border-2 ${
                    isEquipped
                      ? 'bg-white border-purple-400 shadow-lg ring-2 ring-purple-300'
                      : isOwned
                      ? 'bg-white border-green-300 shadow-md'
                      : isAvailable
                      ? `bg-white ${activeCat.border} shadow-md cursor-pointer hover:shadow-lg`
                      : 'bg-gray-50 border-gray-100 shadow-sm cursor-not-allowed'
                  }`}
                >
                  {/* Lock icon */}
                  {isLocked && (
                    <div className="absolute top-1.5 right-1.5">
                      <Lock size={11} className="text-gray-300" />
                    </div>
                  )}

                  {/* Equipped checkmark */}
                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle size={14} className="text-purple-500 fill-purple-100" />
                    </div>
                  )}

                  {/* "NEW" badge for available but not yet owned */}
                  {isAvailable && !isOwned && (
                    <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      NEW
                    </div>
                  )}

                  {/* Emoji icon */}
                  <div
                    className={`text-3xl mb-1.5 transition-all ${
                      isLocked ? 'grayscale opacity-30' : isLoading ? 'animate-bounce' : ''
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* Name */}
                  <p
                    className={`text-[11px] font-bold leading-tight ${
                      isLocked ? 'text-gray-300' : 'text-gray-800'
                    }`}
                  >
                    {item.name}
                  </p>

                  {/* Equipped label */}
                  {isEquipped && (
                    <p className="text-[9px] text-purple-500 font-bold mt-0.5">Equipped</p>
                  )}

                  {/* Unlock requirement */}
                  {isLocked && (
                    <p className="text-[9px] text-gray-400 mt-1 leading-tight">
                      {item.unlockLabel}
                    </p>
                  )}

                  {/* Available — tap to add */}
                  {isAvailable && !isOwned && (
                    <p className="text-[9px] text-green-500 font-semibold mt-0.5">Tap to add!</p>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {displayItems.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">🌳</p>
            <p className="font-semibold">No items in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
