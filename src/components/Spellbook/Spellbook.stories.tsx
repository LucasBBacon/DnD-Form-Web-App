import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Spellbook, type SpellbookEntry, type SpellReferenceData } from "./Spellbook";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const toRomanNumeral = (level: number) => ROMAN[level - 1] ?? String(level);

const makeEntry = (
  reference: SpellReferenceData,
  overrides: Partial<Omit<SpellbookEntry, "reference">> = {},
): SpellbookEntry => ({
  reference,
  isPrepared: false,
  isKnown: true,
  isAlwaysPrepared: false,
  ...overrides,
});

// Fixture references mapped from existing spells in src/data/spells.json.
const mageHand: SpellReferenceData = {
  id: "spell_mage_hand",
  name: "Mage Hand",
  level: 0,
  school: "Conjuration",
  castingTime: "1 action",
  range: "30 feet",
  components: { vocal: true, somatic: true, material: null },
  duration: "1 minute",
  description: "A spectral, floating hand appears at a point you choose within range.",
};

const hex: SpellReferenceData = {
  id: "spell_hex",
  name: "Hex",
  level: 1,
  school: "Enchantment",
  castingTime: "1 bonus action",
  range: "90 feet",
  components: {
    vocal: true,
    somatic: true,
    material: "The petrified eye of a newt.",
  },
  duration: "1 hour",
  description:
    "You place a curse on a creature that you can see within range. You deal extra necrotic damage when you hit the target.",
  highLevelsText:
    "Your concentration can last longer when cast using a higher-level spell slot.",
};

const fireball: SpellReferenceData = {
  id: "spell_fireball",
  name: "Fireball",
  level: 3,
  school: "Evocation",
  castingTime: "1 action",
  range: "150 feet",
  components: {
    vocal: true,
    somatic: true,
    material: "A tiny ball of bat guano and sulfur.",
  },
  duration: "Instantaneous",
  description: "A streak flashes to a point and explodes in a 20-foot radius sphere of flame.",
  highLevelsText:
    "When cast using a spell slot of 4th level or higher, damage increases by 1d6 per slot level above 3rd.",
};

const arcaneEye: SpellReferenceData = {
  id: "spell_arcane_eye",
  name: "Arcane Eye",
  level: 4,
  school: "Divination",
  castingTime: "1 action",
  range: "30 feet",
  components: { vocal: true, somatic: true, material: "A bit of bat fur." },
  duration: "1 hour",
  description: "You create an invisible magical eye and receive visual information from it.",
};

const nondetection: SpellReferenceData = {
  id: "spell_nondetection",
  name: "Nondetection",
  level: 3,
  school: "Abjuration",
  castingTime: "1 action",
  range: "Touch",
  components: {
    vocal: true,
    somatic: true,
    material:
      "A pinch of diamond dust worth 25 gp sprinkled over the target, which the spell consumes.",
  },
  duration: "8 hours",
  description:
    "You hide a touched target from divination magic and magical scrying sensors.",
};

const baseEntries: SpellbookEntry[] = [
  makeEntry(fireball),
  makeEntry(mageHand),
  makeEntry(hex, { isPrepared: true }),
  makeEntry(arcaneEye),
  makeEntry(nondetection, { isPrepared: true, isAlwaysPrepared: true }),
];

const meta: Meta<typeof Spellbook> = {
  title: "Spellbook/Spellbook",
  component: Spellbook,
  tags: ["autodocs"],
  args: {
    entries: baseEntries,
    toRomanNumeral,
  },
};

export default meta;

type Story = StoryObj<typeof Spellbook>;

export const CatalogOverview: Story = {
  args: {
    entries: baseEntries,
  },
};

export const EmptySpellbook: Story = {
  args: {
    entries: [],
  },
};

export const PreparedOnlyFlow: Story = {
  args: {
    entries: baseEntries,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("checkbox"));

    await expect(canvas.getByText("Hex")).toBeInTheDocument();
    await expect(canvas.getByText("Nondetection")).toBeInTheDocument();
    await expect(canvas.queryByText("Fireball")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Arcane Eye")).not.toBeInTheDocument();
  },
};

export const SearchFilterFlow: Story = {
  args: {
    entries: baseEntries,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText("Search incantations"), "hand");

    await expect(canvas.getByText("Mage Hand")).toBeInTheDocument();
    await expect(canvas.queryByText("Hex")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Fireball")).not.toBeInTheDocument();
  },
};

export const LevelFilterFlow: Story = {
  args: {
    entries: baseEntries,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Cantrip" }));

    await expect(canvas.getByText("Mage Hand")).toBeInTheDocument();
    await expect(canvas.queryByText("Hex")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Fireball")).not.toBeInTheDocument();
  },
};

export const SchoolFilterFlow: Story = {
  args: {
    entries: baseEntries,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Evocation" }));

    await expect(canvas.getByText("Fireball")).toBeInTheDocument();
    await expect(canvas.queryByText("Hex")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Mage Hand")).not.toBeInTheDocument();
  },
};

export const CombinedFilterNoResults: Story = {
  args: {
    entries: baseEntries,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Cantrip" }));
    await userEvent.click(canvas.getByRole("button", { name: "Abjuration" }));

    await expect(
      canvas.getByText("No incantations match the filters."),
    ).toBeInTheDocument();
  },
};

export const SortByLevelThenName: Story = {
  args: {
    entries: [
      makeEntry(fireball),
      makeEntry({ ...hex, name: "Bane", id: "spell_bane", school: "Enchantment" }),
      makeEntry(mageHand),
      makeEntry(hex),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates parent sorting: level ascending first, then alphabetical by spell name within each level.",
      },
    },
  },
};

export const Playground: Story = {};