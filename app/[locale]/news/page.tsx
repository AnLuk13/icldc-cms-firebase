"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, User, FileText } from "lucide-react";
import { NewsForm } from "@/components/news/news-form";
import { NewsTable } from "@/components/news/news-table";
import { newsApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getLocalizedText } from "@/components/language-tabs";
import type { News } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { isThisMonth, isThisWeek } from "date-fns";
import { useTranslations } from "next-intl";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteNews, setDeleteNews] = useState<News | null>(null);
  const { language } = useAppStore();
  const { toast } = useToast();
  const t = useTranslations();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getAll();
      setNews(data);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("news.errorLoadingNews"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = () => {
    setSelectedNews(null);
    setIsFormOpen(true);
  };

  const handleEditNews = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsFormOpen(true);
  };

  const handleDeleteNews = async (newsItem: News) => {
    try {
      await newsApi.delete(newsItem._id!);
      await loadNews();
      setDeleteNews(null);
      toast({
        title: t("common.success"),
        description: t("news.newsDeletedSuccessfully"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("news.errorDeletingNews"),
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (newsData: Omit<News, "_id">) => {
    try {
      if (selectedNews) {
        await newsApi.update(selectedNews._id!, newsData);
        toast({
          title: t("common.success"),
          description: t("news.newsUpdatedSuccessfully"),
        });
      } else {
        await newsApi.create(newsData);
        toast({
          title: t("common.success"),
          description: t("news.newsCreatedSuccessfully"),
        });
      }
      await loadNews();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t(
          selectedNews ? "news.errorUpdatingNews" : "news.errorCreatingNews"
        ),
        variant: "destructive",
      });
    }
  };

  const filteredNews = news.filter((newsItem) => {
    const name = getLocalizedText(newsItem.name, language).toLowerCase();
    const content = getLocalizedText(newsItem.content, language).toLowerCase();
    const summary = newsItem.summary
      ? getLocalizedText(newsItem.summary, language).toLowerCase()
      : "";
    const author = newsItem.author?.toLowerCase() || "";
    const category = newsItem.category?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      name.includes(search) ||
      content.includes(search) ||
      summary.includes(search) ||
      author.includes(search) ||
      category.includes(search)
    );
  });

  const publishedThisWeek = news.filter(
    (item) => item.publishedAt && isThisWeek(new Date(item.publishedAt))
  ).length;
  const publishedThisMonth = news.filter(
    (item) => item.publishedAt && isThisMonth(new Date(item.publishedAt))
  ).length;
  const draftArticles = news.filter((item) => !item.publishedAt).length;

  const categories = [
    ...new Set(news.map((item) => item.category).filter(Boolean)),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("news.title")}
            </h1>
            <p className="text-muted-foreground">{t("news.description")}</p>
          </div>
          <Button onClick={handleCreateNews} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("news.addNews")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("news.totalArticles")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{news.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("news.allArticles")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("news.thisWeek")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                {t("news.publishedRecently")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("news.thisMonth")}
              </CardTitle>
              <Badge variant="default">{publishedThisMonth}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {t("news.monthlyPublications")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("news.drafts")}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftArticles}</div>
              <p className="text-xs text-muted-foreground">
                {t("news.unpublishedArticles")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Overview */}
        {categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("news.categories")}</CardTitle>
              <CardDescription>
                {t("news.articleDistributionByCategory")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const count = news.filter(
                    (item) => item.category === category
                  ).length;
                  return (
                    <Badge key={category} variant="outline" className="gap-1">
                      {category} ({count})
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t("news.allNews")}</CardTitle>
            <CardDescription>{t("news.viewAndManageNews")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("news.searchNews")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <NewsTable
              news={filteredNews}
              loading={loading}
              onEdit={handleEditNews}
              onDelete={(newsItem) => setDeleteNews(newsItem)}
            />
          </CardContent>
        </Card>

        {/* News Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedNews ? t("news.editNews") : t("news.createNewNews")}
              </DialogTitle>
              <DialogDescription>
                {selectedNews
                  ? t("news.updateNewsInformation")
                  : t("news.addNewNewsToOrganization")}
              </DialogDescription>
            </DialogHeader>
            <NewsForm
              news={selectedNews}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteNews}
          onOpenChange={() => setDeleteNews(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("news.areYouSure")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("news.deleteConfirmation", {
                  newsTitle: deleteNews
                    ? getLocalizedText(deleteNews.name, language)
                    : "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteNews && handleDeleteNews(deleteNews)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
