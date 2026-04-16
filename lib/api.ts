import axios, { AxiosRequestConfig, AxiosError } from "axios";
import type { Project, Partner, Event, News, User } from "./types";

// API Error class for better error handling
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Generic API helper
async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Request failed";
    const status = axiosError.response?.status || 500;
    throw new ApiError(errorMessage, status, axiosError.response?.data);
  }
}

// Projects API
export const projectsApi = {
  getAll: () => apiRequest<Project[]>("/projects"),
  getById: (id: string) => apiRequest<Project>(`/projects/${id}`),
  create: (project: Omit<Project, "_id">) =>
    apiRequest<Project>("/projects", {
      method: "POST",
      data: project,
    }),
  update: (id: string, project: Partial<Project>) =>
    apiRequest<Project>(`/projects/${id}`, {
      method: "PUT",
      data: project,
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// Partners API
export const partnersApi = {
  getAll: () => apiRequest<Partner[]>("/partners"),
  getById: (id: string) => apiRequest<Partner>(`/partners/${id}`),
  create: (partner: Omit<Partner, "_id">) =>
    apiRequest<Partner>("/partners", {
      method: "POST",
      data: partner,
    }),
  update: (id: string, partner: Partial<Partner>) =>
    apiRequest<Partner>(`/partners/${id}`, {
      method: "PUT",
      data: partner,
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/partners/${id}`, {
      method: "DELETE",
    }),
};

// Events API
export const eventsApi = {
  getAll: () => apiRequest<Event[]>("/events"),
  getById: (id: string) => apiRequest<Event>(`/events/${id}`),
  create: (event: Omit<Event, "_id">) =>
    apiRequest<Event>("/events", {
      method: "POST",
      data: event,
    }),
  update: (id: string, event: Partial<Event>) =>
    apiRequest<Event>(`/events/${id}`, {
      method: "PUT",
      data: event,
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/events/${id}`, {
      method: "DELETE",
    }),
};

// News API
export const newsApi = {
  getAll: () => apiRequest<News[]>("/news"),
  getById: (id: string) => apiRequest<News>(`/news/${id}`),
  create: (news: Omit<News, "_id">) =>
    apiRequest<News>("/news", {
      method: "POST",
      data: news,
    }),
  update: (id: string, news: Partial<News>) =>
    apiRequest<News>(`/news/${id}`, {
      method: "PUT",
      data: news,
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/news/${id}`, {
      method: "DELETE",
    }),
};

// File upload helper — raw base64 (for non-image files like PDFs)
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image file via Canvas before base64 encoding.
 * - Strips all EXIF / ICC / thumbnail metadata
 * - Re-encodes as JPEG at the given quality (0–1)
 * - Scales down proportionally if either dimension exceeds maxWidth / maxHeight
 */
export function compressImageToBase64(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Authentication API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ user: any; message: string }>("/auth/login", {
      method: "POST",
      data: credentials,
    }),
  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    }),
};

// Home Content API
export const homeContentApi = {
  get: () => apiRequest<any>("/home-content"),
  update: (content: any) =>
    apiRequest<any>("/home-content", {
      method: "PUT",
      data: content,
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest<User[]>("/users"),
  getById: (id: string) => apiRequest<User>(`/users/${id}`),
  create: (user: Omit<User, "_id">) =>
    apiRequest<User>("/users", {
      method: "POST",
      data: user,
    }),
  update: (id: string, user: Partial<User>) =>
    apiRequest<User>(`/users/${id}`, {
      method: "PUT",
      data: user,
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/users/${id}`, {
      method: "DELETE",
    }),
};
