import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { usePageMeta } from "../usePageMeta";

const description = () => document.querySelector('meta[name="description"]')?.getAttribute("content");
const robots = () => document.querySelector('meta[name="robots"]');

function Page({ title, desc, noindex }: { title: string | null; desc?: string; noindex?: boolean }) {
  usePageMeta(title, desc, { noindex });
  return null;
}

describe("usePageMeta", () => {
  it("sets title and description, and restores the default description for pages without one", () => {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = "Site default";
    document.head.appendChild(meta);

    const { rerender } = render(<Page title="Pricing" desc="Plans and prices" />);
    expect(document.title).toBe("Pricing · 2kTunes");
    expect(description()).toBe("Plans and prices");

    rerender(<Page title="About" />);
    expect(document.title).toBe("About · 2kTunes");
    expect(description()).toBe("Site default");
    meta.remove();
  });

  it("adds robots noindex only while a noindex page is mounted", () => {
    const { unmount } = render(<Page title="Not found" noindex />);
    expect(robots()?.getAttribute("content")).toBe("noindex");
    unmount();
    expect(robots()).toBeNull();
  });
});
