import { apiRequest, API_BASE } from "./api";
export async function uploadImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type))
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose an image smaller than 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to process this image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.75);
    if (data.length > 660000)
      throw new Error("This image is too large. Choose a smaller photo.");
    const result = await apiRequest<{ path: string }>(
      "/uploads/images",
      "POST",
      { data },
    );
    return result.path.startsWith("https://") ? result.path : API_BASE + result.path;
  } finally {
    bitmap.close();
  }
}
