import { Router, Request, Response } from 'express';
import { generateEmbedding } from '../services/openai.service';
import { searchSimilarTranscripts } from '../services/chroma.service';
import { query } from '../database/db';

const router = Router();

// GET /api/search?q=query&limit=5
router.get('/search', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5; // Default to 5 most relevant results

    if (!searchQuery) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log(`Searching for: "${searchQuery}" (limit: ${limit})`);

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(searchQuery);

    // Search similar transcripts in Chroma
    const chromaResults = await searchSimilarTranscripts(queryEmbedding, limit);

    if (chromaResults.ids.length === 0) {
      return res.json({ results: [] });
    }

    // Get full transcript details from PostgreSQL
    const transcriptIds = chromaResults.ids;
    const placeholders = transcriptIds.map((_, i) => `$${i + 1}`).join(',');

    const result = await query(
      `SELECT 
        t.id,
        t.transcript_id,
        t.title,
        t.occurred_at,
        t.duration_minutes,
        t.sentiment,
        t.transcript_text,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('name', p.name, 'email', p.email)
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as participants,
        COALESCE(
          json_agg(DISTINCT topics.name) FILTER (WHERE topics.id IS NOT NULL),
          '[]'
        ) as topics
      FROM transcripts t
      LEFT JOIN transcript_participants tp ON t.id = tp.transcript_id
      LEFT JOIN participants p ON tp.participant_id = p.id
      LEFT JOIN transcript_topics tt ON t.id = tt.transcript_id
      LEFT JOIN topics ON tt.topic_id = topics.id
      WHERE t.transcript_id IN (${placeholders})
      GROUP BY t.id`,
      transcriptIds
    );

    // Combine results with similarity scores
    const resultsWithScores = result.rows.map((row) => {
      const index = chromaResults.ids.indexOf(row.transcript_id);
      const distance = chromaResults.distances[index] || 0;
      // Convert distance to similarity score (lower distance = higher similarity)
      const similarity = 1 / (1 + distance);

      return {
        ...row,
        similarity_score: similarity,
      };
    });

    // Sort by similarity score
    resultsWithScores.sort((a, b) => b.similarity_score - a.similarity_score);

    res.json({ results: resultsWithScores });
  } catch (error: any) {
    console.error('Error in search:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

