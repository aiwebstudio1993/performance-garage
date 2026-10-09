/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { generateVehicleFromRegistration, MOCK_DIAGNOSTIC_SYMPTOMS } from "./src/mockData";

dotenv.config();

// Lazily initialize Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Vehicle Lookup API
  app.get("/api/vehicle-lookup", (req, res) => {
    const reg = req.query.reg;
    if (!reg || typeof reg !== "string") {
      return res.status(400).json({ error: "Registration is required" });
    }
    try {
      const vehicle = generateVehicleFromRegistration(reg);
      return res.json(vehicle);
    } catch (error) {
      console.error("Vehicle lookup failed", error);
      return res.status(500).json({ error: "Failed to perform vehicle lookup" });
    }
  });

  // 2. AI Diagnostics API with graceful fallback if no key
  app.post("/api/ai-diagnostics", async (req, res) => {
    const { symptom, vehicle } = req.body;
    if (!symptom || typeof symptom !== "string" || symptom.trim() === "") {
      return res.status(400).json({ error: "Symptom description is required" });
    }

    const ai = getGeminiClient();
    
    // Fallback dictionary matching keywords
    const lowerSymptom = symptom.toLowerCase();
    let fallbackCategory = "brakes"; // default fallback

    if (lowerSymptom.includes("brake") || lowerSymptom.includes("squeak") || lowerSymptom.includes("noise") || lowerSymptom.includes("grind") || lowerSymptom.includes("stop")) {
      fallbackCategory = "brakes";
    } else if (lowerSymptom.includes("rattle") || lowerSymptom.includes("clunk") || lowerSymptom.includes("bump") || lowerSymptom.includes("pothole") || lowerSymptom.includes("suspension")) {
      fallbackCategory = "rattle";
    } else if (lowerSymptom.includes("smoke") || lowerSymptom.includes("exhaust") || lowerSymptom.includes("blue") || lowerSymptom.includes("emission") || lowerSymptom.includes("carbon")) {
      fallbackCategory = "smoke";
    } else if (lowerSymptom.includes("steer") || lowerSymptom.includes("pull") || lowerSymptom.includes("left") || lowerSymptom.includes("right") || lowerSymptom.includes("alignment") || lowerSymptom.includes("tracking")) {
      fallbackCategory = "steering";
    } else if (lowerSymptom.includes("battery") || lowerSymptom.includes("start") || lowerSymptom.includes("crank") || lowerSymptom.includes("dead") || lowerSymptom.includes("power") || lowerSymptom.includes("light")) {
      fallbackCategory = "battery";
    }

    const fallbackResult = MOCK_DIAGNOSTIC_SYMPTOMS[fallbackCategory];

    if (!ai) {
      // Return beautiful fallback mock response if no Gemini API Key is configured
      console.log("No GEMINI_API_KEY found, responding with smart rule-based fallback diagnostics.");
      return res.json({
        ...fallbackResult,
        isFallback: true
      });
    }

    try {
      const vehicleInfo = vehicle 
        ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.engineSize} ${vehicle.fuelType}, Mileage: ${Math.round(vehicle.currentMileage)} miles)`
        : "Unknown vehicle";

      const systemPrompt = "You are an expert, highly friendly automotive mechanic diagnostic AI. Analyse the symptoms and output structured car diagnostics.";

      const userPrompt = `A customer has described the following symptom: "${symptom}"
Vehicle Details: ${vehicleInfo}

Please diagnose the issue and return a structured JSON response matching the following schema.
The fields must contain:
1. "issue": (string) Short title of the most likely diagnosis.
2. "explanation": (string) Reassuring, friendly, non-jargon explanation of what is happening. Keep it under 100 words.
3. "severity": (string) "safe", "moderate", or "dangerous".
4. "estimatedCost": (string) Plausible cost range in GBP (e.g. "£90 - £180").
5. "recommendedService": (string) Recommended service. Must be one of: "Interim Service", "Full Service", "Major Service", "MOT", or "Diagnostic Check".
6. "checklistItemsToInspect": (array of strings) 3 to 4 specific multi-point items from a standard checklist to look at during the workshop service.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              issue: { type: Type.STRING, description: "Most likely diagnosis title" },
              explanation: { type: Type.STRING, description: "Friendly, reassuring explanation" },
              severity: { type: Type.STRING, description: "One of 'safe', 'moderate', 'dangerous'" },
              estimatedCost: { type: Type.STRING, description: "Estimated repair price range (GBP)" },
              recommendedService: { type: Type.STRING, description: "Must be: Interim Service, Full Service, Major Service, MOT, or Diagnostic Check" },
              checklistItemsToInspect: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 3-4 parts or items to inspect"
              }
            },
            required: ["issue", "explanation", "severity", "estimatedCost", "recommendedService", "checklistItemsToInspect"]
          }
        }
      });

      const textOutput = response.text;
      if (textOutput) {
        const result = JSON.parse(textOutput.trim());
        return res.json({
          ...result,
          isFallback: false
        });
      } else {
        throw new Error("Empty text response from Gemini API");
      }
    } catch (err) {
      console.error("Gemini API call failed, falling back to rule-based diagnostics.", err);
      return res.json({
        ...fallbackResult,
        isFallback: true
      });
    }
  });

  // 3. Mock Booking Confirmation API
  app.post("/api/book", (req, res) => {
    const bookingData = req.body;
    if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.services || bookingData.services.length === 0) {
      return res.status(400).json({ error: "Incomplete booking details provided" });
    }
    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);
    const confirmedBooking = {
      ...bookingData,
      id: bookingId,
      status: "Booked",
      progressPercent: 0,
      statusNotes: "Booking received and confirmed in the garage booking registry.",
      createdAt: new Date().toISOString()
    };
    return res.json(confirmedBooking);
  });

  // Serve static assets or use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Car Servicing & Garage Server running on http://localhost:${PORT}`);
  });
}

startServer();
