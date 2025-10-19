'use client'; // This directive is necessary for using hooks like useState

import { useState } from 'react';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSummary('');
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
          YouTube Video Summarizer
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Paste a YouTube video URL below to get a quick summary of its key points using AI.
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
              {isLoading ? 'Summarizing...' : 'Get Summary'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="w-full max-w-2xl mt-8 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-md">
          <p><span className="font-bold">Error:</span> {error}</p>
        </div>
      )}

      {summary && (
        <div className="w-full max-w-2xl mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Summary</h2>
          <div 
            className="prose prose-invert text-gray-300 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}
          />
        </div>
      )}
    </main>
  );
}