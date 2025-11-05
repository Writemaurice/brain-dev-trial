import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { transcriptApi, SearchResult } from '../api/api';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await transcriptApi.search(query);
      setResults(data);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Semantic Search</h1>
        <p className="mt-2 text-sm text-gray-700">
          Search transcripts using natural language. Powered by AI embeddings.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for topics, decisions, or discussions..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {results.length > 0
              ? `Found ${results.length} relevant transcript${results.length !== 1 ? 's' : ''}`
              : 'No results found'}
          </h2>

          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={result.transcript_id}
                to={`/transcript/${result.transcript_id}`}
                className="block bg-white shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {result.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          {Math.round(result.similarity_score * 100)}% match
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(result.occurred_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        • {result.duration_minutes} minutes
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.sentiment === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : result.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {result.sentiment}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.topics?.slice(0, 5).map((topic, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {result.transcript_text && (
                    <div className="mt-3 text-sm text-gray-600 line-clamp-3">
                      {result.transcript_text.substring(0, 300)}...
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;

