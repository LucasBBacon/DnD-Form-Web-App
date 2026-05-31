import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpellBookView } from "../SpellBookView/SpellBookView";
import { SPELLBOOK_BOARD_FIXTURES } from "./SpellBookBoard.fixtures";

const meta: Meta<typeof SpellBookView> = {
  title: "Boards/SpellBookBoard",
  component: SpellBookView,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SpellBookView>;

export const PreparedCaster: Story = {
  args: {
    spellcasting: SPELLBOOK_BOARD_FIXTURES.preparedCaster,
  },
};

export const ArmorBlocked: Story = {
  args: {
    spellcasting: SPELLBOOK_BOARD_FIXTURES.armorBlocked,
  },
};

export const PactCaster: Story = {
  args: {
    spellcasting: SPELLBOOK_BOARD_FIXTURES.pactCaster,
  },
};

export const WithInnateSpells: Story = {
  args: {
    spellcasting: SPELLBOOK_BOARD_FIXTURES.withInnateSpells,
  },
};
