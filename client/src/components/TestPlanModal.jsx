import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, BookOpen, CheckSquare, Square, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';

export default function TestPlanModal({ subject, profileId, onClose, onCreated }) {
  const meta = subjects[subject] || {};
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [testDate, setTestDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [error, setError] = useState('');

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Max date: 30 days out
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  useEffect(() => {
    if (!profileId || !subject) return;
    setLoadingTopics(true);
    api(`/curriculum/${subject}/3?profileId=${profileId}`)
      .then(data => {
        const names = Array.isArray(data) ? data.map(t => t.name || t) : [];
        setTopics(names);
      })
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false));
  }, [subject, profileId]);

  function toggleTopic(name) {
    setSelectedTopics(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  }

  function selectAll() {
    setSelectedTopics(topics.slice());
  }

  function clearAll() {
    setSelectedTopics([]);
  }

  async function handleCreate() {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }
    if (!testDate) {
      setError('Please pick your test date.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const plan = await api('/test-plan/create', {
        method: 'POST',
        body: { profileId, subject, topics: selectedTopics, testDate },
      });
      onCreated && onCreated(plan);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {/* Header */}
          <div
            className="px-5 pt-5 pb-4 flex items-center justify-between"
            style={{ backgroundColor: `${meta.color || '#A855F7'}18` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: meta.color || '#A855F7' }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">I have a test!</h2>
                <p className="text-xs text-gray-500 font-semibold capitalize">{meta.name || subject}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-gray-500 hover:bg-white transition-colors shadow-sm"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Test Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <CalendarDays size={15} style={{ color: meta.color || '#A855F7' }} />
                When is your test?
              </label>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none transition-colors"
                style={{ '--tw-ring-color': meta.color }}
                onFocus={e => e.target.style.borderColor = meta.color || '#A855F7'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Topics */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">Which topics?</label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ color: meta.color || '#A855F7', backgroundColor: `${meta.color || '#A855F7'}15` }}
                  >
                    All
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs font-bold px-2 py-1 rounded-lg text-gray-400 bg-gray-100"
                  >
                    None
                  </button>
                </div>
              </div>

              {loadingTopics ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : topics.length === 0 ? (
                <p className="text-sm text-gray-400 font-semibold text-center py-4">
                  No topics found — you can still create a general plan!
                </p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {topics.map(name => {
                    const selected = selectedTopics.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleTopic(name)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: selected ? `${meta.color || '#A855F7'}18` : '#F9FAFB',
                          border: `2px solid ${selected ? meta.color || '#A855F7' : 'transparent'}`,
                        }}
                      >
                        {selected
                          ? <CheckSquare size={16} style={{ color: meta.color || '#A855F7' }} className="shrink-0" />
                          : <Square size={16} className="text-gray-300 shrink-0" />
                        }
                        <span className="text-sm font-semibold text-gray-700">{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm font-bold text-red-500 bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: meta.color || '#A855F7' }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating your plan...</>
                : 'Create My Study Plan!'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
