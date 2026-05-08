import type React from "react";
import type { SpellData } from "../types/spell";
import type { ClassSpellcastingSummary, UseSpellcastingReturn } from "../hooks/useSpellcasting";
import { useMemo, useState } from "react";
import { getAllClasses, getAllSpells } from "../data/staticDataApi";
import "./SpellBookView.css";

interface SpellBookViewProps {
  spellcasting: UseSpellcastingReturn;
}

type AvailabilityFilter = "all" | "eligible" | "ineligible";

const formatAttackBonus = (bonus: number) =>
  bonus >= 0 ? `+${bonus}` : String(bonus);

const formatLevel = (level: number) => (level === 0 ? "Cantrip" : `Level ${level}`);

const formatSchool = (school: string) =>
  school.charAt(0).toUpperCase() + school.slice(1);

const formatResetText = (value: string) => value.replace(/_/g, " ");

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
    summary.schoolRestrictions.some((restrictedSchool) => restrictedSchool === spell.school);

  const baseMatch = (classMatch && schoolMatch) || expandedMatch;
  if (!baseMatch) return false;

  if (spell.level === 0) {
    return summary.maxCantrips > 0;
  }

  const fallbackLevelCap =
    summary.preparationType === "pact" ? pactMaxLevel : sharedMaxLevel;
  const levelCap = summary.maxSpellLevel > 0 ? summary.maxSpellLevel : fallbackLevelCap;

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
    () => Array.from(new Set(allSpells.map((spell) => spell.level))).sort((a, b) => a - b),
    [allSpells],
  );

  const schoolOptions = useMemo(
    () => Array.from(new Set(allSpells.map((spell) => spell.school))).sort((a, b) => a.localeCompare(b)),
    [allSpells],
  );

  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(allSpells.flatMap((spell) => spell.classes)),
      ).sort((a, b) => {
        const labelA = classLabelMap.get(a) ?? a;
        const labelB = classLabelMap.get(b) ?? b;
        return labelA.localeCompare(labelB);
      }),
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
          const eligible = spellcasting.diagnostics.classBreakdown.some((summary) =>
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
          if (a.spell.level !== b.spell.level) return a.spell.level - b.spell.level;
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

        if (selectedClassId !== "all" && !spell.classes.includes(selectedClassId)) {
          return false;
        }

        if (availabilityFilter === "eligible" && !eligible) return false;
        if (availabilityFilter === "ineligible" && eligible) return false;

        return true;
      }),
    [spellRows, selectedLevel, selectedSchool, selectedClassId, availabilityFilter],
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
            {filteredRows.length} shown, {eligibleCount} rules-eligible for this character.
          </p>
        </div>

        {!spellcasting.canCastSpells && (
          <div className="spell-error-state">
            <strong>Cannot Cast Spells Right Now</strong>
            <p>You are wearing armor you are not proficient with.</p>
          </div>
        )}
      </div>

      <div className="spell-filters" aria-label="Spell filters">
        <label className="filter-group">
          <span>Level</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Filter by level"
          >
            <option value="all">All levels</option>
            {levelOptions.map((level) => (
              <option key={`level-filter-${level}`} value={String(level)}>
                {formatLevel(level)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span>School</span>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            aria-label="Filter by school"
          >
            <option value="all">All schools</option>
            {schoolOptions.map((school) => (
              <option key={`school-filter-${school}`} value={school}>
                {formatSchool(school)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span>Class</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            aria-label="Filter by class"
          >
            <option value="all">All classes</option>
            {classOptions.map((classId) => (
              <option key={`class-filter-${classId}`} value={classId}>
                {classLabelMap.get(classId) ?? classId}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span>Availability</span>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as AvailabilityFilter)}
            aria-label="Filter by availability"
          >
            <option value="all">All spells</option>
            <option value="eligible">Rules-eligible</option>
            <option value="ineligible">Not eligible</option>
          </select>
        </label>
      </div>

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
          <div className="empty-state">No spells match your current filters.</div>
        )}

        {filteredRows.map(({ spell, eligible }) => {
          const isExpanded = expandedSpellId === spell.id;
          const hasDamageOutput = (spell.output?.damage?.length ?? 0) > 0;
          const classNames = spell.classes
            .map((classId) => classLabelMap.get(classId) ?? classId)
            .sort((a, b) => a.localeCompare(b));

          return (
            <article
              key={spell.id}
              role="listitem"
              className={`spell-card ${isExpanded ? "expanded" : ""}`}
            >
              <button
                className="spell-header-btn"
                onClick={() => toggleSpell(spell.id)}
                aria-expanded={isExpanded}
              >
                <div className="spell-heading-main">
                  <span className="spell-name">{spell.name}</span>
                  <span className={`availability-badge ${eligible ? "eligible" : "ineligible"}`}>
                    {eligible ? "Eligible" : "Not eligible"}
                  </span>
                </div>

                <div className="spell-collapsed-meta">
                  <span className="quick-stat">{formatLevel(spell.level)}</span>
                  <span className="quick-stat">{formatSchool(spell.school)}</span>
                </div>

                <p className="spell-short-description">
                  {spell.lore.shortDescription || "No short description available."}
                </p>
              </button>

              {isExpanded && (
                <div className="spell-details">
                  <div className="spell-meta-grid">
                    <div className="meta-item">
                      <strong>Casting Time:</strong> {spell.castingTime}
                    </div>
                    <div className="meta-item">
                      <strong>Range:</strong> {spell.range}
                    </div>
                    <div className="meta-item">
                      <strong>Duration:</strong> {spell.duration}
                    </div>
                    <div className="meta-item">
                      <strong>Concentration:</strong> {spell.concentration ? "Yes" : "No"}
                    </div>
                    <div className="meta-item">
                      <strong>Ritual:</strong> {spell.ritual ? "Yes" : "No"}
                    </div>
                    <div className="meta-item">
                      <strong>Classes:</strong> {classNames.join(", ")}
                    </div>
                    <div className="meta-item">
                      <strong>Components:</strong>{" "}
                      {[
                        spell.components.vocal ? "V" : null,
                        spell.components.somatic ? "S" : null,
                        spell.components.material ? "M" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </div>
                    {spell.components.materialMaterials && (
                      <div className="meta-item">
                        <strong>Material Details:</strong>{" "}
                        {spell.components.materialMaterials}
                      </div>
                    )}
                    {spell.savingThrow && spellcasting.casting.ability && (
                      <>
                        <div className="meta-item highlight">
                          <strong>Save DC:</strong> {spellcasting.casting.saveDC}
                        </div>
                      </>
                    )}
                    {hasDamageOutput && spellcasting.casting.ability && (
                      <>
                        <div className="meta-item highlight">
                          <strong>Spell Attack:</strong>{" "}
                          {formatAttackBonus(spellcasting.casting.attackBonus)}
                        </div>
                      </>
                    )}
                  </div>

                  <hr className="divider" />

                  <p className="spell-description">
                    {spell.lore.fullText?.trim() || "No description available."}
                  </p>

                  {spell.lore.higherLevel && (
                    <p className="spell-higher-level">
                      <strong>At Higher Levels:</strong> {spell.lore.higherLevel}
                    </p>
                  )}

                  {spellcasting.pools.innate
                    .filter((entry) => entry.spellId === spell.id)
                    .map((entry, index) => (
                      <div key={`${spell.id}-innate-${index}`} className="innate-note">
                        <strong>Innate Source:</strong> {entry.sourceTraitName}
                        <span>
                          {" "}
                          (DC {entry.spellSaveDC}
                          {hasDamageOutput
                            ? `, Attack ${formatAttackBonus(entry.spellAttackBonus)}`
                            : ""}
                          )
                        </span>
                        {entry.uses && (
                          <span>
                            {" "}
                            - Uses: {entry.uses.count} / {formatResetText(entry.uses.reset)}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
