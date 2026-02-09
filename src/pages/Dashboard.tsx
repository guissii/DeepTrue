import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui-custom/StatCard";
import { RiskBadge } from "@/components/ui-custom/RiskBadge";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  ScanLine,
  AlertTriangle,
  FileText,
  Activity,
  Image as ImageIcon,
  Video,
  Mic,
} from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { t } = useTranslation();
  const { history, getRecentAnalyses } = useAnalysisHistory();
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    scansToday: 0,
    highRisk: 0,
    financeAlerts: 0,
    totalAnalyses: 0,
  });

  // Calculate real stats and chart data from history
  useEffect(() => {
    if (!history) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Calculate Stats
    const scansToday = history.filter((h) => {
      const date = new Date(h.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    }).length;

    const highRisk = history.filter((h) => h.riskLevel === "high").length;
    const financeAlerts = history.filter(
      (h) => h.type === "finance" && h.riskLevel === "high"
    ).length;
    const totalAnalyses = history.length;

    setStats({
      scansToday,
      highRisk,
      financeAlerts,
      totalAnalyses,
    });

    // 2. Calculate Chart Data (Risk Trend - Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const trendData = last7Days.map((date) => {
      const dayStr = date.toLocaleDateString(undefined, { weekday: 'short' });
      const dayAnalyses = history.filter((h) => {
        const hDate = new Date(h.date);
        hDate.setHours(0, 0, 0, 0);
        return hDate.getTime() === date.getTime();
      });

      const avgScore =
        dayAnalyses.length > 0
          ? dayAnalyses.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            dayAnalyses.length
          : 0; // Default to 0 if no scans

      return {
        name: dayStr,
        risk: Math.round(avgScore),
        count: dayAnalyses.length,
      };
    });

    setChartData(trendData);
  }, [history]);

  const recentAnalyses = getRecentAnalyses(5);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "finance":
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const pieData = [
    { name: "Low", value: history.filter(h => h.riskLevel === 'low').length, color: "#22c55e" },
    { name: "Medium", value: history.filter(h => h.riskLevel === 'medium').length, color: "#f59e0b" },
    { name: "High", value: history.filter(h => h.riskLevel === 'high').length, color: "#ef4444" },
  ].filter(d => d.value > 0);

  // If no data, show default empty state for pie
  if (pieData.length === 0) {
    pieData.push({ name: "No Data", value: 1, color: "#334155" });
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground">
          Real-time intelligence overview
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: t("dashboard.stats.scansToday"), value: stats.scansToday, icon: ScanLine, color: "text-blue-500" },
          { title: t("dashboard.stats.highRisk"), value: stats.highRisk, icon: AlertTriangle, color: "text-red-500" },
          { title: t("dashboard.stats.financeAlerts"), value: stats.financeAlerts, icon: FileText, color: "text-amber-500" },
          { title: t("dashboard.stats.totalAnalyses"), value: stats.totalAnalyses, icon: Activity, color: "text-green-500" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-background/50 backdrop-blur-xl hover:bg-background/80 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>{t("dashboard.charts.riskTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRisk)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="h-[300px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="absolute bottom-0 left-0 w-full flex justify-center gap-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Analyses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{t("dashboard.recent.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead>{t("dashboard.recent.type")}</TableHead>
                  <TableHead>{t("dashboard.recent.date")}</TableHead>
                  <TableHead>{t("dashboard.recent.score")}</TableHead>
                  <TableHead>{t("dashboard.recent.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAnalyses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No recent analyses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentAnalyses.map((analysis) => (
                    <TableRow key={analysis.id} className="hover:bg-muted/50 border-b border-border/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getTypeIcon(analysis.type)}
                          </div>
                          <span className="capitalize font-medium">{analysis.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(analysis.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {analysis.score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{analysis.score}%</span>
                            {analysis.riskLevel && (
                              <RiskBadge level={analysis.riskLevel} />
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            analysis.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : analysis.status === "failed"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {analysis.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
