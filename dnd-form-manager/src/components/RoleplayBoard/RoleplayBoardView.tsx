import type React from "react";
import "./RoleplayBoard.css";
import { ManuscriptField } from "./ui/ManuscriptField";

// #region Types & Interfaces

export type RoleplayTab = "characteristics" | "biography";

export type RoleplayField =
  | "personalityTraits"
  | "ideals"
  | "bonds"
  | "flaws"
  | "age"
  | "height"
  | "weight"
  | "eyes"
  | "skin"
  | "hair"
  | "appearance"
  | "backstory"
  | "alliesAndOrganizations";

export interface RoleplayFeatureSource {
  /** The unique key for the feature source */
  key: string;
  /** The kind of feature source (e.g., race, class, feat) */
  kind: string;
  /** The label for the feature source */
  label: string;
}

export interface RoleplayFeature {
  /** The unique identifier for the feature */
  id: string;
  /** The name of the feature */
  name: string;
  /** The description of the feature */
  description: string;
  /** The sources from which the feature is derived */
  sources: RoleplayFeatureSource[];
}

export interface RoleplayBoardViewProps {
  /** The currently active tab */
  activeTab: RoleplayTab;
  /** The list of features to display */
  features: RoleplayFeature[];
  /** The character's characteristics */
  characteristics: {
    /** The character's personality traits */
    personalityTraits: string;
    /** The character's ideals */
    ideals: string;
    /** The character's bonds */
    bonds: string;
    /** The character's flaws */
    flaws: string;
  };
  /** The character's biography */
  biography: {
    /** The character's age */
    age: string;
    /** The character's height */
    height: string;
    /** The character's weight */
    weight: string;
    /** The character's eye color */
    eyes: string;
    /** The character's skin color */
    skin: string;
    /** The character's hair color */
    hair: string;
    /** The character's appearance */
    appearance: string;
    /** The character's backstory */
    backstory: string;
    /** The character's allies and organizations */
    alliesAndOrganizations: string;
  };

  /** Callback when the active tab changes */
  onTabChange: (tab: RoleplayTab) => void;
  /** Callback when a roleplay field loses focus */
  onRoleplayFieldBlur: (field: RoleplayField, value: string) => void;
}

// #endregion

// #region View Component

export const RoleplayBoardView: React.FC<RoleplayBoardViewProps> = ({
  activeTab,
  characteristics,
  biography,
  onTabChange,
  onRoleplayFieldBlur,
}) => {
  const currentTab =
    activeTab === "characteristics" ? "characteristics" : "biography";

  return (
    <div className="roleplay-board-container">
      {/* Bookmark Tabs */}
      <div className="bookmark-tabs-container">
        <button
          className={`bookmark-tab ${currentTab === "characteristics" ? "active" : ""}`}
          onClick={() => onTabChange("characteristics")}
        >
          Persona
        </button>
        <button
          className={`bookmark-tab ${currentTab === "biography" ? "active" : ""}`}
          onClick={() => onTabChange("biography")}
        >
          Chronicle
        </button>
      </div>

      <div className="roleplay-content-area">
        {/* Persona Tab */}
        {currentTab === "characteristics" && (
          <div className="characteristics-grid fadeIn">
            <ManuscriptField
              label="Personality Traits"
              fieldId="personalityTraits"
              initialValue={characteristics.personalityTraits}
              onBlur={onRoleplayFieldBlur}
              isMultiline
            />
            <ManuscriptField
              label="Ideals"
              fieldId="ideals"
              initialValue={characteristics.ideals}
              onBlur={onRoleplayFieldBlur}
              isMultiline
            />
            <ManuscriptField
              label="Bonds"
              fieldId="bonds"
              initialValue={characteristics.bonds}
              onBlur={onRoleplayFieldBlur}
              isMultiline
            />
            <ManuscriptField
              label="Flaws"
              fieldId="flaws"
              initialValue={characteristics.flaws}
              onBlur={onRoleplayFieldBlur}
              isMultiline
            />
          </div>
        )}

        {/* Chronicle Tab */}
        {currentTab === "biography" && (
          <div className="biography-layout fadeIn">
            {/* Physical Stats dense grid */}
            <div className="physical-stats-grid">
              <ManuscriptField
                label="Age"
                fieldId="age"
                initialValue={biography.age}
                onBlur={onRoleplayFieldBlur}
              />
              <ManuscriptField
                label="Height"
                fieldId="height"
                initialValue={biography.height}
                onBlur={onRoleplayFieldBlur}
              />
              <ManuscriptField
                label="Weight"
                fieldId="weight"
                initialValue={biography.weight}
                onBlur={onRoleplayFieldBlur}
              />
              <ManuscriptField
                label="Eyes"
                fieldId="eyes"
                initialValue={biography.eyes}
                onBlur={onRoleplayFieldBlur}
              />
              <ManuscriptField
                label="Skin"
                fieldId="skin"
                initialValue={biography.skin}
                onBlur={onRoleplayFieldBlur}
              />
              <ManuscriptField
                label="Hair"
                fieldId="hair"
                initialValue={biography.hair}
                onBlur={onRoleplayFieldBlur}
              />
            </div>

            <hr className="filigree-divider" />

            {/* Long form text */}
            <div className="long-form-texts">
              <ManuscriptField
                label="Appearance"
                fieldId="appearance"
                initialValue={biography.appearance}
                onBlur={onRoleplayFieldBlur}
                isMultiline
              />
              <ManuscriptField
                label="Backstory"
                fieldId="backstory"
                initialValue={biography.backstory}
                onBlur={onRoleplayFieldBlur}
                isMultiline
                className="tall-textarea"
              />
              <ManuscriptField
                label="Allies & Organizations"
                fieldId="alliesAndOrganizations"
                initialValue={biography.alliesAndOrganizations}
                onBlur={onRoleplayFieldBlur}
                isMultiline
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// #endregion
