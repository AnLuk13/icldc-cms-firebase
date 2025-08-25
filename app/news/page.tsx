"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, User, FileText } from "lucide-react"
import { NewsForm } from "@/components/news/news-form"
import { NewsTable } from "@/components/news/news-table"
import { newsApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { getLocalizedText } from "@/components/language-tabs"
import type { News } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { isThisMonth, isThisWeek } from "date-fns"

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteNews, setDeleteNews] = useState<News | null>(null)
  const { language } = useAppStore()
  const { toast } = useToast()

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      const data = await newsApi.getAll()
      setNews(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load news",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNews = () => {
    setSelectedNews(null)
    setIsFormOpen(true)
  }

  const handleEditNews = (newsItem: News) => {
    setSelectedNews(newsItem)
    setIsFormOpen(true)
  }

  const handleDeleteNews = async (newsItem: News) => {
    try {
      await newsApi.delete(newsItem._id!)
      await loadNews()
      setDeleteNews(null)
      toast({
        title: "Success",
        description: "News article deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete news article",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = async (newsData: Omit<News, "_id">) => {
    try {
      if (selectedNews) {
        await newsApi.update(selectedNews._id!, newsData)
        toast({
          title: "Success",
          description: "News article updated successfully",
        })
      } else {
        await newsApi.create(newsData)
        toast({
          title: "Success",
          description: "News article created successfully",
        })
      }
      await loadNews()
      setIsFormOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedNews ? "update" : "create"} news article`,
        variant: "destructive",
      })
    }
  }

  const filteredNews = news.filter((newsItem) => {
    const name = getLocalizedText(newsItem.name, language).toLowerCase()
    const content = getLocalizedText(newsItem.content, language).toLowerCase()
    const summary = newsItem.summary ? getLocalizedText(newsItem.summary, language).toLowerCase() : ""
    const author = newsItem.author?.toLowerCase() || ""
    const category = newsItem.category?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()
    return (
      name.includes(search) ||
      content.includes(search) ||
      summary.includes(search) ||
      author.includes(search) ||
      category.includes(search)
    )
  })

  const publishedThisWeek = news.filter((item) => item.publishedAt && isThisWeek(new Date(item.publishedAt))).length
  const publishedThisMonth = news.filter((item) => item.publishedAt && isThisMonth(new Date(item.publishedAt))).length
  const draftArticles = news.filter((item) => !item.publishedAt).length

  const categories = [...new Set(news.map((item) => item.category).filter(Boolean))]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">News</h1>
            <p className="text-muted-foreground">Manage your organization's news articles and announcements</p>
          </div>
          <Button onClick={handleCreateNews} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{news.length}</div>
              <p className="text-xs text-muted-foreground">All articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedThisWeek}</div>
              <p className="text-xs text-muted-foreground">Published recently</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Badge variant="default">{publishedThisMonth}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedThisMonth}</div>
              <p className="text-xs text-muted-foreground">Monthly publications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftArticles}</div>
              <p className="text-xs text-muted-foreground">Unpublished articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Overview */}
        {categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Article distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const count = news.filter((item) => item.category === category).length
                  return (
                    <Badge key={category} variant="outline" className="gap-1">
                      {category} ({count})
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
            <CardDescription>View and manage all your news articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
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
              <DialogTitle>{selectedNews ? "Edit Article" : "Create New Article"}</DialogTitle>
              <DialogDescription>
                {selectedNews ? "Update article information" : "Add a new news article to your organization"}
              </DialogDescription>
            </DialogHeader>
            <NewsForm news={selectedNews} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteNews} onOpenChange={() => setDeleteNews(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the article "
                {deleteNews && getLocalizedText(deleteNews.name, language)}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteNews && handleDeleteNews(deleteNews)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
