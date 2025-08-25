"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, ImageIcon, Upload, File } from "lucide-react"
import { LanguageTabs, createEmptyMultilingualText } from "@/components/language-tabs"
import { convertFileToBase64 } from "@/lib/api"
import type { News, Language, MultilingualText } from "@/lib/types"

interface NewsFormProps {
  news?: News | null
  onSubmit: (data: Omit<News, "_id">) => void
  onCancel: () => void
}

interface FormData {
  name: MultilingualText
  content: MultilingualText
  summary: MultilingualText
  author: string
  category: string
  tags: string[]
  publishedAt: string
  bannerImage: string
  documents: string[]
  publishNow: boolean
}

export function NewsForm({ news, onSubmit, onCancel }: NewsFormProps) {
  const [tagInput, setTagInput] = useState("")
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: news?.name
        ? typeof news.name === "string"
          ? { en: news.name, ro: "", ru: "" }
          : news.name
        : createEmptyMultilingualText(),
      content: news?.content
        ? typeof news.content === "string"
          ? { en: news.content, ro: "", ru: "" }
          : news.content
        : createEmptyMultilingualText(),
      summary: news?.summary
        ? typeof news.summary === "string"
          ? { en: news.summary, ro: "", ru: "" }
          : news.summary
        : createEmptyMultilingualText(),
      author: news?.author || "",
      category: news?.category || "",
      tags: news?.tags || [],
      publishedAt: news?.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : "",
      bannerImage: news?.bannerImage || "",
      documents: news?.documents || [],
      publishNow: false,
    },
  })

  const watchedTags = watch("tags")
  const watchedBannerImage = watch("bannerImage")
  const watchedDocuments = watch("documents")
  const watchedPublishNow = watch("publishNow")

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

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const base64 = await convertFileToBase64(file)
      setValue("bannerImage", base64)
    } catch (error) {
      console.error("Banner upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveBanner = () => {
    setValue("bannerImage", "")
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      console.error("Document upload error:", error)
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
    const newsData: Omit<News, "_id"> = {
      ...data,
      publishedAt: data.publishNow
        ? new Date()
        : data.publishedAt
          ? new Date(data.publishedAt)
          : news?.publishedAt
            ? new Date(news.publishedAt)
            : undefined,
      author: data.author || undefined,
      category: data.category || undefined,
      bannerImage: data.bannerImage || undefined,
    }
    onSubmit(newsData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Article Title */}
      <div className="space-y-2">
        <Label>Article Title *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={`Enter article title in ${language.toUpperCase()}`}
                {...register(`name.${language}`, {
                  required: language === "en" ? "English title is required" : false,
                })}
              />
              {errors.name?.[language] && <p className="text-sm text-destructive">{errors.name[language]?.message}</p>}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Article Summary */}
      <div className="space-y-2">
        <Label>Summary</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={`Enter article summary in ${language.toUpperCase()}`}
                rows={3}
                {...register(`summary.${language}`)}
              />
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Article Content */}
      <div className="space-y-2">
        <Label>Content *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={`Enter article content in ${language.toUpperCase()}`}
                rows={8}
                {...register(`content.${language}`, {
                  required: language === "en" ? "English content is required" : false,
                })}
              />
              {errors.content?.[language] && (
                <p className="text-sm text-destructive">{errors.content[language]?.message}</p>
              )}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Author and Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Author</Label>
          <Input placeholder="Article author" {...register("author")} />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Input placeholder="Article category" {...register("category")} />
        </div>
      </div>

      {/* Banner Image */}
      <div className="space-y-2">
        <Label>Banner Image</Label>
        {watchedBannerImage ? (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={watchedBannerImage || "/placeholder.svg"}
                alt="Article banner"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveBanner}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" id="banner-upload" />
            <label htmlFor="banner-upload" className="flex flex-col items-center justify-center cursor-pointer">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload banner image"}
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="space-y-2">
        <Label>Documents</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          <input
            type="file"
            multiple
            onChange={handleDocumentUpload}
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

      {/* Publishing Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="publishNow"
            checked={watchedPublishNow}
            onCheckedChange={(checked) => setValue("publishNow", !!checked)}
          />
          <Label htmlFor="publishNow">Publish immediately</Label>
        </div>

        {!watchedPublishNow && (
          <div className="space-y-2">
            <Label>Scheduled Publish Date</Label>
            <Input type="datetime-local" {...register("publishedAt")} />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving..." : news ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  )
}
