import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, Input, PasswordInput, Select, Textarea } from "../Field";

describe("Field", () => {
  it("labels its control and wires the hint via aria-describedby", () => {
    render(
      <Field label="Email" hint="We never share it">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We never share it");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("replaces the hint with an alert error and marks the control invalid", () => {
    render(
      <Field label="Email" hint="Hint text" error="Enter a valid email">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email");
    expect(screen.queryByText("Hint text")).toBeNull();
  });

  it("works for textarea and select", () => {
    render(
      <>
        <Field label="Message">
          <Textarea />
        </Field>
        <Field label="Topic" required>
          <Select defaultValue="a">
            <option value="a">A</option>
          </Select>
        </Field>
      </>,
    );
    expect(screen.getByLabelText("Message").tagName).toBe("TEXTAREA");
    const select = screen.getByLabelText(/Topic/);
    expect(select.tagName).toBe("SELECT");
    expect(select).toBeRequired();
  });

  it("PasswordInput toggles visibility with an accessible button", async () => {
    render(
      <Field label="Password">
        <PasswordInput showLabel="Show password" hideLabel="Hide password" />
      </Field>,
    );
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });
});
