import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LabeledField } from "./LabeledField";

describe("LabeledField", () => {
  it("renders the label in uppercase", () => {
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="readonly"
      />,
    );
    expect(screen.getByText("CHARACTER NAME")).toBeInTheDocument();
  });

  it("displays the value in readonly mode", () => {
    render(
      <LabeledField
        label="Character Name"
        value="Thrall the Mighty"
        editMode="readonly"
      />,
    );
    expect(screen.getByText("Thrall the Mighty")).toBeInTheDocument();
  });

  it("displays dash for empty value", () => {
    render(<LabeledField label="Background" value="" editMode="readonly" />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders with readonly class", () => {
    const { container } = render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="readonly"
      />,
    );
    const fieldContainer = container.querySelector(".mode-readonly");
    expect(fieldContainer).toBeInTheDocument();
  });

  it("renders with inline class in readonly mode", () => {
    const { container } = render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={() => {}}
      />,
    );
    const fieldContainer = container.querySelector(".mode-inline");
    expect(fieldContainer).toBeInTheDocument();
  });

  it("renders with modal class for modal mode", () => {
    const { container } = render(
      <LabeledField
        label="Class & Level"
        value="Wizard 5"
        editMode="modal"
        onClickModal={() => {}}
      />,
    );
    const fieldContainer = container.querySelector(".mode-modal");
    expect(fieldContainer).toBeInTheDocument();
  });

  it("enters edit mode when clicked in inline mode", async () => {
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={() => {}}
      />,
    );

    const fieldContainer = screen
      .getByText("Thrall")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    const input = screen.getByDisplayValue("Thrall");
    expect(input).toBeInTheDocument();
  });

  it("calls onChange when saving inline edit", async () => {
    const mockOnChange = vi.fn();
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={mockOnChange}
      />,
    );

    // Click to enter edit mode
    const fieldContainer = screen
      .getByText("Thrall")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    // Edit the value
    const input = screen.getByDisplayValue("Thrall");
    await userEvent.clear(input);
    await userEvent.type(input, "Thrall 2");

    // Save by pressing Enter
    await userEvent.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith("Thrall 2");
  });

  it("cancels edit when pressing Escape", async () => {
    const mockOnChange = vi.fn();
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={mockOnChange}
      />,
    );

    // Click to enter edit mode
    const fieldContainer = screen
      .getByText("Thrall")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    // Edit the value
    const input = screen.getByDisplayValue("Thrall");
    await userEvent.clear(input);
    await userEvent.type(input, "NewName");

    // Cancel by pressing Escape
    await userEvent.keyboard("{Escape}");

    // Should return to display mode with original value
    expect(screen.getByText("Thrall")).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("saves edit on blur", async () => {
    const mockOnChange = vi.fn();
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={mockOnChange}
      />,
    );

    // Click to enter edit mode
    const fieldContainer = screen
      .getByText("Thrall")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    // Edit the value
    const input = screen.getByDisplayValue("Thrall");
    await userEvent.clear(input);
    await userEvent.type(input, "Thrall Updated");

    // Blur the input
    await userEvent.click(document.body);

    expect(mockOnChange).toHaveBeenCalledWith("Thrall Updated");
  });

  it("does not call onChange if value unchanged", async () => {
    const mockOnChange = vi.fn();
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={mockOnChange}
      />,
    );

    // Click to enter edit mode
    const fieldContainer = screen
      .getByText("Thrall")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    // Save without changing
    await userEvent.keyboard("{Enter}");

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("calls onClickModal when clicked in modal mode", async () => {
    const mockOnClick = vi.fn();
    render(
      <LabeledField
        label="Class & Level"
        value="Wizard 5"
        editMode="modal"
        onClickModal={mockOnClick}
      />,
    );

    const fieldValue = screen.getByText("Wizard 5");
    await userEvent.click(fieldValue);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <LabeledField
        label="Special Field"
        value="Test"
        editMode="readonly"
        className="custom-class"
      />,
    );
    const fieldContainer = container.querySelector(".custom-class");
    expect(fieldContainer).toBeInTheDocument();
  });

  it("renders with text input type by default", async () => {
    render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={() => {}}
      />,
    );

    // Click to enter edit mode
    const fieldContainer = screen
      .getByText("Thrall")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    const input = screen.getByDisplayValue("Thrall") as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("renders with number input type when specified", async () => {
    render(
      <LabeledField
        label="Experience Points"
        value={6500}
        editMode="inline"
        onChange={() => {}}
        type="number"
      />,
    );

    // Click to enter edit mode
    const fieldContainer = screen
      .getByText("6500")
      .closest(".labeled-field-container");
    await userEvent.click(fieldContainer!);

    const input = screen.getByDisplayValue("6500") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  it("displays edit icon in inline mode", async () => {
    const { container } = render(
      <LabeledField
        label="Character Name"
        value="Thrall"
        editMode="inline"
        onChange={() => {}}
      />,
    );

    const editIcon = container.querySelector(".edit-icon");
    expect(editIcon).toBeInTheDocument();
  });

  it("displays cog icon in modal mode", () => {
    const { container } = render(
      <LabeledField
        label="Class & Level"
        value="Wizard 5"
        editMode="modal"
        onClickModal={() => {}}
      />,
    );

    const editIcon = container.querySelector(".edit-icon");
    expect(editIcon).toBeInTheDocument();
  });
});
