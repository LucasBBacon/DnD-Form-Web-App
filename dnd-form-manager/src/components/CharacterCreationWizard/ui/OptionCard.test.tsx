import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptionCard } from "./OptionCard";

const option = {
  id: "elf",
  name: "Elf",
  tagline: "Graceful, keen-sensed, magical.",
  description: "Elves are a magical people...",
  traits: [],
  subOptions: [],
};

describe("OptionCard", () => {
  it("renders the name and tagline", () => {
    render(
      <OptionCard option={option} isSelected={false} onClick={() => {}} />,
    );
    expect(screen.getByText("Elf")).toBeInTheDocument();
    expect(
      screen.getByText("Graceful, keen-sensed, magical."),
    ).toBeInTheDocument();
  });

  it("renders the first letter as the initial avatar", () => {
    render(
      <OptionCard option={option} isSelected={false} onClick={() => {}} />,
    );
    expect(screen.getByText("E")).toBeInTheDocument();
  });

  it("does not show selected badge when not selected", () => {
    render(
      <OptionCard option={option} isSelected={false} onClick={() => {}} />,
    );
    expect(screen.queryByText("CHOSEN")).not.toBeInTheDocument();
  });

  it("shows CHOSEN badge when selected", () => {
    render(<OptionCard option={option} isSelected onClick={() => {}} />);
    expect(screen.getByText("CHOSEN")).toBeInTheDocument();
  });

  it("applies selected class when selected", () => {
    const { container } = render(
      <OptionCard option={option} isSelected onClick={() => {}} />,
    );
    expect(container.firstChild).toHaveClass("selected");
  });

  it("calls onClick when card is clicked", async () => {
    const onClick = vi.fn();
    render(<OptionCard option={option} isSelected={false} onClick={onClick} />);
    await userEvent.click(screen.getByText("Elf"));
    expect(onClick).toHaveBeenCalled();
  });
});
