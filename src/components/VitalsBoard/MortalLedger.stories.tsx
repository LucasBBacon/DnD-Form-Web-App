import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MortalLedger } from "./MortalLedger";

const meta: Meta<typeof MortalLedger> = {
  title: "VitalsBoard/MortalLedger",
  component: MortalLedger,
  tags: ["autodocs"],
  args: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: {
      current: 38,
      max: 52,
    },
    tempHp: 0,
    deathSaves: {
      success: 0,
      failure: 0,
    },
    level: 7,
    hitDicePools: [
      {
        sides: 10,
        total: 7,
        expended: 3,
      },
    ],
    onTakeDamage: fn(),
    onHeal: fn(),
    onSetTempHp: fn(),
    onRecordSave: fn(),
    onSpendHitDie: fn(),
    onShortRest: fn(),
    onLongRest: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof MortalLedger>;

export const AdventuringBaseline: Story = {};

export const ArmorPenaltyWithTempWard: Story = {
  args: {
    armorClass: 18,
    initiative: -1,
    speed: 20,
    isArmorPenalized: true,
    hp: {
      current: 31,
      max: 52,
    },
    tempHp: 8,
  },
};

export const BloodiedButStanding: Story = {
  args: {
    hp: {
      current: 11,
      max: 52,
    },
    tempHp: 0,
  },
};

export const HeroicTank: Story = {
  args: {
    armorClass: 22,
    initiative: 0,
    speed: 25,
    hp: {
      current: 142,
      max: 142,
    },
    tempHp: 20,
    level: 14,
    hitDicePools: [
      {
        sides: 12,
        total: 14,
        expended: 5,
      },
    ],
  },
};

export const DyingFreshSaves: Story = {
  args: {
    hp: {
      current: 0,
      max: 52,
    },
    tempHp: 0,
    deathSaves: {
      success: 0,
      failure: 0,
    },
  },
};

export const DyingCritical: Story = {
  args: {
    hp: {
      current: 0,
      max: 52,
    },
    tempHp: 0,
    deathSaves: {
      success: 1,
      failure: 2,
    },
  },
};

export const StabilizedAtZero: Story = {
  args: {
    hp: {
      current: 0,
      max: 52,
    },
    tempHp: 0,
    deathSaves: {
      success: 3,
      failure: 1,
    },
  },
};

export const DeceasedState: Story = {
  args: {
    hp: {
      current: 0,
      max: 52,
    },
    tempHp: 0,
    deathSaves: {
      success: 0,
      failure: 3,
    },
  },
};

export const MulticlassRecoveryPools: Story = {
  args: {
    level: 10,
    hitDicePools: [
      {
        sides: 6,
        total: 3,
        expended: 1,
      },
      {
        sides: 8,
        total: 3,
        expended: 2,
      },
      {
        sides: 10,
        total: 4,
        expended: 3,
      },
    ],
  },
};

export const NoHitDiceLeft: Story = {
  args: {
    hitDicePools: [
      {
        sides: 8,
        total: 4,
        expended: 4,
      },
      {
        sides: 10,
        total: 3,
        expended: 3,
      },
    ],
  },
};

export const HealthDrawerOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("Click to adjust hit points"));
    await expect(canvas.getByPlaceholderText("Amount...")).toBeInTheDocument();
  },
};

export const DeathSaveInteraction: Story = {
  args: {
    hp: {
      current: 0,
      max: 52,
    },
    deathSaves: {
      success: 0,
      failure: 0,
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Death Save Failure 1"));
    await expect(args.onRecordSave).toHaveBeenCalledWith("failure", 1);
  },
};

export const RecoveryDrawerOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /rest & recovery/i }),
    );
    await expect(canvas.getByText("Spend Hit Dice")).toBeInTheDocument();
  },
};

export const Playground: Story = {};
