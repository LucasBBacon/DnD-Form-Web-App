import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabBar } from "./TabBar";

const tabs = [
  { id: "features", label: "FEATURES & TRAITS" },
  { id: "characteristics", label: "CHARACTERISTICS" },
];

describe("TabBar", () => {
  it("renders all tab labels", () => {
    render(<TabBar tabs={tabs} activeId="features" onChange={() => {}} />);
    expect(screen.getByText("FEATURES & TRAITS")).toBeInTheDocument();
    expect(screen.getByText("CHARACTERISTICS")).toBeInTheDocument();
  });

  it("applies active class to the current tab", () => {
    render(
      <TabBar tabs={tabs} activeId="characteristics" onChange={() => {}} />,
    );
    expect(screen.getByText("CHARACTERISTICS").closest("button")).toHaveClass(
      "active",
    );
    expect(
      screen.getByText("FEATURES & TRAITS").closest("button"),
    ).not.toHaveClass("active");
  });

  it("calls onChange with the tab id when clicked", async () => {
    const onChange = vi.fn();
    render(<TabBar tabs={tabs} activeId="features" onChange={onChange} />);
    await userEvent.click(screen.getByText("CHARACTERISTICS"));
    expect(onChange).toHaveBeenCalledWith("characteristics");
  });
});
