import type { Project, Partner, Event, News } from "./types"

// API Error class for better error handling
export class ApiError extends Error {
  public status: number
  public data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

// Generic API helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies in requests
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new ApiError(error.message || `HTTP ${response.status}`, response.status, error)
  }

  return response.json()
}

// Projects API
export const projectsApi = {
  getAll: () => apiRequest<Project[]>("/projects"),
  getById: (id: string) => apiRequest<Project>(`/projects/${id}`),
  create: (project: Omit<Project, "_id">) =>
    apiRequest<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    }),
  update: (id: string, project: Partial<Project>) =>
    apiRequest<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/projects/${id}`, {
      method: "DELETE",
    }),
}

// Partners API
export const partnersApi = {
  getAll: () => apiRequest<Partner[]>("/partners"),
  getById: (id: string) => apiRequest<Partner>(`/partners/${id}`),
  create: (partner: Omit<Partner, "_id">) =>
    apiRequest<Partner>("/partners", {
      method: "POST",
      body: JSON.stringify(partner),
    }),
  update: (id: string, partner: Partial<Partner>) =>
    apiRequest<Partner>(`/partners/${id}`, {
      method: "PUT",
      body: JSON.stringify(partner),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/partners/${id}`, {
      method: "DELETE",
    }),
}

// Events API
export const eventsApi = {
  getAll: () => apiRequest<Event[]>("/events"),
  getById: (id: string) => apiRequest<Event>(`/events/${id}`),
  create: (event: Omit<Event, "_id">) =>
    apiRequest<Event>("/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  update: (id: string, event: Partial<Event>) =>
    apiRequest<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/events/${id}`, {
      method: "DELETE",
    }),
}

// News API
export const newsApi = {
  getAll: () => apiRequest<News[]>("/news"),
  getById: (id: string) => apiRequest<News>(`/news/${id}`),
  create: (news: Omit<News, "_id">) =>
    apiRequest<News>("/news", {
      method: "POST",
      body: JSON.stringify(news),
    }),
  update: (id: string, news: Partial<News>) =>
    apiRequest<News>(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(news),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/news/${id}`, {
      method: "DELETE",
    }),
}

// File upload helper
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Authentication API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ user: any; token: string; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    }),
}

// Home Content API  
export const homeContentApi = {
  get: () => apiRequest<any>("/home-content"),
  update: (content: any) =>
    apiRequest<any>("/home-content", {
      method: "PUT",
      body: JSON.stringify(content),
    }),
}
