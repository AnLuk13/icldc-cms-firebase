"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Upload, X } from "lucide-react"
import { LanguageTabs } from "@/components/language-tabs"

const homeContentSchema = z.object({
  heroTitle: z.object({
    ro: z.string().min(1, "Title is required"),
    ru: z.string().min(1, "Title is required"),
    en: z.string().min(1, "Title is required"),
  }),
  heroSubtitle: z.object({
    ro: z.string().min(1, "Subtitle is required"),
    ru: z.string().min(1, "Subtitle is required"),
    en: z.string().min(1, "Subtitle is required"),
  }),
  heroDescription: z.object({
    ro: z.string().min(1, "Description is required"),
    ru: z.string().min(1, "Description is required"),
    en: z.string().min(1, "Description is required"),
  }),
  aboutTitle: z.object({
    ro: z.string().min(1, "About title is required"),
    ru: z.string().min(1, "About title is required"),
    en: z.string().min(1, "About title is required"),
  }),
  aboutContent: z.object({
    ro: z.string().min(1, "About content is required"),
    ru: z.string().min(1, "About content is required"),
    en: z.string().min(1, "About content is required"),
  }),
  metaTitle: z.object({
    ro: z.string().min(1, "Meta title is required"),
    ru: z.string().min(1, "Meta title is required"),
    en: z.string().min(1, "Meta title is required"),
  }),
  metaDescription: z.object({
    ro: z.string().min(1, "Meta description is required"),
    ru: z.string().min(1, "Meta description is required"),
    en: z.string().min(1, "Meta description is required"),
  }),
  heroImage: z.string().optional(),
  aboutImage: z.string().optional(),
})

type HomeContentForm = z.infer<typeof homeContentSchema>

export default function HomeContentPage() {
  const [activeLanguage, setActiveLanguage] = useState<"ro" | "ru" | "en">("ro")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null)
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<HomeContentForm>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: {
      heroTitle: { ro: "", ru: "", en: "" },
      heroSubtitle: { ro: "", ru: "", en: "" },
      heroDescription: { ro: "", ru: "", en: "" },
      aboutTitle: { ro: "", ru: "", en: "" },
      aboutContent: { ro: "", ru: "", en: "" },
      metaTitle: { ro: "", ru: "", en: "" },
      metaDescription: { ro: "", ru: "", en: "" },
      heroImage: "",
      aboutImage: "",
    },
  })

  const heroImage = watch("heroImage")
  const aboutImage = watch("aboutImage")

  useEffect(() => {
    loadHomeContent()
  }, [])

  useEffect(() => {
    if (heroImage) {
      setHeroImagePreview(heroImage)
    }
  }, [heroImage])

  useEffect(() => {
    if (aboutImage) {
      setAboutImagePreview(aboutImage)
    }
  }, [aboutImage])

  const loadHomeContent = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/home-content")
      if (response.ok) {
        const data = await response.json()
        reset(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load home content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, field: "heroImage" | "aboutImage") => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setValue(field, base64)
        if (field === "heroImage") {
          setHeroImagePreview(base64)
        } else {
          setAboutImagePreview(base64)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (field: "heroImage" | "aboutImage") => {
    setValue(field, "")
    if (field === "heroImage") {
      setHeroImagePreview(null)
    } else {
      setAboutImagePreview(null)
    }
  }

  const onSubmit = async (data: HomeContentForm) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/home-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Home content updated successfully",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save home content",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home Content</h1>
        <p className="text-muted-foreground">Manage your website's homepage content and SEO settings</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <LanguageTabs activeLanguage={activeLanguage} onLanguageChange={setActiveLanguage} />

        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Main banner content that appears at the top of your homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`heroTitle-${activeLanguage}`}>Hero Title</Label>
                <Input
                  id={`heroTitle-${activeLanguage}`}
                  {...register(`heroTitle.${activeLanguage}`)}
                  placeholder="Enter hero title"
                />
                {errors.heroTitle?.[activeLanguage] && (
                  <p className="text-sm text-destructive">{errors.heroTitle[activeLanguage]?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`heroSubtitle-${activeLanguage}`}>Hero Subtitle</Label>
                <Input
                  id={`heroSubtitle-${activeLanguage}`}
                  {...register(`heroSubtitle.${activeLanguage}`)}
                  placeholder="Enter hero subtitle"
                />
                {errors.heroSubtitle?.[activeLanguage] && (
                  <p className="text-sm text-destructive">{errors.heroSubtitle[activeLanguage]?.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`heroDescription-${activeLanguage}`}>Hero Description</Label>
              <Textarea
                id={`heroDescription-${activeLanguage}`}
                {...register(`heroDescription.${activeLanguage}`)}
                placeholder="Enter hero description"
                rows={4}
              />
              {errors.heroDescription?.[activeLanguage] && (
                <p className="text-sm text-destructive">{errors.heroDescription[activeLanguage]?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hero Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("hero-image-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="hero-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "heroImage")}
                />
                {heroImagePreview && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeImage("heroImage")}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              {heroImagePreview && (
                <div className="mt-2">
                  <img
                    src={heroImagePreview || "/placeholder.svg"}
                    alt="Hero preview"
                    className="h-32 w-auto rounded-md border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
            <CardDescription>Information about your organization or company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`aboutTitle-${activeLanguage}`}>About Title</Label>
              <Input
                id={`aboutTitle-${activeLanguage}`}
                {...register(`aboutTitle.${activeLanguage}`)}
                placeholder="Enter about section title"
              />
              {errors.aboutTitle?.[activeLanguage] && (
                <p className="text-sm text-destructive">{errors.aboutTitle[activeLanguage]?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`aboutContent-${activeLanguage}`}>About Content</Label>
              <Textarea
                id={`aboutContent-${activeLanguage}`}
                {...register(`aboutContent.${activeLanguage}`)}
                placeholder="Enter about section content"
                rows={6}
              />
              {errors.aboutContent?.[activeLanguage] && (
                <p className="text-sm text-destructive">{errors.aboutContent[activeLanguage]?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>About Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("about-image-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="about-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "aboutImage")}
                />
                {aboutImagePreview && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeImage("aboutImage")}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              {aboutImagePreview && (
                <div className="mt-2">
                  <img
                    src={aboutImagePreview || "/placeholder.svg"}
                    alt="About preview"
                    className="h-32 w-auto rounded-md border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Meta tags and SEO information for your homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`metaTitle-${activeLanguage}`}>Meta Title</Label>
              <Input
                id={`metaTitle-${activeLanguage}`}
                {...register(`metaTitle.${activeLanguage}`)}
                placeholder="Enter meta title for SEO"
              />
              {errors.metaTitle?.[activeLanguage] && (
                <p className="text-sm text-destructive">{errors.metaTitle[activeLanguage]?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`metaDescription-${activeLanguage}`}>Meta Description</Label>
              <Textarea
                id={`metaDescription-${activeLanguage}`}
                {...register(`metaDescription.${activeLanguage}`)}
                placeholder="Enter meta description for SEO"
                rows={3}
              />
              {errors.metaDescription?.[activeLanguage] && (
                <p className="text-sm text-destructive">{errors.metaDescription[activeLanguage]?.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
