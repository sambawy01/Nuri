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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
}));
app.use(express.json());

// Health check
const { getProvider } = require('./services/ai-provider');

app.get('/api/health', async (req, res) => {
  const health = { status: 'ok', timestamp: new Date().toISOString(), aiProvider: getProvider() };

  if (getProvider() === 'ollama') {
    try {
      const ollama = require('./services/ollama');
      const available = await ollama.isAvailable();
      const models = available ? await ollama.listModels() : [];
      health.ollama = { available, model: ollama.OLLAMA_MODEL, availableModels: models };
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Nuri server running on port ${PORT}`);
});

module.exports = app;
