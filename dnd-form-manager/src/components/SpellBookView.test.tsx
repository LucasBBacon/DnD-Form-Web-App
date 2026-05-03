/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpellBookView } from "./SpellBookView";
import { getSpellByID } from "../data/staticDataApi";

vi.mock("../data/staticDataApi");

const buildSpellcasting = (overrides: Partial<any> = {}): any => ({
  isSpellcaster: true,
  canCastSpells: true,
  casting: {
    ability: "int",
    preparationType: "prepared",
    saveDC: 15,
    attackBonus: 7,
  },
  pools: {
    known: { selected: [], max: 10 },
    prepared: { selected: ["spell_magic_missile"], max: 10 },
    cantrips: { max: 3 },
    innate: [],
  },
  slots: {
    shared: {},
    pact: null,
  },
  diagnostics: {
    selections: {
      invalidKnownSpellIds: [],
      invalidPreparedSpellIds: [],
      knownSpellOverflow: 0,
      preparedSpellOverflow: 0,
    },
    classBreakdown: [],
  },
  ...overrides,
});

describe("SpellBookView", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getSpellByID).mockImplementation((spellId) => {
      const map: Record<string, any> = {
        spell_magic_missile: {
          id: "spell_magic_missile",
          name: "Magic Missile",
          level: 1,
          school: "evocation",
          classes: ["class_wizard"],
          castingTime: "1 action",
          range: "120 feet",
          duration: "Instantaneous",
          concentration: false,
          ritual: false,
          components: { vocal: true, somatic: true, material: false },
          lore: {
            shortDescription: "Three darts of magical force.",
            fullText:
              "You create three glowing darts of magical force. Each dart hits a creature of your choice.",
          },
        },
        spell_shield: {
          id: "spell_shield",
          name: "Shield",
          level: 1,
          school: "abjuration",
          classes: ["class_wizard"],
          castingTime: "1 reaction",
          range: "Self",
          duration: "1 round",
          concentration: false,
          ritual: false,
          components: { vocal: true, somatic: true, material: false },
          lore: {
            shortDescription: "Invisible barrier of force.",
            fullText:
              "An invisible barrier of magical force appears and protects you.",
          },
        },
        spell_ember_spark: {
          id: "spell_ember_spark",
          name: "Ember Spark",
          level: 0,
          school: "evocation",
          classes: ["class_warlock"],
          castingTime: "1 action",
          range: "60 feet",
          duration: "Instantaneous",
          concentration: false,
          ritual: false,
          components: { vocal: true, somatic: true, material: false },
          lore: {
            shortDescription: "A cinder mote lashes a nearby target.",
            fullText:
              "You snap your fingers and launch a cinder mote at one creature you can see within range.",
          },
        },
      };

      return map[String(spellId)] ?? null;
    });
  });

  it("renders spell description when expanded", async () => {
    const user = userEvent.setup();

    render(<SpellBookView spellcasting={buildSpellcasting()} />);

    await user.click(screen.getByRole("button", { name: /magic missile/i }));

    expect(
      screen.getByText(
        /You create three glowing darts of magical force\. Each dart hits a creature of your choice\./i,
      ),
    ).toBeInTheDocument();
  });

  it("shows fallback text when description is missing", async () => {
    const user = userEvent.setup();

    vi.mocked(getSpellByID).mockReturnValue({
      id: "spell_magic_missile",
      name: "Magic Missile",
      level: 1,
      school: "evocation",
      classes: ["class_wizard"],
      castingTime: "1 action",
      range: "120 feet",
      duration: "Instantaneous",
      concentration: false,
      ritual: false,
      components: { vocal: true, somatic: true, material: false },
      lore: {
        shortDescription: "Three darts of magical force.",
        fullText: "",
      },
    } as any);

    render(<SpellBookView spellcasting={buildSpellcasting()} />);

    await user.click(screen.getByRole("button", { name: /magic missile/i }));

    expect(screen.getByText("No description available.")).toBeInTheDocument();
  });

  it("displays save DC and spell attack in expanded details", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          casting: {
            ability: "int",
            preparationType: "prepared",
            saveDC: 16,
            attackBonus: 8,
          },
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /magic missile/i }));

    expect(screen.getByText(/Save DC:/i)).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText(/Spell Attack:/i)).toBeInTheDocument();
    expect(screen.getByText("+8")).toBeInTheDocument();
  });

  it("deduplicates known and prepared spell IDs", () => {
    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          pools: {
            known: { selected: ["spell_magic_missile", "spell_shield"], max: 10 },
            prepared: { selected: ["spell_shield", "spell_magic_missile"], max: 10 },
            cantrips: { max: 3 },
            innate: [],
          },
        })}
      />,
    );

    expect(screen.getAllByRole("button", { name: /magic missile/i })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /shield/i })).toHaveLength(1);
  });

  it("shows missing reference message when spell IDs cannot be resolved", () => {
    vi.mocked(getSpellByID).mockReturnValue(null);

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          pools: {
            known: { selected: ["spell_missing"], max: 10 },
            prepared: { selected: [], max: 10 },
            cantrips: { max: 3 },
            innate: [],
          },
        })}
      />,
    );

    expect(screen.getByText("Missing Spell References")).toBeInTheDocument();
    expect(screen.getByText("Missing spell reference: spell_missing")).toBeInTheDocument();
    expect(screen.getByText("Your spellbook is empty.")).toBeInTheDocument();
  });

  it("shows armor penalty warning when cannot cast", () => {
    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          canCastSpells: false,
        })}
      />,
    );

    expect(screen.getByText("Cannot Cast Spells")).toBeInTheDocument();
    expect(
      screen.getByText("You are wearing armor you are not proficient with."),
    ).toBeInTheDocument();
  });

  it("renders a distinct innate section below standard spells", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          pools: {
            known: { selected: ["spell_magic_missile"], max: 10 },
            prepared: { selected: [], max: 10 },
            cantrips: { max: 3 },
            innate: [
              {
                spellId: "spell_ember_spark",
                spellName: "Ember Spark",
                isResolvedSpell: true,
                sourceTraitName: "Starlit Bloodline",
                spellSaveDC: 14,
                spellAttackBonus: 6,
              },
            ],
          },
        })}
      />,
    );

    expect(
      screen.getByText(/INNATE SPELLCASTING - TRAITS AND FEATURES/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/INNATE CANTRIPS/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ember spark/i }));

    expect(screen.getByText(/Source:/i)).toBeInTheDocument();
    expect(screen.getByText("Starlit Bloodline")).toBeInTheDocument();
  });

  it("uses per-entry innate save DC and attack bonus values", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          casting: {
            ability: "int",
            preparationType: "prepared",
            saveDC: 99,
            attackBonus: 99,
          },
          pools: {
            known: { selected: [], max: 10 },
            prepared: { selected: [], max: 10 },
            cantrips: { max: 3 },
            innate: [
              {
                spellId: "spell_ember_spark",
                spellName: "Ember Spark",
                isResolvedSpell: true,
                sourceTraitName: "Starlit Bloodline",
                spellSaveDC: 15,
                spellAttackBonus: 7,
                uses: { count: 1, reset: "long_rest" },
              },
            ],
          },
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /ember spark/i }));

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
    expect(screen.getByText(/Uses:/i)).toBeInTheDocument();
    expect(screen.getByText(/1 \/ long rest/i)).toBeInTheDocument();
  });
});
