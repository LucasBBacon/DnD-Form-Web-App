import type { Meta, StoryObj } from "@storybook/react-vite";
import { LabeledField } from "./LabeledField";

const meta = {
  title: "Components/Utils/LabeledField",
  component: LabeledField,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LabeledField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  args: {
    label: "Character Name",
    value: "Thrall the Mighty",
    editMode: "readonly",
  },
};

export const InlineEditable: Story = {
  args: {
    label: "Character Name",
    value: "Thrall the Mighty",
    editMode: "inline",
    onChange: () => {},
  },
};

export const ModalClickable: Story = {
  args: {
    label: "Class & Level",
    value: "Wizard 5",
    editMode: "modal",
    onClickModal: () => alert("Modal opened"),
  },
};

export const Empty: Story = {
  args: {
    label: "Background",
    value: "",
    editMode: "readonly",
  },
};

export const NumericValue: Story = {
  args: {
    label: "Experience Points",
    value: 6500,
    editMode: "inline",
    onChange: () => {},
    type: "number",
  },
};

export const LongValue: Story = {
  args: {
    label: "Character Description",
    value:
      "A seasoned adventurer with years of experience in dungeon delving and dragon slaying.",
    editMode: "readonly",
  },
};

export const Interactive: Story = {
  args: {
    label: "Player Name",
    value: "Alice",
    editMode: "inline",
    onChange: (value) => alert(`Changed to: ${value}`),
  },
};

export const WithCustomClass: Story = {
  args: {
    label: "Special Field",
    value: "Custom styled",
    editMode: "readonly",
    className: "custom-field-class",
  },
};
