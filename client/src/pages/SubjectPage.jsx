import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Puzzle, Calculator, FlaskConical, BookOpen, Clock, Heart, Languages, Globe, Star, ChevronRight } from 'lucide-react';
import { subjects } from '../lib/subjects';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import { useState, useEffect } from 'react';

const iconMap = { Calculator, FlaskConical, BookOpen, Clock, Heart, Languages, Globe };

export default function SubjectPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { currentProfile } = useProfile();
  const meta = subjects[subject];
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (!currentProfile || !meta) return;
    setLoading(true);
    api(`/curriculum/${subject}/${currentProfile.year_group}?profileId=${currentProfile.id}`)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [subject, currentProfile]);

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🤔</p>
          <p className="text-gray-600 font-bold">Subject not found</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-purple-500 font-bold underline">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[meta.icon];

  const renderStars = (count) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Back button */}
      <motion.button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-gray-700"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
      >
        <ArrowLeft size={20} />
        Back
      </motion.button>

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg"
          style={{ backgroundColor: meta.color }}
        >
          {Icon ? <Icon size={36} /> : <span className="text-4xl">{meta.emoji}</span>}
        </div>
        <h1 className={`text-3xl font-extrabold text-gray-800 ${subject === 'arabic' ? 'font-arabic' : ''}`}>
          {meta.name}
        </h1>
        <p className="text-gray-500 font-semibold mt-1">
          Year {currentProfile?.year_group} — Pick a topic or mode
        </p>
      </motion.div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.button
          onClick={() => navigate(`/learn/${subject}`, { state: { topic: selectedTopic } })}
          className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <Lightbulb size={24} style={{ color: meta.color }} />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">Learn 💡</h3>
          <p className="text-gray-400 text-xs font-semibold mt-0.5">Nuri teaches you</p>
        </motion.button>

        <motion.button
          onClick={() => navigate(`/quiz/${subject}`, { state: { topic: selectedTopic } })}
          className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <Puzzle size={24} style={{ color: meta.color }} />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">Quiz 🧩</h3>
          <p className="text-gray-400 text-xs font-semibold mt-0.5">Test yourself</p>
        </motion.button>
      </div>

      {/* Topic List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-lg font-extrabold text-gray-700 mb-3">
          📚 Topics for Year {currentProfile?.year_group}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow text-center text-gray-400 font-semibold">
            No topics found for this subject
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, index) => (
              <motion.button
                key={topic.name}
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                className={`w-full bg-white rounded-xl p-4 shadow text-left transition-all ${
                  selectedTopic === topic.name
                    ? 'ring-2 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={{
                  borderColor: selectedTopic === topic.name ? meta.color : 'transparent',
                  ringColor: selectedTopic === topic.name ? meta.color : undefined,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-bold text-gray-800 text-sm ${subject === 'arabic' ? 'font-arabic' : ''}`}>
                        {topic.name}
                      </p>
                      {topic.attempts > 0 && (
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">
                          {topic.correctCount}/{topic.attempts} correct
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(topic.stars)}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Selected topic action */}
        {selectedTopic && (
          <motion.div
            className="mt-4 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => navigate(`/learn/${subject}`, { state: { topic: selectedTopic } })}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg"
              style={{ backgroundColor: meta.color }}
            >
              Learn: {selectedTopic}
            </button>
            <button
              onClick={() => navigate(`/quiz/${subject}`, { state: { topic: selectedTopic } })}
              className="flex-1 py-3 rounded-xl font-bold text-sm shadow-lg border-2"
              style={{ borderColor: meta.color, color: meta.color }}
            >
              Quiz: {selectedTopic}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
