import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedEntities {
  topics: string[];
  action_items: string[];
  decisions: string[];
  sentiment: string;
}

export async function extractEntities(transcript: string): Promise<ExtractedEntities> {
  try {
    const prompt = `Analyze the following meeting transcript and extract:
1. Main topics discussed (3-7 key themes)
2. Action items (specific tasks assigned with who should do them)
3. Key decisions made
4. Overall sentiment (positive, neutral, or negative)

Transcript:
${transcript}

Return your response in the following JSON format:
{
  "topics": ["topic1", "topic2", ...],
  "action_items": ["action1", "action2", ...],
  "decisions": ["decision1", "decision2", ...],
  "sentiment": "positive/neutral/negative"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in analyzing meeting transcripts. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const extracted = JSON.parse(content);
    
    return {
      topics: extracted.topics || [],
      action_items: extracted.action_items || [],
      decisions: extracted.decisions || [],
      sentiment: extracted.sentiment || 'neutral',
    };
  } catch (error) {
    console.error('Error extracting entities:', error);
    throw error;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const prompt = `Summarize the following meeting transcript in 2-3 concise sentences. Focus on the main purpose of the meeting and key outcomes.

Transcript:
${transcript}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in summarizing meeting transcripts concisely and accurately.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return content.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

export async function generateKeyInsights(transcript: string): Promise<string[]> {
  try {
    const prompt = `Analyze the following meeting transcript and generate 3-5 key insights. These should be strategic observations, important patterns, or critical takeaways that provide value beyond surface-level information.

Transcript:
${transcript}

Return your response as a JSON array of strings:
{
  "insights": ["insight1", "insight2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in analyzing meetings and extracting strategic insights. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    return parsed.insights || [];
  } catch (error) {
    console.error('Error generating key insights:', error);
    throw error;
  }
}

