import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Puzzle, GraduationCap, Calculator, FlaskConical, BookOpen, Clock, Heart, Languages, Globe, Star, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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
      <div className="grid grid-cols-3 gap-3 mb-8">
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

        <motion.button
          onClick={() => navigate(`/explain/${subject}`, { state: { topic: selectedTopic } })}
          className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <GraduationCap size={24} style={{ color: meta.color }} />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">Teach 🎓</h3>
          <p className="text-gray-400 text-xs font-semibold mt-0.5">Explain to Nuri</p>
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
        ) : (() => {
          // Group topics by strand
          const strands = [];
          const strandMap = {};
          topics.forEach((topic, index) => {
            const strand = topic.strand || 'General';
            if (!strandMap[strand]) {
              strandMap[strand] = [];
              strands.push(strand);
            }
            strandMap[strand].push({ ...topic, _index: index });
          });

          return (
            <div className="space-y-4">
              {strands.map(strand => (
                <div key={strand}>
                  {strands.length > 1 && (
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{strand}</p>
                  )}
                  <div className="space-y-2">
                    {strandMap[strand].map((topic) => {
                      const isExpanded = selectedTopic === topic.name;
                      const objectiveCount = topic.objectives?.length || 0;
                      const progressPct = topic.attempts > 0 ? Math.round((topic.correctCount / topic.attempts) * 100) : 0;

                      return (
                        <motion.div
                          key={topic.name}
                          className={`bg-white rounded-xl shadow text-left transition-all overflow-hidden ${
                            isExpanded ? 'ring-2 shadow-lg' : 'hover:shadow-md'
                          }`}
                          style={{ ringColor: isExpanded ? meta.color : undefined }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + topic._index * 0.04 }}
                        >
                          <button
                            onClick={() => setSelectedTopic(isExpanded ? null : topic.name)}
                            className="w-full p-4 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                                  style={{ backgroundColor: meta.color }}
                                >
                                  {topic._index + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-bold text-gray-800 text-sm ${subject === 'arabic' ? 'font-arabic' : ''}`}>
                                    {topic.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {topic.attempts > 0 && (
                                      <span className="text-xs text-gray-400 font-semibold">
                                        {progressPct}% correct
                                      </span>
                                    )}
                                    {objectiveCount > 0 && (
                                      <span className="text-xs text-gray-300 font-semibold">
                                        {objectiveCount} objectives
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {renderStars(topic.stars)}
                                {isExpanded
                                  ? <ChevronDown size={16} className="text-gray-400" />
                                  : <ChevronRight size={16} className="text-gray-300" />
                                }
                              </div>
                            </div>

                            {/* Progress bar */}
                            {topic.attempts > 0 && (
                              <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${progressPct}%`, backgroundColor: meta.color }}
                                />
                              </div>
                            )}
                          </button>

                          {/* Expanded: objectives + codes */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                                  {topic.codes?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {topic.codes.slice(0, 6).map(code => (
                                        <span key={code} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                          {code}
                                        </span>
                                      ))}
                                      {topic.codes.length > 6 && (
                                        <span className="text-[10px] px-1.5 py-0.5 text-gray-400">
                                          +{topic.codes.length - 6} more
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {topic.objectives?.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-bold text-gray-500 mb-2">What you'll learn:</p>
                                      {topic.objectives.map((obj, i) => (
                                        <button
                                          key={i}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/learn/${subject}`, { state: { topic: `${topic.name}: ${obj}` } });
                                          }}
                                          className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                        >
                                          <CheckCircle2
                                            size={14}
                                            className="shrink-0 mt-0.5 transition-colors"
                                            style={{ color: topic.stars >= 3 ? meta.color : '#D1D5DB' }}
                                          />
                                          <p className={`text-xs leading-relaxed flex-1 ${subject === 'arabic' ? 'font-arabic' : ''} ${
                                            topic.stars >= 3 ? 'text-gray-700' : 'text-gray-500'
                                          }`}>
                                            {obj}
                                          </p>
                                          <Lightbulb size={12} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: meta.color }} />
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {/* Action buttons */}
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigate(`/learn/${subject}`, { state: { topic: topic.name } }); }}
                                      className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
                                      style={{ backgroundColor: meta.color }}
                                    >
                                      <Lightbulb size={14} /> Learn
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${subject}`, { state: { topic: topic.name } }); }}
                                      className="flex-1 py-2.5 rounded-xl font-bold text-sm shadow-md border-2 flex items-center justify-center gap-1.5"
                                      style={{ borderColor: meta.color, color: meta.color }}
                                    >
                                      <Puzzle size={14} /> Quiz
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigate(`/explain/${subject}`, { state: { topic: topic.name } }); }}
                                      className="flex-1 py-2.5 rounded-xl font-bold text-sm shadow-md border-2 flex items-center justify-center gap-1.5"
                                      style={{ borderColor: meta.color, color: meta.color }}
                                    >
                                      <GraduationCap size={14} /> Teach
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

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
            <button
              onClick={() => navigate(`/explain/${subject}`, { state: { topic: selectedTopic } })}
              className="flex-1 py-3 rounded-xl font-bold text-sm shadow-lg border-2"
              style={{ borderColor: meta.color, color: meta.color }}
            >
              Teach: {selectedTopic}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
