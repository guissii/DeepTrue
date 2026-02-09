// Configuration des API et environnement
// TODO: Ajoutez vos clés API dans le fichier .env.local

export const DEEPFAKE_API_KEY = import.meta.env.VITE_DEEPFAKE_API_KEY || "";
export const DEEPFAKE_API_ENDPOINT = import.meta.env.VITE_DEEPFAKE_API_ENDPOINT || "https://api.example.com/deepfake";

export const FINANCE_API_KEY = import.meta.env.VITE_FINANCE_API_KEY || "";
export const FINANCE_API_ENDPOINT = import.meta.env.VITE_FINANCE_API_ENDPOINT || "https://api.example.com/finance";

export const OCR_API_KEY = import.meta.env.VITE_OCR_API_KEY || "";
export const OCR_API_ENDPOINT = import.meta.env.VITE_OCR_API_ENDPOINT || "https://api.example.com/ocr";

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Mode demo - active les données mock si true
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Validation des clés API
export const hasDeepfakeApiKey = () => DEEPFAKE_API_KEY.length > 0;
export const hasFinanceApiKey = () => FINANCE_API_KEY.length > 0;
export const hasOcrApiKey = () => OCR_API_KEY.length > 0;
