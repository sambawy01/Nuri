import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';

export default function TestPredictionCard({ profileId }) {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (!profileId) return;
    api(`/homework/predictions/${profileId}`)
      .then(data => setPredictions(Array.isArray(data) ? data : []))
      .catch(() => setPredictions([]));
  }, [profileId]);

  if (!predictions.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-2 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {predictions.map((pred, i) => (
          <motion.button
            key={i}
            onClick={() => navigate(`/subject/${pred.subject}`)}
            className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">
                Your teacher has been focusing on{' '}
                <span className="text-amber-600">{pred.topic}</span>.
                A test might be coming!
              </p>
              <p className="text-xs text-amber-600 font-semibold mt-0.5 capitalize">
                {pred.subject} — tap to practise
              </p>
            </div>
            <ChevronRight size={18} className="text-amber-400 shrink-0" />
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
