/**
 * localStorage keys that remember in-progress upload sessions (see
 * chunkedUpload.ts). Kept in its own tiny module so the auth provider can
 * clear them on sign-out without pulling the upload engine into the main
 * bundle.
 */
export const RESUME_KEY_PREFIX = "2ktunes.upload.";

/** Forgets every remembered upload session (called on explicit sign-out). */
export function clearResumeKeys(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(RESUME_KEY_PREFIX)) doomed.push(k);
    }
    for (const k of doomed) localStorage.removeItem(k);
  } catch {
    /* storage blocked: nothing was persisted */
  }
}
