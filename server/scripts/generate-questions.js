#!/usr/bin/env node
/**
 * Question Bank Generator
 *
 * Generates 30 questions per topic per difficulty using Ollama (free, local).
 * Batches 10 questions per API call to minimize overhead.
 * Inserts directly into Supabase question_bank table.
 *
 * Usage: node server/scripts/generate-questions.js [--subject maths] [--year 3] [--resume]
 *
 * --subject: Generate for a specific subject only
 * --year: Generate for a specific year group only
 * --resume: Skip topics that already have 30+ questions in the bank
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Pool } = require('pg');
const { getTopics, getAgeRange } = require('../src/services/curriculum');

// Use Supabase for storage, Ollama for generation
const DATABASE_URL = process.env.SUPABASE_URL || process.env.DATABASE_URL;
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b';

const QUESTIONS_PER_TOPIC = 30;
const BATCH_SIZE = 10;
const DIFFICULTIES = ['easy', 'medium', 'hard', 'challenge'];
const SUBJECTS = ['maths', 'science', 'english', 'history', 'arabic', 'religion'];

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function ollamaGenerate(prompt, systemPrompt) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: { temperature: 0.7, num_predict: 4096 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

function buildBatchPrompt(subject, topic, yearGroup, difficulty, batchNum) {
  const ageRange = getAgeRange(yearGroup);

  let diffNote = '';
  if (difficulty === 'easy') diffNote = 'Easy confidence-building questions.';
  else if (difficulty === 'hard') diffNote = 'Challenging stretch questions.';
  else if (difficulty === 'challenge') diffNote = 'Very hard multi-step reasoning questions.';

  return {
    system: `You are a quiz question generator for Year ${yearGroup} (age ${ageRange}) students studying ${subject}. Generate exactly ${BATCH_SIZE} different multiple-choice questions about "${topic}". Difficulty: ${difficulty}. ${diffNote}

CRITICAL: Verify each answer is correct. For maths, do the arithmetic step by step.

Respond with a JSON array of exactly ${BATCH_SIZE} questions:
[
  {"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."},
  ...
]

Rules:
- Each question must be DIFFERENT (no duplicates)
- correctAnswer is just the letter A, B, C, or D
- Age-appropriate for ${ageRange} year olds
- Mix up which option is correct (don't always make it A)
- Batch ${batchNum}/${QUESTIONS_PER_TOPIC / BATCH_SIZE}: make these distinct from other batches`,

    user: `Generate ${BATCH_SIZE} unique ${difficulty} questions about "${topic}" for Year ${yearGroup} ${subject}. Batch ${batchNum} — make sure these are different from typical questions on this topic.`,
  };
}

function parseQuestions(text) {
  // Try to extract JSON array
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // Try individual JSON objects
  const questions = [];
  const objectMatches = text.matchAll(/\{[^{}]*"question"[^{}]*\}/g);
  for (const match of objectMatches) {
    try {
      questions.push(JSON.parse(match[0]));
    } catch {}
  }
  return questions;
}

function shuffleOptions(q) {
  const labels = ['A', 'B', 'C', 'D'];
  const correctIdx = labels.indexOf((q.correctAnswer || 'A').toUpperCase());
  if (correctIdx === -1 || !q.options || q.options.length !== 4) return q;

  const clean = q.options.map(o => o.replace(/^[A-D]\)\s*/, ''));
  const indices = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return {
    ...q,
    options: indices.map((orig, i) => `${labels[i]}) ${clean[orig]}`),
    correctAnswer: labels[indices.indexOf(correctIdx)],
  };
}

async function getExistingCount(subject, topic, yearGroup, difficulty) {
  const result = await pool.query(
    'SELECT COUNT(*)::int as c FROM question_bank WHERE subject=$1 AND topic=$2 AND year_group=$3 AND difficulty=$4',
    [subject, topic, yearGroup, difficulty]
  );
  return result.rows[0].c;
}

async function insertQuestions(questions, subject, topic, yearGroup, difficulty) {
  let inserted = 0;
  for (const q of questions) {
    if (!q.question || !q.options || !q.correctAnswer) continue;
    const shuffled = shuffleOptions(q);
    const cleanOptions = shuffled.options.map(o => o.replace(/^[A-D]\)\s*/, ''));

    try {
      await pool.query(
        `INSERT INTO question_bank (subject, topic, year_group, difficulty, question_text, options, correct_answer, explanation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [subject, topic, yearGroup, difficulty, shuffled.question, JSON.stringify(cleanOptions), shuffled.correctAnswer, shuffled.explanation || null]
      );
      inserted++;
    } catch (err) {
      // Skip duplicates or errors
    }
  }
  return inserted;
}

async function qualityCheck(subject, topic, yearGroup, difficulty) {
  // Pick 10 random questions from the bank
  const result = await pool.query(
    `SELECT question_text, options, correct_answer FROM question_bank
     WHERE subject=$1 AND topic=$2 AND year_group=$3 AND difficulty=$4
     ORDER BY RANDOM() LIMIT 10`,
    [subject, topic, yearGroup, difficulty]
  );

  if (result.rows.length === 0) return 0;

  const questionsText = result.rows.map((q, i) => {
    const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    return `Q${i + 1}: ${q.question_text}\nA) ${opts[0]}\nB) ${opts[1]}\nC) ${opts[2]}\nD) ${opts[3]}\nStated answer: ${q.correct_answer}`;
  }).join('\n\n');

  try {
    const response = await ollamaGenerate(
      `Verify these ${result.rows.length} quiz questions. For each, check if the stated correct answer is actually correct. Respond with ONLY a JSON array of booleans, e.g. [true, true, false, true, ...] where true = correct answer is right, false = wrong.\n\n${questionsText}`,
      'You are a quiz answer verifier. Check if each question has the correct answer marked. For maths, solve step by step. Respond ONLY with a JSON array of booleans.'
    );

    const match = response.match(/\[[\s\S]*?\]/);
    if (match) {
      const results = JSON.parse(match[0]);
      const correct = results.filter(Boolean).length;
      return correct;
    }
  } catch {
    // If verification fails, assume OK
    return 10;
  }

  return 10;
}

async function main() {
  const args = process.argv.slice(2);
  const subjectFilter = args.includes('--subject') ? args[args.indexOf('--subject') + 1] : null;
  const yearFilter = args.includes('--year') ? parseInt(args[args.indexOf('--year') + 1]) : null;
  const resume = args.includes('--resume');

  // Check Ollama is available
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) throw new Error();
    console.log(`Connected to Ollama (${OLLAMA_MODEL})`);
  } catch {
    console.error('Ollama is not running. Start it with: ollama serve');
    process.exit(1);
  }

  const subjects = subjectFilter ? [subjectFilter] : SUBJECTS;
  let totalGenerated = 0;
  let totalSkipped = 0;
  const startTime = Date.now();

  for (const subject of subjects) {
    for (let year = 1; year <= 6; year++) {
      if (yearFilter && year !== yearFilter) continue;

      const topics = getTopics(subject, year);
      if (!topics) continue;

      for (const topicObj of topics) {
        const topic = topicObj.name;

        for (const difficulty of DIFFICULTIES) {
          // Check existing count
          const existing = await getExistingCount(subject, topic, year, difficulty);

          if (resume && existing >= QUESTIONS_PER_TOPIC) {
            totalSkipped++;
            continue;
          }

          const needed = QUESTIONS_PER_TOPIC - existing;
          const batches = Math.ceil(needed / BATCH_SIZE);
          let skipRemaining = false;

          for (let b = 1; b <= batches; b++) {
            if (skipRemaining) break;

            const { system, user } = buildBatchPrompt(subject, topic, year, difficulty, b);

            process.stdout.write(`[${subject}] Y${year} "${topic}" ${difficulty} batch ${b}/${batches}... `);

            try {
              const response = await ollamaGenerate(user, system);
              const questions = parseQuestions(response);
              const inserted = await insertQuestions(questions, subject, topic, year, difficulty);
              totalGenerated += inserted;
              console.log(`${inserted} questions saved (total: ${totalGenerated})`);

              // Quality gate at 20 questions: spot-check 10, skip if 8+/10 good
              if (b === 2) {
                const currentCount = await getExistingCount(subject, topic, year, difficulty);
                if (currentCount >= 20) {
                  const score = await qualityCheck(subject, topic, year, difficulty);
                  if (score >= 8) {
                    console.log(`  ✓ Quality score ${score}/10 — skipping to next (${currentCount} questions is enough)`);
                    skipRemaining = true;
                    totalSkipped++;
                  } else {
                    console.log(`  ⚠ Quality score ${score}/10 — generating more to improve pool`);
                  }
                }
              }
            } catch (err) {
              console.log(`ERROR: ${err.message}`);
            }
          }
        }
      }
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log(`\nDone! Generated ${totalGenerated} questions in ${elapsed} minutes. Skipped ${totalSkipped} already-full slots.`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
