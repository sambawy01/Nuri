const express = require('express');
const router = express.Router();
const { getTopics, curriculum } = require('../services/curriculum');
const pool = require('../db/connection');

// GET /api/curriculum/:subject/:yearGroup — get topics with mastery data
router.get('/:subject/:yearGroup', async (req, res, next) => {
  try {
    const { subject, yearGroup } = req.params;
    const profileId = req.query.profileId;
    const year = parseInt(yearGroup);

    const topics = getTopics(subject, year);
    if (!topics) {
      return res.status(404).json({ success: false, error: 'Subject or year group not found' });
    }

    // If profileId provided, fetch mastery data for each topic
    let masteryMap = {};
    if (profileId) {
      const result = await pool.query(
        'SELECT topic, stars, attempts, correct_count FROM topic_mastery WHERE profile_id = $1 AND subject = $2',
        [profileId, subject]
      );
      for (const row of result.rows) {
        masteryMap[row.topic] = {
          stars: row.stars,
          attempts: row.attempts,
          correctCount: row.correct_count,
        };
      }
    }

    const topicsWithMastery = topics.map(topic => ({
      id: topic.id,
      name: topic.name,
      strand: topic.strand || '',
      objectives: topic.objectives || [],
      codes: topic.codes || [],
      stars: masteryMap[topic.name]?.stars || 0,
      attempts: masteryMap[topic.name]?.attempts || 0,
      correctCount: masteryMap[topic.name]?.correctCount || 0,
    }));

    res.json({ success: true, data: topicsWithMastery });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
