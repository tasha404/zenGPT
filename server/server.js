import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // 🧠 Call OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are zenGPT, a calm and helpful AI assistant."
        },
        ...messages
      ],
    });

    // ✅ Safe extraction
    const aiMessage = response.choices?.[0]?.message?.content;

    res.json({
      reply: {
        role: "assistant",
        content: aiMessage || "No response from AI"
      }
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);

    res.status(500).json({
      reply: {
        role: "assistant",
        content: "⚠️ Server error. Check backend."
      }
    });
  }
});

// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});