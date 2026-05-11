// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VitalsDashboard } from "./VitalsDashboard";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useCharacterStats } from "../../hooks/useCharacterStats";

vi.mock("../store/useCharacterStore");
vi.mock("../hooks/useCharacterStats");

describe("VitalsDashboard rest actions", () => {
  const openRestModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 5,
      tempHp: 0,
      deathSaves: { successes: 0, failures: 0 },
      expendedHitDice: 2,
      takeDamage: vi.fn(),
      heal: vi.fn(),
      setTempHp: vi.fn(),
      recordDeathSave: vi.fn(),
      openRestModal,
    } as never);

    vi.mocked(useCharacterStats).mockReturnValue({
      combat: {
        armorClass: 16,
        initiative: 2,
        speed: 30,
        isArmorPenalized: false,
        hp: {
          current: 24,
          max: 31,
        },
      },
    } as never);
  });

  it("opens short and long rest modals from vitals controls", async () => {
    const user = userEvent.setup();

    render(<VitalsDashboard />);

    await user.click(screen.getByRole("button", { name: "Short Rest" }));
    await user.click(screen.getByRole("button", { name: "Long Rest" }));

    expect(openRestModal).toHaveBeenNthCalledWith(1, "short");
    expect(openRestModal).toHaveBeenNthCalledWith(2, "long");
  });
});
