import { useMemo } from "react";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { getSpellByID } from "../data/staticDataApi";
import { useAttacks } from "./useAttacks";
import { useSpellcasting } from "./useSpellcasting";
import { useTraitActions } from "./useTraitActions";
import { useCharacterStore } from "../store/useCharacterStore";
import type { ActionType } from "../types/action";
import type { DieFace } from "../types/common";
import type { WeaponPropertyCatalogEntry, WeaponRangeBand } from "../types/item";

// #region Types and Interfaces

export type CombatActionSection = "action" | "bonus_action" | "reaction";

export interface CombatActionUseState {
  /** Total number of uses for the combat action */
  total: number;
  /** Remaining number of uses for the combat action */
  remaining: number;
}

export interface CombatActionEntry {
  /** Unique identifier for the combat action */
  id: string;
  /** Name of the combat action */
  name: string;
  /** Section of the combat action (action, bonus_action, reaction) */
  section: CombatActionSection;
  /** Source of the combat action (attack, spell, trait) */
  source: "attack" | "spell" | "trait";
  /** Optional subtitle for the combat action */
  subtitle?: string;
  /** Quick stats for the combat action */
  quickStats: string[];
  /** Optional description for the combat action */
  description?: string;
  /** Indicates if the combat action is exhausted */
  isExhausted: boolean;
  /** Optional spell level for spell actions */
  spellLevel?: number;
  /** Optional cast state for spell actions */
  spellCast?: {
    /** Indicates whether the spell can be cast right now */
    canCast: boolean;
    /** Indicates whether a shared slot can be consumed */
    canUseSharedSlot: boolean;
    /** Indicates whether a pact slot can be consumed */
    canUsePactSlot: boolean;
    /** Optional reason why casting is unavailable */
    unavailableReason?: string;
  };
  /** Optional usage state for the combat action */
  uses?: CombatActionUseState;
  /** Optional attack roll metadata for the combat action */
  attackRoll?: CombatRollMetadata;
  /** Optional damage roll metadata for the combat action */
  damageRolls?: CombatRollMetadata[];
  /** Weapon property catalog entries (attack cards only) */
  weaponProperties?: WeaponPropertyCatalogEntry[];
  /** Ammunition info for ranged attack entries */
  ammo?: { id: string; name: string | null; count: number | null };
  /** Parsed range data for ranged attack entries */
  rangeInfo?: WeaponRangeBand;
  /** Effective melee reach in feet for this attack */
  meleeReachFeet?: number;
  /** True when the weapon has the reach property */
  hasReachProperty?: boolean;
  /** True when this attack entry represents a thrown variant */
  isThrown?: boolean;
  /** Base item id consumed when this thrown attack is used */
  throwableItemId?: string;
  /** Remaining count for this throwable source, when countable */
  throwableCount?: number | null;
  /** True when a heavy weapon is wielded by a Small character — attack is locked to disadvantage */
  heavyDisadvantage?: boolean;
  /** Versatile mode for versatile weapons (one-handed or two-handed) */
  versatileMode?: "one-handed" | "two-handed";
  /** Versatile damage dice string for the weapon (e.g., "1d8"), if the weapon is versatile */
  versatileDamageDice?: string | null;
  /** Base damage dice string for the weapon (e.g., "1d6") */
  baseDamageDice?: string;
  /** Instance ID for weapon attacks (for state management) */
  instanceId?: string;
}

export interface CombatRollMetadata {
  /** Unique identifier for the combat roll */
  id: string;
  /** Number of dice to roll */
  count: number;
  /** Number of sides on each die */
  sides: DieFace;
  /** Modifier to apply to the roll */
  modifier: number;
  /** Label for the combat roll */
  label: string;
}

// #endregion

// #region Helper Functions

const ROLL_EXPRESSION_RE =
  /^\s*(\d+)d(4|6|8|10|12|20|100)(?:\s*([+-])\s*(\d+))?\s*(.*)$/i;

/**
 * Parses a roll expression in the format of "XdY+Z" (e.g., "2d6+3") and returns
 * the corresponding combat roll metadata. The expression can also include trailing text after the roll, which will be captured as well.
 * @param expression The roll expression to parse.
 * @returns The combat roll metadata and trailing text, or null if the expression is invalid.
 */
const parseRollExpression = (
  expression: string,
): (CombatRollMetadata & { trailingText: string }) | null => {
  const match = expression.match(ROLL_EXPRESSION_RE);
  if (!match) return null;

  const [, countRaw, sidesRaw, signRaw, modifierRaw, trailingTextRaw] = match;
  const count = Number(countRaw);
  const sides = Number(sidesRaw) as DieFace;

  if (!Number.isInteger(count) || count <= 0) return null;

  const modifierValue = modifierRaw ? Number(modifierRaw) : 0;
  const sign = signRaw === "-" ? -1 : 1;
  const modifier = modifierValue * sign;

  return {
    id: expression.trim(),
    count,
    sides,
    modifier,
    label: expression.trim(),
    trailingText: (trailingTextRaw ?? "").trim(),
  };
};

/**
 * Resolves a scaled roll expression based on character or class level.
 * @param baseRoll The base roll expression.
 * @param scaling The scaling information for the roll.
 * @param characterLevel The character's level.
 * @param classLevel The character's class level.
 * @returns The resolved roll expression.
 */
const resolveScaledRollExpression = (
  baseRoll: string,
  scaling:
    | {
        type: "character_level" | "class_level" | "spell_slot";
        thresholds?: Record<string, string>;
      }
    | undefined,
  characterLevel: number,
  classLevel: number,
): string => {
  if (!scaling?.thresholds) return baseRoll;
  if (scaling.type === "spell_slot") return baseRoll;

  const levelForScaling =
    scaling.type === "class_level" ? classLevel : characterLevel;

  const bestMatch = Object.entries(scaling.thresholds)
    .map(([threshold, value]) => ({
      threshold: Number(threshold),
      value,
    }))
    .filter(
      (entry) =>
        Number.isFinite(entry.threshold) && levelForScaling >= entry.threshold,
    )
    .sort((a, b) => b.threshold - a.threshold)[0];

  return bestMatch?.value ?? baseRoll;
};

/**
 * Converts a string to title case, replacing underscores with spaces and capitalizing each word.
 * @param value The string to convert.
 * @returns The converted string in title case.
 */
const toTitleCase = (value: string): string =>
  value.replace(/_/g, " ")
       .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Normalizes the action type for a spell based on its declared action type and casting time.
 * If the declared action type is one of the standard types (action, bonus_action, reaction), it is used directly.
 * Otherwise, the casting time string is analyzed for keywords to determine the appropriate action type.
 * @param actionType The declared action type of the spell, if any.
 * @param castingTime The casting time string of the spell.
 * @returns The normalized combat action section for the spell, or null if it cannot be determined.
 */
const normalizeSpellActionType = (
  actionType: ActionType | undefined,
  castingTime: string,
): CombatActionSection | null => {
  if (actionType === "action") return "action";
  if (actionType === "bonus_action") return "bonus_action";
  if (actionType === "reaction") return "reaction";

  const normalized = castingTime.toLowerCase();
  if (normalized.includes("bonus action")) return "bonus_action";
  if (normalized.includes("reaction")) return "reaction";
  if (normalized.includes("action")) return "action";
  return null;
};

/**
 * Converts a number to a Roman numeral string. 
 * For example, 1 becomes "I", 4 becomes "IV", and 10 becomes "X". If the input number is 0 or negative, "C" is returned to represent "Cantrip".
 * @param level The number to convert.
 * @returns The Roman numeral representation of the number, or "C" for 0 or negative numbers.
 */
const toRomanNumeral = (level: number): string => {
  if (level <= 0) return "C";
  const map: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let value = level;
  let result = "";

  map.forEach(([decimal, numeral]) => {
    while (value >= decimal) {
      value -= decimal;
      result += numeral;
    }
  });

  return result;
};

// #endregion

// #region Hook

/**
 * Custom React hook to manage and compute combat actions for a character based on their attacks, spellcasting, and trait actions.
 * It aggregates data from various sources to create a structured representation of the character's available combat actions, 
 * including their usage state and associated rolls.
 * @returns An object containing the computed combat actions and their usage state.
 */
export const useCombatActions = () => {
  const state = useCharacterStore();
  const attacks = useAttacks();
  const spellcasting = useSpellcasting();
  const traitActions = useTraitActions();

  const traitActionUses = useMemo(() => {
    const allTraits = getAllCharacterTraits(
      state.level,
      state.raceId,
      state.subraceId,
      state.classId,
      state.subclassId,
      false,
      state.choicesByLevel,
      state.acquiredFeats,
      state.classTracks,
    );

    const byActionId: Record<string, CombatActionUseState> = {};

    allTraits.forEach((trait) => {
      trait.effects?.forEach((effect) => {
        if (effect.type !== "action_grant") return;
        if (typeof effect.value !== "string") return;
        const actionId = effect.value;
        const rawCount = effect.uses?.count;
        const totalUses = typeof rawCount === "number" ? rawCount : null;
        if (!totalUses || totalUses <= 0) return;

        const expended = state.expendedTraitActionUses[actionId] ?? 0;
        const remaining = Math.max(totalUses - expended, 0);
        byActionId[actionId] = {
          total: totalUses,
          remaining,
        };
      });
    });

    return byActionId;
  }, [
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    state.choicesByLevel,
    state.acquiredFeats,
    state.classTracks,
    state.expendedTraitActionUses,
  ]);

  const sections = useMemo(() => {
    const grouped: Record<CombatActionSection, CombatActionEntry[]> = {
      action: [],
      bonus_action: [],
      reaction: [],
    };

    const primaryClassLevel = state.classId
      ? (state.classTracks.find((track) => track.classId === state.classId)
          ?.level ?? state.level)
      : state.level;

    attacks.attacks.forEach((attack, index) => {
      // Extract base damage dice from the damage string (e.g., "1d6" from "1d6 + 2 slashing")
      const baseDamageDiceMatch = attack?.damageString?.match(/^\s*(\d+d\d+)/);
      const baseDamageDice = baseDamageDiceMatch ? baseDamageDiceMatch[1] : "1d6";

      // Determine effective damage string based on versatile mode
      let effectiveDamageString = attack?.damageString ?? "";
      if (
        attack?.versatileDamageDice &&
        attack?.versatileMode === "two-handed"
      ) {
        // For versatile weapons in two-handed mode, use versatile dice
        // Extract the damage bonus from the original damage string and apply it to versatile dice
        const damageBonus = attack.damageString
          ? attack.damageString.match(/([+-]\s*\d+)/)?.[0] ?? ""
          : "";
        const damageType = attack.damageString
          ? attack.damageString.split(/\s+/)?.[2] ?? ""
          : "";
        effectiveDamageString = `${attack.versatileDamageDice} ${damageBonus} ${damageType}`.trim();
      }

      const parsedDamage = parseRollExpression(effectiveDamageString);

      grouped.action.push({
        id: `atk:${attack?.weaponId || "Weapon id not found"}:${index}`,
        name: attack?.name || "Weapon name not found",
        section: "action",
        source: "attack",
        subtitle: "Weapon Attack",
        quickStats: [
          (attack?.toHit ?? 0) >= 0
            ? `ATK +${attack?.toHit ?? 0}`
            : `ATK ${attack?.toHit ?? 0}`,
          effectiveDamageString || "1d6",
          attack?.hasReachProperty
            ? `Melee (${attack?.meleeReachFeet ?? 10} ft reach)`
            : (attack?.range || "Melee"),
        ],
        ammo: attack?.ammo ?? undefined,
        rangeInfo: attack?.rangeInfo ?? undefined,
        meleeReachFeet: attack?.meleeReachFeet,
        hasReachProperty: attack?.hasReachProperty ?? false,
        isThrown: attack?.isThrown ?? false,
        throwableItemId: attack?.throwableItemId,
        throwableCount: attack?.throwableCount ?? null,
        heavyDisadvantage: attack?.heavyDisadvantage ?? false,
        versatileMode: attack?.versatileMode ?? "one-handed",
        versatileDamageDice: attack?.versatileDamageDice ?? null,
        baseDamageDice,
        instanceId: attack?.instanceId ?? undefined,
        isExhausted: !attack?.canAttack,
        weaponProperties: attack?.properties ?? [],
        attackRoll: {
          id: `attack-roll:${attack?.weaponId || "unknown"}:${index}`,
          count: 1,
          sides: 20,
          modifier: attack?.toHit ?? 0,
          label: "To-Hit",
        },
        damageRolls: parsedDamage
          ? [
              {
                id: `attack-damage:${attack?.weaponId || "unknown"}:${index}:0`,
                count: parsedDamage.count,
                sides: parsedDamage.sides,
                modifier: parsedDamage.modifier,
                label: parsedDamage.trailingText
                  ? `Damage (${parsedDamage.trailingText})`
                  : "Damage",
              },
            ]
          : [],
      });
    });

    // Union known, prepared, and always-prepared bonus pools so domain/oath
    // spells are surfaced alongside manually selected spells.
    const activeCastableSpellIds = Array.from(
      new Set([
        ...spellcasting.pools.known.selected,
        ...spellcasting.pools.prepared.selected,
        ...spellcasting.pools.bonusPrepared,
      ]),
    );

    activeCastableSpellIds.forEach((spellId) => {
      const spell = getSpellByID(spellId);
      if (!spell) return;

      const section = normalizeSpellActionType(
        spell.actionType,
        spell.castingTime,
      );
      if (!section) return;

      const shared = spellcasting.slots.shared[spell.level];
      const sharedRemaining = shared
        ? Math.max(shared.total - shared.expended, 0)
        : 0;
      // Pact slots cover any spell whose level is at or below the pact slot level,
      // not just exact-level matches. A level 4 pact slot can cast a level 2 spell.
      const pactCanCoverSpell =
        spell.level > 0 &&
        spellcasting.slots.pact != null &&
        spell.level <= spellcasting.slots.pact.level;
      const pactRemaining = pactCanCoverSpell
        ? Math.max(
            spellcasting.slots.pact!.total - spellcasting.slots.pact!.expended,
            0,
          )
        : 0;
      const canUseSharedSlot = spell.level > 0 && sharedRemaining > 0;
      const canUsePactSlot = spell.level > 0 && pactRemaining > 0;
      const hasAvailableSlot = canUseSharedSlot || canUsePactSlot;
      const canCastWithoutArmorPenalty = spellcasting.canCastSpells;
      const canCast =
        canCastWithoutArmorPenalty &&
        (spell.level === 0 || hasAvailableSlot);
      const isExhausted =
        spell.level > 0 && !hasAvailableSlot;
      const unavailableReason = !canCastWithoutArmorPenalty
        ? "Cannot cast spells while wearing armor you are not proficient with."
        : spell.level > 0 && !hasAvailableSlot
          ? `No Level ${spell.level} spell slots available.`
          : undefined;
      // Label pact-only spells distinctly so the player knows which slot pool is used.
      // If both shared and pact slots exist at this level (multiclass), keep the generic label.
      const isPactSpell = pactCanCoverSpell && sharedRemaining === 0;

      grouped[section].push({
        id: `spell:${spell.id}`,
        name: spell.name,
        section,
        source: "spell",
        subtitle:
          spell.level === 0
            ? "Cantrip"
            : isPactSpell
              ? "Pact Magic"
              : `Level ${spell.level} Spell`,
        quickStats: [spell.range, spell.duration],
        description: spell.lore.shortDescription,
        isExhausted,
        spellLevel: spell.level,
        spellCast: {
          canCast,
          canUseSharedSlot,
          canUsePactSlot,
          unavailableReason,
        },
      });
    });

    traitActions.actions.forEach((action) => {
      if (
        action.activation.actionType !== "action" &&
        action.activation.actionType !== "bonus_action" &&
        action.activation.actionType !== "reaction"
      ) {
        return;
      }

      const uses = traitActionUses[action.id];
      const damageSummary = action.output?.damage
        ?.map((entry) => `${entry.roll} ${entry.type}`)
        .join(", ");

      grouped[action.activation.actionType].push({
        id: `trait:${action.id}`,
        name: action.name,
        section: action.activation.actionType,
        source: "trait",
        subtitle: "Trait Action",
        quickStats: [
          toTitleCase(action.activation.actionType),
          action.range.type === "self"
            ? "Self"
            : action.range.type === "touch"
              ? "Touch"
              : typeof action.range.distance === "number"
                ? `${toTitleCase(action.range.type)} ${action.range.distance} ft`
                : toTitleCase(action.range.type),
          damageSummary || "",
        ].filter(Boolean),
        description: action.description,
        isExhausted: uses ? uses.remaining <= 0 : false,
        uses,
        damageRolls: (action.output?.damage ?? [])
          .map((entry, index) => {
            const resolvedRoll = resolveScaledRollExpression(
              entry.roll,
              entry.scaling,
              state.level,
              primaryClassLevel,
            );
            const parsed = parseRollExpression(resolvedRoll);
            if (!parsed) return null;
            return {
              id: `trait-damage:${action.id}:${index}`,
              count: parsed.count,
              sides: parsed.sides,
              modifier: parsed.modifier,
              label: entry.type ? `Damage (${entry.type})` : "Damage",
            } satisfies CombatRollMetadata;
          })
          .filter((entry): entry is CombatRollMetadata => entry != null),
      });
    });

    Object.values(grouped).forEach((entries) => {
      entries.sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [
    attacks.attacks,
    state.classId,
    state.classTracks,
    state.level,
    spellcasting.pools.known.selected,
    spellcasting.pools.prepared.selected,
    spellcasting.pools.bonusPrepared,
    spellcasting.slots.shared,
    spellcasting.slots.pact,
    spellcasting.canCastSpells,
    traitActionUses,
    traitActions.actions,
  ]);

  return {
    spellcasting,
    sections,
    toRomanNumeral,
  };
};

// #endregion
