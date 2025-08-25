"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { ProjectForm } from "@/components/projects/project-form"
import { ProjectTable } from "@/components/projects/project-table"
import { projectsApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { getLocalizedText } from "@/components/language-tabs"
import type { Project } from "@/lib/types"
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const { language } = useAppStore()
  const { toast } = useToast()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    setSelectedProject(null)
    setIsFormOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setIsFormOpen(true)
  }

  const handleDeleteProject = async (project: Project) => {
    try {
      await projectsApi.delete(project._id!)
      await loadProjects()
      setDeleteProject(null)
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = async (projectData: Omit<Project, "_id">) => {
    try {
      if (selectedProject) {
        await projectsApi.update(selectedProject._id!, projectData)
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
      } else {
        await projectsApi.create(projectData)
        toast({
          title: "Success",
          description: "Project created successfully",
        })
      }
      await loadProjects()
      setIsFormOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedProject ? "update" : "create"} project`,
        variant: "destructive",
      })
    }
  }

  const filteredProjects = projects.filter((project) => {
    const name = getLocalizedText(project.name, language).toLowerCase()
    const description = getLocalizedText(project.description, language).toLowerCase()
    const search = searchTerm.toLowerCase()
    return name.includes(search) || description.includes(search)
  })

  const statusCounts = {
    ongoing: projects.filter((p) => p.status === "ongoing").length,
    completed: projects.filter((p) => p.status === "completed").length,
    planned: projects.filter((p) => p.status === "planned").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your organization's projects and initiatives</p>
          </div>
          <Button onClick={handleCreateProject} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ongoing Projects</CardTitle>
              <Badge variant="default">{statusCounts.ongoing}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.ongoing}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <Badge variant="secondary">{statusCounts.completed}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planned Projects</CardTitle>
              <Badge variant="outline">{statusCounts.planned}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.planned}</div>
              <p className="text-xs text-muted-foreground">In planning phase</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>View and manage all your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ProjectTable
              projects={filteredProjects}
              loading={loading}
              onEdit={handleEditProject}
              onDelete={(project) => setDeleteProject(project)}
            />
          </CardContent>
        </Card>

        {/* Project Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject ? "Edit Project" : "Create New Project"}</DialogTitle>
              <DialogDescription>
                {selectedProject ? "Update project information" : "Add a new project to your organization"}
              </DialogDescription>
            </DialogHeader>
            <ProjectForm project={selectedProject} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project "
                {deleteProject && getLocalizedText(deleteProject.name, language)}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject && handleDeleteProject(deleteProject)}
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
