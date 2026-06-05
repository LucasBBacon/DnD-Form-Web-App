import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SpellbookRow } from "./SpellbookRow";
import type { SpellbookEntry, SpellReferenceData } from "../Spellbook";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Spell reference fixtures (derived from spells.json, mapped to view shape)
// ---------------------------------------------------------------------------

/** Cantrip — Mage Hand (conjuration, VS only) */
const mageHand: SpellReferenceData = {
  id: "spell_mage_hand",
  name: "Mage Hand",
  level: 0,
  school: "Conjuration",
  castingTime: "1 action",
  range: "30 feet",
  components: { vocal: true, somatic: true, material: null },
  duration: "1 minute",
  description:
    "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action.",
};

/** Level 1 — Hex (enchantment, VSM, concentration, higherLevelsText) */
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
  duration: "1 hour (concentration)",
  description:
    "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability.",
  highLevelsText:
    "Your Concentration can last longer with a spell slot of level 2 (up to 4 hours), 3–4 (up to 8 hours), or 5+ (24 hours).",
};

/** Level 1 — Animal Friendship (enchantment, VSM, no concentration) */
const animalFriendship: SpellReferenceData = {
  id: "spell_animal_friendship",
  name: "Animal Friendship",
  level: 1,
  school: "Enchantment",
  castingTime: "1 action",
  range: "30 feet",
  components: { vocal: true, somatic: true, material: "A morsel of food." },
  duration: "24 hours",
  description:
    "This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the spell's duration.",
  highLevelsText:
    "When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional beast for each slot level above 1st.",
};

/** Level 3 — Fireball (evocation, VSM, higherLevelsText) */
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
  description:
    "A bright streak flashes from your pointing finger to a point you choose within range then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot radius must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.",
  highLevelsText:
    "When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.",
};

/** Level 4 — Arcane Eye (divination, VSM, no higherLevelsText) */
const arcaneEye: SpellReferenceData = {
  id: "spell_arcane_eye",
  name: "Arcane Eye",
  level: 4,
  school: "Divination",
  castingTime: "1 action",
  range: "30 feet",
  components: { vocal: true, somatic: true, material: "A bit of bat fur." },
  duration: "1 hour (concentration)",
  description:
    "You create an invisible, magical eye within range that hovers in the air for the duration. You mentally receive visual information from the eye, which has normal vision and darkvision out to 30 feet.",
};

/** Level 3 — Nondetection (abjuration, VSM with expensive material) */
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
    "For the duration, you hide a target that you touch from divination magic. The target can be a willing creature or a place or an object no larger than 10 feet in any dimension. The target can't be targeted by any divination magic or perceived through magical scrying sensors.",
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof SpellbookRow> = {
  title: "SpellBookView/SpellbookRow",
  component: SpellbookRow,
  tags: ["autodocs"],
  args: {
    toRomanNumeral,
  },
};

export default meta;

type Story = StoryObj<typeof SpellbookRow>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const CantripCollapsed: Story = {
  args: {
    entry: makeEntry(mageHand),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Level-0 spells show "C" in the level indicator instead of a Roman numeral.',
      },
    },
  },
};

export const SpellCollapsed: Story = {
  args: {
    entry: makeEntry(fireball),
  },
};

export const PreparedSpell: Story = {
  args: {
    entry: makeEntry(hex, { isPrepared: true }),
  },
  parameters: {
    docs: {
      description: {
        story: "Prepared spells show a bookmark icon in the header row.",
      },
    },
  },
};

export const AlwaysPreparedSpell: Story = {
  args: {
    entry: makeEntry(animalFriendship, {
      isPrepared: true,
      isAlwaysPrepared: true,
    }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Always-prepared spells (e.g. domain/oath spells) render the bookmark with the `always-prepared` CSS class.",
      },
    },
  },
};

export const UnpreparedSpell: Story = {
  args: {
    entry: makeEntry(arcaneEye, { isPrepared: false }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A spell that is known but not currently prepared — no bookmark shown.",
      },
    },
  },
};

export const ExpandedWithMaterialAndHigherLevels: Story = {
  args: {
    entry: makeEntry(fireball),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Fireball"));
    await expect(canvas.getByText("Casting Time")).toBeInTheDocument();
    await expect(canvas.getByText(/bat guano and sulfur/i)).toBeInTheDocument();
    await expect(canvas.getByText(/At Higher Levels/i)).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expands Fireball to confirm mechanics grid, material component text, and higher-levels block all render.",
      },
    },
  },
};

export const ExpandedNoHigherLevels: Story = {
  args: {
    entry: makeEntry(arcaneEye),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Arcane Eye"));
    await expect(canvas.getByText("Range")).toBeInTheDocument();
    await expect(
      canvas.queryByText(/At Higher Levels/i),
    ).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expands Arcane Eye which has no higher-levels text — confirms that block is hidden.",
      },
    },
  },
};

export const ExpandedExpensiveMaterial: Story = {
  args: {
    entry: makeEntry(nondetection),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Nondetection"));
    await expect(
      canvas.getByText(/diamond dust worth 25 gp/i),
    ).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Material components with long descriptive text (including cost) render fully.",
      },
    },
  },
};

export const ExpandedVSMOnly: Story = {
  args: {
    entry: makeEntry(hex, { isPrepared: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Hex"));
    await expect(canvas.getByText(/V, S, M/i)).toBeInTheDocument();
    await expect(
      canvas.getByText(/petrified eye of a newt/i),
    ).toBeInTheDocument();
    await expect(canvas.getByText(/At Higher Levels/i)).toBeInTheDocument();
  },
};

export const ExpandedVSNoMaterial: Story = {
  args: {
    entry: makeEntry(mageHand),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Mage Hand"));
    await expect(canvas.getByText("V, S")).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "When material is null the component label shows only V, S with no parenthetical.",
      },
    },
  },
};

export const CollapseAfterExpand: Story = {
  args: {
    entry: makeEntry(fireball),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Fireball"));
    await expect(canvas.getByText("Casting Time")).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Fireball"));
    await expect(canvas.queryByText("Casting Time")).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Clicking the header a second time collapses the expanded details.",
      },
    },
  },
};

export const HighLevelSpell: Story = {
  args: {
    entry: makeEntry(arcaneEye),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Level 4 spell renders the Roman numeral IV in the level indicator.",
      },
    },
  },
};

export const Playground: Story = {
  args: {
    entry: makeEntry(fireball),
  },
};
