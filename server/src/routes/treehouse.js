// server/src/routes/treehouse.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { checkUnlocks, seedItems, isUnlocked, getProfileStats, TREEHOUSE_ITEMS } = require('../services/treehouse-items');

// Ensure treehouse tables exist (idempotent)
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS treehouse_items (
      id           SERIAL PRIMARY KEY,
      name         TEXT NOT NULL,
      category     TEXT NOT NULL,
      icon         TEXT NOT NULL,
      unlock_type  TEXT NOT NULL,
      unlock_value INTEGER NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS owned_items (
      id          SERIAL PRIMARY KEY,
      profile_id  INT REFERENCES profiles(id) ON DELETE CASCADE,
      item_id     INT REFERENCES treehouse_items(id) ON DELETE CASCADE,
      equipped    BOOLEAN NOT NULL DEFAULT FALSE,
      earned_at   TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (profile_id, item_id)
    )
  `);
}

// GET /api/treehouse/:profileId — all items with unlock status
router.get('/:profileId', async (req, res, next) => {
  try {
    await ensureTables();
    // Seed items on first call if the table is empty
    const countResult = await pool.query('SELECT COUNT(*) as c FROM treehouse_items');
    if (parseInt(countResult.rows[0].c) === 0) {
      await seedItems();
    }

    const { profileId } = req.params;
    const { ownedItems, availableItems, lockedItems, stats } = await checkUnlocks(profileId);

    res.json({
      success: true,
      data: {
        ownedItems,
        availableItems,
        lockedItems,
        stats,
        totalItems: ownedItems.length + availableItems.length + lockedItems.length,
        collectedCount: ownedItems.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/treehouse/equip — toggle equip state for an item
router.post('/equip', async (req, res, next) => {
  try {
    await ensureTables();

    const { profileId, itemId, equipped } = req.body;
    if (!profileId || !itemId || equipped === undefined) {
      return res.status(400).json({ success: false, error: 'profileId, itemId, and equipped required' });
    }

    // Verify the item exists
    const itemResult = await pool.query('SELECT * FROM treehouse_items WHERE id = $1', [itemId]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    const item = itemResult.rows[0];

    // Verify profile meets unlock criteria before owning
    const stats = await getProfileStats(profileId);
    if (!isUnlocked(item, stats)) {
      return res.status(403).json({ success: false, error: 'Item not yet unlocked' });
    }

    // Upsert owned item record
    await pool.query(
      `INSERT INTO owned_items (profile_id, item_id, equipped)
       VALUES ($1, $2, $3)
       ON CONFLICT (profile_id, item_id) DO UPDATE SET equipped = EXCLUDED.equipped`,
      [profileId, itemId, equipped]
    );

    res.json({ success: true, data: { profileId, itemId, equipped } });
  } catch (err) {
    next(err);
  }
});

// POST /api/treehouse/seed — manually seed item definitions
router.post('/seed', async (req, res, next) => {
  try {
    await ensureTables();
    const count = await seedItems();
    res.json({ success: true, data: { seeded: count } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
