import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Normalize UploadThing client upload callback payload to a public URL */
export function uploadThingResultToUrl(res) {
  try {
    if (Array.isArray(res) && res.length > 0) {
      const file = res[0];
      return file?.key ? `https://utfs.io/f/${file.key}` : file?.url || file?.serverData?.url || null;
    }
    if (res && typeof res === "object" && !Array.isArray(res)) {
      return res.key ? `https://utfs.io/f/${res.key}` : res.url || res.serverData?.url || null;
    }
  } catch {
    /* ignore */
  }
  return null;
}
