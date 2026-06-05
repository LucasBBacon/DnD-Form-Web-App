import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ManuscriptField } from "./ManuscriptField";

const fieldOptions = [
  "personalityTraits",
  "ideals",
  "bonds",
  "flaws",
  "age",
  "height",
  "weight",
  "eyes",
  "skin",
  "hair",
  "appearance",
  "backstory",
  "alliesAndOrganizations",
] as const;

const meta: Meta<typeof ManuscriptField> = {
  title: "RoleplayBoard/ManuscriptField",
  component: ManuscriptField,
  tags: ["autodocs"],
  args: {
    label: "BACKSTORY",
    fieldId: "backstory",
    initialValue: "Raised in the shadow of ancient ruins.",
    isMultiline: false,
    className: "",
    onBlur: fn(),
  },
  argTypes: {
    fieldId: {
      control: "select",
      options: fieldOptions,
    },
    isMultiline: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ManuscriptField>;

export const SingleLine: Story = {
  args: {
    label: "AGE",
    fieldId: "age",
    initialValue: "126",
    isMultiline: false,
  },
};

export const Multiline: Story = {
  args: {
    label: "BACKSTORY",
    fieldId: "backstory",
    initialValue:
      "A former archivist who now travels with a weathered journal and a borrowed spellbook.",
    isMultiline: true,
  },
};

export const EmptyValue: Story = {
  args: {
    label: "ALLIES & ORGANIZATIONS",
    fieldId: "alliesAndOrganizations",
    initialValue: "",
    isMultiline: true,
  },
};

export const Playground: Story = {};
