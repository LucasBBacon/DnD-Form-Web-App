import type React from "react";
import "./Spellbook.css";
import type { SpellCastMetadata } from "../../hooks/useSpellcasting";
import { useMemo, useState } from "react";
import { SpellbookFilters } from "./ui/SpellbookFilters";
import { SpellbookRow } from "./ui/SpellbookRow";

export interface SpellReferenceData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: {
    vocal: boolean;
    somatic: boolean;
    material: string | null;
  };
  duration: string;
  description: string;
  highLevelsText?: string;
}

export interface SpellbookEntry {
  reference: SpellReferenceData;
  metadata?: SpellCastMetadata;
  isPrepared: boolean;
  isKnown: boolean;
  isAlwaysPrepared: boolean;
}

export interface SpellFilterState {
  searchQuery: string;
  levels: Set<number>;
  schools: Set<string>;
  preparedOnly: boolean;
}

interface SpellbookProps {
  entries: SpellbookEntry[];
  toRomanNumeral: (level: number) => string;
}

export const Spellbook: React.FC<SpellbookProps> = ({
  entries,
  toRomanNumeral,
}) => {
  const [filters, setFilters] = useState<SpellFilterState>({
    searchQuery: "",
    levels: new Set(),
    schools: new Set(),
    preparedOnly: false,
  });

  // extract unique schools dynamically for the filter UI
  const availableSchools = useMemo(() => {
    const schools = new Set(entries.map((e) => e.reference.school));
    return Array.from(schools).sort();
  }, [entries]);

  // apply filters
  const filteredEntires = useMemo(() => {
    return entries
      .filter((entry) => {
        // search query
        if (
          filters.searchQuery &&
          !entry.reference.name
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase())
        ) {
          return false;
        }

        // level filter
        if (
          filters.levels.size > 0 &&
          !filters.levels.has(entry.reference.level)
        ) {
          return false;
        }

        // school filter
        if (
          filters.schools.size > 0 &&
          !filters.schools.has(entry.reference.school)
        ) {
          return false;
        }

        // prepared status
        if (filters.preparedOnly && !entry.isPrepared) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // primary sort: level, secondary sort: alphabetical name
        if (a.reference.level === b.reference.level) {
          return a.reference.name.localeCompare(b.reference.name);
        }
        return a.reference.level - b.reference.level;
      });
  }, [entries, filters]);

  return (
    <div className="spellbook-master-container">
      <div className="spellbook-header">
        <h2 className="manuscript-section-title">Grimoire</h2>
        <h2 className="ornate-board-divider" />
      </div>

      <SpellbookFilters
        filters={filters}
        setFilters={setFilters}
        availableSchools={availableSchools}
      />

      <div className="spellbook-list-area">
        {filteredEntires.length === 0 ? (
          <div className="empty-state-text">
            No incantations match the filters.
          </div>
        ) : (
          filteredEntires.map((entry) => (
            <SpellbookRow
              key={entry.reference.id}
              entry={entry}
              toRomanNumeral={toRomanNumeral}
            />
          ))
        )}
      </div>
    </div>
  );
};
