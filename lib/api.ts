import { auth } from "@/lib/firebase/client";
import type { Project, Partner, Event, News, User } from "./types";

const API_BASE = "/api";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Always get a fresh (auto-refreshed) ID token from the Firebase client SDK
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

// Projects API
export const projectsApi = {
  getAll: () => fetchAPI<Project[]>("/projects"),
  getById: (id: string) => fetchAPI<Project>(`/projects/${id}`),
  create: (project: Omit<Project, "_id">) =>
    fetchAPI<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    }),
  update: (id: string, project: Partial<Project>) =>
    fetchAPI<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),
};

// Partners API
export const partnersApi = {
  getAll: () => fetchAPI<Partner[]>("/partners"),
  getById: (id: string) => fetchAPI<Partner>(`/partners/${id}`),
  create: (partner: Omit<Partner, "_id">) =>
    fetchAPI<Partner>("/partners", {
      method: "POST",
      body: JSON.stringify(partner),
    }),
  update: (id: string, partner: Partial<Partner>) =>
    fetchAPI<Partner>(`/partners/${id}`, {
      method: "PUT",
      body: JSON.stringify(partner),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/partners/${id}`, { method: "DELETE" }),
};

// Events API
export const eventsApi = {
  getAll: () => fetchAPI<Event[]>("/events"),
  getById: (id: string) => fetchAPI<Event>(`/events/${id}`),
  create: (event: Omit<Event, "_id">) =>
    fetchAPI<Event>("/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  update: (id: string, event: Partial<Event>) =>
    fetchAPI<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/events/${id}`, { method: "DELETE" }),
};

// News API
export const newsApi = {
  getAll: () => fetchAPI<News[]>("/news"),
  getById: (id: string) => fetchAPI<News>(`/news/${id}`),
  create: (news: Omit<News, "_id">) =>
    fetchAPI<News>("/news", {
      method: "POST",
      body: JSON.stringify(news),
    }),
  update: (id: string, news: Partial<News>) =>
    fetchAPI<News>(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(news),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/news/${id}`, { method: "DELETE" }),
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
  // Login page calls signInWithEmailAndPassword client-side first, then passes
  // the ID token here to create an httpOnly session cookie + get Firestore user data.
  login: (idToken: string) =>
    fetchAPI<{ user: User; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
  logout: () =>
    fetchAPI<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => fetchAPI<{ user: User }>("/auth/me"),
};

// Home Content API
export const homeContentApi = {
  get: () => fetchAPI<any>("/home-content"),
  update: (content: any) =>
    fetchAPI<any>("/home-content", {
      method: "PUT",
      body: JSON.stringify(content),
    }),
};

/**
 * Upload a file to Firebase Storage via the /api/upload route.
 * Returns the public Storage URL.
 */
export async function uploadToStorage(
  file: File,
  folder: string,
): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }

  const { url } = await response.json();
  return url as string;
}

/**
 * Delete a file from Firebase Storage via the /api/upload/delete route.
 * No-ops for non-Storage URLs (e.g. base64 data URLs from older records).
 */
export async function deleteFromStorage(url: string): Promise<void> {
  if (!url?.startsWith("https://storage.googleapis.com")) return;
  const token = await auth.currentUser?.getIdToken();
  await fetch("/api/upload/delete", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ url }),
  });
}

// Users API
export const usersApi = {
  getAll: () => fetchAPI<User[]>("/users"),
  getById: (id: string) => fetchAPI<User>(`/users/${id}`),
  create: (user: Omit<User, "_id">) =>
    fetchAPI<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),
  update: (id: string, user: Partial<User>) =>
    fetchAPI<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
};

/**
 * Upload a file to Firebase Storage via the /api/upload route.
 * Returns the public download URL.
 */
export async function uploadFileToStorage(
  file: File,
  folder = "uploads",
): Promise<string> {
  const token = await auth.currentUser?.getIdToken();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // Do NOT set Content-Type — fetch sets it automatically with the correct boundary
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || error.message || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}
