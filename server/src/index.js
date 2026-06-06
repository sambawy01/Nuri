require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const profilesRouter = require('./routes/profiles');
const chatRouter = require('./routes/chat');
const quizRouter = require('./routes/quiz');
const statsRouter = require('./routes/stats');
const curriculumRouter = require('./routes/curriculum');
const mistakesRouter = require('./routes/mistakes');
const reviewRouter = require('./routes/review');
const explainRouter = require('./routes/explain');
const learningStyleRouter = require('./routes/learning-style');
const badgesRouter = require('./routes/badges');
const challengeRouter = require('./routes/challenge');
const homeworkRouter = require('./routes/homework');
const reportsRouter = require('./routes/reports');
const parentRouter = require('./routes/parent');
const testPlanRouter = require('./routes/test-plan');
const duelsRouter = require('./routes/duels');
const treehouseRouter = require('./routes/treehouse');
const storyRouter = require('./routes/story');
const teacherRouter = require('./routes/teacher');
const presenceRouter = require('./routes/presence');
const bedayaRouter = require('./routes/bedaya');
const diagnosticRouter = require('./routes/diagnostic');
const voiceAuthRouter = require('./routes/voice-auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.VERCEL
    ? true  // Allow all origins on Vercel (same-origin anyway)
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
const ai = require('./services/ai');

app.get('/api/health', async (req, res) => {
  const health = { status: 'ok', timestamp: new Date().toISOString(), aiProvider: ai.getProvider() };

  if (ai.getProvider() === 'ollama') {
    try {
      const available = await ai.isOllamaAvailable();
      const models = available ? await ai.listOllamaModels() : [];
      health.ollama = { available, model: ai.OLLAMA_MODEL, availableModels: models };
    } catch (err) {
      health.ollama = { available: false, error: err.message };
    }
  }

  res.json({ success: true, data: health });
});

// Routes
app.use('/api/profiles', profilesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/stats', statsRouter);
app.use('/api/curriculum', curriculumRouter);
app.use('/api/mistakes', mistakesRouter);
app.use('/api/review', reviewRouter);
app.use('/api/explain', explainRouter);
app.use('/api/learning-style', learningStyleRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/challenge', challengeRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/parent', parentRouter);
app.use("/api/test-plan", testPlanRouter);
app.use("/api/duels", duelsRouter);
app.use('/api/treehouse', treehouseRouter);
app.use('/api/story', storyRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/presence', presenceRouter);
app.use('/api/bedaya', bedayaRouter);
app.use('/api/diagnostic', diagnosticRouter);
app.use('/api/voice', voiceAuthRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Only listen when running directly (not as Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Nuri server running on port ${PORT}`);
  });
}

module.exports = app;
