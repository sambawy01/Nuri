import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Flame, Zap, Trophy, TrendingUp, AlertTriangle,
  CheckCircle2, Target, Lightbulb, Plus, X, BarChart2, BookOpen,
  GraduationCap, Clock,
} from 'lucide-react';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';
import ParentPinModal from '../components/ParentPinModal';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── helpers ────────────────────────────────────────────────────────────────

const SESSION_KEY = (classId) => `teacher_verified_${classId}`;

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function subjectColor(subject) {
  return subjects[subject]?.color || '#6366F1';
}

function subjectEmoji(subject) {
  return subjects[subject]?.emoji || '';
}

function engagementStatus(lastActiveDate) {
  if (!lastActiveDate) return { color: 'bg-gray-300', label: 'Never' };
  const now = new Date();
  const last = new Date(lastActiveDate);
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { color: 'bg-green-400', label: 'Today' };
  if (diffDays <= 6) return { color: 'bg-yellow-400', label: `${diffDays}d ago` };
  return { color: 'bg-red-400', label: `${diffDays}d ago` };
}

// ─── sub-components ─────────────────────────────────────────────────────────

function Card({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-md p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function ClassPresence({ presence }) {
  if (!Array.isArray(presence) || presence.length === 0) return null;
  const withData = presence.filter((p) => (p.sessions ?? 0) > 0);
  if (withData.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-purple-500" />
          <h3 className="font-extrabold text-base text-gray-700">Class engagement</h3>
        </div>
        <span className="text-xs text-gray-400 font-semibold">last 7 days</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Percentage of session time each student was actually present at the screen. Lower = more distracted.
      </p>
      <div className="space-y-2">
        {withData.map((row) => {
          const pct = Math.round((row.avgPresence || 0) * 100);
          const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400';
          return (
            <div key={row.profileId} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 w-28 truncate">{row.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-600 w-10 text-right">{pct}%</span>
              {row.voidedCount > 0 && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                  {row.voidedCount} void
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, color = 'text-gray-700' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className={color} />
      <h3 className={`font-extrabold text-base ${color}`}>{title}</h3>
    </div>
  );
}

// ─── Section 1: Student Overview ────────────────────────────────────────────

function StudentOverview({ students, navigate }) {
  if (!students || students.length === 0) {
    return (
      <Card delay={0.25}>
        <SectionTitle icon={Users} title="Students" color="text-blue-500" />
        <p className="text-sm text-gray-400 text-center py-4">No students yet — add students from the setup page.</p>
      </Card>
    );
  }

  return (
    <Card delay={0.25}>
      <SectionTitle icon={Users} title="Students" color="text-blue-500" />
      <div className="space-y-2">
        {students.map((s, i) => {
          const eng = engagementStatus(s.lastActiveDate);
          return (
            <motion.button
              key={s.id}
              onClick={() => navigate(`/parent/${s.id}`)}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-100"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Avatar dot */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                style={{ backgroundColor: s.avatarColor || '#6366F1' }}
              >
                {s.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 truncate">{s.name}</span>
                  <span className="text-xs text-gray-400 font-medium">Y{s.yearGroup}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Flame size={12} className="text-orange-400" />
                    {s.streakDays || 0}d
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Zap size={12} className="text-purple-400" />
                    +{s.weeklyXp || 0} XP
                  </span>
                </div>
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`w-2.5 h-2.5 rounded-full ${eng.color}`} />
                <span className="text-xs text-gray-400 font-medium">{eng.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Section 2: Weekly Objectives ───────────────────────────────────────────

function WeeklyObjectives({ objectives, classId, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('maths');
  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!topic.trim() || !objective.trim()) return;
    setSaving(true);
    try {
      await api('/teacher/objectives', {
        method: 'POST',
        body: { classId, subject, topic: topic.trim(), objective: objective.trim() },
      });
      setTopic('');
      setObjective('');
      setShowForm(false);
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(objId) {
    try {
      await api(`/teacher/objectives/${objId}`, { method: 'DELETE' });
      onRefresh();
    } catch {
      // silently fail
    }
  }

  const subjectOptions = Object.entries(subjects).map(([key, s]) => ({
    key,
    name: s.name,
  }));

  return (
    <Card delay={0.35}>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle icon={Target} title="Weekly Objectives" color="text-green-500" />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex gap-2">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="text-sm font-bold border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                {subjectOptions.map(s => (
                  <option key={s.key} value={s.key}>{s.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Topic (e.g. Fractions)"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <input
              type="text"
              placeholder="Objective (e.g. Understand equivalent fractions)"
              value={objective}
              onChange={e => setObjective(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !topic.trim() || !objective.trim()}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
              >
                <Plus size={13} />
                {saving ? 'Adding...' : 'Add Objective'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Objectives list */}
      {(!objectives || objectives.length === 0) && !showForm && (
        <p className="text-sm text-gray-400 text-center py-3">No objectives set this week.</p>
      )}
      <div className="space-y-3">
        {(objectives || []).map((obj, i) => {
          const completed = obj.completedBy?.length || 0;
          const total = obj.totalStudents || 1;
          const pct = Math.round((completed / total) * 100);
          const color = subjectColor(obj.subject);
          return (
            <motion.div
              key={obj.id || i}
              className="border border-gray-100 rounded-xl p-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {subjectEmoji(obj.subject)} {capitalize(obj.subject)}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{obj.topic}</span>
                </div>
                <button
                  onClick={() => handleDelete(obj.id)}
                  className="shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                  aria-label="Remove objective"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-2">{obj.objective}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.45 }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500">{completed}/{total}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Section 3: Class Performance ───────────────────────────────────────────

function ClassPerformance({ averageAccuracy }) {
  if (!averageAccuracy || Object.keys(averageAccuracy).length === 0) return null;

  const entries = Object.entries(averageAccuracy);

  return (
    <Card delay={0.45}>
      <SectionTitle icon={BarChart2} title="Class Performance" color="text-blue-500" />
      <div className="space-y-3">
        {entries.map(([subject, acc]) => {
          const color = subjectColor(subject);
          return (
            <div key={subject}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <span>{subjectEmoji(subject)}</span>
                  {capitalize(subject)}
                </span>
                <span className="text-sm font-extrabold" style={{ color }}>{acc}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${acc}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Section 4: Class Analysis ──────────────────────────────────────────────

function ClassAnalysis({ classAnalysis }) {
  if (!classAnalysis) return null;

  const { topStruggleTopics, topMasteredTopics, recentMistakePatterns } = classAnalysis;

  return (
    <Card delay={0.55}>
      <SectionTitle icon={TrendingUp} title="Class Analysis" color="text-purple-500" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Needs Attention */}
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Needs Attention
          </p>
          {(!topStruggleTopics || topStruggleTopics.length === 0) ? (
            <p className="text-xs text-gray-400 py-2">Nothing flagged yet.</p>
          ) : (
            <div className="space-y-2">
              {topStruggleTopics.map((t, i) => (
                <motion.div
                  key={i}
                  className="bg-red-50 border border-red-100 rounded-xl p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: subjectColor(t.subject) }}
                    >
                      {capitalize(t.subject)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{t.topic}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-extrabold text-red-500">{t.avgAccuracy}% avg</span>
                    <span>{t.studentsStruggling} students struggling</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Well Done */}
        <div>
          <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CheckCircle2 size={12} />
            Well Done
          </p>
          {(!topMasteredTopics || topMasteredTopics.length === 0) ? (
            <p className="text-xs text-gray-400 py-2">No mastered topics yet.</p>
          ) : (
            <div className="space-y-2">
              {topMasteredTopics.map((t, i) => (
                <motion.div
                  key={i}
                  className="bg-green-50 border border-green-100 rounded-xl p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: subjectColor(t.subject) }}
                    >
                      {capitalize(t.subject)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{t.topic}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-extrabold text-green-500">{t.avgAccuracy}% avg</span>
                    <span>{t.studentsMastered} students mastered</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mistake Patterns */}
      {recentMistakePatterns && recentMistakePatterns.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Common Mistake Patterns
          </p>
          <div className="flex flex-wrap gap-2">
            {recentMistakePatterns.map((m, i) => (
              <span
                key={i}
                className="text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{
                  color: subjectColor(m.subject),
                  borderColor: subjectColor(m.subject),
                  backgroundColor: `${subjectColor(m.subject)}10`,
                }}
              >
                {m.errorType} ({m.count}x)
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Section 5: Suggested Next Steps ────────────────────────────────────────

function SuggestedNextSteps({ suggestions, classId, onRefresh }) {
  const [adding, setAdding] = useState(null);

  async function handleSetAsObjective(text, index) {
    setAdding(index);
    try {
      await api('/teacher/objectives', {
        method: 'POST',
        body: {
          classId,
          subject: 'maths',
          topic: 'AI Suggestion',
          objective: text,
        },
      });
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setAdding(null);
    }
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card delay={0.65}>
      <SectionTitle icon={Lightbulb} title="Suggested Next Steps" color="text-blue-500" />
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            className="bg-blue-50 border border-blue-100 rounded-xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05 }}
          >
            <p className="text-sm text-blue-800 font-medium mb-2">{s}</p>
            <button
              onClick={() => handleSetAsObjective(s, i)}
              disabled={adding === i}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Target size={12} />
              {adding === i ? 'Adding...' : 'Set as Objective'}
            </button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [verified, setVerified] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY(classId)) === 'true'; } catch { return false; }
  });
  const [pinMode, setPinMode] = useState(null);
  const [pinError, setPinError] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // On mount, decide what PIN flow to show
  useEffect(() => {
    if (!verified) {
      checkPinExists();
    }
  }, [classId]);

  // Fetch dashboard data once verified
  useEffect(() => {
    if (verified && !data) {
      fetchDashboard();
    }
  }, [verified]);

  async function checkPinExists() {
    try {
      const res = await fetch('/api/teacher/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, pin: '' }),
      });
      const json = await res.json();
      if (json.success && json.data?.firstTime) {
        setPinMode('set');
      } else {
        setPinMode('verify');
      }
    } catch {
      setPinMode('verify');
    }
  }

  async function handlePinSuccess(pin) {
    if (pinMode === 'set') {
      try {
        await api('/teacher/set-pin', { method: 'POST', body: { classId, pin } });
        try { sessionStorage.setItem(SESSION_KEY(classId), 'true'); } catch {}
        setPinMode(null);
        setVerified(true);
      } catch {
        setPinError('Could not save PIN. Please try again.');
        setPinMode('set');
      }
    } else {
      try {
        const result = await api('/teacher/verify-pin', { method: 'POST', body: { classId, pin } });
        if (result.verified) {
          try { sessionStorage.setItem(SESSION_KEY(classId), 'true'); } catch {}
          setPinMode(null);
          setVerified(true);
        } else {
          setPinError('Incorrect PIN. Please try again.');
        }
      } catch {
        setPinError('Error verifying PIN.');
      }
    }
  }

  async function fetchDashboard() {
    setLoading(true);
    setError('');
    try {
      const [d, presence] = await Promise.all([
        api(`/teacher/dashboard/${classId}`),
        api(`/presence/class/${classId}`).catch(() => []),
      ]);
      setData({ ...d, presence });
    } catch (e) {
      setError(e.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }

  // ── Render PIN flow ──
  if (!verified && pinMode) {
    return (
      <AnimatePresence>
        <ParentPinModal
          mode={pinMode}
          onSuccess={handlePinSuccess}
          onCancel={() => navigate(-1)}
        />
        {pinError && (
          <motion.p
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg z-[60]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {pinError}
          </motion.p>
        )}
      </AnimatePresence>
    );
  }

  if (!verified) return null;

  if (loading) return <LoadingSpinner text="Loading class dashboard..." />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-500 font-bold text-center">{error}</p>
        <button
          onClick={fetchDashboard}
          className="bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { className: clsName, students, classAnalysis, suggestedNextSteps, weeklyObjectives, presence } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header gradient — blue-to-teal to distinguish from parent dashboard */}
      <div className="bg-gradient-to-br from-blue-500 to-teal-400 pt-10 pb-20 px-5">
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 font-bold mb-6 hover:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Teacher Dashboard</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">
            {clsName || 'My Class'}
          </h1>
          <p className="text-white/80 font-semibold">
            {students?.length || 0} students
          </p>
        </motion.div>

        {/* Quick stats row */}
        <motion.div
          className="flex gap-3 mt-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          {[
            {
              icon: Users,
              label: 'Students',
              value: students?.length || 0,
              textColor: 'text-blue-200',
            },
            {
              icon: Trophy,
              label: 'Avg Accuracy',
              value: classAnalysis?.averageAccuracy
                ? `${Math.round(Object.values(classAnalysis.averageAccuracy).reduce((a, b) => a + b, 0) / Math.max(Object.values(classAnalysis.averageAccuracy).length, 1))}%`
                : '--',
              textColor: 'text-yellow-200',
            },
            {
              icon: Target,
              label: 'Objectives',
              value: weeklyObjectives?.length || 0,
              textColor: 'text-teal-200',
            },
          ].map(({ icon: Icon, label, value, textColor }) => (
            <div key={label} className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
              <Icon size={18} className={`mx-auto mb-1 ${textColor}`} />
              <p className="text-white font-extrabold text-base leading-none">{value}</p>
              <p className="text-white/60 text-xs font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Cards — negative margin to overlap header */}
      <div className="px-4 -mt-10 space-y-4 max-w-2xl mx-auto">
        <StudentOverview students={students} navigate={navigate} />
        <ClassPresence presence={presence} />
        <WeeklyObjectives objectives={weeklyObjectives} classId={classId} onRefresh={fetchDashboard} />
        <ClassPerformance averageAccuracy={classAnalysis?.averageAccuracy} />
        <ClassAnalysis classAnalysis={classAnalysis} />
        <SuggestedNextSteps suggestions={suggestedNextSteps} classId={classId} onRefresh={fetchDashboard} />
      </div>
    </div>
  );
}
