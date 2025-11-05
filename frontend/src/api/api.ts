import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Transcript {
  id: string;
  transcript_id: string;
  title: string;
  occurred_at: string;
  duration_minutes: number;
  sentiment: string;
  summary?: string;
  key_insights?: string[];
  participants: Array<{ name: string; email: string; role: string }>;
  topics: string[];
  transcript?: string;
  transcript_text?: string;
  action_items?: string[];
  decisions?: string[];
  created_at?: string;
}

export interface SearchResult extends Transcript {
  similarity_score: number;
}

export interface TopicAnalytics {
  topic: string;
  count: number;
  transcript_titles: string[];
}

export interface ParticipantAnalytics {
  name: string;
  email: string;
  meeting_count: number;
  meetings: string[];
}

export interface SentimentTrend {
  date: string;
  avg_sentiment: number;
  meeting_count: number;
}

export interface TranscriptFilters {
  participant?: string;
  startDate?: string;
  endDate?: string;
}

export const transcriptApi = {
  getAll: async (filters?: TranscriptFilters): Promise<Transcript[]> => {
    const params = new URLSearchParams();
    if (filters?.participant) params.append('participant', filters.participant);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/transcripts?${queryString}` : '/transcripts';
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string): Promise<Transcript> => {
    const response = await api.get(`/transcripts/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data.results;
  },

  getTopicAnalytics: async (): Promise<TopicAnalytics[]> => {
    const response = await api.get('/analytics/topics');
    return response.data;
  },

  getParticipantAnalytics: async (): Promise<ParticipantAnalytics[]> => {
    const response = await api.get('/analytics/participants');
    return response.data;
  },

  getSentimentTrend: async (): Promise<SentimentTrend[]> => {
    const response = await api.get('/analytics/sentiment-trend');
    return response.data;
  },
};

export default api;

