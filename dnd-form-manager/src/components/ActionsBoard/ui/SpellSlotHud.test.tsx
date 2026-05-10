import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpellSlotHud } from "./SpellSlotHud";

describe("SpellSlotHud", () => {
  it("shows no spell slots message when rows is empty", () => {
    render(<SpellSlotHud rows={[]} />);
    expect(screen.getByText("No spell slots")).toBeInTheDocument();
  });

  it("renders each row label and text", () => {
    render(
      <SpellSlotHud
        rows={[
          { label: "Shared", text: "2/4 used" },
          { label: "Pact", text: "1/2 used" },
        ]}
      />,
    );
    expect(screen.getByText("Shared:")).toBeInTheDocument();
    expect(screen.getByText("2/4 used")).toBeInTheDocument();
    expect(screen.getByText("Pact:")).toBeInTheDocument();
    expect(screen.getByText("1/2 used")).toBeInTheDocument();
  });

  it("does not show empty message when rows are provided", () => {
    render(
      <SpellSlotHud rows={[{ label: "Shared", text: "0/4 used" }]} />,
    );
    expect(screen.queryByText("No spell slots")).not.toBeInTheDocument();
  });
});
