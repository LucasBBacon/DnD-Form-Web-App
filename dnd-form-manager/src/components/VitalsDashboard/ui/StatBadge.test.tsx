import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatBadge } from "./StatBadge";

describe("StatBadge", () => {
  it("renders label and value", () => {
    render(<StatBadge label="ARMOR CLASS" value={16} />);
    expect(screen.getByText("ARMOR CLASS")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("applies extra className", () => {
    const { container } = render(
      <StatBadge label="ARMOR CLASS" value={16} className="shield" />,
    );
    expect(container.firstChild).toHaveClass("shield");
  });

  it("shows warning icon when warning is true", () => {
    render(<StatBadge label="ARMOR CLASS" value={14} warning />);
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("does not show warning icon when warning is false", () => {
    render(<StatBadge label="ARMOR CLASS" value={16} warning={false} />);
    expect(screen.queryByText("⚠️")).not.toBeInTheDocument();
  });

  it("forwards the title attribute", () => {
    const { container } = render(
      <StatBadge label="AC" value={16} title="Armor Class" />,
    );
    expect(container.firstChild).toHaveAttribute("title", "Armor Class");
  });
});
