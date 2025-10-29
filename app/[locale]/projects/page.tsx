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
import { Plus, Search } from "lucide-react";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectTable } from "@/components/projects/project-table";
import { projectsApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getLocalizedText } from "@/components/language-tabs";
import type { Project } from "@/lib/types";
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
import { useTranslations } from "next-intl";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const { language } = useAppStore();
  const { toast } = useToast();
  const t = useTranslations();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("projects.errorLoadingProjects"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await projectsApi.delete(project._id!);
      await loadProjects();
      setDeleteProject(null);
      toast({
        title: t("common.success"),
        description: t("projects.projectDeletedSuccessfully"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("projects.errorDeletingProject"),
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (projectData: Omit<Project, "_id">) => {
    try {
      if (selectedProject) {
        await projectsApi.update(selectedProject._id!, projectData);
        toast({
          title: t("common.success"),
          description: t("projects.projectUpdatedSuccessfully"),
        });
      } else {
        await projectsApi.create(projectData);
        toast({
          title: t("common.success"),
          description: t("projects.projectCreatedSuccessfully"),
        });
      }
      await loadProjects();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t(
          selectedProject
            ? "projects.errorUpdatingProject"
            : "projects.errorCreatingProject"
        ),
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects.filter((project) => {
    const name = getLocalizedText(project.name, language).toLowerCase();
    const description = getLocalizedText(
      project.description,
      language
    ).toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || description.includes(search);
  });

  const statusCounts = {
    ongoing: projects.filter((p) => p.status === "ongoing").length,
    completed: projects.filter((p) => p.status === "completed").length,
    planned: projects.filter((p) => p.status === "planned").length,
  };

  const partnerStats = {
    projectsWithPartners: projects.filter(
      (p) => p.partners && p.partners.length > 0
    ).length,
    totalPartnerConnections: projects.reduce(
      (sum, project) => sum + (project.partners ? project.partners.length : 0),
      0
    ),
    uniquePartners: projects
      .flatMap((project) => project.partners || [])
      .filter((partner, index, self) =>
        // Remove duplicates based on _id if partners are populated objects
        typeof partner === "object" && partner._id
          ? self.findIndex(
              (p) => typeof p === "object" && p._id === partner._id
            ) === index
          : true
      ).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("projects.title")}
            </h1>
            <p className="text-muted-foreground">{t("projects.description")}</p>
          </div>
          <Button onClick={handleCreateProject} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("projects.addProject")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("projects.stats.ongoingProjects")}
              </CardTitle>
              <Badge variant="default">{statusCounts.ongoing}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.ongoing}</div>
              <p className="text-xs text-muted-foreground">
                {t("projects.stats.currentlyActive")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("projects.stats.completedProjects")}
              </CardTitle>
              <Badge variant="secondary">{statusCounts.completed}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground">
                {t("projects.stats.successfullyFinished")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("projects.stats.plannedProjects")}
              </CardTitle>
              <Badge variant="outline">{statusCounts.planned}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.planned}</div>
              <p className="text-xs text-muted-foreground">
                {t("projects.stats.inPlanningPhase")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("projects.stats.partnerCollaborations")}
              </CardTitle>
              <Badge variant="secondary">
                {partnerStats.projectsWithPartners}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partnerStats.totalPartnerConnections}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("projects.stats.totalPartnerships")}
              </p>
              <div className="text-sm text-muted-foreground mt-1">
                {t("projects.stats.uniquePartners", {
                  count: partnerStats.uniquePartners,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t("projects.allProjects")}</CardTitle>
            <CardDescription>
              {t("projects.viewAndManageProjects")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("projects.searchProjects")}
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
          <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="text-wrap break-words">
                {selectedProject
                  ? t("projects.editProject")
                  : t("projects.createNewProject")}
              </DialogTitle>
              <DialogDescription className="text-wrap break-words">
                {selectedProject
                  ? t("projects.updateProjectInformation")
                  : t("projects.addNewProjectToOrganization")}
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              project={selectedProject}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteProject}
          onOpenChange={() => setDeleteProject(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("projects.areYouSure")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("projects.deleteConfirmation", {
                  projectName: deleteProject
                    ? getLocalizedText(deleteProject.name, language)
                    : "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteProject && handleDeleteProject(deleteProject)
                }
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
