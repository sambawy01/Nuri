import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';

const DAY_TYPE_EMOJI = {
  review: '📖',
  practice: '✏️',
  mock_test: '📝',
  confidence: '⭐',
};

const DAY_TYPE_LABEL = {
  review: 'Review',
  practice: 'Practice',
  mock_test: 'Mock Test',
  confidence: 'Confidence',
};

export default function TestPlanCard({ profileId, onPlanUpdate }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    fetchPlans();
  }, [profileId]);

  async function fetchPlans() {
    try {
      const data = await api(`/test-plan/active/${profileId}`);
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteDay(e, dayId) {
    e.stopPropagation();
    if (completing) return;
    setCompleting(dayId);
    try {
      await api('/test-plan/complete-day', {
        method: 'POST',
        body: { dayId },
      });
      await fetchPlans();
      onPlanUpdate && onPlanUpdate();
    } catch {
      // silently ignore
    } finally {
      setCompleting(null);
    }
  }

  function handleTapDay(plan, day) {
    if (!day) return;
    const route = day.day_type === 'review' || day.day_type === 'confidence'
      ? `/learn/${plan.subject}`
      : `/quiz/${plan.subject}`;
    navigate(route, { state: { topic: day.topic || undefined } });
  }

  if (loading) return null;
  if (!plans.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-3 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {plans.map((plan, pi) => {
          const meta = subjects[plan.subject] || {};
          const progressPct = plan.totalDays > 0
            ? Math.round((plan.completedCount / plan.totalDays) * 100)
            : 0;
          const day = plan.todayDay;
          const dayEmoji = day ? DAY_TYPE_EMOJI[day.day_type] || '📚' : '🎉';
          const dayTypeLabel = day ? DAY_TYPE_LABEL[day.day_type] || day.day_type : '';

          let countdownText = '';
          if (plan.daysUntilTest === 0) {
            countdownText = 'Test is TODAY! 🎉';
          } else if (plan.daysUntilTest === 1) {
            countdownText = 'Test tomorrow!';
          } else {
            countdownText = `Test in ${plan.daysUntilTest} days`;
          }

          return (
            <motion.div
              key={plan.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-l-4"
              style={{ borderLeftColor: meta.color || '#A855F7' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.05 }}
            >
              {/* Header row */}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.emoji || '📚'}</span>
                  <span className="text-sm font-extrabold text-gray-800 capitalize">{meta.name || plan.subject}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold rounded-full px-2.5 py-1"
                  style={{ backgroundColor: `${meta.color || '#A855F7'}18`, color: meta.color || '#A855F7' }}>
                  <CalendarDays size={12} />
                  {countdownText}
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-semibold">
                    {plan.completedCount} of {plan.totalDays} days done
                  </span>
                  <span className="text-xs font-bold" style={{ color: meta.color || '#A855F7' }}>
                    {progressPct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: meta.color || '#A855F7' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Today's task */}
              {day ? (
                <motion.button
                  onClick={() => handleTapDay(plan, day)}
                  className="w-full px-4 pb-3 flex items-center gap-3 text-left"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                    style={{ backgroundColor: `${meta.color || '#A855F7'}20` }}
                  >
                    {dayEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      Day {day.day_number} of {plan.totalDays}: {day.label}
                    </p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">
                      {dayTypeLabel} — tap to start
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={e => handleCompleteDay(e, day.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${meta.color || '#A855F7'}15` }}
                      title="Mark as done"
                    >
                      {completing === day.id
                        ? <Loader2 size={14} className="animate-spin" style={{ color: meta.color }} />
                        : <CheckCircle2 size={14} style={{ color: meta.color || '#A855F7' }} />
                      }
                    </button>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </motion.button>
              ) : (
                <div className="px-4 pb-3 flex items-center gap-2 text-sm font-bold" style={{ color: meta.color || '#A855F7' }}>
                  <CheckCircle2 size={16} />
                  All days completed! Good luck on your test!
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
