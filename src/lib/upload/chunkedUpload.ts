import { ApiError } from "@/lib/api/client";
import type { UploadKind, UploadSession } from "@/lib/api/types";
import {
  completeUploadSession,
  createUploadSession,
  getUploadSession,
  putUploadChunk,
} from "@/lib/api/uploads";
import { RESUME_KEY_PREFIX } from "./resumeKeys";
import { Sha256 } from "./sha256";

/**
 * RESUMABLE, CHUNKED, CHECKSUMMED UPLOADS
 * =======================================
 *
 *   1. Hash    — the whole file is SHA-256'd slice by slice (constant memory).
 *   2. Session — POST /uploads {kind, filename, size, mime, sha256, chunk_size}.
 *                The server fixes `chunk_size` / `total_chunks`.
 *   3. Chunks  — PUT /uploads/{id}/chunks/{i} for every chunk the server does
 *                not have yet. Every chunk but the last is exactly chunk_size
 *                bytes. PUT is idempotent, so a failed chunk is simply retried
 *                (with back-off) — no duplicate data on the server.
 *   4. Complete — POST /uploads/{id}/complete. The server re-hashes the
 *                assembled file and rejects a mismatch (`checksum_mismatch`);
 *                if it reports chunks missing (`upload_incomplete`,
 *                `details.missing`) those are re-sent and completion retried.
 *
 * RESUME: the session id is remembered in localStorage under a key derived
 * from (kind, sha256, size). Picking the same file again — after a network
 * drop, a closed tab or a crash — finds the session, asks the server which
 * chunks it already has (GET /uploads/{id}) and sends only the rest. Sessions
 * expire server-side after 48 h; an expired/failed/unknown session silently
 * falls back to a fresh one.
 *
 * The API contract has one checksum: the whole-file `sha256` sent at session
 * creation and verified on completion. There is no per-chunk hash field.
 */

export type UploadPhase = "hashing" | "uploading" | "finalizing" | "done";

export type UploadProgress = {
  phase: UploadPhase;
  /** Bytes processed in the current phase. */
  loaded: number;
  total: number;
};

export type UploadApi = {
  create: typeof createUploadSession;
  get: typeof getUploadSession;
  put: typeof putUploadChunk;
  complete: typeof completeUploadSession;
};

const defaultApi: UploadApi = {
  create: createUploadSession,
  get: getUploadSession,
  put: putUploadChunk,
  complete: completeUploadSession,
};

/** A minimal key/value store (localStorage in the app, a Map in tests). */
export type ResumeStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

const browserResumeStore: ResumeStore = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage blocked: the upload still works, it just can't resume */
    }
  },
  remove: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

/** Preferred chunk size: small enough for flaky mobile links, ≥ the 256 KB server minimum. */
const DEFAULT_CHUNK_SIZE = 4 * 1024 * 1024;
export const MIN_CHUNK_SIZE = 256 * 1024;

type ChunkRange = { index: number; start: number; end: number };

/**
 * The byte ranges for a file of `size` split into `chunkSize` pieces — the
 * same arithmetic the server uses (`ceil(size / chunk)`, last chunk short).
 */
export function planChunks(size: number, chunkSize: number): ChunkRange[] {
  if (!Number.isInteger(size) || size <= 0) return [];
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) throw new Error("chunkSize must be a positive integer");
  const total = Math.ceil(size / chunkSize);
  return Array.from({ length: total }, (_, index) => {
    const start = index * chunkSize;
    return { index, start, end: Math.min(start + chunkSize, size) };
  });
}

/** Chunks the server does not have yet, in order. */
export function missingChunks(totalChunks: number, received: number[]): number[] {
  const have = new Set(received);
  const out: number[] = [];
  for (let i = 0; i < totalChunks; i++) if (!have.has(i)) out.push(i);
  return out;
}

export function resumeKey(kind: UploadKind, sha256: string, size: number): string {
  return `${RESUME_KEY_PREFIX}${kind}.${sha256}.${size}`;
}

function aborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");
}

function readSlice(blob: Blob, start: number, end: number): Promise<ArrayBuffer> {
  const slice = blob.slice(start, end);
  if (typeof slice.arrayBuffer === "function") return slice.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(slice);
  });
}

/** SHA-256 of a Blob/File, read in slices so memory stays bounded. */
export async function hashBlob(
  blob: Blob,
  {
    sliceSize = DEFAULT_CHUNK_SIZE,
    onProgress,
    signal,
  }: { sliceSize?: number; onProgress?: (loaded: number, total: number) => void; signal?: AbortSignal } = {},
): Promise<string> {
  const hasher = new Sha256();
  for (const r of planChunks(blob.size, sliceSize)) {
    aborted(signal);
    hasher.update(new Uint8Array(await readSlice(blob, r.start, r.end)));
    onProgress?.(r.end, blob.size);
  }
  return hasher.hex();
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Upload cancelled", "AbortError"));
      },
      { once: true },
    );
  });

/** Retry only what can succeed on retry: network drops, 5xx, 429. */
export function isRetryable(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return false;
  if (err instanceof ApiError) return err.isNetwork || err.status >= 500 || err.status === 429 || err.status === 0;
  return true;
}

type UploadOptions = {
  file: Blob & { name?: string; type?: string };
  kind: UploadKind;
  filename?: string;
  chunkSize?: number;
  onProgress?: (p: UploadProgress) => void;
  signal?: AbortSignal;
  /** Attempts per chunk (network/5xx), with exponential back-off. */
  maxAttempts?: number;
  /** Base back-off in ms (tests pass 0). */
  backoffMs?: number;
  api?: UploadApi;
  store?: ResumeStore;
  /** Precomputed hash (skips the hashing pass). */
  sha256?: string;
};

/**
 * Uploads `file` through an upload session and resolves with the COMPLETED
 * session (status "complete", with `inspection`). Attach it afterwards with
 * POST /tracks/{id}/audio or /releases/{id}/artwork `{upload_id}`.
 *
 * Throws ApiError for rule failures (`upload_too_large`, `upload_type_invalid`,
 * `checksum_mismatch`, `file_invalid` …) and AbortError when cancelled.
 */
export async function uploadResumable(opts: UploadOptions): Promise<UploadSession> {
  const {
    file,
    kind,
    onProgress,
    signal,
    maxAttempts = 4,
    backoffMs = 800,
    api = defaultApi,
    store = browserResumeStore,
  } = opts;
  const filename = opts.filename ?? file.name ?? "upload";
  const size = file.size;

  // 1. Hash.
  onProgress?.({ phase: "hashing", loaded: 0, total: size });
  const sha256 =
    opts.sha256 ??
    (await hashBlob(file, {
      signal,
      onProgress: (loaded, total) => onProgress?.({ phase: "hashing", loaded, total }),
    }));
  aborted(signal);

  // 2. Find a resumable session or open a new one.
  const key = resumeKey(kind, sha256, size);
  let session: UploadSession | null = null;
  const remembered = store.get(key);
  if (remembered) {
    try {
      const existing = await api.get(remembered, signal);
      if (existing.status === "complete") {
        store.remove(key);
        onProgress?.({ phase: "done", loaded: size, total: size });
        return existing;
      }
      const expired = existing.expires_at ? new Date(existing.expires_at).getTime() <= Date.now() : false;
      if (existing.status === "pending" && !expired && existing.size === size) session = existing;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      /* unknown / expired session: start fresh */
    }
    if (!session) store.remove(key);
  }
  if (!session) {
    session = await api.create({
      kind,
      filename,
      size,
      mime: file.type || null,
      sha256,
      chunk_size: Math.max(MIN_CHUNK_SIZE, opts.chunkSize ?? DEFAULT_CHUNK_SIZE),
    });
    store.set(key, session.id);
  }

  // 3. Send what the server is missing.
  const ranges = planChunks(size, session.chunk_size);
  const sendChunks = async (indices: number[], received: Set<number>) => {
    for (const index of indices) {
      const r = ranges[index];
      if (!r) continue;
      let attempt = 0;
      for (;;) {
        aborted(signal);
        try {
          const bytes = await readSlice(file, r.start, r.end);
          const updated = await api.put(session!.id, index, bytes, signal);
          for (const i of updated.received_chunks ?? []) received.add(i);
          received.add(index);
          break;
        } catch (err) {
          attempt += 1;
          if (!isRetryable(err) || attempt >= maxAttempts) throw err;
          await sleep(backoffMs * 2 ** (attempt - 1), signal);
        }
      }
      onProgress?.({ phase: "uploading", loaded: bytesFor(received, ranges), total: size });
    }
  };

  const received = new Set(session.received_chunks ?? []);
  onProgress?.({ phase: "uploading", loaded: bytesFor(received, ranges), total: size });
  await sendChunks(missingChunks(session.total_chunks, [...received]), received);

  // 4. Complete (re-sending anything the server says is missing, once).
  onProgress?.({ phase: "finalizing", loaded: size, total: size });
  let done: UploadSession;
  try {
    done = await api.complete(session.id);
  } catch (err) {
    const missing = err instanceof ApiError && err.code === "upload_incomplete" ? err.details?.missing : null;
    if (!Array.isArray(missing)) {
      if (err instanceof ApiError && (err.code === "checksum_mismatch" || err.code === "file_invalid" || err.code === "upload_closed" || err.code === "upload_expired")) {
        store.remove(key);
      }
      throw err;
    }
    for (const m of missing) received.delete(Number(m));
    await sendChunks(missing.map(Number), received);
    done = await api.complete(session.id);
  }
  store.remove(key);
  onProgress?.({ phase: "done", loaded: size, total: size });
  return done;
}

function bytesFor(received: Set<number>, ranges: ChunkRange[]): number {
  let n = 0;
  for (const i of received) {
    const r = ranges[i];
    if (r) n += r.end - r.start;
  }
  return n;
}
