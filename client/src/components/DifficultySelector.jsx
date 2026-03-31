import { motion } from 'framer-motion';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', emoji: '🟢', xp: '+5 XP', color: '#22c55e' },
  { key: 'medium', label: 'Medium', emoji: '🟡', xp: '+10 XP', color: '#eab308' },
  { key: 'hard', label: 'Hard', emoji: '🔴', xp: '+15 XP', color: '#ef4444' },
  { key: 'challenge', label: 'Challenge Me', emoji: '⚫', xp: '+20 XP', color: '#1f2937' },
];

export default function DifficultySelector({ selected, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {DIFFICULTIES.map((d) => (
        <motion.button
          key={d.key}
          onClick={() => !disabled && onSelect(d.key)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
            selected === d.key
              ? 'text-white shadow-md'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
          style={selected === d.key ? { backgroundColor: d.color } : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {d.emoji} {d.label}
          {selected === d.key && (
            <span className="ml-1 opacity-75">({d.xp})</span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
