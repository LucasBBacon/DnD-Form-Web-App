import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { GearCard } from "./GearCard";
import type { InventoryBoardItemData } from "../InventoryBoardView";

const gearItem: InventoryBoardItemData = {
  name: "Rations",
  type: "adventuring_gear",
  weight: 2,
  cpCost: 50,
  lore: {
    shortDescription: "One day of preserved trail food.",
  },
};

const createProps = (
  overrides: Partial<React.ComponentProps<typeof GearCard>> = {},
): React.ComponentProps<typeof GearCard> => ({
  stackId: "stack-1",
  itemData: gearItem,
  quantity: 3,
  baseItemId: "adventuring_gear_rations",
  onStackIncrement: vi.fn(),
  onStackDecrement: vi.fn(),
  formatItemCost: (cpCost: number) => `${cpCost} CP`,
  ...overrides,
});

describe("GearCard", () => {
  it("renders gear details and quantity", () => {
    render(<GearCard {...createProps()} />);

    expect(screen.getByText("Rations")).toBeInTheDocument();
    expect(screen.getByText(/preserved trail food/i)).toBeInTheDocument();
    expect(screen.getByText(/50 CP/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calculates total stack weight", () => {
    render(<GearCard {...createProps({ quantity: 4 })} />);

    expect(screen.getByText("8 lbs total")).toBeInTheDocument();
  });

  it("calls stack decrement and increment callbacks with base item id", async () => {
    const user = userEvent.setup();
    const props = createProps({ baseItemId: "adventuring_gear_torch" });

    render(<GearCard {...props} />);

    await user.click(screen.getByRole("button", { name: "-" }));
    await user.click(screen.getByRole("button", { name: "+" }));

    expect(props.onStackDecrement).toHaveBeenCalledWith("adventuring_gear_torch");
    expect(props.onStackIncrement).toHaveBeenCalledWith("adventuring_gear_torch");
  });
});