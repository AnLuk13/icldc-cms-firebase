import { getAdminStorage } from "@/lib/firebase/admin";
import { randomUUID } from "crypto";
import path from "path";

/**
 * Upload a file (Buffer or File object or base64 string) to Firebase Storage.
 * Returns the public URL.
 */
export async function uploadFile(
  fileBuffer: Buffer | File | string,
  originalName: string,
  folder: string,
): Promise<string> {
  const bucket = getAdminStorage().bucket();
  const ext =
    typeof originalName === "string" ? path.extname(originalName) : "";
  const filePath = `${folder}/${randomUUID()}${ext}`;
  const fileRef = bucket.file(filePath);

  let buffer: Buffer;
  let contentType: string;

  if (typeof fileBuffer === "string") {
    // base64 data URL — any MIME type (image, pdf, doc, etc.)
    const match = fileBuffer.match(/^data:([^;]+);base64,/);
    contentType = match?.[1] ?? "application/octet-stream";
    const base64Data = fileBuffer.replace(/^data:[^;]+;base64,/, "");
    buffer = Buffer.from(base64Data, "base64");
  } else if (fileBuffer instanceof File) {
    buffer = Buffer.from(await fileBuffer.arrayBuffer());
    contentType = fileBuffer.type;
  } else {
    buffer = fileBuffer;
    contentType = getContentType(ext);
  }

  await fileRef.save(buffer, { metadata: { contentType } });
  await fileRef.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}

/**
 * Delete a file from Firebase Storage by its public URL.
 * Silently ignores missing files.
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  if (!publicUrl) return;
  try {
    const bucket = getAdminStorage().bucket();
    const prefix = `https://storage.googleapis.com/${bucket.name}/`;
    if (!publicUrl.startsWith(prefix)) return;
    const filePath = publicUrl.slice(prefix.length);
    if (!filePath) return;
    const fileRef = bucket.file(filePath);
    const [exists] = await fileRef.exists();
    if (exists) await fileRef.delete();
  } catch (error) {
    console.error("Delete file error:", error);
    // Allow callers to continue even if delete fails
  }
}

function getContentType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}
