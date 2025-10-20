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
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSummary('');
    setClassification('');
    setVideoMetadata(null);
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
      <main className="flex min-h-screen flex-col items-center bg-[#0F0F0F]">
        {/* Hero Section */}
        <section id="home" className="w-full bg-gradient-to-b from-[#FF0000]/10 to-transparent pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6 relative">
                <span className="text-[#FF0000]">YouTube</span> Smart Summarizer
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FF0000]"></div>
              </h1>
              <p className="mt-8 text-xl leading-8 text-gray-300 max-w-2xl mx-auto">
                Transform lengthy YouTube videos into concise, intelligent summaries powered by AI.
              </p>
            </div>
          </div>
        </section>

        {/* Main Input Section */}
        <section className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <form onSubmit={handleSubmit} className="transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex gap-4">
              <input
                type="url"
                name="youtubeUrl"
                id="youtubeUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white/10 p-3 text-white shadow-lg ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#FF0000] sm:text-sm transition-all duration-300"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-[#FF0000] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#FF0000]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF0000] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </span>
                ) : 'Generate Summary'}
              </button>
            </div>
          </form>

          {/* Video Information Card */}
          {!isLoading && summary && (
            <div className="w-full max-w-2xl mt-8 space-y-6 transform hover:scale-[1.01] transition-transform duration-300">
              {videoMetadata && (
                <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
                  <h2 className="text-sm font-semibold uppercase text-[#FF0000] mb-4">Video Information</h2>
                  <div className="flex items-start space-x-4">
                    <img 
                      src={videoMetadata.thumbnail} 
                      alt={videoMetadata.title}
                      className="w-32 h-auto rounded-lg shadow-lg"
                    />
                    <div>
                      <a 
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-white hover:text-[#FF0000] transition-colors line-clamp-2"
                      >
                        {videoMetadata.title}
                      </a>
                      <p className="text-gray-400 text-sm mt-2">By {videoMetadata.author}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Type and Summary */}
              <div className="space-y-6">
                <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
                  <h2 className="text-sm font-semibold uppercase text-[#FF0000] mb-2">Content Type</h2>
                  <p className="text-2xl font-bold text-white">{classification}</p>
                </div>
                
                <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
                  <div 
                    className="prose prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(summary) }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-black/30 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-16 relative inline-block">
              Features
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#FF0000]"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI-Powered Summaries',
                  description: 'Advanced AI algorithms extract key information from videos'
                },
                {
                  title: 'Content Classification',
                  description: 'Automatically detect and classify video content type'
                },
                {
                  title: 'Quick Results',
                  description: 'Get comprehensive summaries in seconds'
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
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
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
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