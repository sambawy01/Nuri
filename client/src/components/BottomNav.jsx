import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Camera, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/story', icon: BookOpen, label: 'Adventure' },
  { path: '/homework', icon: Camera, label: 'Homework' },
  { path: '/stickers', icon: Trophy, label: 'Stickers' },
  { path: '/profile', icon: User, label: 'Profile' },
];

// Pages where bottom nav should NOT appear
const HIDDEN_ON = ['/', '/create-profile'];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Hide ONLY on welcome/create and active fullscreen chat sessions
  if (HIDDEN_ON.includes(currentPath)) return null;

  // Hide only during active chat/play sessions (not browsing pages)
  const fullscreenPaths = ['/learn/', '/explain/', '/duel/'];
  if (fullscreenPaths.some(p => currentPath.startsWith(p))) return null;
  // Story chapter stages (not the map)
  if (currentPath.startsWith('/story/') && currentPath.split('/').length > 3) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = currentPath === path || (path !== '/home' && currentPath.startsWith(path));
          const isHome = path === '/home';

          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isHome ? (
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'gradient-bg shadow-md' : 'bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                </motion.div>
              ) : (
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              )}
              <span className={`text-[10px] font-bold ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
