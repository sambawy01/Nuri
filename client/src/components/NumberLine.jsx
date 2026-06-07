import { motion } from 'framer-motion';

export default function NumberLine({ min = 0, max = 10, markers = [], highlight = null, label = '' }) {
  const steps = max - min;
  const markerPositions = markers.map(m => ((m - min) / steps) * 100);
  const highlightPos = highlight !== null ? ((highlight - min) / steps) * 100 : null;

  return (
    <div className="my-4 px-4">
      {label && <p className="text-xs text-gray-500 mb-1 text-center">{label}</p>}
      <div className="relative h-8">
        {/* Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />

        {/* Tick marks */}
        {Array.from({ length: steps + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${(i / steps) * 100}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-0.5 h-3 bg-gray-400" />
            <span className="text-[10px] text-gray-600 mt-0.5">{min + i}</span>
          </div>
        ))}

        {/* Highlight marker */}
        {highlightPos !== null && (
          <motion.div
            className="absolute top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-md"
            style={{ left: `${highlightPos}%`, transform: 'translateX(-50%)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          />
        )}
      </div>
    </div>
  );
}
