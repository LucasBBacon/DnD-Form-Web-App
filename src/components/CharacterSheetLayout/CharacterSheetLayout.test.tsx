// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CharacterSheetLayout } from "./CharacterSheetLayout";

vi.mock("../IdentityHeader/IdentityHeaderContainer", () => ({
  IdentityHeaderContainer: () => <div>Identity Header</div>,
}));

vi.mock("../CoreStatsBoard/CoreStatsBoardContainer", () => ({
  CoreStatsBoardContainer: () => <div>Core Stats</div>,
}));

vi.mock("../VitalsBoard/MortalLedgerContainer", () => ({
  MortalLedgerContainer: () => <div>Mortal Ledger</div>,
}));

vi.mock("../ActionsBoard/ActionsBoardContainer", () => ({
  ActionsBoardContainer: () => <div>Actions Board</div>,
}));

vi.mock("../FeaturesBoard/FeaturesBoardContainer", () => ({
  FeaturesBoardContainer: () => <div>Features Board</div>,
}));

vi.mock("../InventoryBoard/InventoryBoard", () => ({
  InventoryBoard: () => <div>Inventory Board</div>,
}));

vi.mock("../RoleplayBoard/RoleplayBoard", () => ({
  RoleplayBoard: () => <div>Roleplay Board</div>,
}));

vi.mock("../Spellbook/SpellbookContainer.tsx", () => ({
  SpellbookContainer: () => <div>Spellbook Content</div>,
}));

describe("CharacterSheetLayout spellbook launch", () => {
  it("opens and closes the spellbook modal from the Grimoire bookmark", async () => {
    const user = userEvent.setup();

    render(<CharacterSheetLayout />);

    expect(screen.queryByRole("dialog", { name: "Spellbook" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /grimoire/i }));

    expect(screen.getByRole("dialog", { name: "Spellbook" })).toBeInTheDocument();
    expect(screen.getByText("Spellbook Content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close spellbook" }));

    expect(screen.queryByRole("dialog", { name: "Spellbook" })).not.toBeInTheDocument();
  });
});
