import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TraitActionsView } from "./TraitActionsView";
import type { ActionData } from "../../../types/action";

const buildAction = (overrides: Partial<ActionData> = {}): ActionData => ({
  id: "action_breath_weapon_cold_cone",
  name: "Cold Breath",
  activation: {
    actionType: "action",
  },
  range: {
    type: "self",
  },
  ...overrides,
});

describe("TraitActionsView", () => {
  it("shows empty state when there are no trait-granted actions", () => {
    render(<TraitActionsView actions={[]} />);

    expect(
      screen.getByText("No trait-granted actions available."),
    ).toBeInTheDocument();
  });

  it("expands and collapses action details", async () => {
    const user = userEvent.setup();

    render(
      <TraitActionsView
        actions={[
          buildAction({
            description: "A burst of freezing breath.",
            areaOfEffect: {
              shape: "cone",
              size: 15,
            },
            savingThrow: {
              ability: "con",
              dcCalculation: {
                base: 8,
                modifierStat: "con",
              },
              onSave: "half_damage",
            },
            output: {
              damage: [{ type: "cold", roll: "2d6" }],
            },
          }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cold breath/i }));

    expect(screen.getByText(/A burst of freezing breath\./i)).toBeInTheDocument();
    expect(screen.getByText(/15 ft Cone/i)).toBeInTheDocument();
    expect(screen.getByText(/2d6 cold/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cold breath/i }));

    expect(
      screen.queryByText(/A burst of freezing breath\./i),
    ).not.toBeInTheDocument();
  });

  it("shows fallback description text when action has no description", async () => {
    const user = userEvent.setup();

    render(<TraitActionsView actions={[buildAction()]} />);

    await user.click(screen.getByRole("button", { name: /cold breath/i }));

    expect(screen.getByText("No description available.")).toBeInTheDocument();
  });
});
