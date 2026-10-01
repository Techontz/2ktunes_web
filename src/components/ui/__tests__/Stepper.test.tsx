import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stepper } from "../Display";

const steps = [
  { id: "a", label: "Details" },
  { id: "b", label: "Tracks" },
  { id: "c", label: "Review" },
];

describe("Stepper", () => {
  it("marks the current step and announces finished steps", () => {
    render(<Stepper steps={steps} current={1} ariaLabel="Release steps" />);
    expect(screen.getByRole("list", { name: "Release steps" })).toBeInTheDocument();
    expect(screen.getByText("Tracks").closest("[aria-current]")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("(completed)", { exact: false })).toBeInTheDocument();
  });

  it("uses the translated completed label", () => {
    render(<Stepper steps={steps} current={2} completedLabel="imekamilika" />);
    expect(screen.getAllByText("(imekamilika)", { exact: false })).toHaveLength(2);
    expect(screen.queryByText("(completed)", { exact: false })).not.toBeInTheDocument();
  });
});
