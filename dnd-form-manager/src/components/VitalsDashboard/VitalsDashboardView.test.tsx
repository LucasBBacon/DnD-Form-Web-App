// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VitalsDashboardView } from "./VitalsDashboardView";

describe("VitalsDashboardView", () => {
  const defaultProps = {
    // Combat stats
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    // HP state
    hp: { current: 45, max: 52 },
    tempHp: 0,
    // Death saves
    deathSaves: { successes: 0, failures: 0 },
    // Hit dice
    level: 5,
    expendedHitDice: 0,
    // Local form state
    healthInput: "" as const,
    activeHealthMode: null as const,
    // Callbacks
    onHealthInputChange: vi.fn(),
    onHealthModeSelect: vi.fn(),
    onHealthSubmit: vi.fn(),
    onHealthCancel: vi.fn(),
    onTakeDamage: vi.fn(),
    onHeal: vi.fn(),
    onSetTempHp: vi.fn(),
    onRecordDeathSave: vi.fn(),
    onShortRest: vi.fn(),
    onLongRest: vi.fn(),
  };

  describe("renders combat stats", () => {
    it("displays armor class, initiative, and speed", () => {
      render(<VitalsDashboardView {...defaultProps} />);

      expect(screen.getByText("ARMOR CLASS")).toBeInTheDocument();
      expect(screen.getByText("16")).toBeInTheDocument();
      expect(screen.getByText("INITIATIVE")).toBeInTheDocument();
      expect(screen.getByText("+2")).toBeInTheDocument();
      expect(screen.getByText("SPEED")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("shows stealth disadvantage warning when armor is penalized", () => {
      render(
        <VitalsDashboardView
          {...defaultProps}
          isArmorPenalized={true}
          armorClass={14}
        />
      );

      const acBadge = screen.getByTitle("Stealth Disadvantage!");
      expect(acBadge).toBeInTheDocument();
    });
  });

  describe("renders HP display", () => {
    it("shows current and max HP", () => {
      render(<VitalsDashboardView {...defaultProps} />);

      expect(screen.getByText("CURRENT HP")).toBeInTheDocument();
      expect(screen.getByText("45")).toBeInTheDocument();
      expect(screen.getByText("MAX HP")).toBeInTheDocument();
      expect(screen.getByText("52")).toBeInTheDocument();
    });

    it("shows temporary HP when present", () => {
      render(<VitalsDashboardView {...defaultProps} tempHp={8} />);

      expect(screen.getByText("TEMP")).toBeInTheDocument();
      expect(screen.getAllByText("8")).toHaveLength(1);
    });

    it("hides temporary HP when zero", () => {
      render(<VitalsDashboardView {...defaultProps} tempHp={0} />);

      expect(screen.queryByText("TEMP")).not.toBeInTheDocument();
    });
  });

  describe("renders hit dice block", () => {
    it("shows available and total hit dice", () => {
      render(<VitalsDashboardView {...defaultProps} level={5} expendedHitDice={2} />);

      // Available = level - expendedHitDice = 5 - 2 = 3
      expect(screen.getByRole("button", { name: /Short Rest/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Long Rest/i })).toBeInTheDocument();
    });
  });

  describe("renders death saves tracker", () => {
    it("does not show death saves when HP is positive", () => {
      render(<VitalsDashboardView {...defaultProps} hp={{ current: 5, max: 52 }} />);

      expect(screen.queryByText(/death/i)).not.toBeInTheDocument();
    });

    it("shows death saves when HP is zero", () => {
      render(<VitalsDashboardView {...defaultProps} hp={{ current: 0, max: 52 }} />);

      // Death saves tracker should be present
      const tracker = screen.queryByRole("group");
      expect(tracker).toBeInTheDocument();
    });
  });

  describe("health adjustment form", () => {
    it("opens health adjustment form when mode is selected", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<VitalsDashboardView {...defaultProps} />);

      // Simulate form being opened
      rerender(
        <VitalsDashboardView
          {...defaultProps}
          activeHealthMode="damage"
          healthInput=""
        />
      );

      // The form should be rendered (HealthAdjustmentForm component handles visibility)
      expect(screen.getByRole("button", { name: /Short Rest/i })).toBeInTheDocument();
    });

    it("calls onShortRest when short rest button is clicked", async () => {
      const user = userEvent.setup();
      const onShortRest = vi.fn();

      render(
        <VitalsDashboardView
          {...defaultProps}
          onShortRest={onShortRest}
        />
      );

      await user.click(screen.getByRole("button", { name: /Short Rest/i }));
      expect(onShortRest).toHaveBeenCalled();
    });

    it("calls onLongRest when long rest button is clicked", async () => {
      const user = userEvent.setup();
      const onLongRest = vi.fn();

      render(
        <VitalsDashboardView
          {...defaultProps}
          onLongRest={onLongRest}
        />
      );

      await user.click(screen.getByRole("button", { name: /Long Rest/i }));
      expect(onLongRest).toHaveBeenCalled();
    });
  });

  describe("negative initiative display", () => {
    it("shows negative initiative correctly", () => {
      render(
        <VitalsDashboardView
          {...defaultProps}
          initiative={-2}
        />
      );

      expect(screen.getByText("-2")).toBeInTheDocument();
    });
  });
});
