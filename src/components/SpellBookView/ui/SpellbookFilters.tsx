import type React from "react";
import "./SpellbookFilters.css";
import type { SpellFilterState } from "../SpellBookView";
import { BookOpen, Search } from "lucide-react";

interface SpellbookFiltersProps {
  filters: SpellFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SpellFilterState>>;
  availableSchools: string[];
}

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const SpellbookFilters: React.FC<SpellbookFiltersProps> = ({
  filters,
  setFilters,
  availableSchools,
}) => {
  const toggleLevel = (level: number) => {
    setFilters((prev) => {
      const newLevels = new Set(prev.levels);
      if (newLevels.has(level)) newLevels.delete(level);
      else newLevels.add(level);
      return { ...prev, levels: newLevels };
    });
  };

  const toggleSchool = (school: string) => {
    setFilters((prev) => {
      const newSchools = new Set(prev.schools);
      if (newSchools.has(school)) newSchools.delete(school);
      else newSchools.add(school);
      return { ...prev, schools: newSchools };
    });
  };

  return (
    <div className="spellbook-filters-panel">
      {/* Search bar */}
      <div className="search-row">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search incantations"
          className="manuscript-input spell-search"
          value={filters.searchQuery}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
          }
        />
        <label className="prepared-toggle">
          <input
            type="checkbox"
            checked={filters.preparedOnly}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                preparedOnly: e.target.checked,
              }))
            }
          />
          <BookOpen size={14} /> Prepared Only
        </label>
      </div>

      {/* Level toggles */}
      <div className="filter-group">
        <span className="filter-label">Level</span>
        <div className="filter-chips">
          {SPELL_LEVELS.map((level) => (
            <button
              key={`lvl-${level}`}
              className={`filter-chip ${filters.levels.has(level) ? "active" : ""}`}
              onClick={() => toggleLevel(level)}
            >
              {level === 0 ? "Cantrip" : level}
            </button>
          ))}
        </div>
      </div>

      {/* School toggles */}
      <div className="filter-group">
        <span className="filter-label">School</span>
        <div className="filter-chips">
          {availableSchools.map((school) => (
            <button
              key={school}
              className={`filter-chip ${filters.schools.has(school) ? "active" : ""}`}
              onClick={() => toggleSchool(school)}
            >
              {school}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
