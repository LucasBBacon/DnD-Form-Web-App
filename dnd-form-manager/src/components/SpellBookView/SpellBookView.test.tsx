/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpellBookView } from "./SpellBookView";
import { getAllClasses, getAllSpells } from "../../data/staticDataApi";

vi.mock("../data/staticDataApi");

const baseSpells = [
  {
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
    output: {
      damage: [
        {
          type: "force",
          roll: "1d4+1",
        },
      ],
    },
    lore: {
      shortDescription: "Three darts of magical force.",
      fullText:
        "You create three glowing darts of magical force. Each dart hits a creature of your choice.",
    },
  },
  {
    id: "spell_detect_magic",
    name: "Detect Magic",
    level: 1,
    school: "divination",
    classes: ["class_wizard", "class_cleric"],
    castingTime: "1 action",
    range: "Self",
    duration: "10 minutes",
    concentration: true,
    ritual: true,
    components: { vocal: true, somatic: true, material: false },
    savingThrow: {
      ability: "wis",
      dcCalculation: {
        base: 8,
        includeProficiency: true,
        modifierStat: "spellcasting",
      },
      onSave: "special",
    },
    lore: {
      shortDescription: "Sense magic in your surroundings.",
      fullText:
        "For the duration, you sense the presence of magic within 30 feet.",
      higherLevel: "The duration increases when cast at higher levels.",
    },
  },
  {
    id: "spell_cure_wounds",
    name: "Cure Wounds",
    level: 1,
    school: "abjuration",
    classes: ["class_cleric"],
    castingTime: "1 action",
    range: "Touch",
    duration: "Instantaneous",
    concentration: false,
    ritual: false,
    components: { vocal: true, somatic: true, material: false },
    lore: {
      shortDescription: "A creature you touch regains hit points.",
      fullText: "A creature you touch regains a number of hit points.",
    },
  },
  {
    id: "spell_light",
    name: "Light",
    level: 0,
    school: "evocation",
    classes: ["class_wizard"],
    castingTime: "1 action",
    range: "Touch",
    duration: "1 hour",
    concentration: false,
    ritual: false,
    components: {
      vocal: true,
      somatic: true,
      material: true,
      materialMaterials: "A firefly.",
    },
    lore: {
      shortDescription: "Object sheds bright light.",
      fullText: "You touch one object that sheds bright light in a radius.",
    },
  },
];

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
    bonusPrepared: [],
    allExpandedSpellIds: [],
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
    classBreakdown: [
      {
        classId: "class_wizard",
        classLevel: 3,
        preparationType: "prepared",
        spellcastingAbility: "int",
        maxSpellLevel: 2,
        maxCantrips: 3,
        maxSpellsKnown: 0,
        maxPreparedSpells: 5,
        schoolRestrictions: null,
        expandedSpellIds: [],
        spellListSource: null,
        freeSchoolSpellSlots: 0,
      },
    ],
  },
  ...overrides,
});

describe("SpellBookView", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getAllSpells).mockReturnValue(baseSpells as any);
    vi.mocked(getAllClasses).mockReturnValue([
      { id: "class_wizard", name: "Wizard" },
      { id: "class_cleric", name: "Cleric" },
    ] as any);
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

  it("shows fallback text when full description is missing", async () => {
    const user = userEvent.setup();

    vi.mocked(getAllSpells).mockReturnValue([
      {
        ...baseSpells[0],
        lore: {
          ...baseSpells[0].lore,
          fullText: "",
        },
      },
    ] as any);

    render(<SpellBookView spellcasting={buildSpellcasting()} />);

    await user.click(screen.getByRole("button", { name: /magic missile/i }));

    expect(screen.getByText("No description available.")).toBeInTheDocument();
  });

  it("shows spell attack but hides save DC when spell has no saving throw", async () => {
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

    expect(screen.queryByText(/Save DC:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Spell Attack:/i)).toBeInTheDocument();
    expect(screen.getByText("+8")).toBeInTheDocument();
  });

  it("shows save DC when the spell has saving throw data", async () => {
    const user = userEvent.setup();

    render(<SpellBookView spellcasting={buildSpellcasting()} />);

    await user.click(screen.getByRole("button", { name: /detect magic/i }));

    expect(screen.getByText(/Save DC:/i)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.queryByText(/Spell Attack:/i)).not.toBeInTheDocument();
  });

  it("filters list by school and class", async () => {
    const user = userEvent.setup();

    render(<SpellBookView spellcasting={buildSpellcasting()} />);

    await user.selectOptions(
      screen.getByLabelText(/filter by school/i),
      "abjuration",
    );

    expect(
      screen.getByRole("button", { name: /cure wounds/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /magic missile/i }),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText(/filter by class/i),
      "class_wizard",
    );

    expect(
      screen.getByText("No spells match your current filters."),
    ).toBeInTheDocument();
  });

  it("filters by rules-eligible availability", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          slots: {
            shared: {
              1: { total: 4, expended: 0 },
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
                classId: "class_wizard",
                classLevel: 2,
                preparationType: "prepared",
                spellcastingAbility: "int",
                maxSpellLevel: 1,
                maxCantrips: 3,
                maxSpellsKnown: 0,
                maxPreparedSpells: 4,
                schoolRestrictions: null,
                expandedSpellIds: [],
                spellListSource: null,
                freeSchoolSpellSlots: 0,
              },
            ],
          },
        })}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText(/filter by availability/i),
      "ineligible",
    );

    expect(
      screen.getByRole("button", { name: /cure wounds/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /magic missile/i }),
    ).not.toBeInTheDocument();
  });

  it("treats bonus-prepared spells as eligible even when off class list", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          pools: {
            known: { selected: [], max: 10 },
            prepared: { selected: [], max: 10 },
            cantrips: { max: 3 },
            innate: [],
            bonusPrepared: ["spell_cure_wounds"],
            allExpandedSpellIds: [],
            freeSchoolDesignated: [],
            freeSchoolSlots: 0,
          },
          slots: {
            shared: {
              1: { total: 2, expended: 0 },
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
                classId: "class_wizard",
                classLevel: 2,
                preparationType: "prepared",
                spellcastingAbility: "int",
                maxSpellLevel: 1,
                maxCantrips: 3,
                maxSpellsKnown: 0,
                maxPreparedSpells: 4,
                schoolRestrictions: null,
                expandedSpellIds: [],
                spellListSource: null,
                freeSchoolSpellSlots: 0,
              },
            ],
          },
        })}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText(/filter by availability/i),
      "eligible",
    );

    expect(
      screen.getByRole("button", { name: /cure wounds/i }),
    ).toBeInTheDocument();
  });

  it("shows armor penalty warning when cannot cast", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          canCastSpells: false,
        })}
      />,
    );

    expect(
      screen.getByText("Cannot Cast Spells Right Now"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You are wearing armor you are not proficient with."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /magic missile/i }));

    expect(
      screen.getByText(/You create three glowing darts/i),
    ).toBeInTheDocument();
  });

  it("shows innate source info in expanded details when spell is granted innately", async () => {
    const user = userEvent.setup();

    render(
      <SpellBookView
        spellcasting={buildSpellcasting({
          pools: {
            known: { selected: [], max: 10 },
            prepared: { selected: [], max: 10 },
            cantrips: { max: 3 },
            innate: [
              {
                spellId: "spell_light",
                spellName: "Light",
                isResolvedSpell: true,
                sourceTraitName: "Starlit Bloodline",
                spellSaveDC: 14,
                spellAttackBonus: 6,
              },
            ],
            bonusPrepared: [],
            allExpandedSpellIds: [],
          },
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /light/i }));

    expect(screen.getByText(/Innate Source:/i)).toBeInTheDocument();
    expect(screen.getByText(/Starlit Bloodline/i)).toBeInTheDocument();
    expect(screen.getByText(/DC 14/i)).toBeInTheDocument();
    expect(screen.queryByText(/Attack \+6/i)).not.toBeInTheDocument();
  });

  it("renders availability legend text", () => {
    render(<SpellBookView spellcasting={buildSpellcasting()} />);

    expect(screen.getByLabelText(/availability legend/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/availability rules info/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Meets class list, school rules, and per-track spell level limits\./i,
      ),
    ).toBeInTheDocument();
  });
});
