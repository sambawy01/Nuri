import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, ArrowLeft, ArrowRight, Check, Users, Lock, Plus,
} from 'lucide-react';
import { api } from '../lib/api';
import ParentPinModal from '../components/ParentPinModal';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── helpers ────────────────────────────────────────────────────────────────

function getDeviceId() {
  let id = localStorage.getItem('nuri_device_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('nuri_device_id', id);
  }
  return id;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TeacherSetupPage() {
  const navigate = useNavigate();
  const deviceId = getDeviceId();

  // Check if teacher already has classes
  const [existingClasses, setExistingClasses] = useState(null);
  const [checkingClasses, setCheckingClasses] = useState(true);

  const [step, setStep] = useState(1); // 1: class name, 2: PIN, 3: add students, 4: done
  const [className, setClassName] = useState('');
  const [classId, setClassId] = useState(null);
  const [pin, setPin] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState(new Set());
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // On mount, check for existing classes
  useEffect(() => {
    async function checkClasses() {
      try {
        const classes = await api(`/teacher/classes?deviceId=${deviceId}`);
        if (classes && classes.length > 0) {
          setExistingClasses(classes);
        }
      } catch {
        // No classes yet, proceed with setup
      } finally {
        setCheckingClasses(false);
      }
    }
    checkClasses();
  }, []);

  // Load profiles for step 3
  useEffect(() => {
    if (step === 3) {
      loadProfiles();
    }
  }, [step]);

  async function loadProfiles() {
    setLoadingProfiles(true);
    try {
      const res = await api(`/profiles?deviceId=${deviceId}`);
      setProfiles(Array.isArray(res) ? res : res.profiles || []);
    } catch {
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  }

  async function handleCreateClass(pinOverride) {
    const pinToUse = pinOverride || pin;
    if (!className.trim() || !pinToUse) return;
    setSaving(true);
    setError('');
    try {
      const result = await api('/teacher/setup', {
        method: 'POST',
        body: { deviceId, name: className.trim(), pin: pinToUse },
      });
      setClassId(result.classId);
      setStep(3);
    } catch (e) {
      setError(e.message || 'Could not create class');
    } finally {
      setSaving(false);
    }
  }

  function toggleProfile(profileId) {
    setSelectedProfiles(prev => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  }

  async function handleAddStudents() {
    if (selectedProfiles.size === 0) {
      // Skip — go to dashboard
      navigate(`/teacher/${classId}`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      for (const profileId of selectedProfiles) {
        await api('/teacher/add-student', {
          method: 'POST',
          body: { classId, profileId },
        });
      }
      setStep(4);
    } catch (e) {
      setError(e.message || 'Could not add students');
    } finally {
      setSaving(false);
    }
  }

  if (checkingClasses) return <LoadingSpinner text="Checking for existing classes..." />;

  // If classes already exist, show selection or create new
  if (existingClasses && step === 1 && !classId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-sm space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Teacher Dashboard</h1>
            <p className="text-sm text-gray-500 font-medium">Select a class or create a new one</p>
          </div>

          <div className="space-y-3">
            {existingClasses.map((cls) => (
              <motion.button
                key={cls.id}
                onClick={() => navigate(`/teacher/${cls.id}`)}
                className="w-full bg-white rounded-2xl shadow-md p-4 flex items-center gap-3 text-left hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{cls.name}</p>
                  <p className="text-xs text-gray-400">{cls.studentCount || 0} students</p>
                </div>
                <ArrowRight size={16} className="text-gray-300" />
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={() => setExistingClasses(null)}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            Create New Class
          </motion.button>

          <button
            onClick={() => navigate(-1)}
            className="w-full text-sm text-gray-400 font-semibold hover:text-gray-600 transition-colors text-center py-2"
          >
            Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-gradient-to-r from-blue-500 to-teal-400' :
                s < step ? 'w-4 bg-teal-400' : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Class Name */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Create Your Class</h1>
                <p className="text-sm text-gray-500 font-medium">Give your class a name to get started</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Year 3 Class"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-colors"
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

              <motion.button
                onClick={() => { if (className.trim()) setStep(2); }}
                disabled={!className.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <ArrowRight size={18} />
              </motion.button>

              <button
                onClick={() => navigate(-1)}
                className="w-full text-sm text-gray-400 font-semibold hover:text-gray-600 transition-colors text-center py-2"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Step 2: Set PIN */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ParentPinModal
                mode="set"
                onSuccess={(enteredPin) => {
                  setPin(enteredPin);
                  handleCreateClass(enteredPin);
                }}
                onCancel={() => setStep(1)}
              />
              {saving && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
                  <LoadingSpinner text="Creating class..." />
                </div>
              )}
              {error && (
                <motion.p
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg z-[60]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Step 3: Add Students */}
          {step === 3 && (
            <motion.div
              key="step3"
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Add Students</h1>
                <p className="text-sm text-gray-500 font-medium">Select which profiles belong to this class</p>
              </div>

              {loadingProfiles ? (
                <LoadingSpinner text="Loading profiles..." />
              ) : profiles.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                  <p className="text-sm text-gray-400">No student profiles found on this device.</p>
                  <p className="text-xs text-gray-400 mt-1">Students need to create profiles first.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md divide-y divide-gray-100 overflow-hidden">
                  {profiles.map((p) => {
                    const profileId = p._id || p.id;
                    const isSelected = selectedProfiles.has(profileId);
                    return (
                      <motion.button
                        key={profileId}
                        onClick={() => toggleProfile(profileId)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                          style={{ backgroundColor: p.avatarColor || '#6366F1' }}
                        >
                          {p.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">Year {p.yearGroup || p.year_group || '?'}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-gradient-to-br from-blue-500 to-teal-400 border-transparent'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

              <motion.button
                onClick={handleAddStudents}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? 'Adding...' : selectedProfiles.size > 0 ? `Add ${selectedProfiles.size} Student${selectedProfiles.size > 1 ? 's' : ''}` : 'Skip for Now'}
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <motion.div
              key="step4"
              className="space-y-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              >
                <Check size={40} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-1">All Set!</h1>
                <p className="text-sm text-gray-500 font-medium">
                  {className} is ready. You can view your class dashboard now.
                </p>
              </div>

              <motion.button
                onClick={() => navigate(`/teacher/${classId}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GraduationCap size={18} />
                Go to Dashboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
