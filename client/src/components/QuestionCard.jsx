import { motion } from 'framer-motion';

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  options = [],
  onAnswer,
  answered,
  selectedAnswer,
  correctAnswer,
  explanation,
  subjectColor,
}) {
  function getButtonStyle(index) {
    if (!answered) {
      return 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-md';
    }
    if (index === correctAnswer) {
      return 'bg-green-100 border-2 border-green-500 text-green-800';
    }
    if (index === selectedAnswer && index !== correctAnswer) {
      return 'bg-amber-100 border-2 border-amber-500 text-amber-800';
    }
    return 'bg-gray-50 border-2 border-gray-200 text-gray-400';
  }

  return (
    <div className="w-full">
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-lg font-bold text-gray-800 leading-relaxed">{question}</p>
      </motion.div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            className={`w-full text-left px-5 py-4 rounded-2xl font-semibold transition-all flex items-center gap-3 ${getButtonStyle(index)}`}
            onClick={() => !answered && onAnswer(index)}
            disabled={answered}
            whileHover={!answered ? { scale: 1.02 } : {}}
            whileTap={!answered ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: answered ? (index === correctAnswer ? '#22c55e' : '#d1d5db') : (subjectColor || '#A855F7') }}
            >
              {LABELS[index]}
            </span>
            <span>{option}</span>
          </motion.button>
        ))}
      </div>

      {answered && explanation && (
        <motion.div
          className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm font-semibold text-blue-800 mb-1">Explanation</p>
          <p className="text-sm text-blue-700 leading-relaxed">{explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
