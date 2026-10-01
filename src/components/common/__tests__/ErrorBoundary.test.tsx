import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ErrorBoundary } from "../ErrorBoundary";

function Boom(): never {
  throw new Error("render exploded");
}

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <LanguageProvider initial="EN">
        <ErrorBoundary>
          <p>fine</p>
        </ErrorBoundary>
      </LanguageProvider>,
    );
    expect(screen.getByText("fine")).toBeInTheDocument();
  });

  it("shows a friendly 500 page with reload and home actions on a crash", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { ...original, reload } });
    try {
      render(
        <LanguageProvider initial="EN">
          <ErrorBoundary>
            <Boom />
          </ErrorBoundary>
        </LanguageProvider>,
      );
      expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
      expect(screen.queryByText("render exploded")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
      await userEvent.click(screen.getByRole("button", { name: "Reload page" }));
      expect(reload).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: original });
      consoleError.mockRestore();
    }
  });

  it("speaks Swahili when the visitor chose it", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <LanguageProvider initial="SW">
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading", { name: "Kuna kitu kimeharibika" })).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
