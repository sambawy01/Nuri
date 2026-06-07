import { motion } from 'framer-motion';

export default function NuriAvatar({ size = 200, animate = true }) {
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -8, 0] } : {}}
      transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <div className="absolute inset-0 rounded-full gradient-border p-1">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <span style={{ fontSize: size * 0.45 }}>🦉</span>
        </div>
      </div>
    </motion.div>
  );
}
