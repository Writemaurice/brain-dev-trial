# Knowledge Extraction API - Brain Developer Trial

A full-stack application that processes meeting transcripts using AI to extract entities, generate summaries and insights, perform semantic search, and provide analytics.

## Features

### ✅ Backend API (Express + TypeScript)
- **POST /api/ingest** - Ingests transcripts with AI-powered extraction
- **GET /api/transcripts** - Lists all transcripts
- **GET /api/transcripts/:id** - Gets specific transcript details
- **GET /api/search?q=query** - Semantic search using embeddings
- **GET /api/analytics/topics** - Topic statistics
- **GET /api/analytics/participants** - Participant engagement metrics

### ✅ AI Features
1. **Entity Extraction** - Extracts topics, action items, decisions, and sentiment
2. **Automatic Summarization** - Generates 2-3 sentence summaries
3. **Key Insights Generation** - Extracts 3-5 strategic insights
4. **Semantic Search** - OpenAI embeddings + ChromaDB for meaning-based search

### ✅ Frontend Dashboard (React + Vite + Tailwind)
- **Transcript List** - Browse and filter transcripts
- **Transcript Detail** - View full details with summary and insights
- **Semantic Search** - Natural language search interface
- **Analytics Dashboard** - Charts and statistics with Recharts

## Technology Stack

**Backend:**
- Express.js + TypeScript
- PostgreSQL (structured data)
- ChromaDB (vector embeddings)
- OpenAI API (GPT-3.5-turbo + text-embedding-3-small)
- Zod (validation)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Recharts (visualizations)
- Axios (HTTP client)

## Architecture

```
┌─────────────────┐
│  React Frontend │ 
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌────────────────────────────────────┐
│     Express Backend API            │
│        (Port 3001)                 │
│                                    │
│  • Entity Extraction (GPT-3.5)    │
│  • Summarization (GPT-3.5)        │
│  • Insights Generation (GPT-3.5)  │
│  • Embeddings (text-embedding)    │
└─────────┬──────────────┬───────────┘
          │              │
    ┌─────▼─────┐  ┌─────▼─────┐
    │PostgreSQL │  │ ChromaDB  │
    │(Relations)│  │(Vectors)  │
    └───────────┘  └───────────┘
```

## Database Schema

- **transcripts** - Meeting records with summary and insights
- **participants** - People (deduplicated by email)
- **topics** - Extracted themes
- **action_items** - Tasks identified
- **decisions** - Key outcomes
- **transcript_participants** - Many-to-many junction
- **transcript_topics** - Many-to-many junction

## Project Structure

```
brain-dev-trial/
├── README.md                    # This file
├── SETUP.md                     # Setup instructions
├── backend/
│   ├── src/
│   │   ├── index.ts            # Main server
│   │   ├── migrate.ts          # Migration runner
│   │   ├── database/
│   │   │   ├── schema.sql      # Database schema
│   │   │   └── db.ts           # Connection pool
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # OpenAI & ChromaDB
│   │   └── types/              # Zod schemas
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/              # React pages
│   │   └── api/                # API client
│   ├── package.json
│   └── vite.config.ts
└── sample-data/
    └── sample-transcripts.json # Test data
```

## Quick Start

See **SETUP.md** for detailed installation and setup instructions.

```bash
# 1. Start databases
docker run -d --name brain-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=brain_trial -p 5432:5432 postgres:16-alpine
docker run -d --name brain-chroma -p 8000:8000 chromadb/chroma:latest

# 2. Setup backend
cd backend
npm install
cp env.example .env
# Edit .env and add your OPENAI_API_KEY
npm run migrate
npm run dev

# 3. Setup frontend (in new terminal)
cd frontend
npm install
npm run dev

# 4. Open http://localhost:3000
```

## API Example

### Ingest a transcript:

```bash
curl -X POST http://localhost:3001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "transcript_id": "meeting-001",
    "title": "Q4 Planning",
    "occurred_at": "2025-10-20T10:00:00Z",
    "duration_minutes": 30,
    "participants": [
      {"name": "John Doe", "email": "john@example.com", "role": "speaker"}
    ],
    "transcript": "John: Hello everyone. Today we will discuss our Q4 goals and budget allocation..."
  }'
```

### Response:

```json
{
  "id": "meeting-001",
  "status": "processed",
  "extracted": {
    "topics": ["Budget Planning", "Q4 Goals"],
    "action_items": ["Review Q3 report"],
    "decisions": ["Approved budget increase"],
    "sentiment": "positive",
    "summary": "The team discussed Q4 goals and budget allocation. Key decisions were made regarding budget increases and action items were assigned.",
    "key_insights": [
      "Team alignment on Q4 priorities shows strong organizational focus",
      "Budget increase indicates growth trajectory"
    ]
  }
}
```

## Requirements Met

✅ **Part 1: Backend API** - All endpoints implemented  
✅ **Part 2: Data Modeling** - PostgreSQL schema with proper relationships  
✅ **Part 3: Frontend Dashboard** - 4 pages with modern UI  
✅ **Part 4: AI Integration** - 4 AI features (entity extraction, summarization, insights, semantic search)

## Design Decisions

**Express vs NestJS:** Chose Express for simpler setup and faster MVP development

**PostgreSQL:** Relational data with ACID compliance, JSONB for flexibility

**ChromaDB:** Open-source vector database optimized for embeddings. I chose this because of simple local setup and easy implementation due to time constraints.

**Zod:** Type-safe validation with TypeScript integration

## What Happens During Ingestion

1. Validates request data (Zod)
2. Extracts entities with GPT-3.5 (topics, actions, decisions, sentiment)
3. Generates 2-3 sentence summary
4. Generates 3-5 key insights
5. Stores in PostgreSQL with relationships
6. Creates vector embedding (1536 dimensions)
7. Stores embedding in ChromaDB
8. Returns all extracted data

Processing time: 10-20 seconds per transcript

## Environment Variables

Create `backend/.env`:

```env
OPENAI_API_KEY=sk-proj-your-key-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brain_trial
PORT=3001
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

## Development

- **Backend**: `cd backend && npm run dev` (port 3001)
- **Frontend**: `cd frontend && npm run dev` (port 3000)
- **Migration**: `cd backend && npm run migrate`

## Testing

### Test API:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/transcripts
curl "http://localhost:3001/api/search?q=budget"
```

### Load sample data:
Use the 4 sample transcripts in `sample-data/sample-transcripts.json`

## Trade-offs & Future Improvements

**Current Limitations:**
- No caching (every OpenAI call is fresh)
- No authentication
- No pagination
- Sequential processing only

**With More Time:**
- Add Redis caching
- Implement JWT authentication
- Add job queue (Bull/BullMQ)
- Write unit & integration tests
- Add rate limiting
- Implement real-time updates (WebSockets)
- Dark mode support
- Replace Chroma with Weaviate or Qdrant for scalability

## Documentation

- **README.md** - Project overview (this file)
- **SETUP.md** - Detailed setup instructions
- API responses are self-documenting with TypeScript interfaces

---

**Total Implementation Time:** ~5 hours  
**AI Models Used:** GPT-3.5-turbo, text-embedding-3-small
