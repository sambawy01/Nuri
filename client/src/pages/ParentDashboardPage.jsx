import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Flame, Zap, Trophy, BookOpen, TrendingUp, AlertTriangle,
  Award, BarChart2, ClipboardList, Target, CheckCircle2, XCircle, Lightbulb,
  MessageSquare, X, Plus, Heart, Download, ExternalLink, Save,
} from 'lucide-react';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';
import ParentPinModal from '../components/ParentPinModal';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── helpers ────────────────────────────────────────────────────────────────

const SESSION_KEY = (profileId) => `parent_verified_${profileId}`;

function formatDay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function subjectColor(subject) {
  return subjects[subject]?.color || '#6366F1';
}

function subjectEmoji(subject) {
  return subjects[subject]?.emoji || '📚';
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

function SectionTitle({ icon: Icon, title, color = 'text-gray-700' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className={color} />
      <h3 className={`font-extrabold text-base ${color}`}>{title}</h3>
    </div>
  );
}

// ─── WeeklyXPChart ───────────────────────────────────────────────────────────

function WeeklyXPChart({ weeklyXP }) {
  // Build 7-day array ending today
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const xpByDay = {};
  (weeklyXP || []).forEach(row => {
    const key = typeof row.day === 'string' ? row.day.split('T')[0] : new Date(row.day).toISOString().split('T')[0];
    xpByDay[key] = parseInt(row.xp, 10) || 0;
  });

  const values = days.map(d => xpByDay[d] || 0);
  const maxVal = Math.max(...values, 1);

  return (
    <Card delay={0.3}>
      <SectionTitle icon={BarChart2} title="XP This Week" color="text-orange-500" />
      <div className="flex items-end gap-2 h-28">
        {days.map((d, i) => {
          const pct = (values[i] / maxVal) * 100;
          const isToday = d === today.toISOString().split('T')[0];
          return (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className={`w-full rounded-t-lg ${isToday ? 'bg-gradient-to-t from-orange-400 to-purple-500' : 'bg-orange-200'}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 4)}%` }}
                transition={{ delay: 0.35 + i * 0.05, type: 'spring', stiffness: 200 }}
              />
              <span className={`text-xs font-bold ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                {formatDay(d)}
              </span>
              {values[i] > 0 && (
                <span className="text-xs text-gray-500 font-semibold">{values[i]}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── SubjectAccuracy ─────────────────────────────────────────────────────────

function SubjectAccuracy({ topicMastery }) {
  if (!topicMastery || topicMastery.length === 0) return null;

  return (
    <Card delay={0.4}>
      <SectionTitle icon={TrendingUp} title="Subject Accuracy" color="text-blue-500" />
      <div className="space-y-3">
        {topicMastery.map((row) => {
          const acc = row.avg_accuracy ?? 0;
          const color = subjectColor(row.subject);
          return (
            <div key={row.subject}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <span>{subjectEmoji(row.subject)}</span>
                  {capitalize(row.subject)}
                </span>
                <span className="text-sm font-extrabold" style={{ color }}>{acc}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${acc}%` }}
                  transition={{ duration: 0.8, delay: 0.45 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── SessionReports ──────────────────────────────────────────────────────────

function SessionReports({ reports }) {
  if (!reports || reports.length === 0) {
    return (
      <Card delay={0.5}>
        <SectionTitle icon={ClipboardList} title="Recent Session Reports" color="text-purple-500" />
        <p className="text-sm text-gray-400 text-center py-4">No sessions yet — start learning!</p>
      </Card>
    );
  }

  return (
    <Card delay={0.5}>
      <SectionTitle icon={ClipboardList} title="Recent Session Reports" color="text-purple-500" />
      <div className="space-y-4">
        {reports.slice(0, 5).map((r, i) => {
          const color = subjectColor(r.subject);
          const acc = r.questions_attempted > 0
            ? Math.round((r.questions_correct / r.questions_attempted) * 100)
            : null;
          const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
          return (
            <motion.div
              key={r.id || i}
              className="border border-gray-100 rounded-xl p-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {subjectEmoji(r.subject)} {capitalize(r.subject)}
                  </span>
                  {r.topic && (
                    <span className="text-xs text-gray-500 font-medium">{r.topic}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {acc !== null && (
                    <span className={`text-xs font-extrabold ${acc >= 70 ? 'text-green-500' : acc >= 40 ? 'text-orange-500' : 'text-red-400'}`}>
                      {acc}%
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
              </div>
              {r.strengths && r.strengths !== 'None' && (
                <div className="flex gap-1.5 text-xs text-green-700 mb-1">
                  <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
                  <span>{r.strengths}</span>
                </div>
              )}
              {r.struggles && r.struggles !== 'None' && (
                <div className="flex gap-1.5 text-xs text-orange-700 mb-1">
                  <XCircle size={13} className="text-orange-400 shrink-0 mt-0.5" />
                  <span>{r.struggles}</span>
                </div>
              )}
              {r.recommendations && (
                <div className="flex gap-1.5 text-xs text-blue-700">
                  <Lightbulb size={13} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>{r.recommendations}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── TestPredictions ─────────────────────────────────────────────────────────

function TestPredictions({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <Card delay={0.6}>
      <SectionTitle icon={Target} title="Test Readiness" color="text-green-500" />
      <div className="space-y-3">
        {predictions.map((p, i) => {
          const score = p.predicted_score ?? p.confidence ?? 0;
          const label = score >= 80 ? 'Ready' : score >= 60 ? 'Almost Ready' : 'Needs Practice';
          const labelColor = score >= 80 ? 'text-green-600 bg-green-50' : score >= 60 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{subjectEmoji(p.subject)}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-700">{p.topic || capitalize(p.subject)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${labelColor}`}>{label}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.9, delay: 0.65 + i * 0.05 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── MistakePatterns ─────────────────────────────────────────────────────────

function MistakePatterns({ mistakePatterns }) {
  if (!mistakePatterns || mistakePatterns.length === 0) return null;

  return (
    <Card delay={0.65}>
      <SectionTitle icon={AlertTriangle} title="Areas to Practise" color="text-amber-500" />
      <div className="space-y-2">
        {mistakePatterns.map((m, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: subjectColor(m.subject) }}
            >
              {subjectEmoji(m.subject)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{m.error_type}</p>
              <p className="text-xs text-gray-400">{capitalize(m.subject)}</p>
            </div>
            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
              {m.count}x
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── RecentBadges ────────────────────────────────────────────────────────────

function RecentBadges({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <Card delay={0.7}>
      <SectionTitle icon={Award} title="Recent Badges" color="text-purple-500" />
      <div className="flex gap-3 flex-wrap">
        {badges.map((b, i) => (
          <motion.div
            key={b.badge_id || b.id || i}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-purple-50 min-w-[60px]"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75 + i * 0.07, type: 'spring' }}
          >
            <span className="text-2xl">{b.icon}</span>
            <span className="text-xs font-bold text-purple-700 text-center leading-tight">{b.name}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// ─── NotesForNuri ────────────────────────────────────────────────────────────

function NotesForNuri({ profileId }) {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [priority, setPriority] = useState('normal');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [profileId]);

  async function fetchNotes() {
    try {
      const res = await api(`/parent/notes/${profileId}`);
      setNotes(res.data || []);
    } catch {
      setLoadError('Could not load notes.');
    }
  }

  async function handleAdd() {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await api('/parent/notes', {
        method: 'POST',
        body: { profileId, note: noteText.trim(), priority },
      });
      setNotes(prev => [res.data, ...prev]);
      setNoteText('');
      setPriority('normal');
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId) {
    try {
      await api(`/parent/notes/${noteId}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch {
      // silently fail
    }
  }

  const priorityConfig = {
    normal:  { label: 'Normal',    bg: 'bg-gray-100',    text: 'text-gray-600',   active: 'bg-gray-500 text-white' },
    high:    { label: 'Important', bg: 'bg-orange-50',   text: 'text-orange-600', active: 'bg-orange-500 text-white' },
    urgent:  { label: 'Urgent',    bg: 'bg-red-50',      text: 'text-red-600',    active: 'bg-red-500 text-white' },
  };

  function priorityBadge(p) {
    const cfg = priorityConfig[p] || priorityConfig.normal;
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  }

  return (
    <Card delay={0.68}>
      <SectionTitle icon={MessageSquare} title="Notes for Nuri" color="text-teal-500" />

      {/* Input area */}
      <div className="space-y-3 mb-4">
        <textarea
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
          rows={2}
          placeholder="Tell Nuri what to focus on... e.g. 'Focus on fractions this week, he has a test'"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
        />

        {/* Priority selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Priority:</span>
          {Object.entries(priorityConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setPriority(key)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                priority === key ? cfg.active : `${cfg.bg} ${cfg.text}`
              }`}
            >
              {cfg.label}
            </button>
          ))}
          <button
            onClick={handleAdd}
            disabled={saving || !noteText.trim()}
            className="ml-auto flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
          >
            <Plus size={13} />
            Add Note
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loadError && (
        <p className="text-xs text-red-400 text-center py-2">{loadError}</p>
      )}
      {notes.length === 0 && !loadError && (
        <p className="text-sm text-gray-400 text-center py-3">
          No notes yet — tell Nuri what this child needs!
        </p>
      )}
      <AnimatePresence>
        {notes.map((note, i) => {
          const date = note.created_at
            ? new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : '';
          return (
            <motion.div
              key={note.id}
              className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium leading-snug">{note.note}</p>
                <div className="flex items-center gap-2 mt-1">
                  {priorityBadge(note.priority)}
                  {date && <span className="text-xs text-gray-400">{date}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors mt-0.5"
                aria-label="Remove note"
              >
                <X size={12} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Card>
  );
}

// ─── LearningSupport ─────────────────────────────────────────────────────────

const LEARNING_NEEDS = [
  { key: 'dyslexia',     label: 'Dyslexia',     emoji: '📖', description: 'Reading & phonics support' },
  { key: 'adhd',         label: 'ADHD',          emoji: '⚡', description: 'Focus & attention strategies' },
  { key: 'autism',       label: 'Autism',        emoji: '🧩', description: 'Routine & sensory awareness' },
  { key: 'dyscalculia',  label: 'Dyscalculia',   emoji: '🔢', description: 'Maths number sense support' },
];

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-checked={enabled}
      role="switch"
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1 ${
        enabled ? 'bg-amber-400' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function ObservationCard({ flag, onEnableMode }) {
  const conditionLabels = {
    dyslexia:    { emoji: '📖', label: 'Dyslexia-friendly' },
    adhd:        { emoji: '⚡', label: 'ADHD-friendly' },
    autism:      { emoji: '🧩', label: 'Autism-friendly' },
    dyscalculia: { emoji: '🔢', label: 'Dyscalculia-friendly' },
  };
  const cfg = conditionLabels[flag.condition] || { emoji: '💡', label: `${flag.condition}-friendly` };
  const confidencePct = Math.round((flag.confidence || 0) * 100);

  return (
    <motion.div
      className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cfg.emoji}</span>
          <div>
            <p className="text-sm font-extrabold text-amber-800">
              We&apos;ve noticed a pattern
            </p>
            <p className="text-xs text-amber-600 font-medium">
              Some children who learn like {flag.childName || 'your child'} benefit from {cfg.label} settings.
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
          {confidencePct}% match
        </span>
      </div>

      {flag.evidence && (
        <p className="text-xs text-amber-700 leading-relaxed bg-amber-100 rounded-xl px-3 py-2">
          {flag.evidence}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => onEnableMode(flag.condition)}
          className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
        >
          <CheckCircle2 size={13} />
          Enable {cfg.label} mode
        </button>
        <button className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
          <ExternalLink size={12} />
          You might want to discuss this with a specialist
        </button>
      </div>
    </motion.div>
  );
}

function LearningSupport({ profileId }) {
  const [needs, setNeeds] = useState({
    dyslexia: false, adhd: false, autism: false, dyscalculia: false,
  });
  const [otherNotes, setOtherNotes]       = useState('');
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [saveError, setSaveError]         = useState('');
  const [observations, setObservations]   = useState([]);
  const [obsLoading, setObsLoading]       = useState(true);
  const [reportData, setReportData]       = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReport, setShowReport]       = useState(false);

  // Load saved learning needs
  useEffect(() => {
    async function loadNeeds() {
      try {
        const res = await api(`/parent/learning-needs/${profileId}`);
        const d = res.data || res;
        if (d) {
          setNeeds({
            dyslexia:    !!d.dyslexia,
            adhd:        !!d.adhd,
            autism:      !!d.autism,
            dyscalculia: !!d.dyscalculia,
          });
          setOtherNotes(d.other_notes || '');
        }
      } catch {
        // first time — no saved needs yet, defaults are fine
      }
    }
    loadNeeds();
  }, [profileId]);

  // Load AI-detected observations
  useEffect(() => {
    async function loadObs() {
      setObsLoading(true);
      try {
        const res = await api(`/parent/behavior-analysis/${profileId}`);
        setObservations(res.flags || res.data || []);
      } catch {
        setObservations([]);
      } finally {
        setObsLoading(false);
      }
    }
    loadObs();
  }, [profileId]);

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      await api('/parent/learning-needs', {
        method: 'POST',
        body: { profileId, ...needs, other_notes: otherNotes },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError('Could not save — please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEnableMode(condition) {
    // Optimistically turn on that toggle and save
    setNeeds(prev => ({ ...prev, [condition]: true }));
    try {
      await api('/parent/learning-needs', {
        method: 'POST',
        body: { profileId, ...needs, [condition]: true, other_notes: otherNotes },
      });
    } catch {
      // silently fail — user can still save manually
    }
  }

  async function handleExportReport() {
    setReportLoading(true);
    try {
      const res = await api(`/parent/specialist-report/${profileId}`);
      setReportData(res.report || res.data || res);
      setShowReport(true);
    } catch {
      setReportData({ error: 'Could not generate the report. Please try again.' });
      setShowReport(true);
    } finally {
      setReportLoading(false);
    }
  }

  function handleDownloadReport() {
    if (!reportData) return;
    const text = typeof reportData === 'string'
      ? reportData
      : JSON.stringify(reportData, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `nuri-specialist-report-${profileId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasActiveObservations = observations.length > 0;

  return (
    <Card delay={0.72}>
      <SectionTitle icon={Heart} title="Help Nuri Understand Your Child Better" color="text-amber-500" />

      {/* ── Declare Learning Needs ── */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Declare Learning Needs
        </p>
        <div className="space-y-3">
          {LEARNING_NEEDS.map(({ key, label, emoji, description }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{description}</p>
                </div>
              </div>
              <Toggle
                enabled={needs[key]}
                onToggle={() => setNeeds(prev => ({ ...prev, [key]: !prev[key] }))}
              />
            </div>
          ))}
        </div>

        {/* Other notes */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Other notes about learning
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
            rows={2}
            placeholder="e.g. 'She gets anxious with timed tasks' or 'He needs extra time to process instructions'"
            value={otherNotes}
            onChange={e => setOtherNotes(e.target.value)}
          />
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-full transition-colors"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <AnimatePresence>
            {saved && (
              <motion.span
                className="text-xs font-bold text-green-600 flex items-center gap-1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle2 size={13} /> Saved!
              </motion.span>
            )}
            {saveError && (
              <motion.span
                className="text-xs font-bold text-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {saveError}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── AI Observations ── */}
      {!obsLoading && hasActiveObservations && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Nuri&apos;s Observations
          </p>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            Based on how your child learns, Nuri has spotted some patterns. These are observations only —
            every child is wonderfully different.
          </p>
          <div className="space-y-3">
            {observations.map((flag, i) => (
              <ObservationCard
                key={flag.condition || i}
                flag={flag}
                onEnableMode={handleEnableMode}
              />
            ))}
          </div>
        </div>
      )}

      {obsLoading && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2.5 mb-5">
          <span className="animate-pulse">🔍</span>
          <span>Nuri is looking at learning patterns…</span>
        </div>
      )}

      {/* ── Specialist Report Export ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Specialist Report
        </p>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          Share a summary of your child&apos;s learning patterns with a specialist, teacher, or therapist.
          The report includes session data, accuracy trends, and Nuri&apos;s observations.
        </p>
        <button
          onClick={handleExportReport}
          disabled={reportLoading}
          className="flex items-center gap-2 bg-white border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed text-amber-700 text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
        >
          <Download size={15} />
          {reportLoading ? 'Generating…' : 'Export Report for Specialist'}
        </button>
      </div>

      {/* ── Report Modal ── */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReport(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h4 className="font-extrabold text-gray-800 text-base">Specialist Report</h4>
                  <p className="text-xs text-gray-400">You might want to share this with a specialist or teacher.</p>
                </div>
                <button
                  onClick={() => setShowReport(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {reportData?.error ? (
                  <p className="text-sm text-red-500 font-medium">{reportData.error}</p>
                ) : reportData ? (
                  <div className="space-y-4 text-sm text-gray-700">
                    {typeof reportData === 'string' ? (
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-600 bg-gray-50 rounded-xl p-4">
                        {reportData}
                      </pre>
                    ) : (
                      Object.entries(reportData).map(([section, value]) => (
                        <div key={section}>
                          <p className="font-extrabold text-gray-800 capitalize mb-1">
                            {section.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-3 py-2">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
                )}
              </div>

              {/* Modal footer */}
              {reportData && !reportData.error && (
                <div className="px-5 py-4 border-t border-gray-100">
                  <button
                    onClick={handleDownloadReport}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl transition-colors text-sm"
                  >
                    <Download size={15} />
                    Download as Text File
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [verified, setVerified] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY(profileId)) === 'true'; } catch { return false; }
  });
  const [pinMode, setPinMode] = useState(null); // null | 'set' | 'verify'
  const [pinError, setPinError] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // On mount, decide what PIN flow to show
  useEffect(() => {
    if (!verified) {
      checkPinExists();
    }
  }, [profileId]);

  // Fetch dashboard data once verified
  useEffect(() => {
    if (verified && !data) {
      fetchDashboard();
    }
  }, [verified]);

  async function checkPinExists() {
    try {
      // Probe by sending a dummy verify with empty pin — server returns firstTime flag
      const res = await fetch('/api/parent/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, pin: '' }),
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
        await api('/parent/set-pin', { method: 'POST', body: { profileId, pin } });
        try { sessionStorage.setItem(SESSION_KEY(profileId), 'true'); } catch {}
        setPinMode(null);
        setVerified(true);
      } catch {
        setPinError('Could not save PIN. Please try again.');
        setPinMode('set');
      }
    } else {
      try {
        const result = await api('/parent/verify-pin', { method: 'POST', body: { profileId, pin } });
        if (result.verified) {
          try { sessionStorage.setItem(SESSION_KEY(profileId), 'true'); } catch {}
          setPinMode(null);
          setVerified(true);
        } else {
          setPinError('Incorrect PIN. Please try again.');
          // keep pinMode as 'verify' so modal stays
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
      const d = await api(`/parent/dashboard/${profileId}`);
      setData(d);
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

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-500 font-bold text-center">{error}</p>
        <button
          onClick={fetchDashboard}
          className="bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { profile, reports, summary, predictions, badges, weeklyXP, weeklyTime, mistakePatterns, topicMastery } = data;
  const totalXP = (weeklyXP || []).reduce((s, r) => s + (parseInt(r.xp, 10) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-orange-400 to-purple-500 pt-10 pb-20 px-5">
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
          <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Parent Dashboard</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">
            {profile?.name || 'Your Child'}
          </h1>
          <p className="text-white/80 font-semibold">
            Year {profile?.year_group || '?'} &nbsp;·&nbsp; Level {profile?.current_level || 1}
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
            { icon: Trophy, label: 'Total XP', value: profile?.total_xp ?? 0, textColor: 'text-yellow-200' },
            { icon: Flame, label: 'Streak', value: `${profile?.streak_days ?? 0}d`, textColor: 'text-orange-200' },
            { icon: Zap, label: 'This Week', value: `+${totalXP} XP`, textColor: 'text-purple-200' },
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
        {/* Active days banner */}
        {weeklyTime && (
          <motion.div
            className="bg-white rounded-2xl shadow-md px-5 py-3 flex items-center justify-between"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-purple-400" />
              <span className="text-sm font-bold text-gray-700">This Week</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="font-extrabold text-gray-800">{weeklyTime.active_days || 0} <span className="font-semibold text-gray-400">days active</span></span>
              <span className="font-extrabold text-gray-800">{weeklyTime.total_sessions || 0} <span className="font-semibold text-gray-400">sessions</span></span>
            </div>
          </motion.div>
        )}

        <WeeklyXPChart weeklyXP={weeklyXP} />
        <SubjectAccuracy topicMastery={topicMastery} />
        <SessionReports reports={reports} />
        <TestPredictions predictions={predictions} />
        <MistakePatterns mistakePatterns={mistakePatterns} />
        <NotesForNuri profileId={profileId} />
        <LearningSupport profileId={profileId} />
        <RecentBadges badges={badges} />
      </div>
    </div>
  );
}
