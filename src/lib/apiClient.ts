import {
  DEEPFAKE_API_KEY,
  DEEPFAKE_API_ENDPOINT,
  FINANCE_API_KEY,
  FINANCE_API_ENDPOINT,
  OCR_API_KEY,
  OCR_API_ENDPOINT,
} from "@/config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Types pour les réponses API
export interface DeepfakeAnalysisResult {
  score: number;
  riskLevel: "low" | "medium" | "high";
  signals: Array<{
    type: string;
    confidence: number;
    description: string;
  }>;
  metadata?: {
    duration?: number;
    fps?: number;
    codec?: string;
  };
}

export interface FinanceExtractionResult {
  documentType: string;
  fields: Array<{
    name: string;
    value: string;
    confidence: number;
  }>;
  redFlags: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
  compliance: {
    kyc: boolean;
    signature: boolean;
    stamp: boolean;
  };
}

// Client API pour Deepfake
export const analyzeDeepfake = async (
  file: File,
  type: "image" | "video" | "audio",
  sensitivity: "low" | "medium" | "high",
  apiKey?: string
): Promise<DeepfakeAnalysisResult> => {
  // TODO: Remplacez cet endpoint par votre fournisseur de détection deepfake
  const endpoint = `${DEEPFAKE_API_ENDPOINT}/${type}`;
  const effectiveKey = apiKey || DEEPFAKE_API_KEY;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("sensitivity", sensitivity);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Deepfake analysis failed:", error);
    throw error;
  }
};

// Client API pour Gemini
export const analyzeWithGemini = async (
  file: File,
  type: "image" | "video" | "audio",
  apiKey: string
): Promise<DeepfakeAnalysisResult> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-flash-latest as it is the standard free tier model
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });


    let promptType = type as string;
    if (type === 'audio' && file.type.startsWith('video/')) {
       promptType = "video's audio track";
    }

    const prompt = `Analyze this ${promptType} for signs of deepfake manipulation or AI generation. 
    Provide a JSON response with the following structure:
    {
      "score": number (0-100, where 100 is definitely deepfake),
      "riskLevel": "low" | "medium" | "high",
      "signals": [
        {
          "type": "string",
          "confidence": number (0-1),
          "description": "string"
        }
      ]
    }
    Only return the JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};

// Client API pour Finance OCR avec Gemini
export const analyzeFinanceWithGemini = async (
  file: File,
  docType: string,
  apiKey: string
): Promise<FinanceExtractionResult> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const prompt = `Analyze this ${docType} document. Extract key information and identify any red flags or anomalies.
    
    For "invoices", extract: Invoice Number, Date, Total Amount, Vendor Name.
    For "contracts" or "kyc", extract: Name, ID Number, Date of Birth, Expiry Date.
    For "checks", extract: Check Number, Amount, Payer, Date.
    
    Provide a JSON response with the following structure:
    {
      "documentType": "${docType}",
      "fields": [
        { "name": "Field Name", "value": "Extracted Value", "confidence": number (0-1) }
      ],
      "redFlags": [
        { "type": "string", "severity": "low" | "medium" | "high", "description": "string" }
      ],
      "compliance": {
        "kyc": boolean (true if ID/person details present),
        "signature": boolean (true if signature found),
        "stamp": boolean (true if official stamp found)
      }
    }
    Only return the JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini finance analysis failed:", error);
    throw error;
  }
};

export const generateFinanceAuditReport = async (
  data: FinanceExtractionResult,
  docType: string,
  apiKey: string
): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Based on the following extracted financial data from a ${docType}, write a professional, formal audit note (in French).
    
    Data:
    ${JSON.stringify(data, null, 2)}
    
    The audit note should include:
    1. A header with "NOTE D'AUDIT - DEEPTRUST FINANCE".
    2. A summary of the document (Executive Summary).
    3. A detailed review of the extracted fields and their validity.
    4. A dedicated section for "Red Flags" and "Compliance Checks" (mentioning any passed/failed checks).
    5. A final conclusion/recommendation (Approve, Reject, or Review Needed).
    
    Format the output as plain text with clear section headers. Use professional auditor language.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini audit report generation failed:", error);
    throw error;
  }
};

// Client API pour Finance OCR
export const analyzeFinanceDocument = async (
  file: File,
  apiKey?: string
): Promise<FinanceExtractionResult> => {
  // TODO: Remplacez cet endpoint par votre fournisseur OCR
  const endpoint = `${OCR_API_ENDPOINT}/extract`;
  const effectiveKey = apiKey || OCR_API_KEY;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Finance document analysis failed:", error);
    throw error;
  }
};

// Client API pour validation finance
export const validateFinanceData = async (
  data: FinanceExtractionResult
): Promise<FinanceExtractionResult> => {
  // TODO: Remplacez cet endpoint par votre API de validation
  const endpoint = `${FINANCE_API_ENDPOINT}/validate`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FINANCE_API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Finance validation failed:", error);
    throw error;
  }
};

// Authentication & Backend API
const API_BASE_URL = "http://localhost:3000/api";

export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return await response.json();
};

export const registerUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Registration failed");
  return await response.json();
};

export const saveAnalysisHistory = async (type: string, result: any, fileName: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, result, fileName }),
  });
  if (!response.ok) throw new Error("Failed to save history");
  return await response.json();
};

export const getAnalysisHistory = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch history");
  return await response.json();
};

export const getDashboardStats = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch stats");
  return await response.json();
};

export const testApiConnection = async (
  apiType: "deepfake" | "finance" | "ocr" | "gemini",
  apiKey?: string
): Promise<{ success: boolean; message: string }> => {
  if (apiType === "gemini") {
    if (!apiKey) return { success: false, message: "Clé API manquante" };
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      await model.generateContent("Hello");
      return { success: true, message: "Connexion Gemini réussie" };
    } catch (error: any) {
      return { success: false, message: `Erreur: ${error.message || "Clé invalide"}` };
    }
  }

  // Pour les autres API, on teste les endpoints de santé du backend
  const endpoint = `${API_BASE_URL}/${apiType}/health`;
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      return { success: true, message: `Connexion ${apiType} réussie` };
    } else {
      return { success: false, message: `Erreur serveur: ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, message: `Erreur de connexion: ${error.message}` };
  }
};
