import type React from "react";
import type { SpellData } from "../../types/spell";
import type {
  ClassSpellcastingSummary,
  UseSpellcastingReturn,
} from "../../hooks/useSpellcasting";
import { useMemo, useState } from "react";
import { getAllClasses, getAllSpells } from "../../data/staticDataApi";
import "./SpellBookView.css";
import { SpellFilterBar } from "./ui/SpellFilterBar";
import { SpellRow } from "./ui/SpellRow";

interface SpellBookViewProps {
  spellcasting: UseSpellcastingReturn;
}

type AvailabilityFilter = "all" | "eligible" | "ineligible";

const buildClassLabelMap = () => {
  const map = new Map<string, string>();
  getAllClasses().forEach((cls) => {
    map.set(cls.id, cls.name);
  });
  return map;
};

const isSpellEligibleForSummary = (
  spell: SpellData,
  summary: ClassSpellcastingSummary,
  sharedMaxLevel: number,
  pactMaxLevel: number,
  bonusPreparedSpellIds: Set<string>,
) => {
  if (bonusPreparedSpellIds.has(spell.id)) {
    return true;
  }

  const effectiveClassIds = summary.spellListSource ?? [summary.classId];
  const classMatch = effectiveClassIds.some((classId) =>
    spell.classes.includes(classId),
  );
  const expandedMatch = summary.expandedSpellIds.includes(spell.id);
  const schoolMatch =
    !summary.schoolRestrictions ||
    summary.schoolRestrictions.some(
      (restrictedSchool) => restrictedSchool === spell.school,
    );

  const baseMatch = (classMatch && schoolMatch) || expandedMatch;
  if (!baseMatch) return false;

  if (spell.level === 0) {
    return summary.maxCantrips > 0;
  }

  const fallbackLevelCap =
    summary.preparationType === "pact" ? pactMaxLevel : sharedMaxLevel;
  const levelCap =
    summary.maxSpellLevel > 0 ? summary.maxSpellLevel : fallbackLevelCap;

  return levelCap >= spell.level;
};

export const SpellBookView: React.FC<SpellBookViewProps> = ({
  spellcasting,
}) => {
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");

  const allSpells = useMemo(() => getAllSpells(), []);
  const classLabelMap = useMemo(() => buildClassLabelMap(), []);

  const levelOptions = useMemo(
    () =>
      Array.from(new Set(allSpells.map((spell) => spell.level))).sort(
        (a, b) => a - b,
      ),
    [allSpells],
  );

  const schoolOptions = useMemo(
    () =>
      Array.from(new Set(allSpells.map((spell) => spell.school))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [allSpells],
  );

  const classOptions = useMemo(
    () =>
      Array.from(new Set(allSpells.flatMap((spell) => spell.classes))).sort(
        (a, b) => {
          const labelA = classLabelMap.get(a) ?? a;
          const labelB = classLabelMap.get(b) ?? b;
          return labelA.localeCompare(labelB);
        },
      ),
    [allSpells, classLabelMap],
  );

  const sharedMaxLevel = useMemo(() => {
    const levels = Object.keys(spellcasting.slots.shared).map(Number);
    return levels.length > 0 ? Math.max(...levels) : 0;
  }, [spellcasting.slots.shared]);

  const pactMaxLevel = spellcasting.slots.pact?.level ?? 0;
  const bonusPreparedSpellIds = useMemo(
    () => new Set(spellcasting.pools.bonusPrepared),
    [spellcasting.pools.bonusPrepared],
  );

  const spellRows = useMemo(
    () =>
      allSpells
        .map((spell) => {
          const eligible = spellcasting.diagnostics.classBreakdown.some(
            (summary) =>
              isSpellEligibleForSummary(
                spell,
                summary,
                sharedMaxLevel,
                pactMaxLevel,
                bonusPreparedSpellIds,
              ),
          );

          return {
            spell,
            eligible,
          };
        })
        .sort((a, b) => {
          if (a.spell.level !== b.spell.level)
            return a.spell.level - b.spell.level;
          return a.spell.name.localeCompare(b.spell.name);
        }),
    [
      allSpells,
      spellcasting.diagnostics.classBreakdown,
      bonusPreparedSpellIds,
      sharedMaxLevel,
      pactMaxLevel,
    ],
  );

  const filteredRows = useMemo(
    () =>
      spellRows.filter(({ spell, eligible }) => {
        if (selectedLevel !== "all" && spell.level !== Number(selectedLevel)) {
          return false;
        }

        if (selectedSchool !== "all" && spell.school !== selectedSchool) {
          return false;
        }

        if (
          selectedClassId !== "all" &&
          !spell.classes.includes(selectedClassId)
        ) {
          return false;
        }

        if (availabilityFilter === "eligible" && !eligible) return false;
        if (availabilityFilter === "ineligible" && eligible) return false;

        return true;
      }),
    [
      spellRows,
      selectedLevel,
      selectedSchool,
      selectedClassId,
      availabilityFilter,
    ],
  );

  const eligibleCount = useMemo(
    () => spellRows.filter((row) => row.eligible).length,
    [spellRows],
  );

  const toggleSpell = (id: string) => {
    setExpandedSpellId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="spellbook-container" data-testid="spellbook-view">
      <div className="spellbook-header-row">
        <div>
          <h3 className="catalog-title">Spell Catalog</h3>
          <p className="catalog-summary">
            {filteredRows.length} shown, {eligibleCount} rules-eligible for this
            character.
          </p>
        </div>

        {!spellcasting.canCastSpells && (
          <div className="spell-error-state">
            <strong>Cannot Cast Spells Right Now</strong>
            <p>You are wearing armor you are not proficient with.</p>
          </div>
        )}
      </div>

      <SpellFilterBar
        selectedLevel={selectedLevel}
        selectedSchool={selectedSchool}
        selectedClassId={selectedClassId}
        availabilityFilter={availabilityFilter}
        levelOptions={levelOptions}
        schoolOptions={schoolOptions}
        classOptions={classOptions}
        classLabelMap={classLabelMap}
        onLevelChange={setSelectedLevel}
        onSchoolChange={setSelectedSchool}
        onClassChange={setSelectedClassId}
        onAvailabilityChange={setAvailabilityFilter}
      />

      <div className="availability-legend" aria-label="Availability legend">
        <span className="availability-legend-title">
          Availability Key
          <span
            className="availability-legend-tooltip"
            role="img"
            aria-label="Availability rules info"
            title="Eligibility checks class/subclass spell lists, school restrictions, expanded lists, and per-track spell level limits."
          >
            ?
          </span>
        </span>
        <span className="availability-legend-item">
          <span className="availability-badge eligible">Eligible</span>
          Meets class list, school rules, and per-track spell level limits.
        </span>
        <span className="availability-legend-item">
          <span className="availability-badge ineligible">Not eligible</span>
          Missing one or more requirements for this character build.
        </span>
      </div>

      <div className="spell-list" role="list">
        {filteredRows.length === 0 && (
          <div className="empty-state">
            No spells match your current filters.
          </div>
        )}

        {filteredRows.map(({ spell, eligible }) => {
          const isExpanded = expandedSpellId === spell.id;
          const hasDamageOutput = (spell.output?.damage?.length ?? 0) > 0;
          const classNames = spell.classes
            .map((classId) => classLabelMap.get(classId) ?? classId)
            .sort((a, b) => a.localeCompare(b));

          return (
            <SpellRow
              key={spell.id}
              spell={spell}
              eligible={eligible}
              isExpanded={isExpanded}
              onToggle={() => toggleSpell(spell.id)}
              classNames={classNames}
              castingStats={
                spellcasting.casting.ability
                  ? {
                      saveDC: spellcasting.casting.saveDC,
                      attackBonus: spellcasting.casting.attackBonus,
                    }
                  : null
              }
              innateEntries={spellcasting.pools.innate.filter(
                (entry) => entry.spellId === spell.id,
              )}
              hasDamageOutput={hasDamageOutput}
            />
          );
        })}
      </div>
    </div>
  );
};
