"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, ImageIcon } from "lucide-react"
import { LanguageTabs, createEmptyMultilingualText } from "@/components/language-tabs"
import { convertFileToBase64 } from "@/lib/api"
import type { Event, Language, MultilingualText } from "@/lib/types"

interface EventFormProps {
  event?: Event | null
  onSubmit: (data: Omit<Event, "_id">) => void
  onCancel: () => void
}

interface FormData {
  name: MultilingualText
  description: MultilingualText
  location: string
  startDate: string
  endDate: string
  organizer: string
  registrationLink: string
  bannerImage: string
  tags: string[]
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
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
      name: event?.name
        ? typeof event.name === "string"
          ? { en: event.name, ro: "", ru: "" }
          : event.name
        : createEmptyMultilingualText(),
      description: event?.description
        ? typeof event.description === "string"
          ? { en: event.description, ro: "", ru: "" }
          : event.description
        : createEmptyMultilingualText(),
      location: event?.location || "",
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      organizer: event?.organizer || "",
      registrationLink: event?.registrationLink || "",
      bannerImage: event?.bannerImage || "",
      tags: event?.tags || [],
    },
  })

  const watchedTags = watch("tags")
  const watchedBannerImage = watch("bannerImage")

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

  const onFormSubmit = (data: FormData) => {
    const eventData: Omit<Event, "_id"> = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      location: data.location || undefined,
      organizer: data.organizer || undefined,
      registrationLink: data.registrationLink || undefined,
      bannerImage: data.bannerImage || undefined,
    }
    onSubmit(eventData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2">
        <Label>Event Name *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={`Enter event name in ${language.toUpperCase()}`}
                {...register(`name.${language}`, {
                  required: language === "en" ? "English name is required" : false,
                })}
              />
              {errors.name?.[language] && <p className="text-sm text-destructive">{errors.name[language]?.message}</p>}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Event Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={`Enter event description in ${language.toUpperCase()}`}
                rows={4}
                {...register(`description.${language}`)}
              />
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Location and Organizer */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Location</Label>
          <Input placeholder="Event location or 'Online'" {...register("location")} />
        </div>

        <div className="space-y-2">
          <Label>Organizer</Label>
          <Input placeholder="Event organizer" {...register("organizer")} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Start Date & Time *</Label>
          <Input
            type="datetime-local"
            {...register("startDate", {
              required: "Start date is required",
            })}
          />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>End Date & Time</Label>
          <Input type="datetime-local" {...register("endDate")} />
        </div>
      </div>

      {/* Registration Link */}
      <div className="space-y-2">
        <Label>Registration Link</Label>
        <Input
          type="url"
          placeholder="https://example.com/register"
          {...register("registrationLink", {
            pattern: {
              value: /^https?:\/\/.+/,
              message: "Please enter a valid URL starting with http:// or https://",
            },
          })}
        />
        {errors.registrationLink && <p className="text-sm text-destructive">{errors.registrationLink.message}</p>}
      </div>

      {/* Banner Image */}
      <div className="space-y-2">
        <Label>Banner Image</Label>
        {watchedBannerImage ? (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={watchedBannerImage || "/placeholder.svg"}
                alt="Event banner"
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

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  )
}
