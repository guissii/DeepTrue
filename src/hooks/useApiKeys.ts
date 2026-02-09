import { useLocalStorage } from "./useLocalStorage";
import { DEEPFAKE_API_KEY, FINANCE_API_KEY, OCR_API_KEY, GEMINI_API_KEY } from "@/config/env";

interface ApiKeys {
  deepfake: string;
  finance: string;
  ocr: string;
  gemini: string;
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>("deeptrust_api_keys", {
    deepfake: DEEPFAKE_API_KEY,
    finance: FINANCE_API_KEY,
    ocr: OCR_API_KEY,
    gemini: GEMINI_API_KEY,
  });

  const setApiKey = (key: keyof ApiKeys, value: string) => {
    setApiKeys((prev) => ({ ...prev, [key]: value }));
  };

  const getApiKey = (key: keyof ApiKeys) => {
    return apiKeys[key];
  };

  const hasApiKey = (key: keyof ApiKeys) => {
    return apiKeys[key].length > 0;
  };

  const clearApiKey = (key: keyof ApiKeys) => {
    setApiKeys((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllApiKeys = () => {
    setApiKeys({
      deepfake: DEEPFAKE_API_KEY,
      finance: FINANCE_API_KEY,
      ocr: OCR_API_KEY,
      gemini: GEMINI_API_KEY,
    });
  };

  return {
    apiKeys,
    setApiKey,
    getApiKey,
    hasApiKey,
    clearApiKey,
    clearAllApiKeys,
  };
}
