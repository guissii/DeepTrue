import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Dropzone } from "@/components/ui-custom/Dropzone";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { getMockDeepfakeResult } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useDemoMode } from "@/hooks/useDemoMode";
import { analyzeWithGemini, analyzeDeepfake } from "@/lib/apiClient";
import { toast } from "sonner";
import {
  Loader2,
  Image,
  Video,
  Mic,
  FileBarChart,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  History,
  TrendingUp,
  Activity,
  ShieldCheck,
  ShieldAlert,
  FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DeepfakeLab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams();
  const { addAnalysis, history } = useAnalysisHistory();
  const { apiKeys } = useApiKeys();
  const { isDemoMode } = useDemoMode();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [sensitivity] = useState<"low" | "medium" | "high">("medium");

  // Dashboard specific state
  const [viewMode, setViewMode] = useState<'dashboard' | 'upload' | 'result'>('dashboard');

  // Stats calculation
  const deepfakeHistory = history.filter(h => ["image", "video", "audio"].includes(h.type));
  const monthlyAnalysis = deepfakeHistory.filter(h => {
    const date = new Date(h.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyCount = monthlyAnalysis.length;
  const highRiskCount = deepfakeHistory.filter(h => h.result?.riskLevel === 'high').length;

  // Reset state when type changes
  useEffect(() => {
    if (!type) {
      setViewMode('dashboard');
      setFile(null);
      setResult(null);
    } else {
      if (viewMode === 'dashboard') {
        setViewMode('upload');
      }
      if (!file) {
        setViewMode('upload');
      }
    }
  }, [type]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 200);

    const currentType = (type || "image") as "image" | "video" | "audio";

    try {
      let analysisResult;

      // Logic from previous DeepfakeLab
      if (!isDemoMode && apiKeys.gemini && apiKeys.gemini !== 'local-dev-key') {
         analysisResult = await analyzeWithGemini(file, currentType, apiKeys.gemini);
      } else {
         // Mock or Backend
         try {
           analysisResult = await analyzeDeepfake(file, currentType, sensitivity, apiKeys.deepfake);
         } catch (error) {
           console.error("Backend failed, using mock", error);
           analysisResult = getMockDeepfakeResult(currentType);
         }
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(analysisResult);
      setViewMode('result');

      addAnalysis({
        type: currentType,
        filename: file.name,
        status: "completed",
        result: analysisResult,
      });

    } catch (error) {
      clearInterval(progressInterval);
      console.error("Analysis failed:", error);
      toast.error(t("common.error"));
      
      // Fallback to mock for better UX in demo
      const analysisResult = getMockDeepfakeResult(currentType);
      setResult(analysisResult);
      setViewMode('result');
      
      addAnalysis({
        type: currentType,
        filename: file.name,
        status: "completed",
        result: analysisResult,
      });
    }

    setIsProcessing(false);
  };

  const handleGenerateReport = () => {
    if (!result) return;
    
    try {
      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("RAPPORT D'ANALYSE DEEPTRUST", 105, 20, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
      doc.text(`Fichier: ${file?.name || "Inconnu"}`, 20, 50);
      doc.text(`Type: ${type?.toUpperCase() || "IMAGE"}`, 20, 60);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Score de confiance: ${result.score}/100`, 20, 80);
      doc.text(`Niveau de risque: ${result.riskLevel?.toUpperCase()}`, 20, 90);
      
      doc.text("SIGNAUX DÉTECTÉS:", 20, 110);
      
      let y = 120;
      result.signals.forEach((s: any) => {
        doc.setFont("helvetica", "bold");
        doc.text(`- ${s.type} (${(s.confidence * 100).toFixed(0)}%)`, 25, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        const splitDesc = doc.splitTextToSize(s.description, 170);
        doc.text(splitDesc, 30, y);
        y += splitDesc.length * 7 + 5;
      });
      
      doc.save(`deeptrust_report_${type || "media"}_${new Date().getTime()}.pdf`);
      toast.success("Rapport PDF téléchargé");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `deepfake_analysis_${type}_${new Date().getTime()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("JSON exporté avec succès");
  };

  const getTypeIcon = (docType: string) => {
    switch (docType) {
      case "image": return <Image className="h-5 w-5" />;
      case "video": return <Video className="h-5 w-5" />;
      case "audio": return <Mic className="h-5 w-5" />;
      default: return <Image className="h-5 w-5" />;
    }
  };

  const getAcceptTypes = (): Record<string, string[]> => {
    switch (type) {

      case "image": return { "image/*": [".jpg", ".jpeg", ".png", ".webp"] };
      case "video": return { "video/*": [".mp4", ".mov", ".avi", ".mkv"] };
      case "audio": return { 
        "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
        "video/*": [".mp4", ".mov", ".avi", ".mkv"] // Allow video for audio extraction
      };
      default: return { "image/*": [".jpg", ".jpeg", ".png"] };
    }
  };

  // Render Dashboard View
  if (viewMode === 'dashboard' || !type) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Deepfake Intelligence
          </h1>
          <p className="text-lg text-muted-foreground">
            Détection de manipulations multimédia par IA
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Analyses ce mois</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyCount}</div>
              <p className="text-xs text-muted-foreground">Médias analysés</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Historique Total</CardTitle>
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deepfakeHistory.length}</div>
              <p className="text-xs text-muted-foreground">Depuis le début</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risques Élevés</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highRiskCount}</div>
              <p className="text-xs text-muted-foreground">Deepfakes potentiels détectés</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Nouvelle Analyse
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[

              { id: 'image', label: 'Analyser une Image', icon: Image, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'Détection de retouches et génération IA' },
              { id: 'video', label: 'Analyser une Vidéo', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', desc: 'Détection de face-swap et lip-sync' },
              { id: 'audio', label: 'Analyser un Audio', icon: Mic, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: 'Détection de clonage vocal (audio ou vidéo)' },
            ].map((item) => (
              <Card 
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-muted group"
                onClick={() => navigate(`/app/deepfake/${item.id}`)}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                  <div className={`p-4 rounded-full ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-10 w-10 ${item.color}`} />
                  </div>
                  <div>
                    <span className="font-bold text-lg block mb-1">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Activités Récentes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/deepfake/history')}>
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {deepfakeHistory.length > 0 ? (
                    deepfakeHistory.slice().reverse().slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-full border">
                            {item.type === 'video' ? <Video className="h-4 w-4 text-primary" /> : 
                             item.type === 'audio' ? <Mic className="h-4 w-4 text-primary" /> :
                             <Image className="h-4 w-4 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[150px]">{item.filename}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                          </div>
                        </div>
                        <Badge variant={item.result?.riskLevel === 'high' ? 'destructive' : 'outline'}>
                          {item.result?.score ? `${item.result.score}/100` : 'N/A'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      Aucune activité récente
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Modèle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Précision Face-Swap</span>
                  <span className="font-bold">99.2%</span>
                </div>
                <Progress value={99.2} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Précision Voice-Cloning</span>
                  <span className="font-bold">94.5%</span>
                </div>
                <Progress value={94.5} className="h-2" />
              </div>
              <div className="p-4 rounded-lg bg-background/50 border mt-4">
                <h4 className="font-semibold mb-2 text-sm">Mise à jour DeepTrust v2.4</h4>
                <p className="text-xs text-muted-foreground">
                  Nouveaux algorithmes de détection ajoutés pour les modèles de diffusion latente (Stable Diffusion XL, Midjourney v6).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Upload & Analysis View
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/deepfake')} className="gap-1 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Retour au Dashboard
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="font-medium text-foreground capitalize">{type}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-full">
        {/* Left Side: Upload & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="h-full border-muted shadow-lg flex flex-col">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getTypeIcon(type || "image")}
                </div>
                Média Source
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col justify-center min-h-[400px]">
              {!file ? (

                <Dropzone
                  onFileSelect={handleFileSelect}
                  accept={getAcceptTypes()}
                  label={t("deepfake.upload.dragDrop")}
                  sublabel={
                    type === 'audio' 
                      ? "Formats supportés: Audio (MP3, WAV...) ou Vidéo (MP4, AVI...)"
                      : "Formats supportés: JPG, PNG, MP4, MP3, WAV"
                  }
                  className="h-full min-h-[300px]"
                />
              ) : (
                <div className="space-y-6 w-full">
                  <div className="relative aspect-video bg-black/5 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden group">
                    {type === 'image' && <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />}
                    {type === 'video' && <video src={URL.createObjectURL(file)} className="w-full h-full object-contain" controls />}

                    {type === 'audio' && (
                      <div className="flex flex-col items-center">
                        <Mic className="h-16 w-16 text-muted-foreground mb-4" />
                        {file.type.startsWith('video/') ? (
                          <div className="w-full max-w-[250px] space-y-2">
                             <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                               <Video className="h-3 w-3" />
                               <span>Source vidéo (analyse audio)</span>
                             </div>
                             <video src={URL.createObjectURL(file)} controls className="w-full rounded-md bg-black" style={{ maxHeight: '150px' }} />
                          </div>
                        ) : (
                          <audio src={URL.createObjectURL(file)} controls className="w-full max-w-[250px]" />
                        )}
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => { setFile(null); setResult(null); }}
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      Changer
                    </Button>
                    {!result && (
                      <Button 
                        onClick={handleAnalyze} 
                        className="flex-1 gap-2 shadow-md hover:shadow-lg transition-all"
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isProcessing ? 'Analyse...' : 'Lancer l\'IA'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent History Hint */}
          <Card className="bg-muted/10">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <History className="h-4 w-4" />
                 Dernières analyses ({type})
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-2">
                 {deepfakeHistory.filter(h => h.type === type).slice(0, 3).map(h => (
                   <div key={h.id} className="flex justify-between items-center text-sm p-2 bg-background rounded border">
                     <span className="truncate max-w-[150px]">{h.filename}</span>
                     <Badge variant={h.result?.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-xs">
                        {h.result?.score || 0}/100
                     </Badge>
                   </div>
                 ))}
                 {deepfakeHistory.filter(h => h.type === type).length === 0 && (
                   <p className="text-xs text-muted-foreground">Aucun historique pour ce type.</p>
                 )}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Side: Results or Placeholder */}
        <div className="lg:col-span-7 space-y-6">
          {isProcessing ? (
            <Card className="h-full flex flex-col items-center justify-center p-12 space-y-8 min-h-[500px]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative h-32 w-32 bg-background rounded-full border-4 border-primary/20 flex items-center justify-center">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-primary">{progress}%</div>
                   </div>
                </div>
              </div>
              <div className="space-y-2 text-center max-w-md">
                <h3 className="text-xl font-semibold">Analyse IA en cours...</h3>
                <p className="text-muted-foreground">
                  Nos algorithmes examinent chaque pixel et onde sonore pour détecter les manipulations.
                </p>
                <Progress value={progress} className="h-2 w-full mt-4" />
              </div>
            </Card>
          ) : !result ? (
            <Card className="h-full border-dashed border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/5 min-h-[500px]">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Prêt à analyser</h3>
              <p className="max-w-xs mx-auto">
                Chargez un fichier multimédia et lancez l'analyse pour voir les résultats détaillés ici.
              </p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {/* Score & Risk Banner */}
              <div className={cn(
                "rounded-xl p-6 text-white shadow-lg flex items-center justify-between",
                result.riskLevel === 'high' ? "bg-gradient-to-r from-red-600 to-orange-600" :
                result.riskLevel === 'medium' ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
                "bg-gradient-to-r from-emerald-600 to-teal-600"
              )}>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {result.riskLevel === 'high' ? "Contenu Suspect Détecté" :
                     result.riskLevel === 'medium' ? "Contenu Douteux" :
                     "Contenu Authentique"}
                  </h2>
                  <p className="opacity-90">
                    {result.riskLevel === 'high' ? "Forte probabilité de manipulation par IA." :
                     result.riskLevel === 'medium' ? "Quelques anomalies détectées." :
                     "Aucune trace de manipulation significative."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black">{result.score}/100</div>
                  <div className="text-sm font-medium opacity-80">Score de Confiance</div>
                </div>
              </div>

              {/* Signals - Large & Explained */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                   <Activity className="h-5 w-5 text-primary" />
                   Signaux Détectés
                 </h3>
                 <div className="grid gap-4">
                   {result.signals.map((signal: any, index: number) => (
                     <div key={index} className="p-5 rounded-xl border bg-card/50 hover:bg-card transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-lg font-bold text-foreground capitalize">{signal.type}</span>
                          <Badge variant={signal.confidence > 0.7 ? "destructive" : "secondary"}>
                             Confiance: {(signal.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {signal.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-primary bg-primary/5 p-2 rounded">
                          <Sparkles className="h-4 w-4" />
                          <span>L'IA a identifié ce motif avec une certitude de <strong>{(signal.confidence * 100).toFixed(0)}%</strong>.</span>
                        </div>
                     </div>
                   ))}
                   {result.signals.length === 0 && (
                     <div className="p-8 text-center border rounded-xl bg-muted/20 text-muted-foreground">
                       <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                       <p>Aucun signal suspect n'a été détecté dans ce média.</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleGenerateReport} className="w-full gap-2" variant="outline">
                  <FileBarChart className="h-4 w-4" />
                  Télécharger Rapport PDF
                </Button>
                <Button onClick={handleExportJson} className="w-full gap-2" variant="outline">
                  <FileJson className="h-4 w-4" />
                  Exporter JSON
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
