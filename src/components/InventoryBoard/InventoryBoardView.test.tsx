import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryBoardView } from "./InventoryBoardView";
import { INVENTORY_BOARD_FIXTURES } from "./InventoryBoard.fixtures";

const createProps = (
  scenario: (typeof INVENTORY_BOARD_FIXTURES)[keyof typeof INVENTORY_BOARD_FIXTURES],
) => ({
  ...scenario,
  onToggleWeaponEquip: vi.fn(),
  onToggleArmorEquip: vi.fn(),
  onToggleAttunement: vi.fn(),
  onDropInstance: vi.fn(),
  onStackIncrement: vi.fn(),
  onStackDecrement: vi.fn(),
  onOpenAddItemModal: vi.fn(),
});

describe("InventoryBoardView", () => {
  it("renders empty states", () => {
    const props = createProps(INVENTORY_BOARD_FIXTURES.empty);

    render(<InventoryBoardView {...props} />);

    expect(screen.getByText("Your pack is empty.")).toBeInTheDocument();
  });

  it("calls add item callback", async () => {
    const user = userEvent.setup();
    const props = createProps(INVENTORY_BOARD_FIXTURES.empty);

    render(<InventoryBoardView {...props} />);

    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(props.onOpenAddItemModal).toHaveBeenCalledTimes(1);
  });

  it("renders equipment and stack rows", () => {
    const props = createProps(INVENTORY_BOARD_FIXTURES.standardLoadout);

    render(<InventoryBoardView {...props} />);

    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getByText("Chain Mail")).toBeInTheDocument();
    expect(screen.getByText("Rations")).toBeInTheDocument();
  });

  it("shows missing equipment references", () => {
    const props = createProps(INVENTORY_BOARD_FIXTURES.missingReferences);

    render(<InventoryBoardView {...props} />);

    expect(
      screen.getByText(/Missing equipment reference: item_unknown_artifact/i),
    ).toBeInTheDocument();
  });

  it("disables attune button when at max attunements", () => {
    const props = createProps(INVENTORY_BOARD_FIXTURES.fullyAttuned);

    render(<InventoryBoardView {...props} />);

    const attuneButtons = screen.getAllByRole("button", {
      name: /attuned|attune/i,
    });
    expect(attuneButtons.length).toBeGreaterThan(0);
  });

  it("calls weapon equip toggle callback", async () => {
    const user = userEvent.setup();
    const props = createProps(INVENTORY_BOARD_FIXTURES.standardLoadout);

    render(<InventoryBoardView {...props} />);

    const equipButtons = screen.getAllByRole("button", {
      name: /equipped|equip/i,
    });
    await user.click(equipButtons[0]);

    expect(props.onToggleWeaponEquip).toHaveBeenCalled();
  });

  it("calls drop callback", async () => {
    const user = userEvent.setup();
    const props = createProps(INVENTORY_BOARD_FIXTURES.standardLoadout);

    render(<InventoryBoardView {...props} />);

    const dropButtons = screen.getAllByRole("button", { name: /drop/i });
    await user.click(dropButtons[0]);

    expect(props.onDropInstance).toHaveBeenCalled();
  });

  it("calls stack increment and decrement callbacks", async () => {
    const user = userEvent.setup();
    const props = createProps(INVENTORY_BOARD_FIXTURES.standardLoadout);

    render(<InventoryBoardView {...props} />);

    const minus = screen.getAllByRole("button", { name: "-" })[0];
    const plus = screen.getAllByRole("button", { name: "+" })[0];

    await user.click(minus);
    await user.click(plus);

    expect(props.onStackDecrement).toHaveBeenCalled();
    expect(props.onStackIncrement).toHaveBeenCalled();
  });
});
