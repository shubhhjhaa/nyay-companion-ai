import { useState, useEffect } from "react";
import { Briefcase, Users, CheckCircle, Clock, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingRequests: number;
  thisMonthCases: number;
}

const LawyerOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    pendingRequests: 0,
    thisMonthCases: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cases, error } = await supabase
        .from('cases')
        .select('*')
        .eq('lawyer_id', user.id);

      if (error) throw error;

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCases = cases?.length || 0;
      const activeCases = cases?.filter(c => c.status === 'in_progress').length || 0;
      const closedCases = cases?.filter(c => c.status === 'closed').length || 0;
      const pendingRequests = cases?.filter(c => c.status === 'pending').length || 0;
      const thisMonthCases = cases?.filter(c => 
        new Date(c.created_at) >= firstOfMonth
      ).length || 0;

      setStats({
        totalCases,
        activeCases,
        closedCases,
        pendingRequests,
        thisMonthCases
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total Cases", 
      value: stats.totalCases, 
      icon: Briefcase, 
      color: "text-nyay-indigo", 
      bgColor: "bg-nyay-indigo/10",
      description: "All time cases"
    },
    { 
      title: "Active Cases", 
      value: stats.activeCases, 
      icon: Users, 
      color: "text-nyay-teal", 
      bgColor: "bg-nyay-teal/10",
      description: "Currently in progress"
    },
    { 
      title: "Pending Requests", 
      value: stats.pendingRequests, 
      icon: Clock, 
      color: "text-nyay-gold", 
      bgColor: "bg-nyay-gold/10",
      description: "Awaiting your response"
    },
    { 
      title: "Closed Cases", 
      value: stats.closedCases, 
      icon: CheckCircle, 
      color: "text-green-600", 
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Successfully resolved"
    },
    { 
      title: "This Month", 
      value: stats.thisMonthCases, 
      icon: Calendar, 
      color: "text-purple-600", 
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "New cases this month"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm">Your practice at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-foreground mt-1">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nyay-teal" />
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalCases > 0 
                  ? Math.round(((stats.activeCases + stats.closedCases) / stats.totalCases) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.activeCases + stats.closedCases > 0
                  ? Math.round((stats.closedCases / (stats.activeCases + stats.closedCases)) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground">Pending Actions</p>
              <p className="text-2xl font-bold text-nyay-gold">{stats.pendingRequests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerOverview;
