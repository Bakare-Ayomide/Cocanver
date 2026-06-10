import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limits for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for Google GenAI client to avoid crash if API key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure your API key in the AI Studio Secrets panel.");
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

// 1. Multimodal AI Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, mimeType } = req.body;

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

    // Image data part
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
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Scan Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during AI analysis." });
  }
});

// Configure Vite or Serve Static build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development middleware mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    // Production static mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled production build from /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Canvas2Code server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
