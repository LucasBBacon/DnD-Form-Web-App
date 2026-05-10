import type { Meta, StoryObj } from "@storybook/react-vite";
import { WizardStepNav } from "./WizardStepNav";

const meta = {
  title: "Components/CharacterCreationWizard/WizardStepNav",
  component: WizardStepNav,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WizardStepNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
  { id: "race", label: "1. Race" },
  { id: "class", label: "2. Class" },
  { id: "spells", label: "3. Spells" },
  { id: "abilities", label: "4. Abilities" },
  { id: "background", label: "5. Background" },
  { id: "equipment", label: "6. Equipment" },
  { id: "identity", label: "7. Identity" },
];

export const FirstStep: Story = {
  args: {
    steps,
    currentStepIndex: 0,
    onStepClick: () => {},
    isStepDisabled: () => false,
  },
};

export const MiddleStep: Story = {
  args: {
    steps,
    currentStepIndex: 2,
    onStepClick: () => {},
    isStepDisabled: (index) => index > 2,
  },
};

export const WithLocking: Story = {
  args: {
    steps,
    currentStepIndex: 1,
    onStepClick: () => {},
    isStepDisabled: (index) => index > 1,
  },
};

export const FinalStep: Story = {
  args: {
    steps,
    currentStepIndex: 6,
    onStepClick: () => {},
    isStepDisabled: () => false,
  },
};

export const Interactive: Story = {
  args: {
    steps,
    currentStepIndex: 0,
    onStepClick: (index) => alert(`Clicked step ${index}`),
    isStepDisabled: (index) => index > 0,
  },
};
