const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/learning-style/:profileId — get learning style profile
router.get('/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const result = await pool.query(
      'SELECT * FROM learning_style_profiles WHERE profile_id = $1',
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { visual: 0, analogy: 0, example_first: 0, auditory: 0, try_first: 0, total_interactions: 0 },
      });
    }

    const style = result.rows[0];
    res.json({
      success: true,
      data: {
        visual: style.visual,
        analogy: style.analogy,
        example_first: style.example_first,
        auditory: style.auditory,
        try_first: style.try_first,
        total_interactions: style.total_interactions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/learning-style/track — record a learning interaction outcome
router.post('/track', async (req, res, next) => {
  try {
    const { profileId, explanationType, wasCorrect } = req.body;

    if (!profileId || !explanationType || wasCorrect === undefined) {
      return res.status(400).json({
        success: false,
        error: 'profileId, explanationType, and wasCorrect are required',
      });
    }

    const validTypes = ['visual', 'analogy', 'example_first', 'auditory', 'try_first'];
    if (!validTypes.includes(explanationType)) {
      return res.status(400).json({
        success: false,
        error: `explanationType must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Upsert the learning style profile with running average
    const outcome = wasCorrect ? 1.0 : 0.0;

    await pool.query(
      `INSERT INTO learning_style_profiles (profile_id, ${explanationType}, total_interactions)
       VALUES ($1, $2, 1)
       ON CONFLICT (profile_id)
       DO UPDATE SET
         ${explanationType} = learning_style_profiles.${explanationType} +
           ($2 - learning_style_profiles.${explanationType}) / (learning_style_profiles.total_interactions + 1),
         total_interactions = learning_style_profiles.total_interactions + 1,
         updated_at = NOW()`,
      [profileId, outcome]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
