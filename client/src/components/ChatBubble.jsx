import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import NuriOwl from './NuriOwl';
import SpeakerButton from './SpeakerButton';

export default function ChatBubble({ message, isNuri, subjectColor, owlState, owlLevel }) {
  return (
    <motion.div
      className={`flex ${isNuri ? 'justify-start' : 'justify-end'} mb-3`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isNuri && (
        <div className="shrink-0 mt-1 mr-2">
          <NuriOwl size="sm" state={owlState || 'idle'} level={owlLevel || 1} />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isNuri
              ? 'bg-white shadow-md text-gray-800 rounded-tl-sm'
              : 'text-white rounded-tr-sm'
          }`}
          style={!isNuri ? { backgroundColor: subjectColor || '#A855F7' } : undefined}
        >
          {isNuri ? (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 prose-headings:text-base">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
        {isNuri && message && (
          <div className="pl-1">
            <SpeakerButton text={message} size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
