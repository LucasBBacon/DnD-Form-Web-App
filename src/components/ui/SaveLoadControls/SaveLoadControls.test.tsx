// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SaveLoadControls } from "./SaveLoadControls";

const mocks = vi.hoisted(() => {
  return {
    hydrateCharacter: vi.fn(),
    getState: vi.fn(),
    serializeCharacter: vi.fn(),
    validateAndDeserialize: vi.fn(),
    migrateIfNeeded: vi.fn(),
  };
});

vi.mock("../../../store/useCharacterStore", () => {
  const useCharacterStore = ((
    selector: (state: {
      hydrateCharacter: typeof mocks.hydrateCharacter;
    }) => unknown,
  ) => selector({ hydrateCharacter: mocks.hydrateCharacter })) as unknown as {
    (
      selector: (state: {
        hydrateCharacter: typeof mocks.hydrateCharacter;
      }) => unknown,
    ): unknown;
    getState: typeof mocks.getState;
  };

  useCharacterStore.getState = mocks.getState;

  return {
    useCharacterStore,
  };
});

vi.mock("../../../store/characterPersistence", () => ({
  serializeCharacter: mocks.serializeCharacter,
  validateAndDeserialize: mocks.validateAndDeserialize,
  migrateIfNeeded: mocks.migrateIfNeeded,
}));

vi.mock("../../SaveLoad/SaveLoad", () => ({
  SaveLoad: ({
    onSave,
    onLoadRequest,
  }: {
    onSave: () => void;
    onLoadRequest: () => void;
  }) => (
    <div>
      <button type="button" onClick={onSave}>
        Save Data
      </button>
      <button type="button" onClick={onLoadRequest}>
        Load Data
      </button>
    </div>
  ),
}));

vi.mock("../ConfirmationModal/ConfirmationModal", () => ({
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="Overwrite Existing Save?">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm}>
          Overwrite Save
        </button>
      </div>
    ) : null,
}));

describe("SaveLoadControls", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mocks.getState.mockReturnValue({
      isSetupComplete: false,
      name: "",
    });
    mocks.serializeCharacter.mockReturnValue('{"ok":true}');
    mocks.validateAndDeserialize.mockReturnValue({
      success: true,
      data: { character: { name: "Loaded" } },
    });
    mocks.migrateIfNeeded.mockReturnValue({
      character: { name: "Loaded" },
    });

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:save");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("saves the current character state", () => {
    mocks.getState.mockReturnValue({
      isSetupComplete: false,
      name: "Aelar",
    });

    render(<SaveLoadControls />);

    fireEvent.click(screen.getByRole("button", { name: "Save Data" }));

    expect(mocks.serializeCharacter).toHaveBeenCalledWith({
      isSetupComplete: false,
      name: "Aelar",
    });
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before loading over existing data", async () => {
    mocks.getState.mockReturnValue({
      isSetupComplete: true,
      name: "Current Hero",
    });

    const view = render(<SaveLoadControls />);
    const input = view.container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;

    const file = new File(["{}"], "hero.dnd5e.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByRole("dialog", { name: "Overwrite Existing Save?" }),
    ).toBeInTheDocument();
    expect(mocks.validateAndDeserialize).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Overwrite Save" }));

    await waitFor(() => {
      expect(mocks.validateAndDeserialize).toHaveBeenCalledTimes(1);
      expect(mocks.migrateIfNeeded).toHaveBeenCalledTimes(1);
      expect(mocks.hydrateCharacter).toHaveBeenCalledWith({ name: "Loaded" });
    });
  });

  it("loads immediately when current state is empty", async () => {
    mocks.getState.mockReturnValue({
      isSetupComplete: false,
      name: "",
    });

    const view = render(<SaveLoadControls />);
    const input = view.container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;

    const file = new File(["{}"], "new.dnd5e.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mocks.validateAndDeserialize).toHaveBeenCalledTimes(1);
      expect(mocks.hydrateCharacter).toHaveBeenCalledWith({ name: "Loaded" });
    });

    expect(
      screen.queryByRole("dialog", { name: "Overwrite Existing Save?" }),
    ).not.toBeInTheDocument();
  });
});
