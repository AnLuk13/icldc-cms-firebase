"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Calendar, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAppStore } from "@/lib/store";
import { getLocalizedText } from "@/components/language-tabs";
import type { Project } from "@/lib/types";
import { format } from "date-fns";

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusColors = {
  ongoing: "default",
  completed: "secondary",
  planned: "outline",
} as const;

export function ProjectTable({
  projects,
  loading,
  onEdit,
  onDelete,
}: ProjectTableProps) {
  const t = useTranslations("projects.table");
  const tc = useTranslations("common");
  const language = useLocale();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noProjects")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("duration")}</TableHead>
            <TableHead>{t("partners")}</TableHead>
            <TableHead>{t("tags")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project._id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {getLocalizedText(project.name, language)}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {getLocalizedText(project.description, language)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[project.status]}>
                  {t(project.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {project.startDate &&
                    format(new Date(project.startDate), "MMM yyyy")}
                  {project.startDate && project.endDate && " - "}
                  {project.endDate &&
                    format(new Date(project.endDate), "MMM yyyy")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">
                    {project.partners?.length || 0}
                  </span>
                  <span className="text-muted-foreground">
                    {t("partnersCount")}
                  </span>
                </div>
                {project.partners && project.partners.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.partners.slice(0, 2).map((partner) => (
                      <Badge
                        key={
                          typeof partner === "object" ? partner._id : partner
                        }
                        variant="secondary"
                        className="text-xs"
                      >
                        {typeof partner === "object"
                          ? getLocalizedText(partner.name, language)
                          : tc("partner")}
                      </Badge>
                    ))}
                    {project.partners.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.partners.length - 2} {t("more")}
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {project.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags && project.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(project)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
