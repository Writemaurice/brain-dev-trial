import { Router, Request, Response } from 'express';
import { IngestRequestSchema } from '../types/schemas';
import { extractEntities, generateEmbedding, generateSummary, generateKeyInsights } from '../services/openai.service';
import { addEmbedding } from '../services/chroma.service';
import { query } from '../database/db';

const router = Router();

router.post('/ingest', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = IngestRequestSchema.parse(req.body);

    // Extract entities using OpenAI
    console.log('Extracting entities from transcript...');
    const extracted = await extractEntities(validatedData.transcript);

    // Generate summary
    console.log('Generating summary...');
    const summary = await generateSummary(validatedData.transcript);

    // Generate key insights
    console.log('Generating key insights...');
    const keyInsights = await generateKeyInsights(validatedData.transcript);

    // Insert transcript
    const transcriptResult = await query(
      `INSERT INTO transcripts (transcript_id, title, occurred_at, duration_minutes, transcript_text, metadata, sentiment, summary, key_insights)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        validatedData.transcript_id,
        validatedData.title,
        validatedData.occurred_at,
        validatedData.duration_minutes,
        validatedData.transcript,
        JSON.stringify(validatedData.metadata || {}),
        extracted.sentiment,
        summary,
        keyInsights,
      ]
    );

    const transcriptDbId = transcriptResult.rows[0].id;

    // Insert or get participants and link them
    for (const participant of validatedData.participants) {
      // Insert participant (or ignore if exists)
      const participantResult = await query(
        `INSERT INTO participants (name, email)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET name = $1
         RETURNING id`,
        [participant.name, participant.email]
      );

      const participantId = participantResult.rows[0].id;

      // Link participant to transcript
      await query(
        `INSERT INTO transcript_participants (transcript_id, participant_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [transcriptDbId, participantId, participant.role || 'participant']
      );
    }

    // Insert topics
    for (const topicName of extracted.topics) {
      // Insert topic (or ignore if exists)
      const topicResult = await query(
        `INSERT INTO topics (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = $1
         RETURNING id`,
        [topicName]
      );

      const topicId = topicResult.rows[0].id;

      // Link topic to transcript
      await query(
        `INSERT INTO transcript_topics (transcript_id, topic_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [transcriptDbId, topicId]
      );
    }

    // Insert action items
    for (const actionItem of extracted.action_items) {
      await query(
        `INSERT INTO action_items (transcript_id, description)
         VALUES ($1, $2)`,
        [transcriptDbId, actionItem]
      );
    }

    // Insert decisions
    for (const decision of extracted.decisions) {
      await query(
        `INSERT INTO decisions (transcript_id, description)
         VALUES ($1, $2)`,
        [transcriptDbId, decision]
      );
    }

    // Generate and store embedding for semantic search
    console.log('Generating embedding for semantic search...');
    const embedding = await generateEmbedding(validatedData.transcript);
    await addEmbedding(
      validatedData.transcript_id,
      embedding,
      validatedData.transcript,
      {
        title: validatedData.title,
        occurred_at: validatedData.occurred_at,
        db_id: transcriptDbId,
      }
    );

    // Return response
    res.status(201).json({
      id: validatedData.transcript_id,
      status: 'processed',
      extracted: {
        topics: extracted.topics,
        action_items: extracted.action_items,
        decisions: extracted.decisions,
        sentiment: extracted.sentiment,
        summary: summary,
        key_insights: keyInsights,
      },
    });
  } catch (error: any) {
    console.error('Error in /ingest:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

export default router;

