import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Button } from "../Button";

describe("Button", () => {
  it("renders a type=button by default and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("type", "button");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and aria-busy while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Saving" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a router link when given `to`", () => {
    render(
      <MemoryRouter>
        <Button to="/pricing">Pricing</Button>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("href", "/pricing");
  });

  it("renders an anchor when given `href`", () => {
    render(<Button href="mailto:hi@example.com">Email</Button>);
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:hi@example.com");
  });

  it("styles its child with asChild instead of wrapping it", () => {
    render(
      <Button asChild variant="secondary">
        <label htmlFor="x">Upload</label>
      </Button>,
    );
    const label = screen.getByText("Upload");
    expect(label.tagName).toBe("LABEL");
    expect(label.className).toContain("rounded-control");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
