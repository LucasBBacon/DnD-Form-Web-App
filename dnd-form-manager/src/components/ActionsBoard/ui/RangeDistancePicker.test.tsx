import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RangeDistancePicker } from "./RangeDistancePicker";

describe("RangeDistancePicker", () => {
  it("renders normal range option", () => {
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 80 }}
        value="normal"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/Normal \(80 ft\)/)).toBeInTheDocument();
  });

  it("only renders long range option when it exists", () => {
    const { rerender } = render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 80 }}
        value="normal"
        onChange={() => {}}
      />,
    );
    expect(screen.queryByText(/Long/)).not.toBeInTheDocument();

    rerender(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 150, long: 600 }}
        value="normal"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/Long \(600 ft\)/)).toBeInTheDocument();
  });

  it("marks normal radio as checked when value is normal", () => {
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 80, long: 320 }}
        value="normal"
        onChange={() => {}}
      />,
    );
    const normalRadio = screen.getByRole("radio", { name: /Normal/ });
    expect(normalRadio).toBeChecked();
  });

  it("marks long radio as checked when value is long", () => {
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 150, long: 600 }}
        value="long"
        onChange={() => {}}
      />,
    );
    const longRadio = screen.getByRole("radio", { name: /Long/ });
    expect(longRadio).toBeChecked();
  });

  it("calls onChange when normal range is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 150, long: 600 }}
        value="long"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("radio", { name: /Normal/ }));
    expect(onChange).toHaveBeenCalledWith("normal");
  });

  it("calls onChange when long range is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 150, long: 600 }}
        value="normal"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("radio", { name: /Long/ }));
    expect(onChange).toHaveBeenCalledWith("long");
  });

  it("shows long range warning when long range is selected", () => {
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 150, long: 600 }}
        value="long"
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByText(/Long range selected: attacks are typically made with disadvantage/),
    ).toBeInTheDocument();
  });

  it("does not show warning when normal range is selected", () => {
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 150, long: 600 }}
        value="normal"
        onChange={() => {}}
      />,
    );
    expect(
      screen.queryByText(/Long range selected: attacks are typically made with disadvantage/),
    ).not.toBeInTheDocument();
  });

  it("renders fieldset with legend", () => {
    render(
      <RangeDistancePicker
        entryId="atk1"
        rangeInfo={{ normal: 80 }}
        value="normal"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Distance")).toBeInTheDocument();
  });
});
