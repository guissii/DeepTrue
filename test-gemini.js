import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGemini() {
  try {
    // 1. Read .env.local
    const envPath = path.resolve(__dirname, ".env.local");
    if (!fs.existsSync(envPath)) {
      console.error("❌ .env.local file not found!");
      return;
    }

    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
    
    if (!match || !match[1]) {
      console.error("❌ VITE_GEMINI_API_KEY not found in .env.local");
      return;
    }

    const apiKey = match[1].trim();
    console.log(`🔑 Found API Key: ${apiKey.substring(0, 10)}...`);

    // 2. Direct Fetch to List Models
    console.log("📋 Listing available models via raw fetch...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(text);
        return;
    }

    const data = await response.json();
    console.log("✅ Models available:");
    if (data.models) {
        data.models.forEach(m => {
            if (m.name.includes("gemini")) {
                console.log(` - ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
            }
        });
    } else {
        console.log("No models found.");
    }

  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to Gemini");
    console.error(error);
  }
}

testGemini();
