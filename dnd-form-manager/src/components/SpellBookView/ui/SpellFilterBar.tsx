import type React from "react";
import "./SpellFilterBar.css";

// #region Type and Interface

type AvailabilityFilter = "all" | "eligible" | "ineligible";

const formatLevel = (level: number) =>
  level === 0 ? "Cantrip" : `Level ${level}`;
const formatSchool = (school: string) =>
  school.charAt(0).toUpperCase() + school.slice(1);

export interface SpellFilterBarProps {
  /** The currently selected spell level filter */
  selectedLevel: string;
  /** The currently selected spell school filter */
  selectedSchool: string;
  /** The currently selected class filter */
  selectedClassId: string;
  /** The currently selected availability filter */
  availabilityFilter: AvailabilityFilter;
  /** The available spell levels for filtering */
  levelOptions: number[];
  /** The available spell schools for filtering */
  schoolOptions: string[];
  /** The available classes for filtering */
  classOptions: string[];
  /** A map of class IDs to their display names */
  classLabelMap: Map<string, string>;

  /** Callback when the spell level filter changes */
  onLevelChange: (value: string) => void;
  /** Callback when the spell school filter changes */
  onSchoolChange: (value: string) => void;
  /** Callback when the class filter changes */
  onClassChange: (value: string) => void;
  /** Callback when the availability filter changes */
  onAvailabilityChange: (value: AvailabilityFilter) => void;
}

// #endregion

// #region Component

export const SpellFilterBar: React.FC<SpellFilterBarProps> = ({
  selectedLevel,
  selectedSchool,
  selectedClassId,
  availabilityFilter,
  levelOptions,
  schoolOptions,
  classOptions,
  classLabelMap,
  onLevelChange,
  onSchoolChange,
  onClassChange,
  onAvailabilityChange,
}) => (
  <div className="spell-filters" aria-label="Spell filters">
    <label className="filter-group">
      <span>Level</span>
      <select
        value={selectedLevel}
        onChange={(e) => onLevelChange(e.target.value)}
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
        onChange={(e) => onSchoolChange(e.target.value)}
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
        onChange={(e) => onClassChange(e.target.value)}
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
        onChange={(e) =>
          onAvailabilityChange(e.target.value as AvailabilityFilter)
        }
        aria-label="Filter by availability"
      >
        <option value="all">All spells</option>
        <option value="eligible">Rules-eligible</option>
        <option value="ineligible">Not eligible</option>
      </select>
    </label>
  </div>
);

// #endregion
