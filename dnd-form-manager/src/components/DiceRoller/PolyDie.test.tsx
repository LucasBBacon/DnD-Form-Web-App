import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PolyDie } from "./PolyDie";

describe("PolyDie", () => {
  it("renders the die with the correct value", () => {
    render(<PolyDie sides={20} value={15} isRolling={false} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders d4 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={4} value={3} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d4");
    expect(die).toBeInTheDocument();
  });

  it("renders d6 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={6} value={4} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d6");
    expect(die).toBeInTheDocument();
  });

  it("renders d8 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={8} value={5} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d8");
    expect(die).toBeInTheDocument();
  });

  it("renders d10 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={10} value={7} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d10");
    expect(die).toBeInTheDocument();
  });

  it("renders d12 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={12} value={9} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d12");
    expect(die).toBeInTheDocument();
  });

  it("renders d20 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={20} value={15} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d20");
    expect(die).toBeInTheDocument();
  });

  it("renders d100 with correct shape class", () => {
    const { container } = render(
      <PolyDie sides={100} value={50} isRolling={false} />,
    );
    const die = container.querySelector(".shape-d100");
    expect(die).toBeInTheDocument();
  });

  it("displays d100 value as tens place when not zero", () => {
    render(<PolyDie sides={100} value={37} isRolling={false} />);
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("displays d100 value as 00 for multiples of 10", () => {
    render(<PolyDie sides={100} value={10} isRolling={false} />);
    expect(screen.getByText("00")).toBeInTheDocument();
  });

  it("displays d100 value as tens place for other values", () => {
    render(<PolyDie sides={100} value={25} isRolling={false} />);
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("adds rolling class when isRolling is true", () => {
    const { container } = render(
      <PolyDie sides={20} value={12} isRolling={true} />,
    );
    const die = container.querySelector(".rolling");
    expect(die).toBeInTheDocument();
  });

  it("does not add rolling class when isRolling is false", () => {
    const { container } = render(
      <PolyDie sides={20} value={12} isRolling={false} />,
    );
    const die = container.querySelector(".die-base");
    expect(die).not.toHaveClass("rolling");
  });

  it("adds crit-success class for d20 with value 20", () => {
    const { container } = render(
      <PolyDie sides={20} value={20} isRolling={false} />,
    );
    const die = container.querySelector(".crit-success");
    expect(die).toBeInTheDocument();
  });

  it("adds crit-fail class for d20 with value 1", () => {
    const { container } = render(
      <PolyDie sides={20} value={1} isRolling={false} />,
    );
    const die = container.querySelector(".crit-fail");
    expect(die).toBeInTheDocument();
  });

  it("does not add crit class for d20 with normal values", () => {
    const { container } = render(
      <PolyDie sides={20} value={10} isRolling={false} />,
    );
    const die = container.querySelector(".die-base");
    expect(die).not.toHaveClass("crit-success");
    expect(die).not.toHaveClass("crit-fail");
  });

  it("does not add crit class for other die types even with 20 or 1", () => {
    const { container } = render(
      <PolyDie sides={100} value={20} isRolling={false} />,
    );
    const die = container.querySelector(".die-base");
    expect(die).not.toHaveClass("crit-success");
    expect(die).not.toHaveClass("crit-fail");
  });

  it("combines rolling and crit classes correctly", () => {
    const { container } = render(
      <PolyDie sides={20} value={20} isRolling={true} />,
    );
    const die = container.querySelector(".die-base");
    expect(die).toHaveClass("rolling");
    // Note: crit-success class is not added when isRolling is true
    expect(die).not.toHaveClass("crit-success");
  });

  it("shows crit-success when not rolling with value 20", () => {
    const { container } = render(
      <PolyDie sides={20} value={20} isRolling={false} />,
    );
    const die = container.querySelector(".die-base");
    expect(die).toHaveClass("crit-success");
    expect(die).not.toHaveClass("rolling");
  });
});
