import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transcriptApi, Transcript } from '../api/api';

const TranscriptList: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterParticipant, setFilterParticipant] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterParticipant) filters.participant = filterParticipant;
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;
      
      const data = await transcriptApi.getAll(Object.keys(filters).length > 0 ? filters : undefined);
      setTranscripts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadTranscripts();
  };

  const handleClearFilters = () => {
    setFilterParticipant('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterTopic('');
    // Reload without filters
    transcriptApi.getAll().then(setTranscripts).catch(console.error);
  };

  // Apply topic filter on client side (already loaded transcripts)
  const filteredTranscripts = filterTopic
    ? transcripts.filter((t) =>
        t.topics?.some((topic) =>
          topic.toLowerCase().includes(filterTopic.toLowerCase())
        )
      )
    : transcripts;

  const allTopics = Array.from(
    new Set(transcripts.flatMap((t) => t.topics || []))
  ).sort();

  const allParticipants = Array.from(
    new Set(transcripts.flatMap((t) => t.participants?.map(p => p.email) || []))
  ).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading transcripts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={loadTranscripts}
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Meeting Transcripts</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all meeting transcripts with extracted insights.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Topic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">All Topics</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Participant Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participant
            </label>
            <select
              value={filterParticipant}
              onChange={(e) => setFilterParticipant(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">All Participants</option>
              {allParticipants.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Transcripts List */}
      <div className="mt-8 flow-root">
        {filteredTranscripts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No transcripts found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTranscripts.map((transcript) => (
              <Link
                key={transcript.transcript_id}
                to={`/transcript/${transcript.transcript_id}`}
                className="block bg-white shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {transcript.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(transcript.occurred_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {transcript.duration_minutes} minutes
                      </p>
                    </div>
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    {transcript.topics?.slice(0, 5).map((topic, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                    {transcript.topics?.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{transcript.topics.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">{transcript.participants?.length}</span>{' '}
                    participant{transcript.participants?.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptList;

