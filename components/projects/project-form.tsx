"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, File, Users } from "lucide-react";
import {
  LanguageTabs,
  createEmptyMultilingualText,
  getLocalizedText,
} from "@/components/language-tabs";
import { convertFileToBase64, partnersApi } from "@/lib/api";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useAppStore } from "@/lib/store";
import type { Project, Language, MultilingualText, Partner } from "@/lib/types";

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Omit<Project, "_id">) => void;
  onCancel: () => void;
}

interface FormData {
  name: MultilingualText;
  description: MultilingualText;
  status: "ongoing" | "completed" | "planned";
  startDate: Date | undefined;
  endDate: Date | undefined;
  partners: string[];
  documents: string[];
  tags: string[];
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const t = useTranslations("projects.form");
  const tc = useTranslations("common");
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const language = useLocale();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: project?.name
        ? typeof project.name === "string"
          ? { en: project.name, ro: "", ru: "" }
          : project.name
        : createEmptyMultilingualText(),
      description: project?.description
        ? typeof project.description === "string"
          ? { en: project.description, ro: "", ru: "" }
          : project.description
        : createEmptyMultilingualText(),
      status: project?.status || "planned",
      startDate: project?.startDate ? new Date(project.startDate) : undefined,
      endDate: project?.endDate ? new Date(project.endDate) : undefined,
      partners: project?.partners
        ? project.partners
            .map((p) => (typeof p === "object" ? p._id : p))
            .filter(Boolean)
        : [],
      documents: project?.documents || [],
      tags: project?.tags || [],
    },
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoadingPartners(true);
      const partnersData = await partnersApi.getAll();
      setPartners(partnersData);
    } catch (error) {
      console.error("Failed to load partners:", error);
    } finally {
      setLoadingPartners(false);
    }
  };

  const watchedTags = watch("tags");
  const watchedDocuments = watch("documents");
  const watchedPartners = watch("partners");

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue("tags", [...watchedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const base64Files = await Promise.all(
        Array.from(files).map(async (file) => {
          const base64 = await convertFileToBase64(file);
          return base64;
        }),
      );
      setValue("documents", [...watchedDocuments, ...base64Files]);
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setValue(
      "documents",
      watchedDocuments.filter((_, i) => i !== index),
    );
  };

  const onFormSubmit = (data: FormData) => {
    const projectData = {
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      partners: data.partners as any,
      documents: data.documents,
      tags: data.tags,
    };
    onSubmit(projectData as Omit<Project, "_id">);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 w-full max-w-none"
    >
      {/* Project Name */}
      <div className="space-y-2 w-full">
        <Label className="text-wrap break-words">{t("projectName")} *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={t("projectNamePlaceholder")}
                {...register(`name.${language}`, {
                  required:
                    language === "en" ? t("projectNameRequired") : false,
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

      {/* Project Description */}
      <div className="space-y-2 w-full">
        <Label className="text-wrap break-words">{tc("description")} *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={t("descriptionPlaceholder")}
                rows={4}
                {...register(`description.${language}`, {
                  required:
                    language === "en" ? t("descriptionRequired") : false,
                })}
              />
              {errors.description?.[language] && (
                <p className="text-sm text-destructive">
                  {errors.description[language]?.message}
                </p>
              )}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Status */}
      <div className="space-y-2 w-full">
        <Label className="text-wrap break-words">{tc("status")} *</Label>
        <Controller
          name="status"
          control={control}
          rules={{ required: t("statusRequired") }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">{t("statuses.planned")}</SelectItem>
                <SelectItem value="ongoing">{t("statuses.ongoing")}</SelectItem>
                <SelectItem value="completed">
                  {t("statuses.completed")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-2 w-full overflow-hidden">
        <div className="space-y-2 w-full min-w-0">
          <Label className="text-wrap break-words">{tc("startDate")}</Label>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: t("startDateRequired") }}
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                showTime={false}
                placeholder={tc("startDate")}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive text-wrap break-words">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2 w-full min-w-0">
          <Label className="text-wrap break-words">{tc("endDate")}</Label>
          <Controller
            name="endDate"
            control={control}
            rules={{ required: t("endDateRequired") }}
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                showTime={false}
                placeholder={tc("endDate")}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive text-wrap break-words">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2 w-full">
        <Label className="text-wrap break-words">{t("tagsOptional")}</Label>
        <div className="flex gap-2 w-full">
          <Input
            placeholder={t("tagsPlaceholder")}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            className="flex-shrink-0"
          >
            {tc("add")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {watchedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Partners Selection */}
      <div className="space-y-2 w-full">
        <Label className="text-wrap break-words">{tc("partners")}</Label>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm text-wrap break-words">
              {t("selectPartners")}
            </CardTitle>
            <CardDescription className="text-wrap break-words">
              {t("selectPartners")}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            {loadingPartners ? (
              <div className="text-sm text-muted-foreground">
                {tc("loading")}...
              </div>
            ) : partners.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("noPartnersFound")}
              </div>
            ) : (
              <div className="space-y-3">
                <Input placeholder={t("searchPartners")} className="mb-3" />
                {partners.map((partner) => (
                  <Controller
                    key={partner._id}
                    name="partners"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={`partner-${partner._id}`}
                          checked={field.value.includes(partner._id!)}
                          onCheckedChange={(checked) => {
                            const currentPartners = field.value;
                            if (checked) {
                              field.onChange([
                                ...currentPartners,
                                partner._id!,
                              ]);
                            } else {
                              field.onChange(
                                currentPartners.filter(
                                  (id) => id !== partner._id,
                                ),
                              );
                            }
                          }}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-8 w-8">
                            {partner.logo && (
                              <AvatarImage
                                src={partner.logo || "/placeholder.svg"}
                                alt={getLocalizedText(partner.name, language)}
                              />
                            )}
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getLocalizedText(partner.name, language)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1.5 leading-none flex-1">
                            <label
                              htmlFor={`partner-${partner._id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {getLocalizedText(partner.name, language)}
                            </label>
                            {partner.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {getLocalizedText(
                                  partner.description,
                                  language,
                                )}
                              </p>
                            )}
                            {partner.website && (
                              <a
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tc("visitWebsite")}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
            )}
            {watchedPartners.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium mb-2">
                  {tc("selectedPartners", { count: watchedPartners.length })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedPartners.map((partnerId) => {
                    const partner = partners.find((p) => p._id === partnerId);
                    return partner ? (
                      <Badge
                        key={partnerId}
                        variant="secondary"
                        className="gap-1"
                      >
                        <Users className="h-3 w-3" />
                        {getLocalizedText(partner.name, language)}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <div className="space-y-2 w-full">
        <Label className="text-wrap break-words">
          {t("documentsOptional")}
        </Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="document-upload"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="document-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {uploading ? tc("uploading") : t("uploadDocuments")}
            </p>
          </label>
        </div>
        {watchedDocuments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {watchedDocuments.length === 0
                ? t("noDocumentsSelected")
                : t("documentsSelected", { count: watchedDocuments.length })}
            </p>
            {watchedDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm">
                    {tc("document")} {index + 1}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 flex-wrap w-full">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-wrap break-words"
        >
          {tc("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || uploading}
          className="text-wrap break-words"
        >
          {isSubmitting
            ? project
              ? t("updating")
              : t("creating")
            : project
              ? t("updateProject")
              : t("createProject")}
        </Button>
      </div>
    </form>
  );
}
