'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
  const [videoMetadata, setVideoMetadata] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSummary('');
    setClassification('');
    setError('');
    setVideoMetadata(null);

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
      setVideoMetadata(data.videoMetadata);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center">
        {/* Hero Section */}
        <section id="home" className="w-full bg-gradient-to-b from-red-950/20 to-transparent pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                WatchLess<span className="text-red-500">.app</span>
              </h1>
              <p className="text-xl font-medium text-gray-300 max-w-2xl mx-auto">
                Watch less, learn more.
              </p>
            </div>
          </div>
        </section>

        {/* Main Input Section - Optimized for fast loading */}
        <section className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <form onSubmit={handleSubmit} className="group">
            <div className="flex gap-4">
              <input
                type="url"
                name="youtubeUrl"
                id="youtubeUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Summarize'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="w-full mt-8 p-4 bg-red-950/50 text-red-200 border border-red-900 rounded-md animate-in fade-in duration-300">
              <p><span className="font-bold">Error:</span> {error}</p>
            </div>
          )}

          {!isLoading && summary && (
            <div className="w-full mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {videoMetadata && (
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <img 
                      src={videoMetadata.thumbnail} 
                      alt=""
                      className="w-24 h-24 object-cover rounded shadow-md"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <a 
                        href={videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-white hover:text-red-400 transition-colors line-clamp-2"
                      >
                        {videoMetadata.title}
                      </a>
                      <p className="text-gray-400 text-sm mt-1 truncate">By {videoMetadata.author}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg backdrop-blur-sm">
                <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">Content Type</h2>
                <p className="text-2xl font-bold text-red-400">{classification}</p>
              </div>
              
              <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg backdrop-blur-sm">
                <div 
                  className="prose prose-invert prose-red max-w-none text-gray-300 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(summary) }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Features Section - Optimized */}
        <section id="features" className="w-full bg-gray-900/30 py-24 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Smart Summaries',
                  description: 'AI-powered extraction of key information'
                },
                {
                  title: 'Content Detection',
                  description: 'Automatic video content classification'
                },
                {
                  title: 'Time Saver',
                  description: 'Get summaries in seconds, not hours'
                }
              ].map((feature, index) => (
                <div key={index} className="group p-6 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-red-900/50 transition-colors">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-red-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Optimized */}
        <section id="how-it-works" className="w-full py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                {
                  step: '1',
                  title: 'Paste URL',
                  description: 'Copy and paste any YouTube video URL'
                },
                {
                  step: '2',
                  title: 'Process',
                  description: 'Our AI analyzes the video content'
                },
                {
                  step: '3',
                  title: 'Get Summary',
                  description: 'Receive a structured, easy-to-read summary'
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}