import { describe, expect, it } from "vitest";
import { safeNext } from "../routes";

describe("safeNext", () => {
  it("accepts same-origin paths", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/dashboard/music/12?tab=stores")).toBe("/dashboard/music/12?tab=stores");
    expect(safeNext("/email-verified?status=expired")).toBe("/email-verified?status=expired");
  });

  it("rejects empty and absolute or protocol-relative URLs", () => {
    expect(safeNext(null)).toBeNull();
    expect(safeNext("")).toBeNull();
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("/\\evil.com")).toBeNull();
    expect(safeNext("javascript:alert(1)")).toBeNull();
    expect(safeNext("dashboard")).toBeNull();
  });

  it("rejects control characters and whitespace browsers would strip", () => {
    expect(safeNext("/\t/evil.com")).toBeNull();
    expect(safeNext("/\n/evil.com")).toBeNull();
    expect(safeNext("/\r\n/evil.com")).toBeNull();
    expect(safeNext("/ /evil.com")).toBeNull();
    expect(safeNext("/\u0000/evil.com")).toBeNull();
  });

  it("never redirects back into the auth screens", () => {
    expect(safeNext("/auth")).toBeNull();
    expect(safeNext("/auth?mode=register")).toBeNull();
    expect(safeNext("/forgot-password")).toBeNull();
    expect(safeNext("/reset-password?token=x")).toBeNull();
    expect(safeNext("/authors")).toBe("/authors");
  });
});
