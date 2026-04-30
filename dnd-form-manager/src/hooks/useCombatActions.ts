import { useMemo } from "react";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { getSpellByID } from "../data/staticDataApi";
import { useAttacks } from "./useAttacks";
import { useSpellcasting } from "./useSpellcasting";
import { useTraitActions } from "./useTraitActions";
import { useCharacterStore } from "../store/useCharacterStore";
import type { ActionType } from "../types/action";

export type CombatActionSection = "action" | "bonus_action" | "reaction";

export interface CombatActionUseState {
  total: number;
  remaining: number;
}

export interface CombatActionEntry {
  id: string;
  name: string;
  section: CombatActionSection;
  source: "attack" | "spell" | "trait";
  subtitle?: string;
  quickStats: string[];
  description?: string;
  isExhausted: boolean;
  spellLevel?: number;
  uses?: CombatActionUseState;
}

const toTitleCase = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

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

    attacks.attacks.forEach((attack, index) => {
      grouped.action.push({
        id: `atk:${attack?.weaponId || "Weapon id not found"}:${index}`,
        name: attack?.name || "Weapon name not found",
        section: "action",
        source: "attack",
        subtitle: "Weapon Attack",
        quickStats: [
          (attack?.toHit ?? 0) >= 0 ? `ATK +${attack?.toHit ?? 0}` : `ATK ${attack?.toHit ?? 0}`,
          attack?.damageString || "1d6",
          attack?.range || "Melee",
        ],
        description: attack?.ammo
          ? `Ammo: ${attack.ammo.count} ${attack.ammo.name || ""}`.trim()
          : undefined,
        isExhausted: !attack?.canAttack,
      });
    });

    // Union both pools so known/pact casters (warlock) and prepared casters
    // (wizard) — and multiclass mixes of both — all surface their active spells.
    // For prepared casters, spellsKnown is empty/invalid so dedup is harmless.
    // For known/pact casters, spellsPrepared is empty so only known spells show.
    const activeCastableSpellIds = Array.from(
      new Set([
        ...spellcasting.pools.known.selected,
        ...spellcasting.pools.prepared.selected,
      ]),
    );

    activeCastableSpellIds.forEach((spellId) => {
      const spell = getSpellByID(spellId);
      if (!spell) return;

      const section = normalizeSpellActionType(spell.actionType, spell.castingTime);
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
      const isExhausted = spell.level > 0 && sharedRemaining + pactRemaining <= 0;
      // Label pact-only spells distinctly so the player knows which slot pool is used.
      // If both shared and pact slots exist at this level (multiclass), keep the generic label.
      const isPactSpell = pactCanCoverSpell && sharedRemaining === 0;

      grouped[section].push({
        id: `spell:${spell.id}`,
        name: spell.name,
        section,
        source: "spell",
        subtitle:
          spell.level === 0 ? "Cantrip" : isPactSpell ? "Pact Magic" : `Level ${spell.level} Spell`,
        quickStats: [spell.range, spell.duration],
        description: spell.lore.shortDescription,
        isExhausted,
        spellLevel: spell.level,
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
      });
    });

    Object.values(grouped).forEach((entries) => {
      entries.sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [
    attacks.attacks,
    spellcasting.pools.known.selected,
    spellcasting.pools.prepared.selected,
    spellcasting.slots.shared,
    spellcasting.slots.pact,
    traitActionUses,
    traitActions.actions,
  ]);

  return {
    spellcasting,
    sections,
    toRomanNumeral,
  };
};
