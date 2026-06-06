/**
 * AI Provider Switcher for Nuri — Backward Compatibility
 *
 * Now delegates to the unified ai.js (Vercel AI SDK).
 * Existing imports of ai-provider still work without changes.
 */

const ai = require('./ai');

module.exports = {
  buildSystemPrompt: ai.buildSystemPrompt,
  chat: ai.chat,
  chatStream: ai.chatStream,
  generateQuizQuestion: ai.generateQuizQuestion,
  buildExplainBackPrompt: ai.buildExplainBackPrompt,
  getProvider: ai.getProvider,
  supportsStreaming: ai.supportsStreaming,
  isOllamaAvailable: ai.isOllamaAvailable,
  listOllamaModels: ai.listOllamaModels,
  OLLAMA_MODEL: ai.OLLAMA_MODEL,
};
