import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HpDisplay } from "./HpDisplay";

describe("HpDisplay", () => {
  it("renders current and max HP", () => {
    render(<HpDisplay current={30} max={52} temp={0} />);
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("52")).toBeInTheDocument();
    expect(screen.getByText("CURRENT HP")).toBeInTheDocument();
    expect(screen.getByText("MAX HP")).toBeInTheDocument();
  });

  it("hides temp HP when temp is 0", () => {
    render(<HpDisplay current={30} max={52} temp={0} />);
    expect(screen.queryByText("TEMP")).not.toBeInTheDocument();
  });

  it("shows temp HP when temp is greater than 0", () => {
    render(<HpDisplay current={30} max={52} temp={8} />);
    expect(screen.getByText("TEMP")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
