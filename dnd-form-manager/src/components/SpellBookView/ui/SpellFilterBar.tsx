import type React from "react";

type AvailabilityFilter = "all" | "eligible" | "ineligible";

const formatLevel = (level: number) => (level === 0 ? "Cantrip" : `Level ${level}`);
const formatSchool = (school: string) =>
  school.charAt(0).toUpperCase() + school.slice(1);

export interface SpellFilterBarProps {
  selectedLevel: string;
  selectedSchool: string;
  selectedClassId: string;
  availabilityFilter: AvailabilityFilter;
  levelOptions: number[];
  schoolOptions: string[];
  classOptions: string[];
  classLabelMap: Map<string, string>;
  onLevelChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
}

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
        onChange={(e) => onAvailabilityChange(e.target.value as AvailabilityFilter)}
        aria-label="Filter by availability"
      >
        <option value="all">All spells</option>
        <option value="eligible">Rules-eligible</option>
        <option value="ineligible">Not eligible</option>
      </select>
    </label>
  </div>
);
