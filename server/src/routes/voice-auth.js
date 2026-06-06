'use strict';

/**
 * Voice Authentication Routes
 *
 * Endpoints for speaker recognition enrollment and identification.
 * Falls back to manual selection when confidence is too low or
 * the speaker service is unavailable.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const speakerRecognition = require('../services/speaker-recognition');

// POST /api/voice/enroll — enroll a voice profile
router.post('/enroll', async (req, res, next) => {
  try {
    const { profileId, audio, contentType } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId is required' });
    }
    if (!audio) {
      return res.status(400).json({ success: false, error: 'audio (base64) is required' });
    }

    // Verify profile exists
    const profileCheck = await pool.query('SELECT id FROM profiles WHERE id = $1', [profileId]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const result = await speakerRecognition.enrollVoice(profileId, audio, contentType || 'audio/webm');

    if (result.success) {
      res.json({ success: true, data: { profileId, samplesCount: result.samplesCount } });
    } else {
      res.status(502).json({ success: false, error: result.error || 'Voice enrollment failed' });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/voice/identify — identify a speaker from audio
router.post('/identify', async (req, res, next) => {
  try {
    const { audio, contentType } = req.body;

    if (!audio) {
      return res.status(400).json({ success: false, error: 'audio (base64) is required' });
    }

    const match = await speakerRecognition.identifySpeaker(audio, contentType || 'audio/webm');

    if (!match) {
      return res.json({ success: false, needsManualSelection: true });
    }

    // Retrieve full profile like /api/profiles/login does (without PIN)
    const profileResult = await pool.query(
      'SELECT id, name, year_group, avatar_color, total_xp, current_level, streak_days FROM profiles WHERE id = $1',
      [match.profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.json({ success: false, needsManualSelection: true });
    }

    const profile = profileResult.rows[0];
    res.json({
      success: true,
      data: {
        ...profile,
        confidence: match.confidence,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/voice/enroll/:profileId — add another voice sample (re-enrollment)
router.post('/enroll/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { audio, contentType } = req.body;

    if (!audio) {
      return res.status(400).json({ success: false, error: 'audio (base64) is required' });
    }

    // Verify profile exists
    const profileCheck = await pool.query('SELECT id FROM profiles WHERE id = $1', [profileId]);
    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const result = await speakerRecognition.enrollVoice(parseInt(profileId, 10), audio, contentType || 'audio/webm');

    if (result.success) {
      res.json({ success: true, data: { profileId: parseInt(profileId, 10), samplesCount: result.samplesCount } });
    } else {
      res.status(502).json({ success: false, error: result.error || 'Voice re-enrollment failed' });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/voice/profile/:profileId — get voice profile status
router.get('/profile/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const voiceProfile = await speakerRecognition.getVoiceProfile(parseInt(profileId, 10));

    if (!voiceProfile) {
      return res.json({ success: true, data: { enrolled: false } });
    }

    res.json({
      success: true,
      data: {
        enrolled: true,
        id: voiceProfile.id,
        samplesCount: voiceProfile.samplesCount,
        createdAt: voiceProfile.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/voice/profile/:profileId — delete voice enrollment
router.delete('/profile/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const result = await speakerRecognition.deleteVoiceProfile(parseInt(profileId, 10));

    if (result.success) {
      res.json({ success: true, data: { profileId: parseInt(profileId, 10) } });
    } else {
      res.status(500).json({ success: false, error: result.error || 'Failed to delete voice profile' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;