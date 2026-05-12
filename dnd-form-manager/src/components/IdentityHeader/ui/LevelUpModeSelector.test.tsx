import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LevelUpModeSelector } from "./LevelUpModeSelector";

describe("LevelUpModeSelector", () => {
  it("renders the select element with the correct value", () => {
    const mockOnChange = vi.fn();
    render(<LevelUpModeSelector value="xp_gated" onChange={mockOnChange} />);

    const selectElement = screen.getByRole("combobox", {
      name: "Level Up Mode",
    });
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue("xp_gated");
  });

  it("renders the label", () => {
    const mockOnChange = vi.fn();
    render(<LevelUpModeSelector value="xp_gated" onChange={mockOnChange} />);

    expect(screen.getByText("LEVEL UP MODE")).toBeInTheDocument();
  });

  it("renders both option values", () => {
    const mockOnChange = vi.fn();
    render(<LevelUpModeSelector value="xp_gated" onChange={mockOnChange} />);

    expect(
      screen.getByRole("option", { name: "XP Gated" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Milestone Anytime" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with xp_gated value when selected", async () => {
    const mockOnChange = vi.fn();
    render(
      <LevelUpModeSelector value="milestone_anytime" onChange={mockOnChange} />,
    );

    const selectElement = screen.getByRole("combobox", {
      name: "Level Up Mode",
    });
    await userEvent.selectOptions(selectElement, "xp_gated");

    expect(mockOnChange).toHaveBeenCalledWith("xp_gated");
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("calls onChange with milestone_anytime value when selected", async () => {
    const mockOnChange = vi.fn();
    render(<LevelUpModeSelector value="xp_gated" onChange={mockOnChange} />);

    const selectElement = screen.getByRole("combobox", {
      name: "Level Up Mode",
    });
    await userEvent.selectOptions(selectElement, "milestone_anytime");

    expect(mockOnChange).toHaveBeenCalledWith("milestone_anytime");
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("updates the selected value when props change", () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <LevelUpModeSelector value="xp_gated" onChange={mockOnChange} />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("xp_gated");

    rerender(
      <LevelUpModeSelector value="milestone_anytime" onChange={mockOnChange} />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("milestone_anytime");
  });
});
