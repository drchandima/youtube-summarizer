const axios = require('axios');

// --- IMPORTANT ---
// Paste your TranscriptAPI key here directly for this test.
const TRANSCRIPT_API_KEY = "sk_0z9wk0ejradE8oHdmDN2R7VBBMaJ5ZzOlWNAtj00wYQ";
// ---

const videoId = '4ON-nY7oNXk'; // A video ID for testing
const apiUrl = 'https://api.transcriptapi.com/v1/transcript';

async function runTest() {
  console.log(`Attempting to connect to ${apiUrl} with video ID ${videoId}...`);

  try {
    const response = await axios.post(apiUrl, 
      {
        video_id: videoId,
        wait: true
      }, 
      {
        headers: {
          'Authorization': `Bearer ${TRANSCRIPT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        // Add a timeout to prevent it from hanging indefinitely
        timeout: 15000 // 15 seconds
      }
    );

    console.log("--- SUCCESS! ---");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.log("------------------");

  } catch (error) {
    console.error("--- TEST FAILED ---");
    if (error.response) {
      console.error("Error Data:", error.response.data);
      console.error("Error Status:", error.response.status);
    } else if (error.request) {
      console.error("No response received. This is a network or DNS issue.");
      console.error("Error Code:", error.code); // This is very important
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error("-------------------");
  }
}

runTest();