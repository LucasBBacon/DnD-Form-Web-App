import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import type { UseSpellcastingReturn } from "../../hooks/useSpellcasting";
import { SpellBookView } from "./SpellBookView";

const buildSpellcasting = (
  overrides: Partial<UseSpellcastingReturn> = {},
): UseSpellcastingReturn => ({
  isSpellcaster: true,
  canCastSpells: true,
  casting: {
    ability: "wis",
    preparationType: "prepared",
    saveDC: 15,
    attackBonus: 7,
  },
  pools: {
    known: { selected: [], max: 10 },
    prepared: {
      selected: ["spell_hex", "spell_dominate_beast"],
      max: 10,
    },
    cantrips: { max: 3 },
    bonusPrepared: [],
    allExpandedSpellIds: [],
    freeSchoolDesignated: [],
    freeSchoolSlots: 0,
    innate: [],
  },
  slots: {
    shared: {
      1: { total: 4, expended: 0 },
      2: { total: 3, expended: 0 },
      3: { total: 3, expended: 0 },
      4: { total: 3, expended: 0 },
      5: { total: 2, expended: 0 },
      6: { total: 1, expended: 0 },
      7: { total: 1, expended: 0 },
    },
    pact: null,
  },
  diagnostics: {
    selections: {
      invalidKnownSpellIds: [],
      invalidPreparedSpellIds: [],
      knownSpellOverflow: 0,
      preparedSpellOverflow: 0,
      freeSchoolOverflow: 0,
    },
    classBreakdown: [
      {
        classId: "class_warlock",
        classLevel: 7,
        preparationType: "prepared",
        spellcastingAbility: "cha",
        maxSpellLevel: 5,
        maxCantrips: 3,
        maxSpellsKnown: 0,
        maxPreparedSpells: 10,
        schoolRestrictions: null,
        expandedSpellIds: [],
        spellListSource: null,
        freeSchoolSpellSlots: 0,
      },
      {
        classId: "class_druid",
        classLevel: 7,
        preparationType: "prepared",
        spellcastingAbility: "wis",
        maxSpellLevel: 5,
        maxCantrips: 3,
        maxSpellsKnown: 0,
        maxPreparedSpells: 10,
        schoolRestrictions: null,
        expandedSpellIds: [],
        spellListSource: null,
        freeSchoolSpellSlots: 0,
      },
      {
        classId: "class_sorcerer",
        classLevel: 7,
        preparationType: "known",
        spellcastingAbility: "cha",
        maxSpellLevel: 5,
        maxCantrips: 3,
        maxSpellsKnown: 10,
        maxPreparedSpells: 0,
        schoolRestrictions: null,
        expandedSpellIds: [],
        spellListSource: null,
        freeSchoolSpellSlots: 0,
      },
    ],
  },
  spellMetadata: {
    byId: {
      spell_hex: {
        spellId: "spell_hex",
        baseSpellLevel: 1,
        availableCastLevels: [1, 2, 3, 4, 5],
        selectedCastLevel: 5,
        canCast: true,
        canUseSharedSlot: true,
        canUsePactSlot: false,
        resolvedDamageEntries: [],
        resolvedHealingEntries: [],
      },
      spell_dominate_beast: {
        spellId: "spell_dominate_beast",
        baseSpellLevel: 4,
        availableCastLevels: [4, 5, 6, 7],
        selectedCastLevel: 7,
        canCast: true,
        canUseSharedSlot: true,
        canUsePactSlot: false,
        resolvedDamageEntries: [],
        resolvedHealingEntries: [],
      },
    },
    activeSpellIds: ["spell_hex", "spell_dominate_beast"],
  },
  ...overrides,
});

const meta: Meta<typeof SpellBookView> = {
  title: "SpellBookView/SpellBookView",
  component: SpellBookView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full spell catalog view showing structured prose upcast effects alongside existing higher-level text.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SpellBookView>;

export const CatalogOverview: Story = {
  args: {
    spellcasting: buildSpellcasting(),
  },
};

export const HexProseUpcastExpanded: Story = {
  args: {
    spellcasting: buildSpellcasting(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: (name) => name.toLowerCase().includes("hex"),
      }),
    );

    await expect(
      canvas.getByText("Structured Upcast Effects:"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/your concentration can last up to 4 hours/i),
    ).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expands Hex so the structured upcast entries appear in the full SpellBook catalog.",
      },
    },
  },
};

export const DominateBeastProseUpcastExpanded: Story = {
  args: {
    spellcasting: buildSpellcasting(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: (name) => name.toLowerCase().includes("dominate beast"),
      }),
    );

    await expect(
      canvas.getByText("Structured Upcast Effects:"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/duration is concentration, up to 8 hours/i),
    ).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expands Dominate Beast so stepped threshold prose upcast effects are visible in context.",
      },
    },
  },
};