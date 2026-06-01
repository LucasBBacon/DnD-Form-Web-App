import type React from "react";
import "./IdentityHeader.css";
import type { LevelUpMode } from "../../types/progression";
import { ClassAndLevelDisplay } from "./ui/ClassAndLevelDisplay";
import { ExperienceTracker } from "./ui/ExperienceTracker";

export interface CharacterClassEntry {
  classId: string;
  className: string;
  subclassName?: string;
  level: number;
}

export interface IdentityHeaderProps {
  characterName: string;
  playerName: string;
  alignment: string;

  classes: CharacterClassEntry[];

  raceNameDisplay: string;
  backgroundNameDisplay: string;

  xp: number;
  levelUpMode: LevelUpMode;

  onCharacterNameChange: (newValue: string) => void;
  onPlayerNameChange: (newValue: string) => void;
  onAlignmentChange: (newValue: string) => void;
  onXpChange: (newValue: number) => void;
  onLevelUpModeChange: (newMode: LevelUpMode) => void;
  onClassModalClick: () => void;
  onBackgroundModalClick: () => void;
  onRaceModalClick: () => void;
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({
  characterName,
  playerName,
  alignment,
  classes,
  raceNameDisplay,
  backgroundNameDisplay,
  xp,
  levelUpMode,
  onCharacterNameChange,
  onPlayerNameChange,
  onAlignmentChange,
  onXpChange,
  onLevelUpModeChange,
  onClassModalClick,
  onBackgroundModalClick,
  onRaceModalClick,
}) => {
  return (
    <div className="identity-header-container">
      {/* Character Name */}
      <div className="character-name-section">
        <input
          type="text"
          className="character-name-input"
          value={characterName}
          onChange={(e) => onCharacterNameChange(e.target.value)}
          placeholder="Character Name"
          spellCheck={false}
        />
        <div className="name-underline" />
      </div>

      {/* Demographics Grid */}
      <div className="demographics-grid">
        {/* Top Row */}
        <ClassAndLevelDisplay classes={classes} onClick={onClassModalClick} />

        <div
          className="header-box clickable-box"
          onClick={onBackgroundModalClick}
        >
          <div className="box-label">Background</div>
          <div className="box-value">
            {backgroundNameDisplay || (
              <span className="placeholder-text">Select</span>
            )}
          </div>
        </div>

        <div className="header-box editable-box">
          <div className="box-label">Player Name</div>
          <input
            type="text"
            className="header-inline-input"
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        {/* Bottom Row */}
        <div className="header-box clickable-box" onClick={onRaceModalClick}>
          <div className="box-label">Race</div>
          <div className="box-value">
            {raceNameDisplay || (
              <span className="placeholder-text">Select</span>
            )}
          </div>
        </div>

        <div className="header-box editable-box">
          <div className="box-label">Alignment</div>
          <input
            type="text"
            className="header-inline-input"
            value={alignment}
            onChange={(e) => onAlignmentChange(e.target.value)}
            placeholder="Alignment"
          />
        </div>

        <ExperienceTracker
          xp={xp}
          classes={classes}
          levelUpMode={levelUpMode}
          onXpChange={onXpChange}
          onModeChange={onLevelUpModeChange}
        />
      </div>
    </div>
  );
};
