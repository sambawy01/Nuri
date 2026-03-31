# Nuri — AI-Powered Curriculum Tutor

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS 3 + Framer Motion
- Backend: Node.js + Express
- Database: PostgreSQL
- AI: Anthropic Claude API (claude-sonnet-4-20250514)
- Voice: Web Speech API (SpeechSynthesis + SpeechRecognition)
- Fonts: Nunito (English), Noto Naskh Arabic (Arabic)

## Project Structure
```
client/          # React frontend (Vite)
  src/
    components/  # Reusable UI components
    pages/       # Page-level components
    hooks/       # Custom React hooks
    context/     # React Context providers
    assets/      # SVGs, images, fonts
    lib/         # Utility functions
    styles/      # Global CSS
server/          # Express backend
  src/
    routes/      # API route handlers
    db/          # Database connection + migrations
    services/    # Business logic + Claude AI
    middleware/  # Auth, error handling
```

## Key Design Principles
- XP NEVER decreases — growth-only scoring (anti-IXL)
- Voice-first for Years 1-2 (ages 5-7)
- Nuri reads everything aloud, kids answer by speaking or tapping
- Wrong answers get encouragement, never punishment
- Short sessions (10-15 min) with positive endings
- All Arabic text: RTL with transliteration + English meaning

## Curriculum
- Cambridge/British: Maths, Science, English, History (Years 1-6)
- Egyptian National: Arabic Language, Christian Religion (Years 1-6)

## Colors
- Primary: Orange (#F97316) → Purple (#A855F7) gradient
- Maths: Blue (#3B82F6)
- Science: Green (#10B981)
- English: Purple (#8B5CF6)
- History: Amber (#F59E0B)
- Religion: Rose (#F43F5E)
- Arabic: Teal (#14B8A6)
