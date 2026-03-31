import { motion } from 'framer-motion';

export default function ChatBubble({ message, isNuri, subjectColor }) {
  return (
    <motion.div
      className={`flex ${isNuri ? 'justify-start' : 'justify-end'} mb-3`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isNuri && (
        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm mr-2 shrink-0 mt-1">
          🦉
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isNuri
            ? 'bg-white shadow-md text-gray-800 rounded-tl-sm'
            : 'text-white rounded-tr-sm'
        }`}
        style={!isNuri ? { backgroundColor: subjectColor || '#A855F7' } : undefined}
      >
        <p className="whitespace-pre-wrap">{message}</p>
      </div>
    </motion.div>
  );
}
