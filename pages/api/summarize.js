import YouTube from 'youtubei.js';
import Groq from 'groq-sdk';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Add this new function for description extraction
async function getVideoDescription(videoId) {
  try {
    const command = `yt-dlp --skip-download --get-description https://www.youtube.com/watch?v=${videoId}`;
    const { stdout } = await execPromise(command);
    return stdout.trim();
  } catch (error) {
    console.error('Error getting video description:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    // Fetch video metadata using oEmbed
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const oembedResponse = await fetch(oembedUrl);
    const videoMetadata = await oembedResponse.json();

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL provided.' });
    }

    // Step 1: Get the transcript
    const transcriptText = await getTranscriptWithYoutubei(videoId);
    if (!transcriptText) {
      return res.status(400).json({ error: 'Could not fetch transcript for this video.' });
    }

    // Step 2: Classify the transcript text using Prompt 1
    const classification = await classifyContent(transcriptText);

    // Step 3: Generate the formatted summary using Prompt 2
    const summary = await formatSummary(classification, transcriptText);

    // Add description fetching
    const description = await getVideoDescription(videoId);

    // Step 4: Send all results to the frontend
    res.status(200).json({ 
      classification, 
      summary,
      videoMetadata: {
        title: videoMetadata.title,
        author: videoMetadata.author_name,
        thumbnail: videoMetadata.thumbnail_url,
        description: description || 'No description available'
      },
      videoUrl 
    });

  } catch (error) {
    console.error('Error in handler:', error.message);
    res.status(500).json({ error: 'Failed to process video. Please check the server logs.' });
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const matches = url.match(regex);
  return matches ? matches[1] : null;
}

async function getTranscriptWithYoutubei(videoId) {
  // This function remains the same as it's working correctly.
  console.log(`Fetching transcript for video ID ${videoId} using youtubei.js...`);
  try {
    const youtube = await YouTube.create();
    const video = await youtube.getInfo(videoId);
    const transcriptData = await video.getTranscript();
    const segments = transcriptData?.transcript?.content?.body?.initial_segments;
    if (segments && Array.isArray(segments) && segments.length > 0) {
      const fullText = segments.map(segment => segment.snippet.text).join(' ');
      console.log('Successfully parsed and joined transcript segments.');
      return fullText;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Detailed error from youtubei.js: ${error.message}`);
    return null;
  }
}

// LLM Call 1: Content Classifier
async function classifyContent(text) {
  console.log('Classifying content with Prompt 1...');
  const prompt = `You are a YouTube video content classifier.
Analyze the given video transcript or description and classify it into ONE category only.
Classification categories:
1. Recipe / Cooking
2. Tutorial / How-to
3. Lecture / Educational
4. Miscellaneous
Classification rules:
- Choose "Recipe / Cooking" if the content includes cooking instructions, ingredients, meal preparation, baking, or food-related demonstrations.
- Choose "Tutorial / How-to" if the content provides step-by-step instructions for completing a task, learning a skill, or building something (DIY, software, crafts, fitness routines, etc.).
- Choose "Lecture / Educational" if the content is academic, educational explanation, study material, course content, or knowledge-based teaching.
- Choose "Miscellaneous" for all other content types (reviews, vlogs, entertainment, news, music, etc.).
Output format:
Return ONLY the category name in this exact format: <category name>
Input text:
${text}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens: 30,
    });
    const result = chatCompletion.choices[0]?.message?.content.trim() || 'Miscellaneous';
    console.log(`Classification result: ${result}`);
    return result;
  } catch (error) {
    console.error('Error classifying text:', error.message);
    return 'Miscellaneous';
  }
}

// LLM Call 2: Content Summarizer and Formatter
async function formatSummary(category, text) {
  console.log(`Formatting summary for category: ${category}`);
  // We remove the detailed instructions from the prompt sent to the API to save tokens
  const prompt = `You are an expert content summarizer and formatter.
Based on the content category provided, create a beautifully formatted summary with emojis and clear structure.
**Category received:** ${category}
**Input content:** ${text}
---
## FORMATTING INSTRUCTIONS BY CATEGORY:
[Your detailed instructions here...]
---
Now generate the formatted summary:`;
  
  // NOTE: For brevity in the code, the full prompt2 instructions are assumed.
  // The actual prompt sent to the API will contain your full formatting rules.

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt2(category, text) }], // Using a helper for the full prompt
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 2048,
    });
    const result = chatCompletion.choices[0]?.message?.content || 'Could not generate summary.';
    console.log('Successfully generated formatted summary.');
    return result;
  } catch (error) {
    console.error('Error formatting summary:', error.message);
    return 'Error: Could not generate a formatted summary.';
  }
}

// Helper function to build the large second prompt
function prompt2(category, text) {
  return `You are an expert content summarizer and formatter.
Based on the content category provided, create a beautifully formatted summary with emojis and clear structure.
**Category received:** ${category}
**Input content:** ${text}
---
## FORMATTING INSTRUCTIONS BY CATEGORY:
### IF Category = "Recipe / Cooking":
Format the output as follows:
🍳 **Recipe Summary**

**📋 Ingredients:**
- [Ingredient 1] - [amount/quantity]
- [Ingredient 2] - [amount/quantity]

**🔪 Required Tools/Equipment:**
- [Tool 1]
- [Tool 2]

**👨‍🍳 Cooking Steps:**
1. [First step with clear instructions]
2. [Second step with clear instructions]

⏱️ **Total Time:** [Prep time + Cook time]
🔥 **Difficulty Level:** [Easy/Medium/Hard]
💡 **Pro Tips:** [Any helpful tips mentioned]

---
### IF Category = "Tutorial / How-to":
Format the output as follows:
🎯 **Tutorial Summary**

**🛠️ What You'll Need:**
- [Tool/Material 1]
- [Tool/Material 2]

**📝 Prerequisites:**
- [Required knowledge/skills]

**✅ Step-by-Step Instructions:**
1. **[Step title]**: [Clear detailed instruction]
2. **[Step title]**: [Clear detailed instruction]

⏱️ **Estimated Time:** [Time to complete]
🎯 **Difficulty Level:** [Beginner/Intermediate/Advanced]
⚠️ **Common Mistakes to Avoid:** [If mentioned]
💡 **Pro Tips:** [Helpful shortcuts or tricks]

---
### IF Category = "Lecture / Educational":
Format the output as follows:
📚 **Lecture Notes Summary**

**🎓 Main Topic:** [Topic title]

**🔑 Key Concepts:**
• **[Concept 1]**: [Brief explanation]
• **[Concept 2]**: [Brief explanation]

**📖 Detailed Breakdown:**
**Section 1: [Topic name]**
- [Important point 1]
- [Important point 2]
**Section 2: [Topic name]**
- [Important point 1]
- [Important point 2]

**💡 Key Takeaways:**
✓ [Main learning point 1]
✓ [Main learning point 2]

**❓ Study Questions:**
1. [Question to test understanding]
2. [Question to test understanding]

**📌 Important Terms/Definitions:**
- **[Term 1]**: [Definition]
- **[Term 2]**: [Definition]

---
### IF Category = "Miscellaneous":
Format the output as follows:
📺 **Video Summary**

**🎯 Main Topic:** [What the video is about]

**📝 Key Points:**
• [Point 1]
• [Point 2]
• [Point 3]

**⏱️ Video Length:** [Duration if known]

**💡 Quick Takeaway:** [One-sentence summary of main message]

---
**IMPORTANT FORMATTING RULES:**
- Use emojis consistently
- Use bold text (**text**) for emphasis and headers
- Use numbered lists for sequential steps
- Use bullet points (•, ✓) for non-sequential information
- Extract ONLY information present in the content - do not add assumptions
- If information is missing (like time, difficulty), omit that section

Now generate the formatted summary:`;
}