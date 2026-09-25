"use server";

import { requireAdmin } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * `file.type` is just a label the browser attached to the upload request -
 * nothing stops a request from claiming "image/png" for a file that's
 * actually something else entirely (an HTML page, a script), which some
 * browsers or misconfigured servers can then be tricked into executing
 * from the /uploads/ path. Checking the first few bytes against each
 * format's real signature confirms the file itself, not just its label,
 * is one of the four formats this uploader is meant to accept.
 */
function sniffImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export async function uploadImage(
  formData: FormData,
  folder: "products" | "categories" = "products"
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided" };
  if (file.size > MAX_SIZE) return { error: "Image must be under 5MB" };
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { error: "Use a JPG, PNG, WEBP, or GIF image" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);
  if (!sniffed || sniffed !== file.type) {
    return { error: "That file doesn't look like a valid JPG, PNG, WEBP, or GIF image" };
  }

  const filename = `${randomUUID()}.${ext}`;

  // Vercel's serverless functions run on a read only (or at best ephemeral,
  // per instance) filesystem, so a runtime upload written to public/uploads
  // would vanish on the very next request or cold start. When a Blob store
  // is connected (BLOB_READ_WRITE_TOKEN is set, which Vercel injects
  // automatically once one is linked to the project) uploads go there
  // instead. Without it, such as in plain local development, this falls
  // back to the original disk write.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
    });
    return { url: blob.url };
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/uploads/${folder}/${filename}` };
}
