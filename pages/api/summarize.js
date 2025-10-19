import { YoutubeTranscript } from 'youtube-transcript';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    // 1. Fetch transcript from YouTube
    const transcriptText = await fetchTranscript(videoUrl);

    if (!transcriptText) {
      return res.status(400).json({ error: 'Could not fetch transcript for this video. It may be private, have transcripts disabled, or be a live stream.' });
    }

    // 2. Summarize the transcript using Groq API
    const summary = await summarizeText(transcriptText);
    
    // 3. Send the summary back to the frontend
    res.status(200).json({ summary });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to summarize video. Please check the server logs.' });
  }
}

async function fetchTranscript(videoUrl) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    // Join the transcript text objects into a single string
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    return null;
  }
}

async function summarizeText(text) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert summarizer. Your job is to take the provided text and return a concise summary of its key points in a bulleted list format.',
      },
      {
        role: 'user',
        content: `Please summarize the following text into a clear, bulleted list of the most important takeaways:\n\n"${text}"`,
      },
    ],
    model: 'llama3-8b-8192', // A fast and capable model
    temperature: 0.3,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  return chatCompletion.choices[0]?.message?.content || 'No summary could be generated.';
}