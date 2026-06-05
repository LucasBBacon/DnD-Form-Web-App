import { useEffect } from "react";
import type React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BASELINE_CHARACTER_STATE,
  type CoinPurse,
  useCharacterStore,
} from "../../../store/useCharacterStore";
import { WealthTracker } from "./WealthTracker";

type WealthTrackerStoryArgs = React.ComponentProps<typeof WealthTracker> & {
  initialCoinPurse?: Partial<CoinPurse>;
};

const WealthTrackerStoryHarness: React.FC<{
  initialCoinPurse?: Partial<CoinPurse>;
  children: React.ReactNode;
}> = ({ initialCoinPurse, children }) => {
  useEffect(() => {
    useCharacterStore.setState({
      ...BASELINE_CHARACTER_STATE,
      coinPurse: {
        ...BASELINE_CHARACTER_STATE.coinPurse,
        ...(initialCoinPurse ?? {}),
      },
    });

    return () => {
      useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE });
    };
  }, [initialCoinPurse]);

  return <>{children}</>;
};

const meta: Meta<WealthTrackerStoryArgs> = {
  title: "InventoryBoard/WealthTracker",
  component: WealthTracker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    initialCoinPurse: {
      control: false,
      table: {
        disable: true,
      },
    },
  },
  render: ({ initialCoinPurse, ...args }) => (
    <div style={{ maxWidth: "720px" }}>
      <WealthTrackerStoryHarness initialCoinPurse={initialCoinPurse}>
        <WealthTracker {...args} />
      </WealthTrackerStoryHarness>
    </div>
  ),
};

export default meta;

type Story = StoryObj<WealthTrackerStoryArgs>;

export const EmptyWallet: Story = {
  args: {
    allowElectrum: true,
    allowPlatinum: true,
    initialCoinPurse: {},
  },
};

export const MixedCoinPurse: Story = {
  args: {
    allowElectrum: true,
    allowPlatinum: true,
    initialCoinPurse: {
      cp: 17,
      sp: 8,
      ep: 3,
      gp: 12,
      pp: 1,
    },
  },
};

export const NoOptionalCoins: Story = {
  args: {
    allowElectrum: false,
    allowPlatinum: false,
    initialCoinPurse: {
      cp: 42,
      sp: 9,
      gp: 15,
      ep: 6,
      pp: 2,
    },
  },
};

export const PlatinumOnlyOptional: Story = {
  args: {
    allowElectrum: false,
    allowPlatinum: true,
    initialCoinPurse: {
      cp: 5,
      sp: 11,
      ep: 4,
      gp: 9,
      pp: 3,
    },
  },
};
