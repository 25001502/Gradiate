import * as functions from "firebase-functions";
import fetch from "node-fetch";
import { defineString } from "firebase-functions/params";

const geminiApiKey = defineString("GEMINI_API_KEY");

async function generateAIResponse(prompt) {
  const apiKey = geminiApiKey.value();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();
  return data;
}

export const askGemini = functions.https.onRequest(async (req, res) => {
  try {
    if (!req.body || !req.body.prompt) {
      throw new Error("Missing 'prompt' in request body");
    }

    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt);

    // Replace this with your AI call
    const aiResponse = await generateAIResponse(prompt); // or whatever your function calls

    console.log("AI Response:", aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in askGemini:", error);
    res.status(500).json({ error: error.message });
  }
});

