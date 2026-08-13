import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function saveImageUpload(file: File, folder: "expenses" | "investments") {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("请上传支付凭证图片");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("支付凭证必须是图片文件");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  const extension = extensionFromFile(file);
  const fileName = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return `/uploads/${folder}/${fileName}`;
}

function extensionFromFile(file: File) {
  const byName = path.extname(file.name || "").toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(byName)) return byName;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  return ".jpg";
}
