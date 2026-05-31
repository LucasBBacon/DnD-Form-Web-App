import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryBoard } from "./InventoryBoard";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import * as staticDataApi from "../../data/staticDataApi";

vi.mock("../../store/useCharacterStore");
vi.mock("../../hooks/useCharacterStats");
vi.mock("../../data/staticDataApi");
vi.mock("./ui/WealthTracker", () => ({
  WealthTracker: () => <div data-testid="wealth-tracker">Wealth Tracker</div>,
}));
vi.mock("./ui/TwoHandedWarningDialog", () => ({
  TwoHandedWarningDialog: ({ onConfirm }: { onConfirm: () => void }) => (
    <div data-testid="two-handed-dialog">
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
}));

const mockStoreActions = () => ({
  inventoryInstances: [],
  inventoryStacks: [],
  equippedWeaponInstanceIds: [],
  equippedArmorInstanceId: null,
  equippedShieldInstanceId: null,
  attunedInstanceIds: [],
  equipWeaponInstance: vi.fn(),
  unequipWeaponInstance: vi.fn(),
  equipArmorInstance: vi.fn(),
  equipShieldInstance: vi.fn(),
  attuneInstance: vi.fn(),
  unattuneInstance: vi.fn(),
  removeInventoryInstance: vi.fn(),
  removeInventoryItem: vi.fn(),
  addInventoryItem: vi.fn(),
});

const mockWeapon = {
  id: "weapon_longsword",
  name: "Longsword",
  type: "weapon",
  weight: 3,
  cpCost: 1500,
  lore: { shortDescription: "A versatile weapon" },
};

const mockMagicItem = {
  id: "magic_item",
  name: "Ring of Protection",
  type: "wondrous_item",
  weight: 0,
  cpCost: 5000,
  lore: { shortDescription: "Grants +1 to AC" },
  magicItemProperties: { requiresAttunement: true },
};

const mockRations = {
  id: "adventuring_gear_rations",
  name: "Rations",
  type: "adventuring_gear",
  weight: 1,
  cpCost: 50,
  lore: { shortDescription: "One day of preserved food" },
};

describe("InventoryBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCharacterStore).mockReturnValue(mockStoreActions() as never);
    vi.mocked(useCharacterStats).mockReturnValue({
      encumbrance: {
        totalWeight: 0,
        carryingCapacity: 300,
        isEncumbered: false,
      },
    } as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(null);
  });

  it("renders inventory board view", () => {
    render(<InventoryBoard />);
    expect(screen.getByText("EQUIPMENT & ATTUNEMENT")).toBeInTheDocument();
    expect(screen.getByText(/BACKPACK \(GEAR & CONSUMABLES\)/)).toBeInTheDocument();
  });

  it("renders wealth tracker", () => {
    render(<InventoryBoard />);
    expect(screen.getByTestId("wealth-tracker")).toBeInTheDocument();
  });

  it("displays encumbrance information", () => {
    vi.mocked(useCharacterStats).mockReturnValue({
      encumbrance: {
        totalWeight: 150,
        carryingCapacity: 300,
        isEncumbered: false,
      },
    } as never);

    render(<InventoryBoard />);
    // Check that encumbrance display is rendered with the correct values
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it("shows empty state when no equipment", () => {
    render(<InventoryBoard />);
    expect(screen.getByText("No equipment.")).toBeInTheDocument();
    expect(screen.getByText("Backpack is empty.")).toBeInTheDocument();
  });

  it("displays missing item IDs warning when item not found", () => {
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-1",
        baseItemId: "weapon_unknown",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(null);

    render(<InventoryBoard />);
    expect(
      screen.getByText(/Missing equipment reference: weapon_unknown/i),
    ).toBeInTheDocument();
  });

  it("renders equipment when items are found", () => {
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-1",
        baseItemId: "weapon_longsword",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockWeapon as never);

    render(<InventoryBoard />);
    expect(screen.getByText("Longsword")).toBeInTheDocument();
  });

  it("renders equipment with equip button", () => {
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-1",
        baseItemId: "weapon_longsword",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockWeapon as never);

    render(<InventoryBoard />);
    expect(screen.getByRole("button", { name: "Equip" })).toBeInTheDocument();
  });

  it("calls equipWeaponInstance when weapon equip button is clicked", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-1",
        baseItemId: "weapon_longsword",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockWeapon as never);

    render(<InventoryBoard />);
    await user.click(screen.getByRole("button", { name: "Equip" }));
    expect(store.equipWeaponInstance).toHaveBeenCalledWith("inst-1");
  });

  it("calls unequipWeaponInstance when equipped weapon button is clicked", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-1",
        baseItemId: "weapon_longsword",
        customName: undefined,
      },
    ];
    store.equippedWeaponInstanceIds = ["inst-1"];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockWeapon as never);

    render(<InventoryBoard />);
    await user.click(screen.getByRole("button", { name: "EQUIPPED" }));
    expect(store.unequipWeaponInstance).toHaveBeenCalledWith("inst-1");
  });

  it("calls removeInventoryInstance when drop button is clicked", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-1",
        baseItemId: "weapon_longsword",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockWeapon as never);

    render(<InventoryBoard />);
    const dropButton = screen.getByRole("button", { name: "Drop" });
    await user.click(dropButton);
    expect(store.removeInventoryInstance).toHaveBeenCalledWith("inst-1");
  });

  it("renders attuned magic items with attune button", () => {
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-magic",
        baseItemId: "magic_item",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockMagicItem as never);

    render(<InventoryBoard />);
    expect(screen.getByRole("button", { name: "Attune" })).toBeInTheDocument();
  });

  it("calls attuneInstance when attune button is clicked", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-magic",
        baseItemId: "magic_item",
        customName: undefined,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockMagicItem as never);

    render(<InventoryBoard />);
    await user.click(screen.getByRole("button", { name: "Attune" }));
    expect(store.attuneInstance).toHaveBeenCalledWith("inst-magic");
  });

  it("calls unattuneInstance when attuned item button is clicked", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryInstances = [
      {
        instanceId: "inst-magic",
        baseItemId: "magic_item",
        customName: undefined,
      },
    ];
    store.attunedInstanceIds = ["inst-magic"];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockMagicItem as never);

    render(<InventoryBoard />);
    await user.click(screen.getByRole("button", { name: "ATTUNED" }));
    expect(store.unattuneInstance).toHaveBeenCalledWith("inst-magic");
  });

  it("renders backpack items (stacks) with quantity controls", () => {
    const store = mockStoreActions();
    store.inventoryStacks = [
      {
        stackId: "stack-1",
        baseItemId: "adventuring_gear_rations",
        quantity: 5,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockRations as never);

    render(<InventoryBoard />);
    expect(screen.getByText("Rations")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls removeInventoryItem when stack is decremented", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryStacks = [
      {
        stackId: "stack-1",
        baseItemId: "adventuring_gear_rations",
        quantity: 5,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockRations as never);

    render(<InventoryBoard />);
    const minusButtons = screen.getAllByRole("button", { name: "-" });
    await user.click(minusButtons[0]);
    expect(store.removeInventoryItem).toHaveBeenCalledWith(
      "adventuring_gear_rations",
      1,
    );
  });

  it("calls addInventoryItem when stack is incremented", async () => {
    const user = userEvent.setup();
    const store = mockStoreActions();
    store.inventoryStacks = [
      {
        stackId: "stack-1",
        baseItemId: "adventuring_gear_rations",
        quantity: 5,
      },
    ];
    vi.mocked(useCharacterStore).mockReturnValue(store as never);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(mockRations as never);

    render(<InventoryBoard />);
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);
    expect(store.addInventoryItem).toHaveBeenCalledWith(
      "adventuring_gear_rations",
      1,
    );
  });
});
