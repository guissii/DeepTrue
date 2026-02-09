import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { saveAnalysisHistory, getAnalysisHistory } from "@/lib/apiClient";
import { toast } from "sonner";

export interface AnalysisItem {
  id: string;
  type: "image" | "video" | "audio" | "finance";
  subtype?: string;
  filename: string;
  date: string;
  score?: number;
  riskLevel?: "low" | "medium" | "high";
  status: "completed" | "failed" | "processing";
  result?: any;
}

export function useAnalysisHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [token]);

  const loadHistory = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getAnalysisHistory(token);
      // Backend: { id, userId, type, fileName, result, timestamp }
      const formattedHistory: AnalysisItem[] = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        filename: item.fileName,
        date: item.timestamp,
        score: item.result?.score,
        riskLevel: item.result?.riskLevel || "low",
        status: "completed",
        result: item.result,
        subtype: item.result?.documentType || "unknown"
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAnalysis = async (item: Omit<AnalysisItem, "id" | "date">) => {
    const tempId = `temp_${Date.now()}`;
    const newItem: AnalysisItem = {
      ...item,
      id: tempId,
      date: new Date().toISOString(),
    };
    
    // Optimistic update
    setHistory((prev) => [newItem, ...prev]);

    if (token) {
      try {
        await saveAnalysisHistory(item.type, item.result, item.filename, token);
        // Silent reload to sync IDs
        loadHistory(); 
      } catch (error) {
        console.error("Failed to save analysis to backend", error);
        toast.error("Erreur lors de la sauvegarde de l'analyse");
      }
    }
    return tempId;
  };

  const updateAnalysis = (id: string, updates: Partial<AnalysisItem>) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeAnalysis = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    // TODO: Implement delete API endpoint if needed
  };

  const clearHistory = () => {
    setHistory([]);
    // TODO: Implement clear API endpoint if needed
  };

  const getAnalysisById = (id: string) => {
    return history.find((item) => item.id === id);
  };

  const getRecentAnalyses = (limit = 10) => {
    return history.slice(0, limit);
  };

  const getAnalysesByType = (type: AnalysisItem["type"]) => {
    return history.filter((item) => item.type === type);
  };

  const getHighRiskCount = () => {
    return history.filter((item) => item.riskLevel === "high").length;
  };

  const getTodayCount = () => {
    const today = new Date().toDateString();
    return history.filter((item) => new Date(item.date).toDateString() === today).length;
  };

  return {
    history,
    isLoading,
    addAnalysis,
    updateAnalysis,
    removeAnalysis,
    clearHistory,
    getAnalysisById,
    getRecentAnalyses,
    getAnalysesByType,
    getHighRiskCount,
    getTodayCount,
  };
}
