import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EncumbranceDisplay } from "./EncumbranceDisplay";

describe("EncumbranceDisplay", () => {
  it("renders the weight and capacity", () => {
    render(
      <EncumbranceDisplay totalWeight={45.5} capacity={150} isEncumbered={false} />,
    );
    expect(screen.getByText("45.5")).toBeInTheDocument();
    expect(screen.getByText("/ 150 lbs")).toBeInTheDocument();
  });

  it("rounds weight to one decimal place", () => {
    render(
      <EncumbranceDisplay totalWeight={45.55} capacity={150} isEncumbered={false} />,
    );
    expect(screen.getByText("45.6")).toBeInTheDocument();
  });

  it("does not show encumbered warning when not encumbered", () => {
    render(
      <EncumbranceDisplay totalWeight={50} capacity={150} isEncumbered={false} />,
    );
    expect(screen.queryByText(/Encumbered/i)).not.toBeInTheDocument();
  });

  it("shows encumbered warning when encumbered", () => {
    render(
      <EncumbranceDisplay totalWeight={160} capacity={150} isEncumbered />,
    );
    expect(screen.getByText("Encumbered (Speed - 10)")).toBeInTheDocument();
  });

  it("applies encumbered class when encumbered", () => {
    const { container } = render(
      <EncumbranceDisplay totalWeight={160} capacity={150} isEncumbered />,
    );
    expect(container.firstChild).toHaveClass("encumbered");
  });
});
