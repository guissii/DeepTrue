import { useTranslation } from "react-i18next";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileBarChart,
  Download,
  FileJson,
  FileSpreadsheet,
  Trash2,
  FileArchive,
  FileText,
  Image,
  Video,
  Mic,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Reports() {
  const { t } = useTranslation();
  const { history, removeAnalysis, clearHistory } = useAnalysisHistory();
  // Selected report state for future detail view
  // const [selectedReport, setSelectedReport] = useState<any>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleExportPack = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `deeptrust_reports_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Type", "Fichier", "Date", "Score", "Risque", "Status"];
    const rows = history.map(h => [
      h.id,
      h.type,
      h.filename,
      h.date,
      h.score || "",
      h.riskLevel || "",
      h.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `deeptrust_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
          <p className="text-muted-foreground">
            Consultez et exportez vos rapports d'analyse
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            PDF / Imprimer
          </Button>
          <Button variant="outline" onClick={handleExportCsv}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={handleExportPack}>
            <FileArchive className="mr-2 h-4 w-4" />
            {t("reports.exportPack")} (JSON)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-sm text-muted-foreground">Total analyses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {history.filter((h) => h.type === "image" || h.type === "video" || h.type === "audio").length}
            </div>
            <p className="text-sm text-muted-foreground">Deepfake</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {history.filter((h) => h.type === "finance").length}
            </div>
            <p className="text-sm text-muted-foreground">Finance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {history.filter((h) => h.riskLevel === "high").length}
            </div>
            <p className="text-sm text-muted-foreground">Risques élevés</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("reports.list")}</CardTitle>
          {history.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="print:hidden">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Tout supprimer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                  <DialogDescription>
                    Cette action est irréversible. Tous les rapports seront supprimés.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Annuler</Button>
                  <Button variant="destructive" onClick={clearHistory}>
                    Supprimer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Fichier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t("reports.noReports")}
                  </TableCell>
                </TableRow>
              ) : (
                history.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{report.filename}</TableCell>
                    <TableCell>
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.score !== undefined ? (
                        <Badge
                          variant={report.score > 70 ? "destructive" : report.score > 30 ? "secondary" : "default"}
                        >
                          {report.score}/100
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : report.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <FileJson className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnalysis(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.template")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <FileBarChart className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-medium">Rapport complet</h3>
              <p className="text-sm text-muted-foreground">
                Inclut toutes les analyses et métriques
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <FileJson className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-medium">Export JSON</h3>
              <p className="text-sm text-muted-foreground">
                Données brutes au format JSON
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <FileSpreadsheet className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-medium">Export CSV</h3>
              <p className="text-sm text-muted-foreground">
                Tableau de données pour Excel
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
