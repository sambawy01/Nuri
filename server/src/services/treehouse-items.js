// server/src/services/treehouse-items.js
const pool = require('../db/connection');

const TREEHOUSE_ITEMS = [
  // Furniture (unlocked by level)
  { id: 'wooden-desk', name: 'Wooden Desk', category: 'furniture', icon: '🪑', unlock_type: 'level', unlock_value: 1 },
  { id: 'bookshelf', name: 'Bookshelf', category: 'furniture', icon: '📚', unlock_type: 'level', unlock_value: 3 },
  { id: 'cozy-beanbag', name: 'Cozy Beanbag', category: 'furniture', icon: '🛋️', unlock_type: 'level', unlock_value: 5 },
  { id: 'globe', name: 'Globe', category: 'furniture', icon: '🌍', unlock_type: 'level', unlock_value: 8 },
  { id: 'telescope', name: 'Telescope', category: 'furniture', icon: '🔭', unlock_type: 'level', unlock_value: 10 },
  { id: 'grand-piano', name: 'Grand Piano', category: 'furniture', icon: '🎹', unlock_type: 'level', unlock_value: 15 },
  { id: 'golden-throne', name: 'Golden Throne', category: 'furniture', icon: '👑', unlock_type: 'level', unlock_value: 20 },

  // Decorations (unlocked by badge count)
  { id: 'star-banner', name: 'Star Banner', category: 'decoration', icon: '⭐', unlock_type: 'badges', unlock_value: 3 },
  { id: 'trophy-shelf', name: 'Trophy Shelf', category: 'decoration', icon: '🏆', unlock_type: 'badges', unlock_value: 5 },
  { id: 'world-map', name: 'World Map', category: 'decoration', icon: '🗺️', unlock_type: 'badges', unlock_value: 10 },
  { id: 'fairy-lights', name: 'Fairy Lights', category: 'decoration', icon: '✨', unlock_type: 'badges', unlock_value: 15 },
  { id: 'crystal-ball', name: 'Crystal Ball', category: 'decoration', icon: '🔮', unlock_type: 'badges', unlock_value: 20 },

  // Accessories for Nuri (unlocked by streak)
  { id: 'red-scarf', name: 'Red Scarf', category: 'accessory', icon: '🧣', unlock_type: 'streak', unlock_value: 3 },
  { id: 'cool-sunglasses', name: 'Cool Sunglasses', category: 'accessory', icon: '🕶️', unlock_type: 'streak', unlock_value: 7 },
  { id: 'wizard-hat', name: 'Wizard Hat', category: 'accessory', icon: '🎩', unlock_type: 'streak', unlock_value: 14 },
  { id: 'golden-wings', name: 'Golden Wings', category: 'accessory', icon: '🪽', unlock_type: 'streak', unlock_value: 30 },
  { id: 'crown-of-stars', name: 'Crown of Stars', category: 'accessory', icon: '👑', unlock_type: 'streak', unlock_value: 100 },

  // Special (unlocked by homework count)
  { id: 'magic-lamp', name: 'Magic Lamp', category: 'special', icon: '🪔', unlock_type: 'homework', unlock_value: 5 },
  { id: 'ancient-scroll', name: 'Ancient Scroll', category: 'special', icon: '📜', unlock_type: 'homework', unlock_value: 10 },
  { id: 'phoenix-feather', name: 'Phoenix Feather', category: 'special', icon: '🪶', unlock_type: 'homework', unlock_value: 20 },
];

async function seedItems() {
  for (const item of TREEHOUSE_ITEMS) {
    await pool.query(
      `INSERT INTO treehouse_items (id, name, category, icon, unlock_type, unlock_value)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         icon = EXCLUDED.icon,
         unlock_type = EXCLUDED.unlock_type,
         unlock_value = EXCLUDED.unlock_value`,
      [item.id, item.name, item.category, item.icon, item.unlock_type, item.unlock_value]
    );
  }
  return TREEHOUSE_ITEMS.length;
}

async function getProfileStats(profileId) {
  const [profile, badgeCount, homeworkCount] = await Promise.all([
    pool.query('SELECT current_level, streak_days FROM profiles WHERE id = $1', [profileId])
      .then(r => r.rows[0]),
    pool.query('SELECT COUNT(*) as c FROM earned_badges WHERE profile_id = $1', [profileId])
      .then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT COUNT(*) as c FROM homework_sessions WHERE profile_id = $1 AND completed_at IS NOT NULL', [profileId])
      .then(r => parseInt(r.rows[0].c)),
  ]);

  return {
    level: profile?.current_level || 1,
    streak: profile?.streak_days || 0,
    badges: badgeCount,
    homework: homeworkCount,
  };
}

function isUnlocked(item, stats) {
  switch (item.unlock_type) {
    case 'level':    return stats.level >= item.unlock_value;
    case 'badges':   return stats.badges >= item.unlock_value;
    case 'streak':   return stats.streak >= item.unlock_value;
    case 'homework': return stats.homework >= item.unlock_value;
    default:         return false;
  }
}

function unlockLabel(item) {
  switch (item.unlock_type) {
    case 'level':    return `Reach Level ${item.unlock_value} to unlock!`;
    case 'badges':   return `Earn ${item.unlock_value} badges to unlock!`;
    case 'streak':   return `Reach a ${item.unlock_value}-day streak to unlock!`;
    case 'homework': return `Complete ${item.unlock_value} homework sessions to unlock!`;
    default:         return 'Keep learning to unlock!';
  }
}

async function checkUnlocks(profileId) {
  const stats = await getProfileStats(profileId);

  // Get owned/equipped items for this profile
  let ownedRows = [];
  try {
    const result = await pool.query(
      'SELECT item_id, equipped FROM treehouse_owned_items WHERE profile_id = $1',
      [profileId]
    );
    ownedRows = result.rows;
  } catch {
    // Table may not exist yet — return graceful fallback
  }

  const ownedMap = {};
  for (const row of ownedRows) {
    ownedMap[row.item_id] = { equipped: row.equipped };
  }

  const ownedItems = [];
  const availableItems = [];
  const lockedItems = [];

  for (const item of TREEHOUSE_ITEMS) {
    const unlocked = isUnlocked(item, stats);
    const owned = ownedMap[item.id];

    const enriched = {
      ...item,
      unlockLabel: unlockLabel(item),
      stats: {
        levelRequired: item.unlock_type === 'level' ? item.unlock_value : null,
        badgesRequired: item.unlock_type === 'badges' ? item.unlock_value : null,
        streakRequired: item.unlock_type === 'streak' ? item.unlock_value : null,
        homeworkRequired: item.unlock_type === 'homework' ? item.unlock_value : null,
      },
    };

    if (owned) {
      ownedItems.push({ ...enriched, equipped: owned.equipped });
    } else if (unlocked) {
      availableItems.push({ ...enriched, equipped: false });
    } else {
      lockedItems.push({ ...enriched, equipped: false });
    }
  }

  return { ownedItems, availableItems, lockedItems, stats };
}

module.exports = {
  TREEHOUSE_ITEMS,
  seedItems,
  checkUnlocks,
  getProfileStats,
  isUnlocked,
};
