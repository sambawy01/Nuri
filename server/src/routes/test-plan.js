const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { chat } = require('../services/ai-provider');

// POST /api/test-plan/create
router.post('/create', async (req, res, next) => {
  try {
    const { profileId, subject, topics, testDate } = req.body;

    if (!profileId || !subject || !topics || !testDate) {
      return res.status(400).json({
        success: false,
        error: 'profileId, subject, topics, and testDate are required',
      });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'topics must be a non-empty array',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const test = new Date(testDate);
    test.setHours(0, 0, 0, 0);
    const daysRemaining = Math.round((test - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 1) {
      return res.status(400).json({
        success: false,
        error: 'Test date must be at least 1 day in the future',
      });
    }

    // Build AI system prompt for study plan generation
    const systemPrompt = `You are a study plan generator for children aged 5-12. Given a subject, list of topics, and number of days until a test, you generate a structured day-by-day study plan.

Rules:
- Distribute topics evenly across review and practice days
- The LAST day before the test is always a "confidence" day (light review + encouragement)
- If there are 3+ days, include one "mock_test" day near the end
- Day types: "review" (learn/re-learn), "practice" (quiz/exercises), "mock_test" (full practice test), "confidence" (light review, build confidence)
- Each day gets a short, friendly label like "Review fractions" or "Practice adding decimals"
- Keep labels short (max 8 words), child-friendly, encouraging

Respond with ONLY valid JSON — no markdown, no explanation:
{
  "days": [
    { "day_number": 1, "day_type": "review", "topic": "Fractions", "label": "Review fractions with Nuri" },
    { "day_number": 2, "day_type": "practice", "topic": "Fractions", "label": "Practice fractions questions" },
    ...
  ]
}`;

    const userMessage = `Subject: ${subject}
Topics to cover: ${topics.join(', ')}
Days until test: ${daysRemaining}

Generate a ${daysRemaining}-day study plan.`;

    let planDays;
    try {
      const aiResponse = await chat(
        [{ role: 'user', content: userMessage }],
        systemPrompt
      );

      // Strip any markdown code fences if present
      const cleaned = aiResponse.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      planDays = parsed.days;

      if (!Array.isArray(planDays) || planDays.length === 0) {
        throw new Error('AI returned invalid plan structure');
      }
    } catch (aiErr) {
      // Fallback: generate a simple plan without AI
      planDays = generateFallbackPlan(topics, daysRemaining);
    }

    // Store plan in DB
    const planResult = await pool.query(
      `INSERT INTO test_plans (profile_id, subject, topics, test_date, total_days)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [profileId, subject, JSON.stringify(topics), testDate, planDays.length]
    );
    const plan = planResult.rows[0];

    // Store each day
    const dayRows = [];
    for (const day of planDays) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (day.day_number - 1));

      const dayResult = await pool.query(
        `INSERT INTO test_plan_days (plan_id, day_number, day_type, topic, label, scheduled_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [plan.id, day.day_number, day.day_type, day.topic || null, day.label, scheduledDate.toISOString().split('T')[0]]
      );
      dayRows.push(dayResult.rows[0]);
    }

    res.json({
      success: true,
      data: {
        ...plan,
        days: dayRows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/test-plan/active/:profileId
router.get('/active/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const plansResult = await pool.query(
      `SELECT * FROM test_plans
       WHERE profile_id = $1 AND test_date >= CURRENT_DATE
       ORDER BY test_date ASC`,
      [profileId]
    );

    const plans = await Promise.all(
      plansResult.rows.map(async (plan) => {
        const daysResult = await pool.query(
          `SELECT * FROM test_plan_days WHERE plan_id = $1 ORDER BY day_number ASC`,
          [plan.id]
        );
        const days = daysResult.rows;
        const completedCount = days.filter(d => d.completed).length;

        // Find today's day or the next uncompleted day
        const todayStr = new Date().toISOString().split('T')[0];
        const todayDay = days.find(d => d.scheduled_date && d.scheduled_date.toISOString().split('T')[0] === todayStr && !d.completed)
          || days.find(d => !d.completed);

        const testDate = new Date(plan.test_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        testDate.setHours(0, 0, 0, 0);
        const daysUntilTest = Math.round((testDate - today) / (1000 * 60 * 60 * 24));

        return {
          ...plan,
          days,
          completedCount,
          totalDays: days.length,
          todayDay,
          daysUntilTest,
        };
      })
    );

    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

// POST /api/test-plan/complete-day
router.post('/complete-day', async (req, res, next) => {
  try {
    const { dayId } = req.body;

    if (!dayId) {
      return res.status(400).json({ success: false, error: 'dayId is required' });
    }

    const result = await pool.query(
      `UPDATE test_plan_days
       SET completed = TRUE, completed_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [dayId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Day not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * Fallback plan generator when AI is unavailable
 */
function generateFallbackPlan(topics, daysRemaining) {
  const days = [];
  const topicCount = topics.length;

  if (daysRemaining === 1) {
    days.push({
      day_number: 1,
      day_type: 'confidence',
      topic: topics[0] || null,
      label: 'Quick review before the test!',
    });
    return days;
  }

  // Last day is always confidence
  // Second-to-last (if days >= 3) is mock_test
  const hasMockTest = daysRemaining >= 3;
  const regularDays = daysRemaining - 1 - (hasMockTest ? 1 : 0);

  let dayNum = 1;

  // Alternate review/practice across topics
  for (let i = 0; i < regularDays; i++) {
    const topic = topics[i % topicCount];
    const isReview = i % 2 === 0;
    days.push({
      day_number: dayNum++,
      day_type: isReview ? 'review' : 'practice',
      topic,
      label: isReview ? `Review ${topic}` : `Practice ${topic} questions`,
    });
  }

  if (hasMockTest) {
    days.push({
      day_number: dayNum++,
      day_type: 'mock_test',
      topic: null,
      label: 'Full practice test — you\'ve got this!',
    });
  }

  days.push({
    day_number: dayNum,
    day_type: 'confidence',
    topic: null,
    label: 'Light review — stay calm and confident!',
  });

  return days;
}

module.exports = router;
