import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../app/page";

const getDisplay = () => screen.getByTestId("display");
const getExpression = () => screen.getByTestId("expression");

describe("Calculator UI", () => {
  it("shows zero on first render", () => {
    render(<Home />);
    expect(getDisplay()).toHaveTextContent("0");
  });

  it("handles chained operations with precedence", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "+", exact: true }));
    await user.click(screen.getByRole("button", { name: "3" }));
    await user.click(screen.getByRole("button", { name: "×" }));
    await user.click(screen.getByRole("button", { name: "4" }));
    await user.click(screen.getByRole("button", { name: "=" }));

    expect(getDisplay()).toHaveTextContent("14");
    expect(getExpression()).toHaveTextContent("2 + 3 × 4 =");
  });

  it("supports decimals and percent", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "%" }));
    expect(getDisplay()).toHaveTextContent("0.5");

    await user.click(screen.getByRole("button", { name: "+", exact: true }));
    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "." }));
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "=" }));
    expect(getDisplay()).toHaveTextContent("2");
  });

  it("toggles sign and backspaces", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "9" }));
    await user.click(screen.getByRole("button", { name: "+/-" }));
    expect(getDisplay()).toHaveTextContent("-9");

    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "3" }));
    await user.keyboard("{Backspace}");
    expect(getDisplay()).toHaveTextContent("-912");
  });

  it("accepts keyboard input", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.keyboard("7*8{Enter}");
    expect(getDisplay()).toHaveTextContent("56");
  });
});
