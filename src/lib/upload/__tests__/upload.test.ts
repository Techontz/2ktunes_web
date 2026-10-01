import { createHash, randomBytes } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { UploadSession } from "@/lib/api/types";
import {
  MIN_CHUNK_SIZE,
  hashBlob,
  missingChunks,
  planChunks,
  resumeKey,
  uploadResumable,
  type ResumeStore,
  type UploadApi,
} from "../chunkedUpload";
import { Sha256, sha256Hex } from "../sha256";

const nodeSha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

describe("Sha256", () => {
  it("matches the FIPS test vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  it("gives the same digest however the input is split", () => {
    const data = new Uint8Array(randomBytes(200_003));
    const expected = nodeSha(data);
    for (const split of [1, 7, 63, 64, 65, 4096, 65_537]) {
      const h = new Sha256();
      for (let i = 0; i < data.length; i += split) h.update(data.subarray(i, i + split));
      expect(h.hex()).toBe(expected);
    }
  });

  it("hashes block-boundary lengths correctly (padding edge cases)", () => {
    for (const len of [55, 56, 57, 63, 64, 65, 119, 120, 128]) {
      const data = new Uint8Array(len).fill(0x61);
      expect(sha256Hex(data)).toBe(nodeSha(data));
    }
  });
});

describe("planChunks / missingChunks", () => {
  it("splits like the server: every chunk full except the last", () => {
    expect(planChunks(10, 4)).toEqual([
      { index: 0, start: 0, end: 4 },
      { index: 1, start: 4, end: 8 },
      { index: 2, start: 8, end: 10 },
    ]);
    expect(planChunks(8, 4)).toHaveLength(2);
    expect(planChunks(1, 4)).toEqual([{ index: 0, start: 0, end: 1 }]);
    expect(planChunks(0, 4)).toEqual([]);
    expect(() => planChunks(10, 0)).toThrow();
  });

  it("lists the chunks the server lacks", () => {
    expect(missingChunks(5, [0, 3])).toEqual([1, 2, 4]);
    expect(missingChunks(3, [0, 1, 2])).toEqual([]);
  });
});

describe("hashBlob", () => {
  it("hashes a Blob slice by slice with progress", async () => {
    const data = new Uint8Array(randomBytes(1_000_001));
    const progress: number[] = [];
    const hex = await hashBlob(new Blob([data]), { sliceSize: 300_000, onProgress: (l) => progress.push(l) });
    expect(hex).toBe(nodeSha(data));
    expect(progress).toEqual([300_000, 600_000, 900_000, 1_000_001]);
  });
});

/* ── An in-memory upload server that behaves like UploadSessionService ── */

function fakeServer() {
  const sessions = new Map<string, UploadSession & { expected: string | null; parts: Map<number, Uint8Array> }>();
  let seq = 0;
  const failures: { index: number; times: number; status: number }[] = [];
  const puts: { id: string; index: number; size: number }[] = [];

  const api: UploadApi = {
    create: vi.fn(async (input) => {
      const chunk = Math.max(input.chunk_size ?? 8 * 1024 * 1024, MIN_CHUNK_SIZE);
      const s = {
        id: `u-${++seq}`,
        kind: input.kind,
        filename: input.filename,
        size: input.size,
        chunk_size: chunk,
        total_chunks: Math.ceil(input.size / chunk),
        received_chunks: [],
        status: "pending" as const,
        sha256: null,
        inspection: null,
        error: null,
        expires_at: new Date(Date.now() + 48 * 3600_000).toISOString(),
        expected: input.sha256 ?? null,
        parts: new Map<number, Uint8Array>(),
      };
      sessions.set(s.id, s);
      return { ...s, received_chunks: [] };
    }),
    get: vi.fn(async (id) => {
      const s = sessions.get(id);
      if (!s) throw new ApiError("Not found.", 404, {}, false, { code: "not_found" });
      return { ...s, received_chunks: [...s.parts.keys()] };
    }),
    put: vi.fn(async (id, index, bytes) => {
      const s = sessions.get(id)!;
      const buf = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes);
      puts.push({ id, index, size: buf.length });
      const f = failures.find((x) => x.index === index && x.times > 0);
      if (f) {
        f.times -= 1;
        throw f.status === 0 ? new ApiError("NETWORK", 0, {}, true) : new ApiError("SERVER", f.status);
      }
      const isLast = index === s.total_chunks - 1;
      const expected = isLast ? s.size - s.chunk_size * (s.total_chunks - 1) : s.chunk_size;
      if (buf.length !== expected) throw new ApiError("size", 422, {}, false, { code: "chunk_size_mismatch" });
      s.parts.set(index, buf);
      return { ...s, received_chunks: [...s.parts.keys()] };
    }),
    complete: vi.fn(async (id) => {
      const s = sessions.get(id)!;
      const missing = missingChunks(s.total_chunks, [...s.parts.keys()]);
      if (missing.length) {
        throw new ApiError("Upload incomplete", 422, {}, false, { code: "upload_incomplete", details: { missing } });
      }
      const h = new Sha256();
      for (let i = 0; i < s.total_chunks; i++) h.update(s.parts.get(i)!);
      const sha = h.hex();
      if (s.expected && s.expected !== sha) {
        s.status = "failed";
        throw new ApiError("Checksum mismatch", 422, {}, false, { code: "checksum_mismatch" });
      }
      s.status = "complete";
      s.sha256 = sha;
      return { ...s, received_chunks: [...s.parts.keys()] };
    }),
  };
  return { api, sessions, failures, puts };
}

function memoryStore(): ResumeStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, get: (k) => map.get(k) ?? null, set: (k, v) => void map.set(k, v), remove: (k) => void map.delete(k) };
}

const file = (bytes: Uint8Array, name = "master.wav") => new File([bytes], name, { type: "audio/wav" });

describe("uploadResumable", () => {
  it("uploads every chunk at the server's chunk size and completes with a verified checksum", async () => {
    const data = new Uint8Array(randomBytes(MIN_CHUNK_SIZE * 2 + 1234));
    const server = fakeServer();
    const store = memoryStore();
    const phases = new Set<string>();

    const done = await uploadResumable({
      file: file(data),
      kind: "audio",
      chunkSize: MIN_CHUNK_SIZE,
      api: server.api,
      store,
      backoffMs: 0,
      onProgress: (p) => phases.add(p.phase),
    });

    expect(done.status).toBe("complete");
    expect(done.sha256).toBe(nodeSha(data));
    expect(server.api.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "audio", filename: "master.wav", size: data.length, sha256: nodeSha(data) }),
    );
    expect(server.puts.map((p) => p.size)).toEqual([MIN_CHUNK_SIZE, MIN_CHUNK_SIZE, 1234]);
    expect([...phases]).toEqual(["hashing", "uploading", "finalizing", "done"]);
    expect(store.map.size).toBe(0); // resume key cleared after success
  });

  it("retries a chunk after a network drop or 5xx, then succeeds", async () => {
    const data = new Uint8Array(randomBytes(MIN_CHUNK_SIZE + 10));
    const server = fakeServer();
    server.failures.push({ index: 1, times: 1, status: 0 }, { index: 0, times: 1, status: 503 });
    const done = await uploadResumable({
      file: file(data),
      kind: "audio",
      chunkSize: MIN_CHUNK_SIZE,
      api: server.api,
      store: memoryStore(),
      backoffMs: 0,
    });
    expect(done.status).toBe("complete");
    expect(server.puts.map((p) => p.index)).toEqual([0, 0, 1, 1]);
  });

  it("gives up after maxAttempts and keeps the session for a later resume", async () => {
    const data = new Uint8Array(randomBytes(MIN_CHUNK_SIZE * 3));
    const server = fakeServer();
    const store = memoryStore();
    server.failures.push({ index: 2, times: 99, status: 0 });

    await expect(
      uploadResumable({ file: file(data), kind: "audio", chunkSize: MIN_CHUNK_SIZE, api: server.api, store, backoffMs: 0, maxAttempts: 2 }),
    ).rejects.toMatchObject({ isNetwork: true });
    expect(store.map.get(resumeKey("audio", nodeSha(data), data.length))).toBe("u-1");

    // The connection comes back: pick the same file again → only chunk 2 is sent.
    server.failures.length = 0;
    server.puts.length = 0;
    const done = await uploadResumable({ file: file(data), kind: "audio", chunkSize: MIN_CHUNK_SIZE, api: server.api, store, backoffMs: 0 });
    expect(done.status).toBe("complete");
    expect(server.api.create).toHaveBeenCalledTimes(1);
    expect(server.puts.map((p) => p.index)).toEqual([2]);
    expect(store.map.size).toBe(0);
  });

  it("starts a fresh session when the remembered one is gone", async () => {
    const data = new Uint8Array(randomBytes(1000));
    const server = fakeServer();
    const store = memoryStore();
    store.set(resumeKey("artwork", nodeSha(data), 1000), "u-does-not-exist");
    const done = await uploadResumable({ file: file(data, "cover.jpg"), kind: "artwork", api: server.api, store, backoffMs: 0 });
    expect(done.status).toBe("complete");
    expect(server.api.create).toHaveBeenCalledTimes(1);
  });

  it("re-sends chunks the server reports missing on completion", async () => {
    const data = new Uint8Array(randomBytes(MIN_CHUNK_SIZE * 2));
    const server = fakeServer();
    const origPut = server.api.put;
    let dropped = false;
    // The server "loses" chunk 1 the first time (acks it but does not keep it).
    server.api.put = vi.fn(async (id, index, bytes, signal) => {
      const res = await origPut(id, index, bytes, signal);
      if (index === 1 && !dropped) {
        dropped = true;
        server.sessions.get(id)!.parts.delete(1);
      }
      return res;
    });
    const done = await uploadResumable({ file: file(data), kind: "audio", chunkSize: MIN_CHUNK_SIZE, api: server.api, store: memoryStore(), backoffMs: 0 });
    expect(done.status).toBe("complete");
    expect(server.api.complete).toHaveBeenCalledTimes(2);
  });

  it("does not retry rule failures and forgets a corrupted session", async () => {
    const data = new Uint8Array(randomBytes(2000));
    const server = fakeServer();
    const store = memoryStore();
    await expect(
      uploadResumable({ file: file(data), kind: "audio", api: server.api, store, backoffMs: 0, sha256: "0".repeat(64) }),
    ).rejects.toMatchObject({ code: "checksum_mismatch" });
    expect(store.map.size).toBe(0);
    expect(server.api.complete).toHaveBeenCalledTimes(1);
  });

  it("stops when cancelled", async () => {
    const data = new Uint8Array(randomBytes(MIN_CHUNK_SIZE * 2));
    const server = fakeServer();
    const controller = new AbortController();
    controller.abort();
    await expect(
      uploadResumable({ file: file(data), kind: "audio", api: server.api, store: memoryStore(), signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(server.api.create).not.toHaveBeenCalled();
  });
});
