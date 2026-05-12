import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleplayBoardView } from "./RoleplayBoardView";
import { ROLEPLAY_BOARD_FIXTURES } from "./RoleplayBoard.fixtures";

const createProps = (
  scenario: (typeof ROLEPLAY_BOARD_FIXTURES)[keyof typeof ROLEPLAY_BOARD_FIXTURES],
) => ({
  ...scenario,
  onTabChange: vi.fn(),
  onRoleplayFieldBlur: vi.fn(),
  spellbookView: <div data-testid="spellbook-placeholder">Spellbook Placeholder</div>,
});

describe("RoleplayBoardView", () => {
  it("renders empty features state", () => {
    const props = createProps(ROLEPLAY_BOARD_FIXTURES.featuresEmpty);

    render(<RoleplayBoardView {...props} />);

    expect(screen.getByText("No features acquired yet.")).toBeInTheDocument();
  });

  it("renders feature cards with source badges", () => {
    const props = createProps(ROLEPLAY_BOARD_FIXTURES.featuresLoaded);

    render(<RoleplayBoardView {...props} />);

    expect(screen.getByText("Darkvision")).toBeInTheDocument();
    expect(screen.getByText("Fighter level 2")).toBeInTheDocument();
  });

  it("calls onTabChange when user selects tab", async () => {
    const user = userEvent.setup();
    const props = createProps(ROLEPLAY_BOARD_FIXTURES.featuresLoaded);

    render(<RoleplayBoardView {...props} />);

    await user.click(screen.getByRole("button", { name: /biography/i }));

    expect(props.onTabChange).toHaveBeenCalledWith("biography");
  });

  it("calls onRoleplayFieldBlur for characteristics fields", async () => {
    const user = userEvent.setup();
    const props = createProps(ROLEPLAY_BOARD_FIXTURES.characteristicsFilled);

    render(<RoleplayBoardView {...props} />);

    const ideals = screen.getByPlaceholderText("Enter your ideals...");
    await user.clear(ideals);
    await user.type(ideals, "Justice above all.");
    await user.tab();

    expect(props.onRoleplayFieldBlur).toHaveBeenCalledWith(
      "ideals",
      "Justice above all.",
    );
  });

  it("renders biography fields on biography tab", () => {
    const props = createProps(ROLEPLAY_BOARD_FIXTURES.biographyDetailed);

    render(<RoleplayBoardView {...props} />);

    expect(screen.getByText("AGE")).toBeInTheDocument();
    expect(screen.getByText("BACKSTORY")).toBeInTheDocument();
    expect(screen.getByText("ALLIES & ORGANIZATIONS")).toBeInTheDocument();
  });

  it("renders spellbook content on spellbook tab", () => {
    const props = createProps(ROLEPLAY_BOARD_FIXTURES.spellbookTab);

    render(<RoleplayBoardView {...props} />);

    expect(screen.getByTestId("spellbook-placeholder")).toBeInTheDocument();
  });
});
