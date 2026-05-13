import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VersatileModeToggle } from "./VersatileModeToggle";

describe("VersatileModeToggle", () => {
  it("renders both one-handed and two-handed options", () => {
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d8"
        versatileDamageDice="1d10"
        value="one-handed"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/1-handed \(1d8\)/)).toBeInTheDocument();
    expect(screen.getByText(/2-handed \(1d10\)/)).toBeInTheDocument();
  });

  it("marks one-handed radio as checked when value is one-handed", () => {
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d8"
        versatileDamageDice="1d10"
        value="one-handed"
        onChange={() => {}}
      />,
    );
    const oneHandedRadio = screen.getByRole("radio", { name: /1-handed/ });
    expect(oneHandedRadio).toBeChecked();
  });

  it("marks two-handed radio as checked when value is two-handed", () => {
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d8"
        versatileDamageDice="1d10"
        value="two-handed"
        onChange={() => {}}
      />,
    );
    const twoHandedRadio = screen.getByRole("radio", { name: /2-handed/ });
    expect(twoHandedRadio).toBeChecked();
  });

  it("calls onChange with one-handed when one-handed is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d8"
        versatileDamageDice="1d10"
        value="two-handed"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("radio", { name: /1-handed/ }));
    expect(onChange).toHaveBeenCalledWith("one-handed");
  });

  it("calls onChange with two-handed when two-handed is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d8"
        versatileDamageDice="1d10"
        value="one-handed"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("radio", { name: /2-handed/ }));
    expect(onChange).toHaveBeenCalledWith("two-handed");
  });

  it("renders fieldset with legend", () => {
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d8"
        versatileDamageDice="1d10"
        value="one-handed"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Grip")).toBeInTheDocument();
  });

  it("displays damage dice in option labels", () => {
    render(
      <VersatileModeToggle
        entryId="sword1"
        baseDamageDice="1d6"
        versatileDamageDice="1d8"
        value="one-handed"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/1d6/)).toBeInTheDocument();
    expect(screen.getByText(/1d8/)).toBeInTheDocument();
  });
});
