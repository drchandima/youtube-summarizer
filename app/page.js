'use client';

import { useState } from 'react';

// Helper function to convert simple markdown to HTML
const formatMarkdownToHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\n/g, '<br />');                       // Newlines
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [classification, setClassification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSummary('');
    setClassification('');
    setError('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred.');
      }

      setClassification(data.classification);
      setSummary(data.summary);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="z-10 w-full max-w-2xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          YouTube Smart Summarizer
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Paste a YouTube URL to get a perfectly formatted, structured summary based on its content.
        </p>
      </div>

      <div className="w-full max-w-2xl mt-12">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <input
              type="url"
              name="youtubeUrl"
              id="youtubeUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? 'Summarizing...' : 'Generate Summary'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="w-full max-w-2xl mt-8 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-md">
          <p><span className="font-bold">Error:</span> {error}</p>
        </div>
      )}

      {!isLoading && summary && (
        <div className="w-full max-w-2xl mt-8">
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg mb-6">
            <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">Detected Content Type</h2>
            <p className="text-2xl font-bold text-indigo-400">{classification}</p>
          </div>
          
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
            <div 
              className="prose prose-invert text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(summary) }}
            />
          </div>
        </div>
      )}
    </main>
  );
}