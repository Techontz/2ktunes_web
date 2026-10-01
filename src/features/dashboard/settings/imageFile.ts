/**
 * Client-side checks for avatar uploads, mirroring the backend rules
 * (ProfileController@avatar: jpg/png/webp ≤4 MB ≥100 px; ArtistController@avatar:
 * jpg/png/webp ≤6 MB ≥300 px) so people get an instant, specific message
 * instead of a round trip. The server still validates.
 */

export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const AVATAR_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

type ImageProblem = "type" | "size" | "dimensions" | "unreadable";

function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/** Resolves null when the file is fine, otherwise the first problem found. */
export async function checkImage(
  file: File,
  { maxBytes, minPx }: { maxBytes: number; minPx: number },
): Promise<ImageProblem | null> {
  if (!AVATAR_TYPES.includes(file.type)) return "type";
  if (file.size > maxBytes) return "size";
  const dims = await readDimensions(file);
  if (!dims) return "unreadable";
  if (dims.width < minPx || dims.height < minPx) return "dimensions";
  return null;
}
