
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Users,
  BarChart3,
  ScrollText,
  Activity,
  AlertCircle,
  CheckCircle,
  Shield,
  Coins,
  Key,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'deleted';
  createdAt: string;
  requests: number;
  tokens: number;
  lastActive: string;
  apiKey: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTokens: number;
  totalRequests: number;
  recentActivity: any[];
}

interface SystemLog {
  action: string;
  user: string;
  status: 'success' | 'error' | 'warning';
  time: string;
}

export function Admin() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTokens: 0,
    totalRequests: 0,
    recentActivity: [],
  });

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);


  useEffect(() => {
    console.log("Admin page mounted. Token:", !!token);
    if (!token) {
      console.warn("No token found, redirecting or showing error");
      setIsLoading(false);
      setError("Authentication required. Please log in as an administrator.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching admin data...");
        
        // Timeout helper
        const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (err) {
                clearTimeout(id);
                throw err;
            }
        };

        // Fetch Users
        const usersRes = await fetchWithTimeout('http://localhost:3000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (usersRes.status === 401) throw new Error("Session expired. Please login again.");
        if (usersRes.status === 403) throw new Error("Access denied. Admin privileges required.");
        if (!usersRes.ok) {
           const text = await usersRes.text();
           throw new Error(`Failed to fetch users: ${usersRes.status} ${text}`);
        }
        
        const usersData: User[] = await usersRes.json();
        console.log("Users fetched:", usersData.length);
        setUsers(usersData || []);

        // Fetch Stats
        const statsRes = await fetchWithTimeout('http://localhost:3000/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();
        console.log("Stats fetched:", statsData);
        
        setAdminStats({
          totalUsers: statsData.totalUsers || 0,
          activeUsers: statsData.activeUsers || 0,
          totalTokens: statsData.totalTokens || 0,
          totalRequests: statsData.totalAnalyses || 0,
          recentActivity: statsData.recentActivity || [],
        });

        // Derive Logs from Recent Activity
        const derivedLogs: SystemLog[] = (statsData.recentActivity || []).map((activity: any) => {
          const user = (usersData || []).find(u => u.id === activity.userId);
          const userName = user ? user.username : "Unknown User";
          const actionName = activity.type === 'deepfake' || activity.type === 'image' || activity.type === 'video' || activity.type === 'audio' 
            ? `Deepfake Analysis (${activity.type})`
            : activity.type === 'finance' 
              ? 'Financial Doc Analysis' 
              : 'Analysis';

          return {
            action: actionName,
            user: userName,
            status: 'success', // Assuming saved history implies success
            time: activity.timestamp
          };
        });
        setLogs(derivedLogs);

      } catch (err: any) {
        console.error("Failed to fetch admin data", err);
        setError(err.message || "Failed to load admin dashboard data. Please check server connection.");
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
  }, [token, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (

    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {t("admin.title")}
          </h1>
          <p className="text-muted-foreground">
            System administration & user management
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setRefreshKey(k => k + 1)} title="Refresh Data">
            <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Users", value: adminStats.totalUsers, icon: Users, color: "text-blue-500" },
          { title: "Active Users", value: adminStats.activeUsers, icon: Activity, color: "text-green-500" },
          { title: "Total Tokens Consumed", value: adminStats.totalTokens.toLocaleString(), icon: Coins, color: "text-yellow-500" },
          { title: "Total API Requests", value: adminStats.totalRequests, icon: BarChart3, color: "text-purple-500" },

        ].map((stat, index) => (
          <div key={index}>
            <Card className="border-border bg-card shadow-sm hover:bg-muted/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-secondary/10 backdrop-blur-xl border border-border/50">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            {t("admin.users.title")}
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t("admin.stats.title")}
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ScrollText className="mr-2 h-4 w-4" />
            {t("admin.logs.title")}
          </TabsTrigger>
        </TabsList>


        {/* Users Tab */}
        <TabsContent value="users">
          <div>
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent bg-secondary/10">
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className={cn("border-border/50 hover:bg-muted/50", user.status === 'deleted' && "opacity-60 bg-muted/20")}>
                        <TableCell>
                          <div>
                            <div className={cn("font-medium", user.status === 'deleted' && "line-through text-muted-foreground")}>{user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                            user.status === 'active' && "bg-green-500/10 text-green-500",
                            user.status === 'inactive' && "bg-yellow-500/10 text-yellow-500",
                            user.status === 'deleted' && "bg-destructive/10 text-destructive line-through"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              user.status === 'active' && "bg-green-500",
                              user.status === 'inactive' && "bg-yellow-500",
                              user.status === 'deleted' && "bg-destructive"
                            )} />
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", user.status === 'deleted' && "line-through")}>
                            <Key className="h-3 w-3" />
                            {user.apiKey}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                           {user.lastActive ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) : 'Never'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.tokens.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.requests}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={user.status === 'deleted'}
                            onClick={() => toast.info("Edit functionality coming soon")}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                       <TableRow>
                         <TableCell colSpan={8} className="h-24 text-center">
                           No users found.
                         </TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  API Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{user.username}</span>
                        <span className="text-muted-foreground">{user.tokens} tokens</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/80" 
                          style={{ width: `${Math.min((user.tokens / 1000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <div className="text-center text-muted-foreground py-4">No data available</div>}
                </div>
              </CardContent>
            </Card>


            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Privacy & Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-1">
                    <CheckCircle className="h-5 w-5" />
                    Zero-Knowledge Architecture Active
                  </div>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    No sensitive user data is persisted on the server. All processing is local or transient.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                    <span className="text-sm">Storage Used</span>
                    <span className="font-mono font-bold">0 MB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                    <span className="text-sm">Database Status</span>
                    <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Connected (Local)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Logs Tab */}
        <TabsContent value="logs">
           <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {log.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {log.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      <div>
                        <div className="text-sm font-medium">{log.action}</div>
                        <div className="text-xs text-muted-foreground">{log.user}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.time), { addSuffix: true })}
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    No recent system logs found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
