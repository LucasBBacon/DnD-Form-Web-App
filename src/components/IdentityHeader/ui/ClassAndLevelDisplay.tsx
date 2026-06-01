import type React from "react";
import "./ClassAndLevelDisplay.css";
import type { CharacterClassEntry } from "../IdentityHeader";

export const ClassAndLevelDisplay: React.FC<{
  classes: CharacterClassEntry[];
  onClick: () => void;
}> = ({ classes, onClick }) => {
  const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);

  return (
    <div className="header-box clickable-box" onClick={onClick}>
      <div className="box-label">Class & Level</div>
      <div className="box-value class-value">
        {classes.length === 0 ? (
          <span className="placeholder-text">Select Class</span>
        ) : (
          classes.map((cls, idx) => (
            <span key={cls.classId} className="class-segment">
              <span className="class-name">
                {cls.subclassName
                  ? `${cls.subclassName} ${cls.className}`
                  : cls.className}
              </span>
              <span className="class-level">{cls.level}</span>
              {idx < classes.length - 1 && (
                <span className="class-divider">/</span>
              )}
            </span>
          ))
        )}
      </div>
      <div className="total-level-badge">Level {totalLevel}</div>
    </div>
  );
};
