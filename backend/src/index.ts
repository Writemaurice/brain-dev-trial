import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ingestRoute from './routes/ingest.route';
//import transcriptsRoute from './routes/transcripts.route';
import searchRoute from './routes/search.route';
//import analyticsRoute from './routes/analytics.route';
import { initializeChroma } from './services/chroma.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Brain Trial API is running' });
});

// Routes
app.use('/api', ingestRoute);
//app.use('/api', transcriptsRoute);
app.use('/api', searchRoute);
//app.use('/api', analyticsRoute);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize services and start server
async function start() {
  try {
    // Initialize Chroma
    console.log('Initializing Chroma vector database...');
    await initializeChroma();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/ingest`);
      console.log(`   GET  http://localhost:${PORT}/api/transcripts`);
      console.log(`   GET  http://localhost:${PORT}/api/transcripts/:id`);
      console.log(`   GET  http://localhost:${PORT}/api/search?q=query`);
      console.log(`   GET  http://localhost:${PORT}/api/analytics/topics`);
      console.log(`   GET  http://localhost:${PORT}/api/analytics/participants`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

