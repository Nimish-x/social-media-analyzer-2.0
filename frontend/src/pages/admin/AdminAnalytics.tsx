import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, AlertTriangle, DollarSign, Activity } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { API_BASE_URL } from "@/services/api";

interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  mrr: number;
}

interface PlanData {
  name: string;
  value: number;
}

interface PlatformStat {
  platform: string;
  connected_users: number;
  percentage: number;
}

interface RecentUser {
  id: string;
  email: string;
  role: string;
  plan: string;
  created_at: string;
}

export default function AdminAnalytics() {
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({ total_users: 0, active_subscriptions: 0, mrr: 0 });
  const [planData, setPlanData] = useState<PlanData[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStat[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic role check on mount - better to use ProtectedRoute wrapper in App.tsx
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${session.access_token}` };

        // Fetch Overview
        const overviewRes = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, { headers });
        if (!overviewRes.ok) throw new Error("Failed to fetch overview");
        const overviewData = await overviewRes.json();
        setStats(overviewData);

        // Fetch Plans
        const plansRes = await fetch(`${API_BASE_URL}/api/admin/analytics/plans`, { headers });
        if (!plansRes.ok) throw new Error("Failed to fetch plan data");
        const plansData = await plansRes.json();
        setPlanData(plansData);

        // Fetch Platform Stats
        const platRes = await fetch(`${API_BASE_URL}/api/admin/analytics/platform-stats`, { headers });
        if (platRes.ok) setPlatformStats(await platRes.json());

        // Fetch Recent Users
        const usersRes = await fetch(`${API_BASE_URL}/api/admin/analytics/recent-users`, { headers });
        if (usersRes.ok) setRecentUsers(await usersRes.json());


      } catch (err) {
        console.error(err);
        setError("Failed to load admin analytics. Ensure you have admin privileges.");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, profile, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
        Loading analytics...
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 text-destructive flex items-center gap-2">
        <AlertTriangle /> {error}
      </main>
    </div>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-display font-bold">Admin Analytics</h1>
              <p className="text-muted-foreground">Overview of platform growth and user distribution.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
                <p className="text-xs text-muted-foreground">Paid plans active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.mrr}</div>
                <p className="text-xs text-muted-foreground">Estimated MRR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">Uptime this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
            {/* Plan Distribution (3 cols) */}
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>User breakdown by subscription tier</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {planData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Stats (4 cols) */}
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Platform Connections</CardTitle>
                <CardDescription>Most popular social platforms</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformStats} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="platform" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} name="% Connected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>Latest users to join the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? "destructive" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.plan || 'Free'}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {recentUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No recent users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
