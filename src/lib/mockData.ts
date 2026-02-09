import type { DeepfakeAnalysisResult, FinanceExtractionResult } from "./apiClient";

// Mock results for deepfake analysis
export const getMockDeepfakeResult = (
  type: "image" | "video" | "audio"
): DeepfakeAnalysisResult => {
  const baseResult: DeepfakeAnalysisResult = {
    score: Math.floor(Math.random() * 100),
    riskLevel: "low",
    signals: [],
  };

  // Determine risk level based on score
  if (baseResult.score < 30) {
    baseResult.riskLevel = "low";
  } else if (baseResult.score < 70) {
    baseResult.riskLevel = "medium";
  } else {
    baseResult.riskLevel = "high";
  }

  // Add signals based on type
  if (type === "image") {
    baseResult.signals = [
      {
        type: "face_manipulation",
        confidence: 0.85,
        description: "Artifacts détectés autour des contours du visage",
      },
      {
        type: "lighting_inconsistency",
        confidence: 0.72,
        description: "Incohérence d'éclairage entre le visage et l'arrière-plan",
      },
      {
        type: "eye_reflection",
        confidence: 0.68,
        description: "Réflexions oculaires anormales",
      },
    ];
  } else if (type === "video") {
    baseResult.signals = [
      {
        type: "temporal_inconsistency",
        confidence: 0.91,
        description: "Incohérences temporelles entre les frames",
      },
      {
        type: "lip_sync",
        confidence: 0.78,
        description: "Désynchronisation lèvres/audio",
      },
      {
        type: "blink_pattern",
        confidence: 0.65,
        description: "Pattern de clignement anormal",
      },
    ];
    baseResult.metadata = {
      duration: 15.5,
      fps: 30,
      codec: "H.264",
    };
  } else {
    baseResult.signals = [
      {
        type: "voice_spoofing",
        confidence: 0.88,
        description: "Signaux de synthèse vocale détectés",
      },
      {
        type: "spectral_anomaly",
        confidence: 0.74,
        description: "Anomalies spectrales dans les hautes fréquences",
      },
      {
        type: "breathing_pattern",
        confidence: 0.59,
        description: "Pattern respiratoire irrégulier",
      },
    ];
  }

  return baseResult;
};

// Mock results for finance document analysis
export const getMockFinanceResult = (docType?: string): FinanceExtractionResult => {
  const types = ["invoice", "statement", "contract", "kyc"];
  const detectedType = docType || types[Math.floor(Math.random() * types.length)];

  const baseResult: FinanceExtractionResult = {
    documentType: detectedType,
    fields: [],
    redFlags: [],
    compliance: {
      kyc: false,
      signature: false,
      stamp: false,
    },
  };

  if (detectedType === "invoice") {
    baseResult.fields = [
      { name: "Numéro", value: "FAC-2024-001234", confidence: 0.98 },
      { name: "Date", value: "2024-01-15", confidence: 0.95 },
      { name: "Fournisseur", value: "Tech Solutions SA", confidence: 0.92 },
      { name: "Montant HT", value: "1,250.00 €", confidence: 0.97 },
      { name: "TVA", value: "250.00 €", confidence: 0.96 },
      { name: "Montant TTC", value: "1,500.00 €", confidence: 0.98 },
      { name: "IBAN", value: "FR76 3000 1000 0100 0000 0000 000", confidence: 0.89 },
    ];
    baseResult.redFlags = [
      {
        type: "date_mismatch",
        severity: "medium",
        description: "Date de facture antérieure à la date de commande",
      },
    ];
    baseResult.compliance = { kyc: true, signature: true, stamp: false };
  } else if (detectedType === "statement") {
    baseResult.fields = [
      { name: "Banque", value: "Banque Nationale", confidence: 0.99 },
      { name: "Numéro compte", value: "**** **** **** 1234", confidence: 0.97 },
      { name: "Période", value: "01/01/2024 - 31/01/2024", confidence: 0.95 },
      { name: "Solde initial", value: "5,230.50 €", confidence: 0.96 },
      { name: "Solde final", value: "4,890.25 €", confidence: 0.96 },
    ];
    baseResult.redFlags = [];
    baseResult.compliance = { kyc: true, signature: false, stamp: true };
  } else if (detectedType === "contract") {
    baseResult.fields = [
      { name: "Type", value: "Contrat de prestation", confidence: 0.94 },
      { name: "Date début", value: "2024-02-01", confidence: 0.93 },
      { name: "Date fin", value: "2025-01-31", confidence: 0.92 },
      { name: "Montant", value: "50,000.00 €", confidence: 0.91 },
      { name: "Parties", value: "2 signataires", confidence: 0.88 },
    ];
    baseResult.redFlags = [
      {
        type: "missing_signature",
        severity: "high",
        description: "Signature du second partie manquante",
      },
    ];
    baseResult.compliance = { kyc: true, signature: false, stamp: true };
  } else {
    baseResult.fields = [
      { name: "Nom", value: "Jean Dupont", confidence: 0.97 },
      { name: "Date naissance", value: "15/03/1985", confidence: 0.95 },
      { name: "Nationalité", value: "Française", confidence: 0.96 },
      { name: "ID", value: "ID123456789", confidence: 0.94 },
    ];
    baseResult.redFlags = [];
    baseResult.compliance = { kyc: true, signature: true, stamp: true };
  }

  return baseResult;
};

// Simulate API delay
export const simulateDelay = (ms: number = 1500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock chart data for dashboard
export const getMockChartData = () => {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return days.map((day) => ({
    name: day,
    deepfake: Math.floor(Math.random() * 20),
    finance: Math.floor(Math.random() * 15),
    risk: Math.floor(Math.random() * 10),
  }));
};

// Mock stats for dashboard
export const getMockStats = () => ({
  scansToday: Math.floor(Math.random() * 50) + 10,
  highRisk: Math.floor(Math.random() * 10) + 1,
  financeAlerts: Math.floor(Math.random() * 8) + 1,
  totalAnalyses: Math.floor(Math.random() * 500) + 100,
});
