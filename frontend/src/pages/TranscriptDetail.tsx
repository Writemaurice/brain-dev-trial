import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transcriptApi, Transcript } from '../api/api';

const TranscriptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTranscript(id);
    }
  }, [id]);

  const loadTranscript = async (transcriptId: string) => {
    try {
      setLoading(true);
      const data = await transcriptApi.getById(transcriptId);
      setTranscript(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading transcript...</div>
      </div>
    );
  }

  if (error || !transcript) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Transcript not found'}</p>
        <Link to="/" className="mt-2 text-blue-600 underline hover:text-blue-800">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        ← Back to list
      </Link>

      <div className="mt-4 bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{transcript.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>
              {new Date(transcript.occurred_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>•</span>
            <span>{transcript.duration_minutes} minutes</span>
            <span>•</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transcript.sentiment === 'positive'
                  ? 'bg-green-100 text-green-800'
                  : transcript.sentiment === 'negative'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {transcript.sentiment}
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Summary */}
          {transcript.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">📝 Summary</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">{transcript.summary}</p>
              </div>
            </div>
          )}

          {/* Key Insights */}
          {transcript.key_insights && transcript.key_insights.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">💡 Key Insights</h2>
              <div className="space-y-3">
                {transcript.key_insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <span className="text-yellow-600 font-semibold text-lg mt-0.5">{idx + 1}.</span>
                    <p className="text-gray-700 flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Participants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transcript.participants?.map((participant, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {participant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{participant.name}</div>
                    <div className="text-sm text-gray-500">{participant.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Topics</h2>
            <div className="flex flex-wrap gap-2">
              {transcript.topics?.map((topic, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Action Items */}
          {transcript.action_items && transcript.action_items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Action Items</h2>
              <ul className="space-y-2">
                {transcript.action_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Decisions */}
          {transcript.decisions && transcript.decisions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Decisions</h2>
              <ul className="space-y-2">
                {transcript.decisions.map((decision, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">→</span>
                    <span className="text-gray-700">{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Transcript */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Full Transcript</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {transcript.transcript || transcript.transcript_text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptDetail;

