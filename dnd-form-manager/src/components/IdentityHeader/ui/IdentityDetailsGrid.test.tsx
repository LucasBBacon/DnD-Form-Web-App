import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { IdentityDetailsGrid } from "./IdentityDetailsGrid";

describe("IdentityDetailsGrid", () => {
  const defaultProps = {
    classNameDisplay: "Wizard 5",
    backgroundNameDisplay: "Choose Background",
    playerName: "Alice",
    raceNameDisplay: "Human",
    alignment: "Neutral Good",
    xp: 6500,
    levelUpMode: "xp_gated" as const,
    onNameChange: vi.fn(),
    onAlignmentChange: vi.fn(),
    onXpChange: vi.fn(),
    onLevelUpModeChange: vi.fn(),
    onClassModalClick: vi.fn(),
    onBackgroundModalClick: vi.fn(),
    onRaceModalClick: vi.fn(),
  };

  it("renders all field labels", () => {
    render(<IdentityDetailsGrid {...defaultProps} />);

    expect(screen.getByText("CLASS & LEVEL")).toBeInTheDocument();
    expect(screen.getByText("BACKGROUND")).toBeInTheDocument();
    expect(screen.getByText("PLAYER NAME")).toBeInTheDocument();
    expect(screen.getByText("RACE")).toBeInTheDocument();
    expect(screen.getByText("ALIGNMENT")).toBeInTheDocument();
    expect(screen.getByText("EXPERIENCE POINTS")).toBeInTheDocument();
    expect(screen.getByText("LEVEL UP MODE")).toBeInTheDocument();
  });

  it("displays all field values", () => {
    render(<IdentityDetailsGrid {...defaultProps} />);

    expect(screen.getByText("Wizard 5")).toBeInTheDocument();
    expect(screen.getByText("Choose Background")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Neutral Good")).toBeInTheDocument();
    expect(screen.getByText("6500")).toBeInTheDocument();
  });

  it("calls onClassModalClick when class field is clicked", async () => {
    const mockClassClick = vi.fn();
    render(
      <IdentityDetailsGrid
        {...defaultProps}
        onClassModalClick={mockClassClick}
      />
    );

    const classText = screen.getByText("Wizard 5");
    await userEvent.click(classText);

    expect(mockClassClick).toHaveBeenCalled();
  });

  it("calls onNameChange when player name is edited", async () => {
    const mockNameChange = vi.fn();
    render(
      <IdentityDetailsGrid
        {...defaultProps}
        onNameChange={mockNameChange}
      />
    );

    const playerNameText = screen.getByText("Alice");
    await userEvent.click(playerNameText);
    
    const playerNameField = screen.getByDisplayValue("Alice");
    await userEvent.clear(playerNameField);
    await userEvent.type(playerNameField, "Bob");
    await userEvent.keyboard("{Enter}");

    expect(mockNameChange).toHaveBeenCalledWith("Bob");
  });

  it("calls onAlignmentChange when alignment is edited", async () => {
    const mockAlignmentChange = vi.fn();
    render(
      <IdentityDetailsGrid
        {...defaultProps}
        onAlignmentChange={mockAlignmentChange}
      />
    );

    const alignmentText = screen.getByText("Neutral Good");
    await userEvent.click(alignmentText);
    
    const alignmentField = screen.getByDisplayValue("Neutral Good");
    await userEvent.clear(alignmentField);
    await userEvent.type(alignmentField, "Chaotic Evil");
    await userEvent.keyboard("{Enter}");

    expect(mockAlignmentChange).toHaveBeenCalledWith("Chaotic Evil");
  });

  it("calls onXpChange with number when xp is edited", async () => {
    const mockXpChange = vi.fn();
    render(
      <IdentityDetailsGrid {...defaultProps} onXpChange={mockXpChange} />
    );

    const xpText = screen.getByText("6500");
    await userEvent.click(xpText);
    
    const xpField = screen.getByDisplayValue("6500");
    await userEvent.clear(xpField);
    await userEvent.type(xpField, "10000");
    await userEvent.keyboard("{Enter}");

    expect(mockXpChange).toHaveBeenCalledWith(10000);
  });

  it("ignores non-numeric XP input", async () => {
    const mockXpChange = vi.fn();
    render(
      <IdentityDetailsGrid {...defaultProps} onXpChange={mockXpChange} />
    );

    const xpText = screen.getByText("6500");
    await userEvent.click(xpText);
    
    const xpField = screen.getByDisplayValue("6500");
    await userEvent.clear(xpField);
    await userEvent.type(xpField, "abc");
    await userEvent.keyboard("{Enter}");

    expect(mockXpChange).not.toHaveBeenCalled();
  });

  it("calls onLevelUpModeChange when level up mode is changed", async () => {
    const mockModeChange = vi.fn();
    render(
      <IdentityDetailsGrid
        {...defaultProps}
        onLevelUpModeChange={mockModeChange}
      />
    );

    const modeSelect = screen.getByRole("combobox", { name: "Level Up Mode" });
    await userEvent.selectOptions(modeSelect, "milestone_anytime");

    expect(mockModeChange).toHaveBeenCalledWith("milestone_anytime");
  });

  it("calls onBackgroundModalClick when background field is clicked", async () => {
    const mockBackgroundClick = vi.fn();
    render(
      <IdentityDetailsGrid
        {...defaultProps}
        onBackgroundModalClick={mockBackgroundClick}
      />
    );

    const backgroundText = screen.getByText("Choose Background");
    await userEvent.click(backgroundText);

    expect(mockBackgroundClick).toHaveBeenCalled();
  });

  it("calls onRaceModalClick when race field is clicked", async () => {
    const mockRaceClick = vi.fn();
    render(
      <IdentityDetailsGrid
        {...defaultProps}
        onRaceModalClick={mockRaceClick}
      />
    );

    const raceText = screen.getByText("Human");
    await userEvent.click(raceText);

    expect(mockRaceClick).toHaveBeenCalled();
  });
});
