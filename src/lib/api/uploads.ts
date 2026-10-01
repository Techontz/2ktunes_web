import { request } from "./client";
import type { UploadKind, UploadSession } from "./types";

/**
 * Resumable upload sessions (DOCS/API.md → "Resumable uploads";
 * UploadController + UploadSessionService on the backend).
 *
 *   POST /uploads                       {kind, filename, size, mime?, sha256?, chunk_size?}
 *   PUT  /uploads/{id}/chunks/{index}   raw bytes, application/octet-stream (idempotent)
 *   GET  /uploads/{id}                  → received_chunks, to resume
 *   POST /uploads/{id}/complete         → assembled, SHA-256 verified, inspected
 */

export async function createUploadSession(input: {
  kind: UploadKind;
  filename: string;
  size: number;
  mime?: string | null;
  sha256?: string | null;
  chunk_size?: number;
}): Promise<UploadSession> {
  const res = await request<{ upload: UploadSession }>("/uploads", {
    method: "POST",
    body: { ...input, mime: input.mime || undefined, sha256: input.sha256 || undefined },
  });
  return res.upload;
}

export async function getUploadSession(id: string, signal?: AbortSignal): Promise<UploadSession> {
  const res = await request<{ upload: UploadSession }>(`/uploads/${encodeURIComponent(id)}`, { signal });
  return res.upload;
}

export async function putUploadChunk(
  id: string,
  index: number,
  bytes: Blob | ArrayBuffer,
  signal?: AbortSignal,
): Promise<UploadSession> {
  const res = await request<{ upload: UploadSession }>(`/uploads/${encodeURIComponent(id)}/chunks/${index}`, {
    method: "PUT",
    body: bytes,
    signal,
  });
  return res.upload;
}

export async function completeUploadSession(id: string): Promise<UploadSession> {
  const res = await request<{ upload: UploadSession }>(`/uploads/${encodeURIComponent(id)}/complete`, {
    method: "POST",
  });
  return res.upload;
}
