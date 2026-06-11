import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not defined. Please add it to your environment secrets in Vercel." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = 
      "Analyze this user interface screenshot or drawing. Identify all interactive regions, forms, input fields, labels, headers, and clickable elements. " +
      "For each element, define its bounding box as percentage-based coordinates relative to the full image: x (left position percent, 0-100), y (top position percent, 0-100), " +
      "width (percent, 0-100), height (percent, 0-100). Keep them moderately accurate. " +
      "Predict a camelCase 'id' and determine the most appropriate element 'type' from this exact list: " +
      "'Text Input', 'Email Input', 'Password Input', 'Phone Input', 'Number Input', 'Text Area', 'Dropdown', 'Checkbox', 'Radio Button', 'Button', 'Image', 'Label', 'Link', 'Container'. " +
      "Provide a friendly textual 'label' to display inside or next to the interactive widget.";

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: image.split(",")[1] || image,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during AI analysis." });
  }
}
