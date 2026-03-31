import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState, useMemo } from 'react';

const sizes = { sm: 60, md: 120, lg: 200 };

/* ─── tiny star SVG used for celebrations & orbiting ─── */
const Star = ({ x, y, size = 10, color = '#F59E0B', delay = 0, opacity = 1 }) => (
  <motion.g
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, opacity, 0], scale: [0, 1.2, 0], x, y }}
    transition={{ duration: 0.8, delay, ease: 'easeOut' }}
  >
    <polygon
      points={`${x},${y - size} ${x + size * 0.22},${y - size * 0.3} ${x + size},${y - size * 0.38} ${x + size * 0.36},${y + size * 0.1} ${x + size * 0.58},${y + size} ${x},${y + size * 0.4} ${x - size * 0.58},${y + size} ${x - size * 0.36},${y + size * 0.1} ${x - size},${y - size * 0.38} ${x - size * 0.22},${y - size * 0.3}`}
      fill={color}
    />
  </motion.g>
);

/* ─── sparkle dot used for thinking ─── */
const Sparkle = ({ cx, cy, delay = 0 }) => (
  <motion.circle
    cx={cx}
    cy={cy}
    r={2.5}
    fill="#F59E0B"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0] }}
    transition={{ duration: 1.2, delay, repeat: Infinity, repeatDelay: 0.6 }}
  />
);

/* ─── orbiting star for level 10-14 ─── */
const OrbitingStar = ({ angle, radius = 85, duration = 4, delay = 0 }) => (
  <motion.g
    animate={{ rotate: 360 }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    style={{ originX: '100px', originY: '100px', transformOrigin: '100px 100px' }}
  >
    <polygon
      points={`${100 + radius},${100 - 6} ${100 + radius + 2},${100 - 2} ${100 + radius + 6},${100 - 2.5} ${100 + radius + 3},${100 + 1} ${100 + radius + 4},${100 + 6} ${100 + radius},${100 + 3} ${100 + radius - 4},${100 + 6} ${100 + radius - 3},${100 + 1} ${100 + radius - 6},${100 - 2.5} ${100 + radius - 2},${100 - 2}`}
      fill="#F59E0B"
    />
  </motion.g>
);

function NuriOwl({ state = 'idle', level = 1, size = 'md' }) {
  const px = sizes[size] || sizes.md;
  const [blinking, setBlinking] = useState(false);
  const [beakOpen, setBeakOpen] = useState(false);
  const [showCelebrationStars, setShowCelebrationStars] = useState(false);

  // Blink loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Talking beak
  useEffect(() => {
    if (state !== 'talking') { setBeakOpen(false); return; }
    const interval = setInterval(() => {
      setBeakOpen((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  // Celebration burst
  useEffect(() => {
    if (state === 'celebrating') {
      setShowCelebrationStars(true);
      const t = setTimeout(() => setShowCelebrationStars(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Evolution flags
  const hasScarf = level >= 5;
  const hasOrbitingStars = level >= 10 && level < 15;
  const hasGlasses = level >= 15;
  const hasGoldenWings = level >= 20;
  const hasOrbitingStarsHigh = level >= 15;

  const wingColor = hasGoldenWings ? '#F59E0B' : '#7A5F3A';

  // Animation variants per state
  const bodyVariants = useMemo(() => ({
    idle: {
      y: [0, -3, 0],
      rotate: 0,
      transition: { y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    },
    talking: {
      y: [0, -2, 0],
      rotate: 0,
      transition: { y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
    },
    celebrating: {
      y: [0, -15, 0],
      rotate: 0,
      transition: { y: { duration: 0.5, repeat: Infinity, ease: 'easeOut' } },
    },
    thinking: {
      y: [0, -2, 0],
      rotate: 10,
      transition: {
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 0.4 },
      },
    },
    encouraging: {
      y: [0, -2, 0],
      rotate: -5,
      transition: {
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 0.4 },
      },
    },
    excited: {
      y: [0, -6, 0],
      rotate: [0, -3, 3, 0],
      transition: {
        y: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 0.5, repeat: Infinity },
      },
    },
  }), []);

  // Wing spread for celebrating / encouraging / excited
  const leftWingRotate =
    state === 'celebrating' ? -30 :
    state === 'encouraging' ? -15 :
    state === 'excited' ? [-5, -20, -5] :
    0;
  const rightWingRotate =
    state === 'celebrating' ? 30 :
    state === 'encouraging' ? 15 :
    state === 'excited' ? [5, 20, 5] :
    0;

  const eyeScale = state === 'excited' ? 1.1 : 1;

  // Eye pupil offset for thinking (look up-left)
  const pupilOffsetX = state === 'thinking' ? -3 : 0;
  const pupilOffsetY = state === 'thinking' ? -3 : 0;

  return (
    <motion.svg
      width={px}
      height={px}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Nuri the owl, ${state}`}
      role="img"
    >
      {/* Orbiting stars level 10+ */}
      {(hasOrbitingStars || hasOrbitingStarsHigh) && (
        <>
          <OrbitingStar angle={0} duration={5} delay={0} />
          <OrbitingStar angle={120} duration={5} delay={1.67} />
          <OrbitingStar angle={240} duration={5} delay={3.33} />
        </>
      )}

      {/* Main body group with float/bounce */}
      <motion.g
        animate={state}
        variants={bodyVariants}
        style={{ originX: '100px', originY: '100px' }}
      >
        {/* ── Feet ── */}
        <ellipse cx={85} cy={178} rx={10} ry={5} fill="#F97316" />
        <ellipse cx={115} cy={178} rx={10} ry={5} fill="#F97316" />

        {/* ── Body ── */}
        <ellipse cx={100} cy={115} rx={52} ry={62} fill="#8B6F47" />
        {/* Belly */}
        <ellipse cx={100} cy={128} rx={36} ry={42} fill="#D4A574" />

        {/* ── Left Wing ── */}
        <motion.path
          d="M48 100 C30 110, 28 140, 48 150 Q52 135, 50 115Z"
          fill={wingColor}
          animate={{ rotate: leftWingRotate }}
          transition={state === 'excited'
            ? { duration: 0.3, repeat: Infinity }
            : { duration: 0.4 }
          }
          style={{ originX: '52px', originY: '115px', transformOrigin: '52px 115px' }}
        />
        {/* ── Right Wing ── */}
        <motion.path
          d="M152 100 C170 110, 172 140, 152 150 Q148 135, 150 115Z"
          fill={wingColor}
          animate={{ rotate: rightWingRotate }}
          transition={state === 'excited'
            ? { duration: 0.3, repeat: Infinity }
            : { duration: 0.4 }
          }
          style={{ originX: '148px', originY: '115px', transformOrigin: '148px 115px' }}
        />

        {/* ── Scarf (level 5+) ── */}
        {hasScarf && (
          <motion.path
            d="M60 98 Q70 108, 100 106 Q130 108, 140 98 Q138 112, 100 114 Q62 112, 60 98Z"
            fill="#A855F7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* ── Head circle ── */}
        <circle cx={100} cy={78} r={40} fill="#8B6F47" />

        {/* ── Ear tufts ── */}
        <path d="M68 52 L60 32 L78 48Z" fill="#8B6F47" />
        <path d="M132 52 L140 32 L122 48Z" fill="#8B6F47" />

        {/* ── Face disc ── */}
        <ellipse cx={100} cy={82} rx={34} ry={28} fill="#D4A574" opacity={0.5} />

        {/* ── Eyebrows ── */}
        <motion.path
          d="M70 62 Q78 56, 86 62"
          stroke="#5C4A2E"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          animate={{
            d: state === 'thinking'
              ? 'M70 58 Q78 54, 86 60'
              : state === 'excited'
              ? 'M68 58 Q78 52, 88 58'
              : 'M70 62 Q78 56, 86 62',
          }}
        />
        <motion.path
          d="M114 62 Q122 56, 130 62"
          stroke="#5C4A2E"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          animate={{
            d: state === 'thinking'
              ? 'M114 60 Q122 54, 130 58'
              : state === 'excited'
              ? 'M112 58 Q122 52, 132 58'
              : 'M114 62 Q122 56, 130 62',
          }}
        />

        {/* ── Eyes ── */}
        <motion.g animate={{ scale: eyeScale }} style={{ originX: '78px', originY: '78px', transformOrigin: '78px 78px' }}>
          {/* Left eye */}
          {blinking ? (
            <motion.line x1={66} y1={78} x2={90} y2={78} stroke="#5C4A2E" strokeWidth={3} strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={78} cy={78} rx={14} ry={14} fill="white" />
              <circle cx={78} cy={78} r={10} fill="#14B8A6" />
              <circle cx={78 + pupilOffsetX} cy={78 + pupilOffsetY} r={5} fill="#1a1a1a" />
              <circle cx={75 + pupilOffsetX} cy={75 + pupilOffsetY} r={2.2} fill="white" />
              <circle cx={80 + pupilOffsetX} cy={80 + pupilOffsetY} r={1} fill="white" opacity={0.6} />
            </g>
          )}
        </motion.g>

        <motion.g animate={{ scale: eyeScale }} style={{ originX: '122px', originY: '78px', transformOrigin: '122px 78px' }}>
          {/* Right eye */}
          {blinking ? (
            <motion.line x1={110} y1={78} x2={134} y2={78} stroke="#5C4A2E" strokeWidth={3} strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={122} cy={78} rx={14} ry={14} fill="white" />
              <circle cx={122} cy={78} r={10} fill="#14B8A6" />
              <circle cx={122 + pupilOffsetX} cy={78 + pupilOffsetY} r={5} fill="#1a1a1a" />
              <circle cx={119 + pupilOffsetX} cy={75 + pupilOffsetY} r={2.2} fill="white" />
              <circle cx={124 + pupilOffsetX} cy={80 + pupilOffsetY} r={1} fill="white" opacity={0.6} />
            </g>
          )}
        </motion.g>

        {/* ── Glasses (level 15+) ── */}
        {hasGlasses && (
          <g>
            <circle cx={78} cy={78} r={17} fill="none" stroke="#5C4A2E" strokeWidth={1.8} />
            <circle cx={122} cy={78} r={17} fill="none" stroke="#5C4A2E" strokeWidth={1.8} />
            <line x1={95} y1={78} x2={105} y2={78} stroke="#5C4A2E" strokeWidth={1.8} />
            <line x1={61} y1={76} x2={55} y2={74} stroke="#5C4A2E" strokeWidth={1.5} />
            <line x1={139} y1={76} x2={145} y2={74} stroke="#5C4A2E" strokeWidth={1.5} />
          </g>
        )}

        {/* ── Blush ── */}
        <circle cx={64} cy={88} r={6} fill="#FDA4AF" opacity={0.45} />
        <circle cx={136} cy={88} r={6} fill="#FDA4AF" opacity={0.45} />

        {/* ── Beak ── */}
        <motion.path
          d={beakOpen
            ? 'M94 92 L100 100 L106 92Z M94 96 L100 104 L106 96Z'
            : 'M94 92 L100 102 L106 92Z'
          }
          fill="#F97316"
          transition={{ duration: 0.12 }}
        />

        {/* ── Graduation Cap ── */}
        <polygon points="100,28 60,48 100,42 140,48" fill="#1E3A5F" />
        <rect x={82} y={42} width={36} height={6} rx={1} fill="#1E3A5F" />
        {/* Tassel */}
        <line x1={140} y1={48} x2={148} y2={60} stroke="#F59E0B" strokeWidth={2} />
        <circle cx={148} cy={62} r={3} fill="#F59E0B" />

        {/* ── Thinking sparkles ── */}
        {state === 'thinking' && (
          <>
            <Sparkle cx={52} cy={52} delay={0} />
            <Sparkle cx={44} cy={40} delay={0.3} />
            <Sparkle cx={56} cy={36} delay={0.6} />
          </>
        )}
      </motion.g>

      {/* ── Celebration stars (outside body group so they don't float) ── */}
      <AnimatePresence>
        {state === 'celebrating' && showCelebrationStars && (
          <>
            <Star x={40} y={40} delay={0} color="#F59E0B" />
            <Star x={160} y={35} delay={0.1} color="#A855F7" />
            <Star x={30} y={120} delay={0.2} color="#14B8A6" />
            <Star x={170} y={110} delay={0.15} color="#F97316" />
            <Star x={100} y={20} delay={0.05} color="#F59E0B" />
          </>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}

export default memo(NuriOwl);
