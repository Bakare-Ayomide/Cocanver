import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure your API key in the Vercel context.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Support CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { image, mimeType } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const ai = getAiClient();
    const prompt = 
      "Analyze this user interface screenshot or drawing. Identify all interactive regions, forms, input fields, labels, headers, and clickable elements. " +
      "For each element, define its bounding box as percentage-based coordinates relative to the full image: x (left position percent, 0-100), y (top position percent, 0-100), " +
      "width (percent, 0-100), height (percent, 0-100). Keep them moderately accurate. " +
      "Predict a clean camelCase 'id' and determine the most appropriate element 'type' from this exact list: " +
      "'Text Input', 'Email Input', 'Password Input', 'Phone Input', 'Number Input', 'Text Area', 'Dropdown', 'Checkbox', 'Radio Button', 'Button', 'Image', 'Label', 'Link', 'Container'. " +
      "Provide a friendly textual 'label' to display inside or next to the interactive widget.";

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: image.split(",")[1] || image, // strip data:image/... base64 prefix if present
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        imagePart,
        { text: prompt }
      ],
      config: {
        systemInstruction: "You are an expert design systems engineer and computer vision model. Your role is to segment screenshots of user interfaces and classify every interactive element with high spatial precision and accurate element mapping.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            elements: {
              type: Type.ARRAY,
              description: "List of identified interactive UI regions and components",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Select from 'Text Input', 'Email Input', 'Password Input', 'Phone Input', 'Number Input', 'Text Area', 'Dropdown', 'Checkbox', 'Radio Button', 'Button', 'Image', 'Label', 'Link', 'Container'",
                  },
                  label: {
                    type: Type.STRING,
                    description: "User friendly display text or generic placeholder (e.g., 'Enter email', 'Submit')",
                  },
                  id: {
                    type: Type.STRING,
                    description: "A unique camelCase selector ID (e.g., 'emailField', 'signUpBtn')",
                  },
                  x: {
                    type: Type.NUMBER,
                    description: "Percentage left relative coordinate of bounding box, value 0 to 100",
                  },
                  y: {
                    type: Type.NUMBER,
                    description: "Percentage top relative coordinate of bounding box, value 0 to 100",
                  },
                  width: {
                    type: Type.NUMBER,
                    description: "Percentage width relative size of bounding box, value 0 to 100",
                  },
                  height: {
                    type: Type.NUMBER,
                    description: "Percentage height relative size of bounding box, value 0 to 100",
                  },
                },
                required: ["type", "label", "id", "x", "y", "width", "height"],
              },
            },
          },
          required: ["elements"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Set headers and respond
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error("Gemini Vercel Scan Error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during Vercel AI analysis." });
  }
}
