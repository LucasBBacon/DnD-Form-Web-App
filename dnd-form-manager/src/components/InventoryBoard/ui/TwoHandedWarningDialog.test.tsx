import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TwoHandedWarningDialog } from "./TwoHandedWarningDialog";

describe("TwoHandedWarningDialog", () => {
  it("renders dialog title", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Two-Handed Conflict")).toBeInTheDocument();
  });

  it("displays weapon name in the message", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/Greatsword/)).toBeInTheDocument();
  });

  it("displays conflicting shield name when provided", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName="Wooden Shield"
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/Shield: Wooden Shield/)).toBeInTheDocument();
  });

  it("does not display shield row when conflictingShieldName is null", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.queryByText(/Shield:/)).not.toBeInTheDocument();
  });

  it("displays all conflicting weapon names", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={["Longsword", "Dagger"]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/Weapon: Longsword/)).toBeInTheDocument();
    expect(screen.getByText(/Weapon: Dagger/)).toBeInTheDocument();
  });

  it("renders Cancel button", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders Unequip & Equip button", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Unequip & Equip" }),
    ).toBeInTheDocument();
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={onCancel}
        onConfirm={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onConfirm when Unequip & Equip button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unequip & Equip" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("has dialog role and aria attributes", () => {
    const { container } = render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    const dialog = container.querySelector(".two-handed-dialog");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Two-handed weapon conflict");
  });

  it("renders backdrop element with presentation role", () => {
    const { container } = render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName={null}
        conflictingWeaponNames={[]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(
      container.querySelector(".two-handed-dialog-backdrop"),
    ).toBeInTheDocument();
    expect(container.querySelector(".two-handed-dialog-backdrop")).toHaveAttribute(
      "role",
      "presentation",
    );
  });

  it("renders conflict list in unordered list", () => {
    render(
      <TwoHandedWarningDialog
        weaponName="Greatsword"
        conflictingShieldName="Shield"
        conflictingWeaponNames={["Weapon1", "Weapon2"]}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });
});
