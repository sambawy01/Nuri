import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { subjects } from '../lib/subjects';
import { subjectMap } from './NuriOwl';

export default function SubjectCard({ subject, mastery = 0, onClick }) {
  const meta = subjects[subject];
  if (!meta) return null;

  const nuriImage = subjectMap[subject];

  return (
    <motion.button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-lg border-l-4 text-left flex items-center gap-4 cursor-pointer"
      style={{ borderLeftColor: meta.color }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
        {nuriImage ? (
          <img
            src={nuriImage}
            alt={`Nuri ${meta.name}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-2xl">{meta.emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-gray-800 ${subject === 'arabic' ? 'font-arabic' : ''}`}>
          {meta.name}
        </p>
        <div className="flex gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
            />
          ))}
        </div>
      </div>
      <span className="text-2xl">{meta.emoji}</span>
    </motion.button>
  );
}
