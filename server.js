const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require('dotenv').config();

// Initialize Groq client with API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
app.use(cors()); // Enable CORS to allow requests from your React app
app.use(express.json());

// API endpoint for fetching Groq responses
app.post("/api/groq", async (req, res) => {
  const { query } = req.body;

  try {
    // Custom prompt to ensure responses are focused on dental topics
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a highly specialized dental expert. Provide concise and accurate information on dental context asked. Avoid mentioning that you are an AI or a bot, and answer in a professional tone, go direct to the answer of what you have been asked.",
        },
        {
          role: "user",
          content: query, // User's query
        },
      ],
      model: "mixtral-8x7b-32768", // Example model
    });

    // Extract AI response
    const aiResponse = chatCompletion.choices[0]?.message?.content || "No content found.";
    res.json({ aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
