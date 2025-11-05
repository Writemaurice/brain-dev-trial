import { z } from 'zod';

export const ParticipantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().optional(),
});

export const IngestRequestSchema = z.object({
  transcript_id: z.string().min(1),
  title: z.string().min(1),
  occurred_at: z.string().datetime(),
  duration_minutes: z.number().positive(),
  participants: z.array(ParticipantSchema).min(1),
  transcript: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export type IngestRequest = z.infer<typeof IngestRequestSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;

