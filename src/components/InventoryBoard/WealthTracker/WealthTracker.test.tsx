/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  BASELINE_CHARACTER_STATE,
  useCharacterStore,
} from "../../../store/useCharacterStore";
import { WealthTracker } from "./WealthTracker";

describe("WealthTracker", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE } as any);
  });

  it("adds and removes coin through the wallet controls", () => {
    render(<WealthTracker />);

    fireEvent.change(screen.getByLabelText("Coin type"), {
      target: { value: "sp" },
    });
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByLabelText("SP balance")).toHaveValue(5);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByLabelText("SP balance")).toHaveValue(0);
  });

  it("consolidates the wallet when exchange is clicked", () => {
    useCharacterStore.getState().receiveCoins({ gp: 1, sp: 5, cp: 5 });

    render(<WealthTracker />);

    fireEvent.click(screen.getByRole("button", { name: "Exchange" }));

    expect(screen.getByLabelText("GP balance")).toHaveValue(1);
    expect(screen.getByLabelText("SP balance")).toHaveValue(1);
    expect(screen.getByLabelText("CP balance")).toHaveValue(5);
  });

  it("hides electrum and platinum when optional coins are disabled", () => {
    render(<WealthTracker allowElectrum={false} allowPlatinum={false} />);

    expect(screen.queryByLabelText("EP balance")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("PP balance")).not.toBeInTheDocument();
  });
});
