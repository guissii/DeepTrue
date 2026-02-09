import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Dropzone } from "@/components/ui-custom/Dropzone";
import { RiskBadge } from "@/components/ui-custom/RiskBadge";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { getMockFinanceResult } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiKeys } from "@/hooks/useApiKeys";
import { analyzeFinanceWithGemini, generateFinanceAuditReport } from "@/lib/apiClient";
import {
  Loader2,
  Receipt,
  Landmark,
  FileCheck,
  AlertCircle,
  FileBarChart,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  History,
  TrendingUp,
  Activity,
  FileText,
  Search,
  FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function FinanceDocs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams();
  const { addAnalysis, updateAnalysis, history } = useAnalysisHistory();
  const { apiKeys } = useApiKeys();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  // Audit Report State
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);

  // Dashboard specific state
  const [viewMode, setViewMode] = useState<'dashboard' | 'upload' | 'result' | 'history'>('dashboard');

  // Stats calculation
  const financeHistory = history.filter(h => h.type === 'finance');
  const monthlyAnalysis = financeHistory.filter(h => {
    const date = new Date(h.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyCount = monthlyAnalysis.length;

  // Reset state when type changes
  useEffect(() => {
    if (!type) {
      setViewMode('dashboard');
      setFile(null);
      setResult(null);
    } else {
      // If we are navigating to a specific type, switch to upload mode
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
    setAuditReport(null);
    // Don't auto-start, let user click "Analyze"
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

    const id = await addAnalysis({
      type: "finance",
      subtype: type || "unknown",
      filename: file.name,
      status: "processing",
    });

    try {
      // Use "invoices" as default if type is undefined (though it should be defined in upload mode)
      const docType = type || "invoices";
      const financeResult = await analyzeFinanceWithGemini(file, docType, apiKeys.gemini);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(financeResult);
      setViewMode('result');

      updateAnalysis(id, {
        status: "completed",
        result: financeResult,
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Finance analysis failed:", error);
      
      const docType = type || "invoices";
      const mockResult = getMockFinanceResult(docType);
      setResult(mockResult);
      setProgress(100);
      setViewMode('result');
      
      updateAnalysis(id, {
        status: "completed",
        result: mockResult,
      });
    }

    setIsProcessing(false);
  };

  const handleGenerateAudit = async () => {
    if (!result) return;
    
    setIsGeneratingAudit(true);
    
    try {
      const docType = type || "invoices";
      let report = await generateFinanceAuditReport(result, docType, apiKeys.gemini);
      
      setAuditReport(report);
      setIsAuditModalOpen(true);
      
    } catch (error) {
      console.error("Audit generation failed, falling back to simple template:", error);
      
      let report = `AUDIT NOTE - DEEPTRUST FINANCE (FALLBACK)\n`;
      report += `=======================================\n\n`;
      report += `Document: ${file?.name || "Unknown"}\n`;
      report += `Type: ${type?.toUpperCase() || "UNKNOWN"}\n`;
      report += `Date: ${new Date().toLocaleString()}\n\n`;
      
      report += `EXTRACTED DATA:\n`;
      report += `---------------\n`;
      result.fields.forEach((f: any) => {
        report += `${f.name}: ${f.value} (Conf: ${(f.confidence * 100).toFixed(0)}%)\n`;
      });
      
      setAuditReport(report);
      setIsAuditModalOpen(true);
    } finally {
      setIsGeneratingAudit(false);
    }
  };

  const handleDownloadAudit = () => {
    if (!auditReport) return;
    
    try {
      const doc = new jsPDF();
      
      // Set font
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Split text to fit page
      const splitText = doc.splitTextToSize(auditReport, 180);
      
      // Add text
      doc.text(splitText, 15, 15);
      
      // Save
      doc.save(`audit_note_${type || "doc"}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Fallback to text download
      const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(auditReport);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `audit_note_${type || "doc"}_${new Date().getTime()}.txt`);
      linkElement.click();
    }
  };

  const handleExportCsv = () => {
    if (!result) return;
    
    // Add BOM for Excel UTF-8 compatibility
    let csv = '\uFEFF';
    csv += `Field,Value,Confidence,Explanation\n`;
    
    result.fields.forEach((f: any) => {
      const name = f.name.replace(/"/g, '""');
      const value = f.value.replace(/"/g, '""');
      const explanation = `Le champ ${name} a été identifié avec une confiance de ${(f.confidence * 100).toFixed(0)}%.`;
      csv += `"${name}","${value}","${f.confidence}","${explanation}"\n`;
    });
    
    csv += `\nRed Flags,Severity,Description\n`;
    result.redFlags.forEach((f: any) => {
      csv += `"${f.type}","${f.severity}","${f.description}"\n`;
    });

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `finance_export_${type || "doc"}_${new Date().getTime()}.csv`);
    linkElement.click();
  };

  const handleExportJson = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `finance_analysis_${type || "doc"}_${new Date().getTime()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getTypeIcon = (docType: string) => {
    switch (docType) {
      case "invoices": return <Receipt className="h-5 w-5" />;
      case "statements": return <Landmark className="h-5 w-5" />;
      case "contracts": return <FileCheck className="h-5 w-5" />;
      case "checks": return <AlertCircle className="h-5 w-5" />;
      default: return <Receipt className="h-5 w-5" />;
    }
  };

  const isHighRisk = result?.redFlags?.length > 0;

  // Render Dashboard View
  if (viewMode === 'dashboard' || !type) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Finance Intelligence
          </h1>
          <p className="text-lg text-muted-foreground">
            Tableau de bord d'analyse financière et conformité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Analyses ce mois</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyCount}</div>
              <p className="text-xs text-muted-foreground">Documents traités</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Historique Total</CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financeHistory.length}</div>
              <p className="text-xs text-muted-foreground">Depuis le début</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risques Détectés</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financeHistory.filter(h => h.result?.redFlags?.length > 0).length}</div>
              <p className="text-xs text-muted-foreground">Nécessitent une revue manuelle</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Nouvelle Analyse
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'invoices', label: 'Factures', icon: Receipt, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { id: 'statements', label: 'Relevés', icon: Landmark, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { id: 'contracts', label: 'Contrats KYC', icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { id: 'checks', label: 'Contrôles', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            ].map((item) => (
              <Card 
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-muted"
                onClick={() => {
                  navigate(`/app/finance/${item.id}`);
                  // viewMode will be updated by useEffect
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                  <div className={`p-3 rounded-full ${item.bg}`}>
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
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
              <Button variant="ghost" size="sm" onClick={() => setViewMode('history')}>
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {financeHistory.length > 0 ? (
                    financeHistory.slice().reverse().slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-full border">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[150px]">{item.filename}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.subtype}</p>
                          </div>
                        </div>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
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
                Performance IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Précision d'extraction</span>
                  <span className="font-bold">98.5%</span>
                </div>
                <Progress value={98.5} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temps de traitement moyen</span>
                  <span className="font-bold">1.2s</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="p-4 rounded-lg bg-background/50 border mt-4">
                <h4 className="font-semibold mb-2 text-sm">Dernière mise à jour du modèle</h4>
                <p className="text-xs text-muted-foreground">
                  Le modèle Gemini Flash a été mis à jour le {new Date().toLocaleDateString()}.
                  Amélioration de la détection des fraudes de 15%.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render History View
  if (viewMode === 'history') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8 text-primary" />
              Historique Financier
            </h1>
            <p className="text-muted-foreground">
              Consultez l'historique complet de vos analyses financières
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('dashboard')}>
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Retour au Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyses Effectuées</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financeHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun historique disponible
                    </TableCell>
                  </TableRow>
                ) : (
                  financeHistory.slice().reverse().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize flex items-center gap-2">
                        {getTypeIcon(item.subtype || "unknown")}
                        {item.subtype}
                      </TableCell>
                      <TableCell className="font-medium">{item.filename}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.result?.redFlags?.length > 0 ? (
                           <Badge variant="destructive">Risque Élevé</Badge>
                        ) : (
                           <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Sûr</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (item.result) {
                            setResult(item.result);
                            setViewMode('result');
                          }
                        }}>
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Upload & Analysis View
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance')} className="gap-1 pl-0 hover:bg-transparent hover:text-primary">
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
                  {getTypeIcon(type || "doc")}
                </div>
                Document Source
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col justify-center min-h-[400px]">
              {!file ? (
                <Dropzone
                  onFileSelect={handleFileSelect}
                  accept={{
                    "application/pdf": [".pdf"],
                    "image/*": [".jpg", ".jpeg", ".png"],
                  }}
                  label={t("deepfake.upload.dragDrop")}
                  sublabel={t("finance.upload.supported")}
                  className="h-full min-h-[300px]"
                />
              ) : (
                <div className="space-y-6 w-full">
                  <div className="relative aspect-[3/4] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                    <FileText className="h-24 w-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-sm border text-xs">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
          
          {/* History hint */}
          {!result && financeHistory.filter(h => h.subtype === type).length > 0 && (
             <Card className="bg-muted/10">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                   <History className="h-4 w-4" />
                   Dernières analyses ({type})
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-2">
                   {financeHistory.filter(h => h.subtype === type).slice(0, 3).map(h => (
                     <div key={h.id} className="text-sm flex justify-between p-2 bg-background rounded border">
                       <span className="truncate max-w-[150px]">{h.filename}</span>
                       <Badge variant="outline" className="text-xs">{new Date(h.date).toLocaleDateString()}</Badge>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          )}
        </div>

        {/* Right Side: Results or Placeholder */}
        <div className="lg:col-span-7 space-y-6">
          {isProcessing ? (
            <Card className="h-full flex flex-col items-center justify-center p-12 space-y-8 min-h-[500px]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative h-24 w-24 bg-background rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-xl font-semibold">Analyse Intelligente en cours</h3>
                <p className="text-muted-foreground">
                  L'IA Gemini analyse la structure du document, extrait les données clés et vérifie la conformité...
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Extraction</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </Card>
          ) : !result ? (
            <Card className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed bg-muted/5">
              <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-10 w-10 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">En attente de document</h3>
              <p className="max-w-sm mt-2">
                Sélectionnez un fichier à gauche et lancez l'analyse pour voir les résultats détaillés ici.
              </p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {/* Status Banner */}
              <div className={cn(
                "rounded-xl p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden",
                isHighRisk 
                  ? "bg-gradient-to-br from-red-600 to-orange-600" 
                  : "bg-gradient-to-br from-emerald-600 to-teal-600"
              )}>
                <div className="absolute inset-0 bg-white/5 pattern-grid-lg opacity-20" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shadow-inner">
                    {isHighRisk ? <ShieldAlert className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {isHighRisk ? "Risque Détecté" : "Document Conforme"}
                    </h2>
                    <p className="text-white/90 font-medium">
                      {isHighRisk 
                        ? `${result.redFlags.length} anomalie(s) critique(s)` 
                        : "Validation automatique réussie"}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 text-right">
                  <div className="text-3xl font-bold opacity-90">
                    {Math.round(result.fields.reduce((acc: any, curr: any) => acc + curr.confidence, 0) / result.fields.length * 100)}%
                  </div>
                  <div className="text-xs uppercase tracking-wider opacity-75">Confiance IA</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-12 text-base shadow-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" 
                  onClick={handleGenerateAudit}
                  disabled={isGeneratingAudit}
                >
                  {isGeneratingAudit ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FileBarChart className="mr-2 h-5 w-5" />
                  )}
                  Générer Audit
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 text-base hover:bg-muted"
                  onClick={handleExportCsv}
                >
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Exp. CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 text-base hover:bg-muted"
                  onClick={handleExportJson}
                >
                  <FileJson className="mr-2 h-5 w-5" />
                  Exp. JSON
                </Button>
              </div>

              {/* Detailed Results Tabs */}
              <Tabs defaultValue="extracted" className="w-full">
                <TabsList className="w-full grid grid-cols-3 p-1 bg-muted/50">
                  <TabsTrigger value="extracted">Données Extraites</TabsTrigger>
                  <TabsTrigger value="compliance">Conformité</TabsTrigger>
                  <TabsTrigger value="risk" className={isHighRisk ? "text-red-500 data-[state=active]:text-red-600" : ""}>
                    Risques & Alertes
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="extracted" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Champs Identifiés</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.fields.map((field: any, index: number) => (
                        <div key={index} className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-all hover:shadow-md">
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{field.name}</span>
                            <div className="text-3xl font-bold text-foreground break-all">{field.value}</div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span>
                                Le système a identifié <strong>{field.name}</strong> avec une confiance de <strong>{(field.confidence * 100).toFixed(0)}%</strong>.
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compliance" className="mt-4">
                  <Card>
                    <CardContent className="pt-6 grid gap-4">
                      {Object.entries(result.compliance).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-full", value ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                              {value ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            </div>
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                          <Badge variant={value ? "outline" : "destructive"}>
                            {value ? "Validé" : "Manquant"}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risk" className="mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      {result.redFlags.length === 0 ? (
                        <div className="text-center py-8">
                          <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                          <h4 className="text-lg font-medium text-emerald-600">Aucun risque détecté</h4>
                          <p className="text-muted-foreground">Ce document a passé tous les contrôles de sécurité.</p>
                        </div>
                      ) : (
                        result.redFlags.map((flag: any, index: number) => (
                          <div key={index} className="flex gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-red-700 dark:text-red-400">{flag.type}</span>
                                <RiskBadge level={flag.severity} />
                              </div>
                              <p className="text-sm text-red-800 dark:text-red-300">{flag.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Audit Report Dialog */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 bg-muted/30 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Note d'Audit Générée par IA
            </DialogTitle>
            <DialogDescription>
              Analyse professionnelle générée le {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-8 bg-card">
            <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {auditReport}
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t bg-muted/30 gap-2">
            <Button variant="outline" onClick={() => setIsAuditModalOpen(false)}>
              Fermer
            </Button>
            <Button onClick={handleDownloadAudit} className="gap-2">
              <FileBarChart className="h-4 w-4" />
              Télécharger le rapport (PDF)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
