const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// POST /api/teacher/setup — Create a new teacher class
router.post('/setup', async (req, res, next) => {
  try {
    const { name, pin, deviceId } = req.body;
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ success: false, error: '4-digit PIN required' });
    }
    const result = await pool.query(
      'INSERT INTO teacher_classes (name, pin, device_id) VALUES ($1, $2, $3) RETURNING id, name',
      [name || 'My Class', pin, deviceId]
    );
    const row = result.rows[0];
    res.json({ success: true, data: { classId: row.id, name: row.name } });
  } catch (err) { next(err); }
});

// POST /api/teacher/add-student — Add a student to a class
router.post('/add-student', async (req, res, next) => {
  try {
    const { classId, profileId } = req.body;
    if (!classId || !profileId) {
      return res.status(400).json({ success: false, error: 'classId and profileId required' });
    }
    await pool.query(
      'INSERT INTO class_roster (class_id, profile_id) VALUES ($1, $2) ON CONFLICT (class_id, profile_id) DO NOTHING',
      [classId, profileId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/teacher/verify-pin — Verify teacher PIN
router.post('/verify-pin', async (req, res, next) => {
  try {
    const { classId, pin } = req.body;
    if (!classId || !pin) {
      return res.status(400).json({ success: false, error: 'classId and pin required' });
    }
    const result = await pool.query('SELECT pin FROM teacher_classes WHERE id = $1', [classId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    const verified = result.rows[0].pin === pin;
    res.json({ success: true, data: { verified } });
  } catch (err) { next(err); }
});

// GET /api/teacher/classes?deviceId=xxx — List teacher classes for a device
router.get('/classes', async (req, res, next) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId required' });
    }
    const result = await pool.query(
      `SELECT tc.id, tc.name, tc.created_at,
              COUNT(cr.id) as student_count
       FROM teacher_classes tc
       LEFT JOIN class_roster cr ON cr.class_id = tc.id
       WHERE tc.device_id = $1
       GROUP BY tc.id
       ORDER BY tc.created_at DESC`,
      [deviceId]
    );
    res.json({
      success: true,
      data: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        studentCount: parseInt(r.student_count),
        createdAt: r.created_at,
      })),
    });
  } catch (err) { next(err); }
});

// GET /api/teacher/dashboard/:classId — Main dashboard aggregation
router.get('/dashboard/:classId', async (req, res, next) => {
  try {
    const { classId } = req.params;

    const [classInfo, studentsRaw, subjectAccuracy, struggleTopics, masteredTopics, mistakePatterns, objectives, lastWeekAccuracy] = await Promise.all([
      // Class info
      pool.query('SELECT name FROM teacher_classes WHERE id = $1', [classId]).then(r => r.rows[0]),

      // Students with weekly stats
      pool.query(
        `SELECT p.id, p.name, p.year_group, p.avatar_color, p.total_xp,
                p.current_level, p.streak_days, p.last_active_date, p.religion,
                COALESCE(SUM(x.xp_amount), 0) as weekly_xp,
                COUNT(DISTINCT cs.id) as sessions_this_week
         FROM class_roster cr
         JOIN profiles p ON p.id = cr.profile_id
         LEFT JOIN xp_events x ON x.profile_id = p.id AND x.created_at >= NOW() - INTERVAL '7 days'
         LEFT JOIN chat_sessions cs ON cs.profile_id = p.id AND cs.created_at >= NOW() - INTERVAL '7 days'
         WHERE cr.class_id = $1
         GROUP BY p.id
         ORDER BY p.name`,
        [classId]
      ).then(r => r.rows),

      // Subject accuracy per student
      pool.query(
        `SELECT tm.profile_id, tm.subject,
                ROUND(AVG(CASE WHEN tm.attempts > 0 THEN (tm.correct_count::float / tm.attempts * 100) ELSE 0 END)) as accuracy
         FROM topic_mastery tm
         JOIN class_roster cr ON cr.profile_id = tm.profile_id
         WHERE cr.class_id = $1
         GROUP BY tm.profile_id, tm.subject`,
        [classId]
      ).then(r => r.rows),

      // Top struggle topics (class-wide)
      pool.query(
        `SELECT tm.subject, tm.topic,
                ROUND(AVG(CASE WHEN tm.attempts > 0 THEN (tm.correct_count::float / tm.attempts * 100) ELSE 0 END)) as avg_accuracy,
                COUNT(CASE WHEN tm.attempts > 0 AND (tm.correct_count::float / tm.attempts < 0.5) THEN 1 END) as students_struggling
         FROM topic_mastery tm
         JOIN class_roster cr ON cr.profile_id = tm.profile_id
         WHERE cr.class_id = $1 AND tm.attempts > 0
         GROUP BY tm.subject, tm.topic
         HAVING AVG(CASE WHEN tm.attempts > 0 THEN (tm.correct_count::float / tm.attempts * 100) ELSE 0 END) < 70
         ORDER BY avg_accuracy ASC
         LIMIT 5`,
        [classId]
      ).then(r => r.rows),

      // Top mastered topics (class-wide)
      pool.query(
        `SELECT tm.subject, tm.topic,
                ROUND(AVG(CASE WHEN tm.attempts > 0 THEN (tm.correct_count::float / tm.attempts * 100) ELSE 0 END)) as avg_accuracy,
                COUNT(CASE WHEN tm.attempts > 0 AND (tm.correct_count::float / tm.attempts >= 0.9) THEN 1 END) as students_mastered
         FROM topic_mastery tm
         JOIN class_roster cr ON cr.profile_id = tm.profile_id
         WHERE cr.class_id = $1 AND tm.attempts > 0
         GROUP BY tm.subject, tm.topic
         HAVING AVG(CASE WHEN tm.attempts > 0 THEN (tm.correct_count::float / tm.attempts * 100) ELSE 0 END) >= 80
         ORDER BY avg_accuracy DESC
         LIMIT 5`,
        [classId]
      ).then(r => r.rows),

      // Recent mistake patterns
      pool.query(
        `SELECT m.subject, m.error_type, COUNT(*) as count
         FROM mistakes m
         JOIN class_roster cr ON cr.profile_id = m.profile_id
         WHERE cr.class_id = $1 AND m.resolved = false AND m.created_at >= NOW() - INTERVAL '14 days'
         GROUP BY m.subject, m.error_type
         ORDER BY count DESC
         LIMIT 10`,
        [classId]
      ).then(r => r.rows),

      // Current week's objectives
      pool.query(
        `SELECT id, subject, topic, objective, completed_by, created_at
         FROM weekly_objectives
         WHERE class_id = $1 AND week_start >= DATE_TRUNC('week', CURRENT_DATE)
         ORDER BY created_at`,
        [classId]
      ).then(r => r.rows),

      // Last week's subject accuracy (for comparison)
      pool.query(
        `SELECT sr.subject,
                AVG(CASE WHEN sr.questions_attempted > 0 THEN (sr.questions_correct::float / sr.questions_attempted * 100) ELSE NULL END)::int as avg_accuracy
         FROM session_reports sr
         JOIN class_roster cr ON cr.profile_id = sr.profile_id
         WHERE cr.class_id = $1
           AND sr.created_at >= NOW() - INTERVAL '14 days'
           AND sr.created_at < NOW() - INTERVAL '7 days'
         GROUP BY sr.subject`,
        [classId]
      ).then(r => r.rows),
    ]);

    if (!classInfo) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Build per-student subject accuracy map
    const accuracyMap = {};
    for (const row of subjectAccuracy) {
      if (!accuracyMap[row.profile_id]) accuracyMap[row.profile_id] = {};
      accuracyMap[row.profile_id][row.subject] = parseInt(row.accuracy);
    }

    // Build students array
    const students = studentsRaw.map(s => ({
      id: s.id,
      name: s.name,
      yearGroup: s.year_group,
      avatarColor: s.avatar_color,
      totalXp: s.total_xp,
      currentLevel: s.current_level,
      streakDays: s.streak_days,
      lastActiveDate: s.last_active_date,
      religion: s.religion,
      weeklyXp: parseInt(s.weekly_xp),
      sessionsThisWeek: parseInt(s.sessions_this_week),
      subjectAccuracy: accuracyMap[s.id] || {},
    }));

    // Compute class-wide average accuracy per subject
    const subjectTotals = {};
    const subjectCounts = {};
    for (const row of subjectAccuracy) {
      const acc = parseInt(row.accuracy);
      if (!subjectTotals[row.subject]) { subjectTotals[row.subject] = 0; subjectCounts[row.subject] = 0; }
      subjectTotals[row.subject] += acc;
      subjectCounts[row.subject] += 1;
    }
    const averageAccuracy = {};
    for (const subject of Object.keys(subjectTotals)) {
      averageAccuracy[subject] = Math.round(subjectTotals[subject] / subjectCounts[subject]);
    }

    // Last week accuracy map for comparison
    const lastWeekMap = {};
    for (const row of lastWeekAccuracy) {
      if (row.subject && row.avg_accuracy != null) {
        lastWeekMap[row.subject] = parseInt(row.avg_accuracy);
      }
    }

    // Generate rule-based suggested next steps
    const suggestedNextSteps = [];

    // Rule 1: Topics with <50% accuracy across 3+ students
    for (const topic of struggleTopics) {
      if (parseInt(topic.students_struggling) >= 3 && parseInt(topic.avg_accuracy) < 50) {
        suggestedNextSteps.push(
          `${topic.students_struggling} students scored below 50% on ${topic.topic} (${topic.subject}) — consider revisiting this topic`
        );
      }
    }

    // Rule 2: Subject average dropped this week vs last week
    for (const subject of Object.keys(averageAccuracy)) {
      const lastWeek = lastWeekMap[subject];
      if (lastWeek != null) {
        const drop = lastWeek - averageAccuracy[subject];
        if (drop >= 10) {
          suggestedNextSteps.push(
            `Class average in ${subject} dropped ${drop}% this week — check recent topics for difficulty spikes`
          );
        }
      }
    }

    // Rule 3: Students inactive for 3+ days
    const now = new Date();
    for (const student of students) {
      if (student.lastActiveDate) {
        const lastActive = new Date(student.lastActiveDate);
        const daysSince = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
        if (daysSince >= 3) {
          suggestedNextSteps.push(
            `${student.name} hasn't used Nuri in ${daysSince} days`
          );
        }
      } else {
        suggestedNextSteps.push(
          `${student.name} hasn't started using Nuri yet`
        );
      }
    }

    // Format objectives with completion info
    const totalStudents = students.length;
    const formattedObjectives = objectives.map(o => ({
      id: o.id,
      subject: o.subject,
      topic: o.topic,
      objective: o.objective,
      completedBy: o.completed_by || [],
      totalStudents,
    }));

    res.json({
      success: true,
      data: {
        className: classInfo.name,
        students,
        classAnalysis: {
          averageAccuracy,
          topStruggleTopics: struggleTopics.map(t => ({
            subject: t.subject,
            topic: t.topic,
            avgAccuracy: parseInt(t.avg_accuracy),
            studentsStruggling: parseInt(t.students_struggling),
          })),
          topMasteredTopics: masteredTopics.map(t => ({
            subject: t.subject,
            topic: t.topic,
            avgAccuracy: parseInt(t.avg_accuracy),
            studentsMastered: parseInt(t.students_mastered),
          })),
          recentMistakePatterns: mistakePatterns.map(m => ({
            subject: m.subject,
            errorType: m.error_type,
            count: parseInt(m.count),
          })),
        },
        suggestedNextSteps,
        weeklyObjectives: formattedObjectives,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/teacher/objectives — Set weekly objectives
router.post('/objectives', async (req, res, next) => {
  try {
    const { classId, objectives } = req.body;
    if (!classId || !objectives || !Array.isArray(objectives) || objectives.length === 0) {
      return res.status(400).json({ success: false, error: 'classId and objectives array required' });
    }
    const weekStart = getWeekStart();
    let count = 0;
    for (const obj of objectives) {
      if (!obj.subject || !obj.topic || !obj.objective) continue;
      await pool.query(
        'INSERT INTO weekly_objectives (class_id, subject, topic, objective, week_start) VALUES ($1, $2, $3, $4, $5)',
        [classId, obj.subject, obj.topic, obj.objective, weekStart]
      );
      count++;
    }
    res.json({ success: true, count });
  } catch (err) { next(err); }
});

// GET /api/teacher/objectives/:classId — Get current week's objectives with completion
router.get('/objectives/:classId', async (req, res, next) => {
  try {
    const { classId } = req.params;
    const weekStart = getWeekStart();

    const [objectives, roster] = await Promise.all([
      pool.query(
        `SELECT id, subject, topic, objective, completed_by, created_at
         FROM weekly_objectives
         WHERE class_id = $1 AND week_start >= $2
         ORDER BY created_at`,
        [classId, weekStart]
      ).then(r => r.rows),
      pool.query(
        'SELECT profile_id FROM class_roster WHERE class_id = $1',
        [classId]
      ).then(r => r.rows.map(row => row.profile_id)),
    ]);

    // For each objective, check which students have activity on that topic this week
    const enriched = [];
    for (const obj of objectives) {
      const completions = await pool.query(
        `SELECT DISTINCT cr.profile_id
         FROM class_roster cr
         WHERE cr.class_id = $1
           AND (
             EXISTS (
               SELECT 1 FROM quiz_history qh
               WHERE qh.profile_id = cr.profile_id
                 AND LOWER(qh.topic) = LOWER($2)
                 AND qh.created_at >= $3
             )
             OR EXISTS (
               SELECT 1 FROM session_reports sr
               WHERE sr.profile_id = cr.profile_id
                 AND LOWER(sr.topic) = LOWER($2)
                 AND sr.created_at >= $3
             )
           )`,
        [classId, obj.topic, weekStart]
      );
      enriched.push({
        id: obj.id,
        subject: obj.subject,
        topic: obj.topic,
        objective: obj.objective,
        completedBy: completions.rows.map(r => r.profile_id),
        totalStudents: roster.length,
      });
    }

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
});

// DELETE /api/teacher/objectives/:objectiveId — Remove an objective
router.delete('/objectives/:objectiveId', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM weekly_objectives WHERE id = $1', [req.params.objectiveId]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Helper: get Monday of the current week as YYYY-MM-DD
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

module.exports = router;
