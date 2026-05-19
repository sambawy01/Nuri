import { motion } from 'framer-motion';
import { Eye, Clock, AlertCircle } from 'lucide-react';

/**
 * Parent dashboard widget showing engaged minutes vs total minutes for last 7 days.
 * Renders nothing when presence is off or no data has been collected yet.
 */
export default function PresenceCard({ presence, tier }) {
  if (!presence || (presence.sessions ?? 0) === 0 || tier === 'off' || !tier) return null;

  const totalMinutes = presence.totalMinutes ?? 0;
  const engagedMinutes = presence.engagedMinutes ?? 0;
  const pct = totalMinutes > 0 ? Math.round((engagedMinutes / totalMinutes) * 100) : 0;
  const voided = presence.voidedStreakCount ?? 0;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md p-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye size={16} className="text-purple-500" />
        <h3 className="font-extrabold text-gray-800">Real engagement</h3>
        <span className="ml-auto text-xs text-gray-400 font-semibold">last 7 days</span>
      </div>

      <div className="flex items-end gap-4 mb-3">
        <div>
          <p className="text-3xl font-extrabold text-gray-800 leading-none">
            {engagedMinutes}
            <span className="text-base font-bold text-gray-400"> / {totalMinutes} min</span>
          </p>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Actually present at the screen
          </p>
        </div>
        <div className="ml-auto">
          <div className={`text-2xl font-extrabold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
            {pct}%
          </div>
          <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400 text-right">
            engaged
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1 text-gray-500 font-semibold">
          <Clock size={12} /> {presence.sessions} sessions
        </span>
        {voided > 0 && (
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <AlertCircle size={12} /> {voided} streak day{voided === 1 ? '' : 's'} voided
          </span>
        )}
      </div>
    </motion.div>
  );
}
