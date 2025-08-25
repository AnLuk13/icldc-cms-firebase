"use client"

import type React from "react"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Upload, File } from "lucide-react"
import { LanguageTabs, createEmptyMultilingualText } from "@/components/language-tabs"
import { convertFileToBase64 } from "@/lib/api"
import type { Project, Language, MultilingualText } from "@/lib/types"

interface ProjectFormProps {
  project?: Project | null
  onSubmit: (data: Omit<Project, "_id">) => void
  onCancel: () => void
}

interface FormData {
  name: MultilingualText
  description: MultilingualText
  status: "ongoing" | "completed" | "planned"
  startDate: string
  endDate: string
  partners: string[]
  documents: string[]
  tags: string[]
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [tagInput, setTagInput] = useState("")
  const [uploading, setUploading] = useState(false)

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
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
      partners: project?.partners || [],
      documents: project?.documents || [],
      tags: project?.tags || [],
    },
  })

  const watchedTags = watch("tags")
  const watchedDocuments = watch("documents")

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue("tags", [...watchedTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    try {
      const base64Files = await Promise.all(
        Array.from(files).map(async (file) => {
          const base64 = await convertFileToBase64(file)
          return base64
        }),
      )
      setValue("documents", [...watchedDocuments, ...base64Files])
    } catch (error) {
      console.error("File upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveDocument = (index: number) => {
    setValue(
      "documents",
      watchedDocuments.filter((_, i) => i !== index),
    )
  }

  const onFormSubmit = (data: FormData) => {
    const projectData: Omit<Project, "_id"> = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    }
    onSubmit(projectData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Project Name */}
      <div className="space-y-2">
        <Label>Project Name *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={`Enter project name in ${language.toUpperCase()}`}
                {...register(`name.${language}`, {
                  required: language === "en" ? "English name is required" : false,
                })}
              />
              {errors.name?.[language] && <p className="text-sm text-destructive">{errors.name[language]?.message}</p>}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <Label>Description *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={`Enter project description in ${language.toUpperCase()}`}
                rows={4}
                {...register(`description.${language}`, {
                  required: language === "en" ? "English description is required" : false,
                })}
              />
              {errors.description?.[language] && (
                <p className="text-sm text-destructive">{errors.description[language]?.message}</p>
              )}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Status and Dates */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status *</Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" {...register("startDate")} />
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" {...register("endDate")} />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {watchedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-2">
        <Label>Documents</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="document-upload"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <label htmlFor="document-upload" className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload documents"}</p>
          </label>
        </div>
        {watchedDocuments.length > 0 && (
          <div className="space-y-2">
            {watchedDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm">Document {index + 1}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDocument(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  )
}
