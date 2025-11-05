import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

// GET /api/transcripts?participant=email&startDate=2025-01-01&endDate=2025-12-31
router.get('/transcripts', async (req: Request, res: Response) => {
  try {
    const participantFilter = req.query.participant as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (participantFilter) {
      conditions.push(`p.email = $${paramIndex} OR p.name ILIKE $${paramIndex + 1}`);
      params.push(participantFilter, `%${participantFilter}%`);
      paramIndex += 2;
    }

    if (startDate) {
      conditions.push(`t.occurred_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`t.occurred_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT 
        t.id,
        t.transcript_id,
        t.title,
        t.occurred_at,
        t.duration_minutes,
        t.sentiment,
        t.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('name', p.name, 'email', p.email, 'role', tp.role)
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
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.occurred_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transcripts/:id - Get specific transcript
router.get('/transcripts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get transcript details
    const transcriptResult = await query(
      `SELECT * FROM transcripts WHERE transcript_id = $1`,
      [id]
    );

    if (transcriptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    const transcript = transcriptResult.rows[0];

    // Get participants
    const participantsResult = await query(
      `SELECT p.name, p.email, tp.role
       FROM participants p
       JOIN transcript_participants tp ON p.id = tp.participant_id
       WHERE tp.transcript_id = $1`,
      [transcript.id]
    );

    // Get topics
    const topicsResult = await query(
      `SELECT t.name
       FROM topics t
       JOIN transcript_topics tt ON t.id = tt.topic_id
       WHERE tt.transcript_id = $1`,
      [transcript.id]
    );

    // Get action items
    const actionItemsResult = await query(
      `SELECT description FROM action_items WHERE transcript_id = $1`,
      [transcript.id]
    );

    // Get decisions
    const decisionsResult = await query(
      `SELECT description FROM decisions WHERE transcript_id = $1`,
      [transcript.id]
    );

    res.json({
      id: transcript.transcript_id,
      title: transcript.title,
      occurred_at: transcript.occurred_at,
      duration_minutes: transcript.duration_minutes,
      transcript: transcript.transcript_text,
      metadata: transcript.metadata,
      sentiment: transcript.sentiment,
      summary: transcript.summary,
      key_insights: transcript.key_insights,
      participants: participantsResult.rows,
      topics: topicsResult.rows.map((r) => r.name),
      action_items: actionItemsResult.rows.map((r) => r.description),
      decisions: decisionsResult.rows.map((r) => r.description),
      created_at: transcript.created_at,
    });
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

