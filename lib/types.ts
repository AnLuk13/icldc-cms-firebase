export interface MultilingualText {
  ro: string
  ru: string
  en: string
}

export interface Project {
  _id?: string
  name: MultilingualText | string
  description: MultilingualText | string
  status: "ongoing" | "completed" | "planned"
  startDate?: Date
  endDate?: Date
  partners?: Partner[] // Partner IDs
  documents?: string[] // Base64 encoded files/reports
  tags?: string[] // e.g., ["legal", "research"]
  createdAt?: Date
  updatedAt?: Date
}

export interface Partner {
  _id?: string
  name: MultilingualText | string
  description?: MultilingualText | string
  logo?: string // Base64 encoded image
  website?: string
  projects?: Project[] // Array of Project IDs they are involved in
  createdAt?: Date
  updatedAt?: Date
}

export interface Event {
  _id?: string
  name: MultilingualText | string
  description?: MultilingualText | string
  location?: string // Physical or online
  startDate?: Date
  endDate?: Date
  organizer?: string // Partner or user organizing
  registrationLink?: string
  bannerImage?: string // Base64 encoded cover image
  tags?: string[] // e.g., ["conference", "webinar"]
  createdAt?: Date
  updatedAt?: Date
}

export interface News {
  _id?: string
  name: MultilingualText | string
  content: MultilingualText | string
  summary?: MultilingualText | string
  author?: string // User or partner name
  documents: string[] // Base64 encoded attachments
  category?: string // e.g., "Research", "Updates", "Events"
  tags?: string[]
  publishedAt?: Date
  bannerImage?: string // Base64 encoded image
  createdAt?: Date
  updatedAt?: Date
}

export interface User {
  _id?: string
  id?: string // For compatibility with NestJS response
  email: string
  password?: string // Hashed password
  name?: string
  role?: "admin" | "editor"
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface HomeContent {
  id: string
  heroTitle: MultilingualText
  heroSubtitle: MultilingualText
  heroDescription: MultilingualText
  aboutTitle: MultilingualText
  aboutContent: MultilingualText
  metaTitle: MultilingualText
  metaDescription: MultilingualText
  heroImage?: string // Base64 encoded image
  aboutImage?: string // Base64 encoded image
  createdAt: string
  updatedAt: string
}

export type Language = "ro" | "ru" | "en"
