import express from "express";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const modelEndpoint =
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";
    
    const response = await fetch(modelEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = response.headers.get("content-type");

    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return res.status(400).json({ error: errorData.error || "API error" });
    }

    // Convert image response to Base64
    const buffer = await response.arrayBuffer();
    const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;

    res.status(200).json({ image: base64Image });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
