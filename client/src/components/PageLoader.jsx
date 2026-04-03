import { motion } from 'framer-motion';

export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-4"
          animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src="/nuri/idle.png" alt="Nuri" className="w-full h-full object-contain" draggable={false} />
        </motion.div>
        <motion.p
          className="text-gray-500 font-bold text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  );
}
