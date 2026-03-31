const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { buildSystemPrompt, chat, chatStream, supportsStreaming } = require('../services/ai-provider');
const { updateStreak, awardXP } = require('../services/xp');

// POST /api/chat — send message to Nuri
router.post('/', async (req, res, next) => {
  try {
    const { profileId, subject, mode, message, sessionId } = req.body;

    if (!profileId || !subject || !mode || !message) {
      return res.status(400).json({
        success: false,
        error: 'profileId, subject, mode, and message are required',
      });
    }

    if (!['learn', 'quiz', 'chat'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'mode must be one of: learn, quiz, chat',
      });
    }

    // Get the profile
    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Update streak for this session
    await updateStreak(profileId);

    let session;
    let messages = [];

    if (sessionId) {
      // Continue existing session
      const sessionResult = await pool.query(
        'SELECT * FROM chat_sessions WHERE id = $1 AND profile_id = $2',
        [sessionId, profileId]
      );

      if (sessionResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }

      session = sessionResult.rows[0];
      messages = session.messages || [];
    } else {
      // Create new session
      const sessionResult = await pool.query(
        `INSERT INTO chat_sessions (profile_id, subject, mode)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [profileId, subject, mode]
      );

      session = sessionResult.rows[0];
    }

    // Add the user's message
    messages.push({ role: 'user', content: message });

    const systemPrompt = buildSystemPrompt(profile, subject, mode);
    const wantsStream = req.query.stream === 'true' && supportsStreaming() && chatStream;

    if (wantsStream) {
      // SSE streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Send session ID first
      res.write(`data: ${JSON.stringify({ type: 'session', sessionId: session.id })}\n\n`);

      const fullResponse = await chatStream(messages, systemPrompt, (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      });

      // Save to DB
      messages.push({ role: 'assistant', content: fullResponse });
      await pool.query(
        'UPDATE chat_sessions SET messages = $1 WHERE id = $2',
        [JSON.stringify(messages), session.id]
      );

      // Award XP
      const userMessageCount = messages.filter((m) => m.role === 'user').length;
      let xpResult = null;
      if (mode === 'learn' && userMessageCount % 5 === 0) {
        xpResult = await awardXP(profileId, 'learn_session', subject, null);
      }

      res.write(`data: ${JSON.stringify({ type: 'done', xp: xpResult })}\n\n`);
      res.end();
    } else {
      // Non-streaming response
      const response = await chat(messages, systemPrompt);

      messages.push({ role: 'assistant', content: response });
      await pool.query(
        'UPDATE chat_sessions SET messages = $1 WHERE id = $2',
        [JSON.stringify(messages), session.id]
      );

      const userMessageCount = messages.filter((m) => m.role === 'user').length;
      let xpResult = null;
      if (mode === 'learn' && userMessageCount % 5 === 0) {
        xpResult = await awardXP(profileId, 'learn_session', subject, null);
      }

      res.json({
        success: true,
        data: { sessionId: session.id, response, xp: xpResult },
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
