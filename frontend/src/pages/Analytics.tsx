import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { transcriptApi, TopicAnalytics, ParticipantAnalytics, SentimentTrend } from '../api/api';

const Analytics: React.FC = () => {
  const [topicData, setTopicData] = useState<TopicAnalytics[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantAnalytics[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [topics, participants, sentiment] = await Promise.all([
        transcriptApi.getTopicAnalytics(),
        transcriptApi.getParticipantAnalytics(),
        transcriptApi.getSentimentTrend(),
      ]);
      setTopicData(topics);
      setParticipantData(participants);
      setSentimentTrend(sentiment);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  // Prepare chart data (top 10 topics)
  const chartData = topicData
    .slice(0, 10)
    .map((item) => ({
      name: item.topic,
      displayName: item.topic.length > 25 ? item.topic.substring(0, 25) + '...' : item.topic,
      fullName: item.topic,
      count: item.count,
    }));

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of topics and participant engagement across all meetings.
        </p>
      </div>

      {/* Top Topics Chart */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Topics</h2>
          <span className="text-sm text-gray-500">Meeting Count</span>
        </div>
        {topicData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 70, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayName" 
                angle={-45} 
                textAnchor="end" 
                height={120}
                interval={0}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                label={{ value: 'Meeting Count', angle: -90, position: 'left', offset: 10, style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Meetings']}
                labelFormatter={(label: string) => {
                  const item = chartData.find(d => d.displayName === label);
                  return item?.fullName || label;
                }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Bar 
                dataKey="count" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No topic data available</p>
        )}
      </div>

      {/* Topic Details Table */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Topics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meetings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topicData.length > 0 ? (
                topicData.map((topic, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {topic.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {topic.transcript_titles?.join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No topics found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Activity Table */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Participant Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meetings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting Titles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantData.length > 0 ? (
                participantData.map((participant, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {participant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.meeting_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {participant.meetings?.join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No participants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sentiment Trend Over Time */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend Over Time</h2>
        {sentimentTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Date', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                domain={[-1, 1]}
                ticks={[-1, -0.5, 0, 0.5, 1]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Average Sentiment', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(2), 'Avg Sentiment']}
                labelFormatter={(label: string) => `Date: ${label}`}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_sentiment" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No sentiment data available</p>
        )}
        <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Positive (1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Neutral (0.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Negative (-1.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

