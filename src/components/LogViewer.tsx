"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface HistoryItem {
  time: string;
  event: string;
}

interface ApiResponse {
  numbers: number[];
  req: string;
  history: HistoryItem[];
}

const LogViewer: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [sortField, setSortField] = useState<'time' | 'event'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('http://localhost:3001/api/logs/Yi1jLWQ');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const sortedHistory = data?.history.sort((a, b) => {
    if (sortField === 'time') {
      return sortDirection === 'asc' 
        ? new Date(a.time).getTime() - new Date(b.time).getTime()
        : new Date(b.time).getTime() - new Date(a.time).getTime();
    } else {
      return sortDirection === 'asc'
        ? a.event.localeCompare(b.event)
        : b.event.localeCompare(a.event);
    }
  });

  const paginatedHistory = sortedHistory?.slice(currentPage * 10, (currentPage + 1) * 10);

  const handleSort = (field: 'time' | 'event') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleNext = () => {
    if (data && (currentPage + 1) * 10 < data.history.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Log Viewer</h1>
      <div className="mb-4">
        <button
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handleSort('time')}
        >
          Sort by Time {sortField === 'time' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handleSort('event')}
        >
          Sort by Event {sortField === 'event' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Time</th>
            <th className="border border-gray-300 p-2">Event</th>
          </tr>
        </thead>
        <tbody>
          {paginatedHistory?.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{item.time}</td>
              <td className="border border-gray-300 p-2">{item.event}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleNext}
          disabled={(currentPage + 1) * 10 >= (data.history.length || 0)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LogViewer;