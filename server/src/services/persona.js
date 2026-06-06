/**
 * Nuri Persona System — Subject-specific soul templates
 *
 * Loads persona .md files from server/personas/ directory.
 * Each persona enhances (never replaces) the base system prompt
 * with subject-specific guidance, tone adjustments, and pedagogical strategies.
 *
 * Personas are cached after first load for performance.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PERSONAS_DIR = path.resolve(__dirname, '../../personas');

// Cache: subject -> { yearGroups: { [yearGroup]: content }, default: content }
let personaCache = null;
let personaCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load all persona files from the personas directory.
 * Parses frontmatter-style yearGroup ranges from filename or content.
 *
 * File format: nuri-{subject}.md
 * Subject is extracted from filename (e.g., nuri-maths.md → maths)
 *
 * Inside the file, optional yearGroup sections can be marked with:
 *   ## Year 1-2
 *   (content specific to years 1-2)
 *   ## Year 3-6
 *   (content specific to years 3-6)
 *
 * Content before any ## heading is treated as default (applies to all year groups).
 */
function loadPersonas() {
  // Return cached if fresh
  if (personaCache && Date.now() - personaCacheTime < CACHE_TTL) {
    return personaCache;
  }

  const personas = {};

  try {
    const files = fs.readdirSync(PERSONAS_DIR).filter(f => f.startsWith('nuri-') && f.endsWith('.md'));

    for (const file of files) {
      // Extract subject from filename: nuri-maths.md → maths
      const subject = file.replace('nuri-', '').replace('.md', '').toLowerCase();

      const filePath = path.join(PERSONAS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();

      if (!content) continue;

      // Parse year group sections
      // Format: ## Year X-Y or ## Year X
      const sections = { default: '', yearGroups: {} };

      // Split by year group headings
      const yearGroupRegex = /^##\s*Year\s+(\d+)(?:\s*[-–]\s*(\d+))?\s*$/gm;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = yearGroupRegex.exec(content)) !== null) {
        // Content before this heading
        if (match.index > lastIndex) {
          const before = content.slice(lastIndex, match.index).trim();
          if (before) parts.push({ type: 'default', content: before });
        }

        const startYear = parseInt(match[1]);
        const endYear = match[2] ? parseInt(match[2]) : startYear;
        parts.push({ type: 'yearGroup', startYear, endYear, content: '' });

        lastIndex = match.index + match[0].length;
      }

      // Remaining content after last heading (or entire content if no headings)
      if (lastIndex < content.length) {
        const remaining = content.slice(lastIndex).trim();
        if (remaining) {
          if (parts.length > 0 && parts[parts.length - 1].type === 'yearGroup') {
            parts[parts.length - 1].content = remaining;
          } else {
            parts.push({ type: 'default', content: remaining });
          }
        }
      }

      // If no headings found, entire content is default
      if (parts.length === 0) {
        sections.default = content;
      } else {
        for (const part of parts) {
          if (part.type === 'default') {
            sections.default += (sections.default ? '\n\n' : '') + part.content;
          } else {
            for (let y = part.startYear; y <= part.endYear; y++) {
              sections.yearGroups[y] = part.content;
            }
          }
        }
      }

      personas[subject] = sections;
    }
  } catch (err) {
    console.warn('[Persona] Could not load personas from', PERSONAS_DIR, ':', err.message);
    // Return whatever we have (may be empty)
    return personas;
  }

  personaCache = personas;
  personaCacheTime = Date.now();
  return personas;
}

/**
 * Clear the persona cache (useful for development/testing).
 */
function clearPersonaCache() {
  personaCache = null;
  personaCacheTime = 0;
}

/**
 * Get subject-specific prompt additions based on the persona system.
 *
 * Returns a string of additional system prompt content that enhances
 * (never replaces) the base Nuri prompt.
 *
 * @param {string} subject — the subject being taught (e.g., 'maths', 'science')
 * @param {number} yearGroup — the child's year group (1-6)
 * @returns {string} — persona prompt additions, or empty string if no persona found
 */
function getPersona(subject, yearGroup) {
  if (!subject) return '';

  const personas = loadPersonas();
  const key = subject.toLowerCase();

  const persona = personas[key];
  if (!persona) {
    // Try alias mappings for common variations
    const aliases = {
      'math': 'maths',
      'mathematics': 'maths',
      'sci': 'science',
      'eng': 'english',
      'ar': 'arabic',
      'rel': 'religion',
      'coptic': 'religion',
      'hist': 'history',
    };
    const alias = aliases[key];
    if (alias && personas[alias]) {
      return buildPersonaPrompt(personas[alias], yearGroup);
    }
    return '';
  }

  return buildPersonaPrompt(persona, yearGroup);
}

/**
 * Build the actual prompt string from a persona's sections.
 *
 * @param {Object} persona — { default: string, yearGroups: { [year]: string } }
 * @param {number} yearGroup — year group number
 * @returns {string}
 */
function buildPersonaPrompt(persona, yearGroup) {
  let prompt = '';

  if (persona.default) {
    prompt += persona.default;
  }

  // Append year-group-specific content if available
  if (yearGroup && persona.yearGroups && persona.yearGroups[yearGroup]) {
    prompt += '\n\n' + persona.yearGroups[yearGroup];
  }

  return prompt;
}

module.exports = { getPersona, loadPersonas, clearPersonaCache };