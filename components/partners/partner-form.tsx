"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import { LanguageTabs, createEmptyMultilingualText } from "@/components/language-tabs"
import { convertFileToBase64 } from "@/lib/api"
import type { Partner, Language, MultilingualText } from "@/lib/types"

interface PartnerFormProps {
  partner?: Partner | null
  onSubmit: (data: Omit<Partner, "_id">) => void
  onCancel: () => void
}

interface FormData {
  name: MultilingualText
  description: MultilingualText
  logo: string
  website: string
  projects: string[]
}

export function PartnerForm({ partner, onSubmit, onCancel }: PartnerFormProps) {
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      projects: partner?.projects || [],
    },
  })

  const watchedLogo = watch("logo")
  const watchedName = watch("name")

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const base64 = await convertFileToBase64(file)
      setValue("logo", base64)
    } catch (error) {
      console.error("Logo upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setValue("logo", "")
  }

  const onFormSubmit = (data: FormData) => {
    const partnerData: Omit<Partner, "_id"> = {
      ...data,
      logo: data.logo || undefined,
      website: data.website || undefined,
    }
    onSubmit(partnerData)
  }

  const getPartnerInitials = () => {
    const name = typeof watchedName === "string" ? watchedName : watchedName.en || ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Partner Logo */}
      <div className="space-y-4">
        <Label>Partner Logo</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {watchedLogo && <AvatarImage src={watchedLogo || "/placeholder.svg"} alt="Partner logo" />}
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getPartnerInitials() || "PA"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload">
              <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Logo"}
                </span>
              </Button>
            </label>
            {watchedLogo && (
              <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo}>
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Partner Name */}
      <div className="space-y-2">
        <Label>Partner Name *</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={`Enter partner name in ${language.toUpperCase()}`}
                {...register(`name.${language}`, {
                  required: language === "en" ? "English name is required" : false,
                })}
              />
              {errors.name?.[language] && <p className="text-sm text-destructive">{errors.name[language]?.message}</p>}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Partner Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={`Enter partner description in ${language.toUpperCase()}`}
                rows={4}
                {...register(`description.${language}`)}
              />
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label>Website</Label>
        <Input
          type="url"
          placeholder="https://example.com"
          {...register("website", {
            pattern: {
              value: /^https?:\/\/.+/,
              message: "Please enter a valid URL starting with http:// or https://",
            },
          })}
        />
        {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving..." : partner ? "Update Partner" : "Create Partner"}
        </Button>
      </div>
    </form>
  )
}
