/**
 * Incremental SHA-256 (FIPS 180-4).
 *
 * WebCrypto's `crypto.subtle.digest` needs the whole input in one buffer,
 * which for a 500 MB WAV master means holding 500 MB in memory. The upload
 * pipeline instead feeds the file through this hasher one slice at a time, so
 * memory stays at one chunk regardless of file size.
 *
 *   const h = new Sha256();
 *   h.update(bytes1); h.update(bytes2);
 *   h.hex();   // "e3b0c442…"
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export class Sha256 {
  private h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  private w = new Uint32Array(64);
  private block = new Uint8Array(64);
  private blockLen = 0;
  /** Total bytes hashed; a JS number is exact up to 8 PB. */
  private length = 0;
  private finished = false;

  update(input: Uint8Array | ArrayBuffer): this {
    if (this.finished) throw new Error("Sha256: update() after digest");
    const data = input instanceof Uint8Array ? input : new Uint8Array(input);
    this.length += data.length;
    let i = 0;
    if (this.blockLen > 0) {
      const take = Math.min(64 - this.blockLen, data.length);
      this.block.set(data.subarray(0, take), this.blockLen);
      this.blockLen += take;
      i = take;
      if (this.blockLen === 64) {
        this.compress(this.block, 0);
        this.blockLen = 0;
      }
    }
    for (; i + 64 <= data.length; i += 64) this.compress(data, i);
    if (i < data.length) {
      this.block.set(data.subarray(i), 0);
      this.blockLen = data.length - i;
    }
    return this;
  }

  digest(): Uint8Array {
    if (!this.finished) {
      const bitsHi = Math.floor(this.length / 0x20000000);
      const bitsLo = (this.length * 8) >>> 0;
      const padLen = this.blockLen < 56 ? 56 - this.blockLen : 120 - this.blockLen;
      const pad = new Uint8Array(padLen + 8);
      pad[0] = 0x80;
      const view = new DataView(pad.buffer);
      view.setUint32(padLen, bitsHi >>> 0);
      view.setUint32(padLen + 4, bitsLo);
      const savedLength = this.length;
      this.update(pad);
      this.length = savedLength;
      this.finished = true;
    }
    const out = new Uint8Array(32);
    const view = new DataView(out.buffer);
    for (let j = 0; j < 8; j++) view.setUint32(j * 4, this.h[j]);
    return out;
  }

  hex(): string {
    return Array.from(this.digest(), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  private compress(data: Uint8Array, offset: number) {
    const w = this.w;
    for (let t = 0; t < 16; t++) {
      const o = offset + t * 4;
      w[t] = ((data[o] << 24) | (data[o + 1] << 16) | (data[o + 2] << 8) | data[o + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const x = w[t - 15];
      const y = w[t - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = this.h[0];
    let b = this.h[1];
    let c = this.h[2];
    let d = this.h[3];
    let e = this.h[4];
    let f = this.h[5];
    let g = this.h[6];
    let h = this.h[7];
    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    this.h[0] = (this.h[0] + a) >>> 0;
    this.h[1] = (this.h[1] + b) >>> 0;
    this.h[2] = (this.h[2] + c) >>> 0;
    this.h[3] = (this.h[3] + d) >>> 0;
    this.h[4] = (this.h[4] + e) >>> 0;
    this.h[5] = (this.h[5] + f) >>> 0;
    this.h[6] = (this.h[6] + g) >>> 0;
    this.h[7] = (this.h[7] + h) >>> 0;
  }
}

export function sha256Hex(data: Uint8Array | ArrayBuffer | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return new Sha256().update(bytes).hex();
}
