/**
 * Nuri AI Service — Unified Interface
 *
 * Switch between Claude (Anthropic) and Ollama (local) based on environment config.
 *
 * Environment Variables:
 * - AI_PROVIDER: 'claude' | 'ollama' (default: 'claude')
 * - ANTHROPIC_API_KEY: Required if using Claude
 * - OLLAMA_BASE_URL: Optional, default 'http://localhost:11434'
 * - OLLAMA_MODEL: Optional, default 'llama3.2'
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'claude';

let claudeService = null;
let ollamaService = null;

// Lazy load services to avoid requiring missing dependencies
function getClaudeService() {
  if (!claudeService) {
    claudeService = require('./claude');
  }
  return claudeService;
}

function getOllamaService() {
  if (!ollamaService) {
    ollamaService = require('./ollama');
  }
  return ollamaService;
}

/**
 * Get the active AI service based on configuration
 */
function getActiveService() {
  return AI_PROVIDER === 'ollama' ? getOllamaService() : getClaudeService();
}

/**
 * Build system prompt for Nuri persona
 */
function buildSystemPrompt(profile, subject, mode) {
  const service = getActiveService();
  return service.buildSystemPrompt(profile, subject, mode);
}

/**
 * Chat with the AI
 */
async function chat(messages, systemPrompt) {
  const service = getActiveService();
  return service.chat(messages, systemPrompt);
}

/**
 * Generate a quiz question
 */
async function generateQuizQuestion(subject, topic, yearGroup, difficulty) {
  const service = getActiveService();
  return service.generateQuizQuestion(subject, topic, yearGroup, difficulty);
}

/**
 * Health check — returns AI provider status
 */
async function getHealthStatus() {
  const status = {
    provider: AI_PROVIDER,
    available: false,
    model: null,
  };

  try {
    if (AI_PROVIDER === 'ollama') {
      const ollama = getOllamaService();
      status.available = await ollama.isAvailable();
      status.model = ollama.OLLAMA_MODEL;
    } else {
      // For Claude, just check if API key is configured
      status.available = !!process.env.ANTHROPIC_API_KEY;
      status.model = 'claude-sonnet-4-20250514';
    }
  } catch (error) {
    status.error = error.message;
  }

  return status;
}

module.exports = {
  buildSystemPrompt,
  chat,
  generateQuizQuestion,
  getHealthStatus,
  AI_PROVIDER,
};
