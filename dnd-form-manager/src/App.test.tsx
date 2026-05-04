/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { useCharacterStore } from "./store/useCharacterStore";
import { BASELINE_CHARACTER_STATE } from "./store/useCharacterStore";

vi.mock("./components/CharacterCreationWizard", () => ({
  CharacterCreationWizard: () => <div>Wizard Stub</div>,
}));

vi.mock("./components/CharacterSheet", () => ({
  CharacterSheet: () => {
    const { openLevelUpModal } = useCharacterStore();
    return (
      <div>
        <div>Character Sheet Stub</div>
        <button type="button" onClick={() => openLevelUpModal(2)}>
          Open LevelUp From Header Stub
        </button>
      </div>
    );
  },
}));

vi.mock("./components/LevelUp/LevelUpModal", () => ({
  LevelUpModal: ({
    targetLevel,
    onClose,
    isBlocking,
  }: {
    targetLevel: number;
    onClose: () => void;
    isBlocking?: boolean;
  }) => (
    <div>
      <div>Level Up Modal Stub</div>
      <div>Target Level: {targetLevel}</div>
      <div>Blocking: {isBlocking ? "yes" : "no"}</div>
      <button type="button" onClick={onClose}>
        Close LevelUp Modal
      </button>
    </div>
  ),
}));

describe("App setup transition smoke", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      ...BASELINE_CHARACTER_STATE,
      isSetupComplete: false,
      level: 1,
      choicesByLevel: {},
      levelUpModalState: {
        isOpen: false,
        targetLevel: null,
        isBlocking: false,
      },
    } as any);
  });

  it("renders wizard before setup is complete", () => {
    render(<App />);

    expect(screen.getByText("Wizard Stub")).toBeInTheDocument();
    expect(screen.queryByText("Character Sheet Stub")).not.toBeInTheDocument();
    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });

  it("shows blocking modal when setup is complete and no level-1 choices exist", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      choicesByLevel: {},
      levelUpMode: "xp_gated",
    } as any);

    render(<App />);

    expect(screen.queryByText("Wizard Stub")).not.toBeInTheDocument();
    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();
    expect(screen.getByText("Target Level: 1")).toBeInTheDocument();
    expect(screen.getByText("Blocking: yes")).toBeInTheDocument();
  });

  it("hides level-1 modal when level-1 choices already exist", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      xp: 0,
      levelUpMode: "xp_gated",
      choicesByLevel: {
        1: { hpGained: 8 },
      },
    } as any);

    render(<App />);

    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });

  it("shows the first incomplete level when character level is above 1", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 2,
      xp: 0,
      levelUpMode: "xp_gated",
      choicesByLevel: {
        2: { hpGained: 7 },
      },
    } as any);

    render(<App />);

    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();
    expect(screen.getByText("Target Level: 1")).toBeInTheDocument();
  });

  it("reopens XP-gated modal until the required level choice exists", async () => {
    const user = userEvent.setup();
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      choicesByLevel: {},
      levelUpMode: "xp_gated",
    } as any);

    render(<App />);
    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close LevelUp Modal" }));

    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();
  });

  it("does not auto-open modal in milestone-anytime mode", () => {
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      xp: 0,
      levelUpMode: "milestone_anytime",
      choicesByLevel: { 1: { hpGained: 10 } },
    } as any);

    render(<App />);

    expect(screen.getByText("Character Sheet Stub")).toBeInTheDocument();
    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });

  it("opens a non-blocking modal from the shared manual trigger", async () => {
    const user = userEvent.setup();
    useCharacterStore.setState({
      isSetupComplete: true,
      level: 1,
      xp: 0,
      choicesByLevel: { 1: { hpGained: 10 } },
      levelUpMode: "xp_gated",
    } as any);

    render(<App />);

    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open LevelUp From Header Stub" }));

    expect(screen.getByText("Level Up Modal Stub")).toBeInTheDocument();
    expect(screen.getByText("Target Level: 2")).toBeInTheDocument();
    expect(screen.getByText("Blocking: no")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close LevelUp Modal" }));

    expect(screen.queryByText("Level Up Modal Stub")).not.toBeInTheDocument();
  });
});