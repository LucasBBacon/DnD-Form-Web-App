/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { useCharacterStore } from "./store/useCharacterStore";

vi.mock("./components/Wizard/CharacterCreationWizard", () => ({
  CharacterCreationWizard: () => <div>Wizard Stub</div>,
}));

vi.mock("./components/CharacterSheet", () => ({
  CharacterSheet: () => <div>Character Sheet Stub</div>,
}));

vi.mock("./components/LevelUp/LevelUpModal", () => ({
  LevelUpModal: ({ targetLevel, onClose }: { targetLevel: number; onClose: () => void }) => (
    <div>
      <div>Level Up Modal Stub</div>
      <div>Target Level: {targetLevel}</div>
      <button type="button" onClick={onClose}>
        Close LevelUp Modal
      </button>
    </div>
  ),
}));

describe("App setup transition smoke", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      isSetupComplete: false,
      level: 1,
      choicesByLevel: {},
    } as any);
  });

  it("renders wizard before setup is complete", () => {
    render(<App />);

    expect(screen.getByText("Wizard Stub")).toBeInTheDocument();
    expect(screen.queryByText("Character Sheet Stub")).not.toBeInTheDocument();
    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });

  it("shows level-1 modal when setup is complete and no level-1 choices exist", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      choicesByLevel: {},
    } as any);

    render(<App />);

    expect(screen.queryByText("Wizard Stub")).not.toBeInTheDocument();
    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();
    expect(screen.getByText("Target Level: 1")).toBeInTheDocument();
  });

  it("hides level-1 modal when level-1 choices already exist", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      choicesByLevel: {
        1: { hpGained: 8 },
      },
    } as any);

    render(<App />);

    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });

  it("hides level-1 modal when character level is above 1", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 2,
      choicesByLevel: {},
    } as any);

    render(<App />);

    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });

  it("hides the modal after closing it", async () => {
    const user = userEvent.setup();
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      choicesByLevel: {},
    } as any);

    render(<App />);
    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close LevelUp Modal" }));

    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });
});