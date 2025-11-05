import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

// GET /api/analytics/topics
router.get('/analytics/topics', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        t.name as topic,
        COUNT(tt.transcript_id) as count,
        ARRAY_AGG(DISTINCT tr.title) as transcript_titles
      FROM topics t
      LEFT JOIN transcript_topics tt ON t.id = tt.topic_id
      LEFT JOIN transcripts tr ON tt.transcript_id = tr.id
      GROUP BY t.id, t.name
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching topic analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/participants
router.get('/analytics/participants', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.name,
        p.email,
        COUNT(tp.transcript_id) as meeting_count,
        ARRAY_AGG(DISTINCT tr.title) as meetings
      FROM participants p
      LEFT JOIN transcript_participants tp ON p.id = tp.participant_id
      LEFT JOIN transcripts tr ON tp.transcript_id = tr.id
      GROUP BY p.id, p.name, p.email
      ORDER BY meeting_count DESC
    `);

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching participant analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/sentiment-trend
router.get('/analytics/sentiment-trend', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        DATE(occurred_at) as date,
        AVG(
          CASE 
            WHEN sentiment = 'positive' THEN 1
            WHEN sentiment = 'neutral' THEN 0
            WHEN sentiment = 'negative' THEN -1
            ELSE 0
          END
        ) as avg_sentiment,
        COUNT(*) as meeting_count
      FROM transcripts
      GROUP BY DATE(occurred_at)
      ORDER BY date ASC
    `);

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching sentiment trend:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
