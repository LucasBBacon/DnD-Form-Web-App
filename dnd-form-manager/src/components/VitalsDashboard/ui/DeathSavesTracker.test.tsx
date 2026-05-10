import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeathSavesTracker } from "./DeathSavesTracker";

describe("DeathSavesTracker", () => {
  it("renders the section header", () => {
    render(<DeathSavesTracker successes={0} failures={0} onToggle={() => {}} />);
    expect(screen.getByText("DEATH SAVES")).toBeInTheDocument();
  });

  it("checks the correct number of success boxes", () => {
    const { container } = render(
      <DeathSavesTracker successes={2} failures={0} onToggle={() => {}} />,
    );
    const successCheckboxes = container.querySelectorAll(".successes input[type='checkbox']");
    expect(successCheckboxes[0]).toBeChecked();
    expect(successCheckboxes[1]).toBeChecked();
    expect(successCheckboxes[2]).not.toBeChecked();
  });

  it("calls onToggle with 'successes' when a success box is changed", async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <DeathSavesTracker successes={0} failures={0} onToggle={onToggle} />,
    );
    const firstSuccess = container.querySelectorAll(".successes input")[0];
    await userEvent.click(firstSuccess);
    expect(onToggle).toHaveBeenCalledWith("successes", true);
  });

  it("calls onToggle with 'failures' when a failure box is changed", async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <DeathSavesTracker successes={0} failures={0} onToggle={onToggle} />,
    );
    const firstFailure = container.querySelectorAll(".failures input")[0];
    await userEvent.click(firstFailure);
    expect(onToggle).toHaveBeenCalledWith("failures", true);
  });
});
