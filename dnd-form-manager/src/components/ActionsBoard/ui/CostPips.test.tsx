import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CostPips } from "./CostPips";

describe("CostPips", () => {
  it("renders the correct total number of pips", () => {
    const { container } = render(<CostPips remaining={1} total={3} />);
    const pips = container.querySelectorAll(".cost-pip");
    expect(pips).toHaveLength(3);
  });

  it("marks the correct number of pips as filled", () => {
    const { container } = render(<CostPips remaining={2} total={3} />);
    expect(container.querySelectorAll(".filled")).toHaveLength(2);
    expect(container.querySelectorAll(".empty")).toHaveLength(1);
  });

  it("handles remaining=0 (all empty)", () => {
    const { container } = render(<CostPips remaining={0} total={3} />);
    expect(container.querySelectorAll(".filled")).toHaveLength(0);
    expect(container.querySelectorAll(".empty")).toHaveLength(3);
  });

  it("handles remaining equal to total (all filled)", () => {
    const { container } = render(<CostPips remaining={3} total={3} />);
    expect(container.querySelectorAll(".filled")).toHaveLength(3);
    expect(container.querySelectorAll(".empty")).toHaveLength(0);
  });

  it("renders at least 1 pip when total is 0", () => {
    const { container } = render(<CostPips remaining={0} total={0} />);
    expect(container.querySelectorAll(".cost-pip")).toHaveLength(1);
  });
});
