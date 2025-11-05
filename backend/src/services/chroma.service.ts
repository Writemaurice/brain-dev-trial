import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

const chromaHost = process.env.CHROMA_HOST || 'localhost';
const chromaPort = parseInt(process.env.CHROMA_PORT || '8000');

const client = new ChromaClient({
  path: `http://${chromaHost}:${chromaPort}`,
});

const COLLECTION_NAME = 'transcript_embeddings';

export async function initializeChroma() {
  try {
    // Try to get existing collection or create new one
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
    });
    console.log('✅ Chroma collection initialized');
    return collection;
  } catch (error) {
    console.error('Error initializing Chroma:', error);
    throw error;
  }
}

export async function addEmbedding(
  transcriptId: string,
  embedding: number[],
  text: string,
  metadata: Record<string, any>
) {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
    });

    await collection.add({
      ids: [transcriptId],
      embeddings: [embedding],
      documents: [text],
      metadatas: [metadata],
    });

    console.log(`Added embedding for transcript: ${transcriptId}`);
  } catch (error) {
    console.error('Error adding embedding to Chroma:', error);
    throw error;
  }
}


