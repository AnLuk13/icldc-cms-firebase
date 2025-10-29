"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Users,
  Calendar,
  Newspaper,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { newsApi, eventsApi, partnersApi, projectsApi } from "@/lib/api";
import { useTranslations } from "next-intl";

interface DashboardStats {
  totalProjects: number;
  projectsOngoing: number;
  projectsCompleted: number;
  projectsPlanned: number;
  totalPartners: number;
  upcomingEvents: number;
  newsArticles: number;
}

const quickActions = [
  { title: "projects.create", href: "/projects", icon: FolderOpen },
  { title: "partners.create", href: "/partners", icon: Users },
  { title: "events.create", href: "/events", icon: Calendar },
  { title: "news.create", href: "/news", icon: Newspaper },
];

export default function DashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [projects, partners, events, news] = await Promise.all([
        projectsApi.getAll().catch(() => []),
        partnersApi.getAll().catch(() => []),
        eventsApi.getAll().catch(() => []),
        newsApi.getAll().catch(() => []),
      ]);

      // Calculate project stats
      const projectsOngoing = projects.filter(
        (p) => p.status === "ongoing"
      ).length;
      const projectsCompleted = projects.filter(
        (p) => p.status === "completed"
      ).length;
      const projectsPlanned = projects.filter(
        (p) => p.status === "planned"
      ).length;

      // Calculate upcoming events (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const upcomingEvents = events.filter((event) => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return eventDate >= new Date() && eventDate <= thirtyDaysFromNow;
      }).length;

      // Calculate news articles this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newsThisMonth = news.filter((article) => {
        if (!article.publishedAt) return false;
        const publishedDate = new Date(article.publishedAt);
        return (
          publishedDate.getMonth() === currentMonth &&
          publishedDate.getFullYear() === currentYear
        );
      }).length;

      setStats({
        totalProjects: projects.length,
        projectsOngoing,
        projectsCompleted,
        projectsPlanned,
        totalPartners: partners.length,
        upcomingEvents,
        newsArticles: newsThisMonth,
      });
    } catch (err) {
      setError(t("dashboard.errorLoadingData"));
    } finally {
      setLoading(false);
    }
  };

  const getProjectDescription = () => {
    if (!stats) return "";
    const { projectsOngoing, projectsCompleted, projectsPlanned } = stats;
    return t("dashboard.projectStatusBreakdown", {
      ongoing: projectsOngoing,
      completed: projectsCompleted,
      planned: projectsPlanned,
    });
  };

  const statsCards = stats
    ? [
        {
          title: "dashboard.totalProjects",
          value: stats.totalProjects.toString(),
          description: getProjectDescription(),
          icon: FolderOpen,
          href: "/projects",
        },
        {
          title: "dashboard.totalPartners",
          value: stats.totalPartners.toString(),
          description: "dashboard.activePartnerships",
          icon: Users,
          href: "/partners",
        },
        {
          title: "dashboard.upcomingEvents",
          value: stats.upcomingEvents.toString(),
          description: "dashboard.next30Days",
          icon: Calendar,
          href: "/events",
        },
        {
          title: "dashboard.newsArticles",
          value: stats.newsArticles.toString(),
          description: "dashboard.publishedThisMonth",
          icon: Newspaper,
          href: "/news",
        },
      ]
    : [];
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">
              {loading
                ? t("common.loading")
                : error
                ? t("dashboard.connectionIssues")
                : t("dashboard.allSystemsOperational")}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">{error}</p>
                <Button
                  onClick={loadDashboardData}
                  variant="outline"
                  className="mt-2"
                >
                  {t("dashboard.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t(stat.title)}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {typeof stat.description === "string" &&
                      stat.description.startsWith("dashboard.")
                        ? t(stat.description)
                        : stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            <CardDescription>
              {t("dashboard.quickActionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto p-4 bg-transparent"
                  >
                    <action.icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{t(action.title)}</div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <CardDescription>
              {t("dashboard.recentActivityDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-pulse"
                  >
                    <div className="h-2 w-2 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-muted rounded mb-1"></div>
                      <div className="h-3 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t("dashboard.dashboardLoadedWithRealData")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.justNow")}
                    </p>
                  </div>
                </div>
                {!error && stats && (
                  <>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-accent"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.foundProjectsInSystem", {
                            count: stats.totalProjects,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("dashboard.updatedNow")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-accent"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.connectedToActivePartners", {
                            count: stats.totalPartners,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("dashboard.updatedNow")}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
