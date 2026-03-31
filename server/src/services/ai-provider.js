/**
 * AI Provider Switcher for Nuri
 *
 * Provides a unified interface that delegates to either Claude or Ollama.
 * Set AI_PROVIDER=ollama in .env to use Ollama (default: claude)
 *
 * Environment variables:
 *   AI_PROVIDER=claude|ollama (default: claude)
 *   ANTHROPIC_API_KEY=... (required for claude)
 *   OLLAMA_BASE_URL=http://localhost:11434 (default for ollama)
 *   OLLAMA_MODEL=llama3.2 (default model)
 */

const AI_PROVIDER = (process.env.AI_PROVIDER || 'claude').toLowerCase();

let provider;

if (AI_PROVIDER === 'ollama') {
  provider = require('./ollama');
  console.log(`[AI] Using Ollama (model: ${provider.OLLAMA_MODEL})`);
} else {
  provider = require('./claude');
  console.log('[AI] Using Claude API');
}

module.exports = {
  buildSystemPrompt: provider.buildSystemPrompt,
  chat: provider.chat,
  chatStream: provider.chatStream || null,
  generateQuizQuestion: provider.generateQuizQuestion,

  /** Returns which provider is active */
  getProvider: () => AI_PROVIDER,
  supportsStreaming: () => AI_PROVIDER === 'ollama',
};
