"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, FolderOpen } from "lucide-react";
import {
  LanguageTabs,
  createEmptyMultilingualText,
  getLocalizedText,
} from "@/components/language-tabs";
import { compressImageToBase64, projectsApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Partner, Language, MultilingualText, Project } from "@/lib/types";
import { useLocale, useTranslations } from "next-intl";

interface PartnerFormProps {
  partner?: Partner | null;
  onSubmit: (data: Omit<Partner, "_id">) => void;
  onCancel: () => void;
}

interface FormData {
  name: MultilingualText;
  description: MultilingualText;
  logo: string;
  website: string;
  projects: string[];
}

export function PartnerForm({ partner, onSubmit, onCancel }: PartnerFormProps) {
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const language = useLocale();
  const t = useTranslations("partners.form");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: partner?.name
        ? typeof partner.name === "string"
          ? { en: partner.name, ro: "", ru: "" }
          : partner.name
        : createEmptyMultilingualText(),
      description: partner?.description
        ? typeof partner.description === "string"
          ? { en: partner.description, ro: "", ru: "" }
          : partner.description
        : createEmptyMultilingualText(),
      logo: partner?.logo || "",
      website: partner?.website || "",
      projects: partner?.projects
        ? partner.projects
            .map((p) => (typeof p === "object" ? p._id : p))
            .filter(Boolean)
        : [],
    },
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const watchedLogo = watch("logo");
  const watchedName = watch("name");
  const watchedProjects = watch("projects");

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await compressImageToBase64(file, 400, 400, 0.85);
      setValue("logo", base64);
    } catch (error) {
      console.error("Logo upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setValue("logo", "");
  };

  const onFormSubmit = (data: FormData) => {
    const partnerData: Omit<Partner, "_id"> = {
      name: data.name,
      description: data.description,
      logo: data.logo || undefined,
      website: data.website || undefined,
      projects: data.projects as any, // Send as string IDs, backend will handle population
    };
    onSubmit(partnerData);
  };

  const getPartnerInitials = () => {
    const name =
      typeof watchedName === "string" ? watchedName : watchedName.en || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Partner Logo */}
      <div className="space-y-4">
        <Label>{t("partnerLogo")}</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {watchedLogo && (
              <AvatarImage
                src={watchedLogo || "/placeholder.svg"}
                alt={t("logoAlt")}
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getPartnerInitials() || "PA"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? tCommon("uploading") : t("uploadLogo")}
                </span>
              </Button>
            </label>
            {watchedLogo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
              >
                <X className="h-4 w-4 mr-2" />
                {t("removeLogo")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Partner Name */}
      <div className="space-y-2">
        <Label>
          {t("partnerName")} {tCommon("required")}
        </Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={t("namePlaceholder", {
                  language: language.toUpperCase(),
                })}
                {...register(`name.${language}`, {
                  required: language === "en" ? t("nameRequired") : false,
                })}
              />
              {errors.name?.[language] && (
                <p className="text-sm text-destructive">
                  {errors.name[language]?.message}
                </p>
              )}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Partner Description */}
      <div className="space-y-2">
        <Label>{t("description")}</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={t("descriptionPlaceholder", {
                  language: language.toUpperCase(),
                })}
                rows={4}
                {...register(`description.${language}`)}
              />
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label>{t("website")}</Label>
        <Input
          type="url"
          placeholder={t("websitePlaceholder")}
          {...register("website", {
            pattern: {
              value: /^https?:\/\/.+/,
              message: tCommon("validUrl"),
            },
          })}
        />
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      {/* Projects Selection */}
      <div className="space-y-2">
        <Label>{t("associatedProjects")}</Label>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("selectProjects")}</CardTitle>
            <CardDescription>{t("selectProjectsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="text-sm text-muted-foreground">
                {t("loadingProjects")}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("noProjects")}
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Controller
                    key={project._id}
                    name="projects"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={`project-${project._id}`}
                          checked={field.value.includes(project._id!)}
                          onCheckedChange={(checked) => {
                            const currentProjects = field.value;
                            if (checked) {
                              field.onChange([
                                ...currentProjects,
                                project._id!,
                              ]);
                            } else {
                              field.onChange(
                                currentProjects.filter(
                                  (id) => id !== project._id,
                                ),
                              );
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`project-${project._id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {getLocalizedText(project.name, language)}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {getLocalizedText(project.description, language)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                            {project.startDate && (
                              <span>
                                {new Date(project.startDate).getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
            )}
            {watchedProjects.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium mb-2">
                  {t("selectedProjects", { count: watchedProjects.length })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedProjects.map((projectId) => {
                    const project = projects.find((p) => p._id === projectId);
                    return project ? (
                      <Badge
                        key={projectId}
                        variant="secondary"
                        className="gap-1"
                      >
                        <FolderOpen className="h-3 w-3" />
                        {getLocalizedText(project.name, language)}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting
            ? tCommon("saving")
            : partner
              ? t("updatePartner")
              : t("createPartner")}
        </Button>
      </div>
    </form>
  );
}
