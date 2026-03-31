const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// POST /api/profiles — create profile
router.post('/', async (req, res, next) => {
  try {
    const { name, yearGroup, avatarColor, pin } = req.body;

    if (!name || !yearGroup || !avatarColor) {
      return res.status(400).json({
        success: false,
        error: 'name, yearGroup, and avatarColor are required',
      });
    }

    if (yearGroup < 1 || yearGroup > 6) {
      return res.status(400).json({
        success: false,
        error: 'yearGroup must be between 1 and 6',
      });
    }

    if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be exactly 4 digits',
      });
    }

    const result = await pool.query(
      `INSERT INTO profiles (name, year_group, avatar_color, pin)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, yearGroup, avatarColor, pin || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/profiles — list all profiles
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, year_group, avatar_color, total_xp, current_level, streak_days, last_active_date, created_at FROM profiles ORDER BY created_at DESC'
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/profiles/:id — get profile with stats
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Get recent XP events
    const xpResult = await pool.query(
      'SELECT * FROM xp_events WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );

    // Get topic mastery summary
    const masteryResult = await pool.query(
      'SELECT subject, COUNT(*) as topics_practiced, AVG(stars) as avg_stars FROM topic_mastery WHERE profile_id = $1 GROUP BY subject',
      [id]
    );

    // Remove pin from response
    const { pin, ...profileData } = profile;

    res.json({
      success: true,
      data: {
        ...profileData,
        recentXP: xpResult.rows,
        masterySummary: masteryResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profiles/:id — update profile
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, yearGroup, avatarColor, pin } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (yearGroup !== undefined) {
      if (yearGroup < 1 || yearGroup > 6) {
        return res.status(400).json({
          success: false,
          error: 'yearGroup must be between 1 and 6',
        });
      }
      fields.push(`year_group = $${paramIndex++}`);
      values.push(yearGroup);
    }
    if (avatarColor !== undefined) {
      fields.push(`avatar_color = $${paramIndex++}`);
      values.push(avatarColor);
    }
    if (pin !== undefined) {
      if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
        return res.status(400).json({
          success: false,
          error: 'PIN must be exactly 4 digits',
        });
      }
      fields.push(`pin = $${paramIndex++}`);
      values.push(pin || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const { pin: _, ...profileData } = result.rows[0];
    res.json({ success: true, data: profileData });
  } catch (err) {
    next(err);
  }
});

// POST /api/profiles/login — verify PIN
router.post('/login', async (req, res, next) => {
  try {
    const { profileId, pin } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'profileId is required',
      });
    }

    const result = await pool.query(
      'SELECT id, name, year_group, avatar_color, pin, total_xp, current_level, streak_days FROM profiles WHERE id = $1',
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = result.rows[0];

    // If profile has a PIN, verify it
    if (profile.pin) {
      if (!pin) {
        return res.status(401).json({ success: false, error: 'PIN required' });
      }
      if (profile.pin !== pin) {
        return res.status(401).json({ success: false, error: 'Incorrect PIN' });
      }
    }

    const { pin: _, ...profileData } = profile;
    res.json({ success: true, data: profileData });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
