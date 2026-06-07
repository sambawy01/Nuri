const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { buildExplainBackPrompt, chat } = require('../services/ai-provider');
const { awardXP } = require('../services/xp');

// POST /api/explain/message — send explanation to Nuri
router.post('/message', async (req, res, next) => {
  try {
    const { profileId, subject, topic, message, sessionId } = req.body;

    if (!profileId || !subject || !topic || !message) {
      return res.status(400).json({
        success: false,
        error: 'profileId, subject, topic, and message are required',
      });
    }

    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];
    let session;
    let messages = [];

    if (sessionId) {
      const sessionResult = await pool.query(
        'SELECT * FROM explain_back_sessions WHERE id = $1 AND profile_id = $2',
        [sessionId, profileId]
      );
      if (sessionResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }
      session = sessionResult.rows[0];
      messages = session.messages || [];
    } else {
      const sessionResult = await pool.query(
        `INSERT INTO explain_back_sessions (profile_id, subject, topic)
         VALUES ($1, $2, $3) RETURNING *`,
        [profileId, subject, topic]
      );
      session = sessionResult.rows[0];
    }

    messages.push({ role: 'user', content: message });

    const systemPrompt = buildExplainBackPrompt(profile, subject, topic);
    const responseText = await chat(messages, systemPrompt);

    // Parse JSON response from AI
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { reply: responseText, done: false };
    }

    messages.push({ role: 'assistant', content: responseText });

    // Award XP and finalize if done
    let xpResult = null;
    if (parsed.done && parsed.score) {
      const xpAmount = parsed.score * 5; // 5-25 XP based on understanding
      await pool.query(
        `UPDATE explain_back_sessions
         SET messages = $1, understanding_score = $2, xp_earned = $3, ended_at = NOW()
         WHERE id = $4`,
        [JSON.stringify(messages), parsed.score, xpAmount, session.id]
      );
      xpResult = await awardXP(profileId, 'learn_session', subject, topic);
    } else {
      await pool.query(
        'UPDATE explain_back_sessions SET messages = $1 WHERE id = $2',
        [JSON.stringify(messages), session.id]
      );
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        reply: parsed.reply,
        done: parsed.done || false,
        score: parsed.score || null,
        summary: parsed.summary || null,
        xp: xpResult,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
