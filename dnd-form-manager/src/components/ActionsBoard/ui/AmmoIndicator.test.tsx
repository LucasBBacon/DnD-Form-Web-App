import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AmmoIndicator } from "./AmmoIndicator";

describe("AmmoIndicator", () => {
  it("renders ammo count and label", () => {
    render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 20 }} />,
    );
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Arrows")).toBeInTheDocument();
  });

  it("applies ammo-ok class when count > 5", () => {
    const { container } = render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 10 }} />,
    );
    expect(container.querySelector(".ammo-ok")).toBeInTheDocument();
  });

  it("applies ammo-low class when count <= 5", () => {
    const { container } = render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 3 }} />,
    );
    expect(container.querySelector(".ammo-low")).toBeInTheDocument();
  });

  it("applies ammo-empty class when count === 0", () => {
    const { container } = render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 0 }} />,
    );
    expect(container.querySelector(".ammo-empty")).toBeInTheDocument();
  });

  it("shows alert when no ammo", () => {
    render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 0 }} />,
    );
    expect(screen.getByText("No ammo!")).toBeInTheDocument();
  });

  it("does not show alert when ammo is available", () => {
    render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 5 }} />,
    );
    expect(screen.queryByText("No ammo!")).not.toBeInTheDocument();
  });

  it("uses default label when name is null", () => {
    render(
      <AmmoIndicator ammo={{ id: "ammo:unknown", name: null, count: 10 }} />,
    );
    expect(screen.getByText("Ammunition")).toBeInTheDocument();
  });

  it("treats null count as 0", () => {
    const { container } = render(
      <AmmoIndicator ammo={{ id: "ammo:bolts", name: "Bolts", count: null }} />,
    );
    expect(container.querySelector(".ammo-empty")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders ammo icon element", () => {
    const { container } = render(
      <AmmoIndicator ammo={{ id: "ammo:arrows", name: "Arrows", count: 5 }} />,
    );
    expect(container.querySelector(".ammo-icon")).toBeInTheDocument();
  });
});
