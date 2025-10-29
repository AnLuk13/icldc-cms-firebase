"use client"

import type React from "react"
import { useTranslations } from "next-intl"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"
import type { Language, MultilingualText } from "@/lib/types"

interface LanguageTabsProps {
  children: (language: Language) => React.ReactNode
  defaultLanguage?: Language
}

const languages: { code: Language; nameKey: string; flag: string }[] = [
  { code: "en", nameKey: "english", flag: "🇺🇸" },
  { code: "ro", nameKey: "romanian", flag: "🇷🇴" },
  { code: "ru", nameKey: "russian", flag: "🇷🇺" },
]

export function LanguageTabs({ children, defaultLanguage }: LanguageTabsProps) {
  const { language } = useAppStore()
  const t = useTranslations("language")
  const activeLanguage = defaultLanguage || language

  return (
    <Tabs defaultValue={activeLanguage} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {languages.map((lang) => (
          <TabsTrigger key={lang.code} value={lang.code} className="gap-2">
            <span>{lang.flag}</span>
            <span className="hidden sm:inline">{t(lang.nameKey)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {languages.map((lang) => (
        <TabsContent key={lang.code} value={lang.code} className="mt-4">
          {children(lang.code)}
        </TabsContent>
      ))}
    </Tabs>
  )
}

// Helper function to get text in current language
export function getLocalizedText(text: MultilingualText | string, language: Language): string {
  if (typeof text === "string") return text
  return text[language] || text.en || Object.values(text)[0] || ""
}

// Helper function to create empty multilingual text
export function createEmptyMultilingualText(): MultilingualText {
  return { en: "", ro: "", ru: "" }
}
