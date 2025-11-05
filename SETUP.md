# Setup Guide

Complete instructions to get the Knowledge Extraction API running.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+** ([nodejs.org](https://nodejs.org/))
- **Docker Desktop** or PostgreSQL 16+ installed locally
- **OpenAI API Key** ([platform.openai.com/api-keys](https://platform.openai.com/api-keys))

---

## Step 1: Start Databases

### PostgreSQL

```bash
docker run --name brain-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=brain_trial \
  -p 5432:5432 \
  -d postgres:16-alpine
```

If container already exists:
```bash
docker start brain-postgres
```

### ChromaDB

```bash
docker run --name brain-chroma \
  -p 8000:8000 \
  -d chromadb/chroma:latest
```

If container already exists:
```bash
docker start brain-chroma
```

### Verify databases are running:

```bash
docker ps | grep -E "brain-postgres|brain-chroma"
```

You should see both containers running.

---

## Step 2: Backend Setup

### Navigate to backend folder:

```bash
cd backend
```

### Install dependencies:

```bash
npm install
```

### Configure environment variables:

```bash
cp env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brain_trial
PORT=3001
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

**Important:** Replace `YOUR-ACTUAL-KEY-HERE` with your real OpenAI API key.

### Run database migrations:

```bash
npm run migrate
```

You should see: `✅ Database migrations completed successfully!`

### Start the backend server:

```bash
npm run dev
```

Server will start on **http://localhost:3001**

**Keep this terminal open.**

---

## Step 3: Frontend Setup

Open a **new terminal window**.

### Navigate to frontend folder:

```bash
cd frontend
```

### Install dependencies:

```bash
npm install
```

### Start the development server:

```bash
npm run dev
```

Frontend will start on **http://localhost:3000**

**Keep this terminal open.**

---

## Step 4: Access the Application

Open your browser and go to:

```
http://localhost:3000
```

You should see the Knowledge Extraction API dashboard.

---

## Step 5: Load Sample Data

To test the application, ingest a sample transcript.

### Option 1: Using curl

```bash
curl -X POST http://localhost:3001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "transcript_id": "meeting-001",
    "title": "Q4 Planning Meeting",
    "occurred_at": "2025-10-20T10:00:00Z",
    "duration_minutes": 30,
    "participants": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "speaker"
      }
    ],
    "transcript": "John: Hello everyone. Today we will discuss our Q4 goals and budget allocation. We need to increase our marketing spend by 20% and hire 3 new engineers. Sarah: I agree, and we should also focus on customer retention. Let us schedule a follow-up meeting next week.",
    "metadata": {
      "platform": "zoom"
    }
  }'
```

### Option 2: Use sample data file

The `sample-data/sample-transcripts.json` file contains 4 sample transcripts. You can send them individually using the format above.

### What happens during ingestion:

1. Validates the input
2. Extracts topics, action items, decisions, sentiment (AI)
3. Generates 2-3 sentence summary (AI)
4. Generates 3-5 key insights (AI)
5. Stores in PostgreSQL
6. Creates vector embedding for search (AI)
7. Returns extracted data

This takes 10-20 seconds per transcript.

---

## Verify Everything Works

### 1. Check backend health:

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","message":"Brain Trial API is running"}`

### 2. Get all transcripts:

```bash
curl http://localhost:3001/api/transcripts
```

### 3. Test semantic search:

```bash
curl "http://localhost:3001/api/search?q=budget%20planning"
```

### 4. View in browser:

- **Homepage**: http://localhost:3000 - See transcript list
- **Search**: http://localhost:3000/search - Try semantic search
- **Analytics**: http://localhost:3000/analytics - View charts
- Click any transcript to see details with summary and insights

---

## Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**

Check PostgreSQL is running:
```bash
docker ps | grep brain-postgres
docker start brain-postgres
```

**Error: "OpenAI API error"**

- Check your `.env` file has the correct `OPENAI_API_KEY`
- Verify you have credits at https://platform.openai.com/usage

**Error: "Cannot connect to Chroma"**

Check ChromaDB is running:
```bash
docker ps | grep brain-chroma
docker start brain-chroma
```

### Frontend won't load

**Error: "Cannot connect to API"**

- Make sure backend is running on port 3001
- Check backend terminal for errors

**Blank page or errors**

- Check browser console (F12) for errors
- Ensure you're using http://localhost:3000 (not 3001)

### No transcripts showing

Run the curl command above to ingest at least one transcript.

### Migration fails

If you get an error about tables already existing:
```bash
# Connect to database
docker exec -it brain-postgres psql -U postgres -d brain_trial

# Check tables
\dt

# If needed, drop and recreate
DROP DATABASE brain_trial;
CREATE DATABASE brain_trial;
\q

# Then run migration again
cd backend
npm run migrate
```

---

## Stopping the Application

### Stop servers:
- Press `Ctrl+C` in both terminal windows (backend and frontend)

### Stop Docker containers:
```bash
docker stop brain-postgres brain-chroma
```

### Start again later:
```bash
docker start brain-postgres brain-chroma
cd backend && npm run dev &
cd frontend && npm run dev
```

---

## Database Schema

The migration creates 7 tables:

1. **transcripts** - Meeting records
   - Includes: title, transcript_text, sentiment, summary, key_insights
2. **participants** - People (deduplicated by email)
3. **topics** - Extracted themes
4. **action_items** - Tasks
5. **decisions** - Key outcomes
6. **transcript_participants** - Many-to-many relationship
7. **transcript_topics** - Many-to-many relationship

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Ingest and process transcript |
| GET | `/api/transcripts` | List all transcripts |
| GET | `/api/transcripts/:id` | Get specific transcript |
| GET | `/api/search?q=query` | Semantic search |
| GET | `/api/analytics/topics` | Topic statistics |
| GET | `/api/analytics/participants` | Participant metrics |
| GET | `/health` | Health check |

---

## Environment Variables Reference

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/brain_trial` |
| `PORT` | Backend server port | `3001` |
| `CHROMA_HOST` | ChromaDB host | `localhost` |
| `CHROMA_PORT` | ChromaDB port | `8000` |

---

## Next Steps

1. ✅ Get the app running (above steps)
2. 📊 Load sample data and explore the UI
3. 🔍 Try semantic search with different queries
4. 📈 View analytics dashboard
5. 🧪 Ingest your own transcripts

---

## Getting Help

If you encounter issues:

1. Check the error message in backend/frontend terminal
2. Verify all prerequisites are installed
3. Ensure Docker containers are running
4. Check that ports 3000, 3001, 5432, and 8000 are available
5. Verify your OpenAI API key is valid

---

**You're all set!** 🎉

The application should now be running at http://localhost:3000

