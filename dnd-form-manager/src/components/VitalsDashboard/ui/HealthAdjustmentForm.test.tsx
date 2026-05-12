import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HealthAdjustmentForm } from "./HealthAdjustmentForm";

const noop = () => {};

describe("HealthAdjustmentForm", () => {
  it("shows mode buttons when no active mode", () => {
    render(
      <HealthAdjustmentForm
        activeMode={null}
        inputValue=""
        onInputChange={noop}
        onSubmit={noop}
        onModeSelect={noop}
        onCancel={noop}
      />,
    );
    expect(screen.getByText("Damage")).toBeInTheDocument();
    expect(screen.getByText("Heal")).toBeInTheDocument();
    expect(screen.getByText("Temp HP")).toBeInTheDocument();
  });

  it("calls onModeSelect with correct mode when Damage is clicked", async () => {
    const onModeSelect = vi.fn();
    render(
      <HealthAdjustmentForm
        activeMode={null}
        inputValue=""
        onInputChange={noop}
        onSubmit={noop}
        onModeSelect={onModeSelect}
        onCancel={noop}
      />,
    );
    await userEvent.click(screen.getByText("Damage"));
    expect(onModeSelect).toHaveBeenCalledWith("damage");
  });

  it("shows input form when activeMode is set", () => {
    render(
      <HealthAdjustmentForm
        activeMode="damage"
        inputValue={8}
        onInputChange={noop}
        onSubmit={noop}
        onModeSelect={noop}
        onCancel={noop}
      />,
    );
    expect(
      screen.getByPlaceholderText("Enter damage amount"),
    ).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  it("calls onCancel when ✕ is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <HealthAdjustmentForm
        activeMode="heal"
        inputValue=""
        onInputChange={noop}
        onSubmit={noop}
        onModeSelect={noop}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByText("✕"));
    expect(onCancel).toHaveBeenCalled();
  });
});
