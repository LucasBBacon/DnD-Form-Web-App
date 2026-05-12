import type React from "react";
import "./RoleplayBoard.css";
import { TabBar } from "./ui/TabBar";
import { FeatureCard } from "./ui/FeatureCard";

// #region Types & Interfaces

export type RoleplayTab = "features" | "characteristics" | "biography";

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
  features,
  characteristics,
  biography,
  onTabChange,
  onRoleplayFieldBlur,
}) => {
  return (
    <section className="roleplay-board card">
      <TabBar
        tabs={[
          { id: "features", label: "FEATURES & TRAITS" },
          { id: "characteristics", label: "CHARACTERISTICS" },
          { id: "biography", label: "BIOGRAPHY" },
        ]}
        activeId={activeTab}
        onChange={(id) => onTabChange(id as RoleplayTab)}
      />

      <div className="tab-content">
        {activeTab === "features" && (
          <div className="features-list">
            {features.length === 0 ? (
              <p className="empty-state">No features acquired yet.</p>
            ) : (
              features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  name={feature.name}
                  sources={feature.sources}
                  description={feature.description}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "characteristics" && (
          <div className="characteristics-grid">
            {(["personalityTraits", "ideals", "bonds", "flaws"] as const).map(
              (field) => (
                <div key={field} className="rp-input-group">
                  <label className="rp-label">
                    {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </label>
                  <textarea
                    className="rp-textarea"
                    defaultValue={characteristics[field]}
                    onBlur={(e) => onRoleplayFieldBlur(field, e.target.value)}
                    placeholder={`Enter your ${field.toLowerCase()}...`}
                  />
                </div>
              ),
            )}
          </div>
        )}

        {activeTab === "biography" && (
          <div className="biography-layout">
            <div className="physical-attributes-grid">
              {(
                ["age", "height", "weight", "eyes", "skin", "hair"] as const
              ).map((field) => (
                <div key={field} className="rp-input-group inline">
                  <label className="rp-label">{field.toUpperCase()}</label>
                  <input
                    type="text"
                    className="rp-input"
                    defaultValue={biography[field]}
                    onBlur={(e) => onRoleplayFieldBlur(field, e.target.value)}
                    placeholder="-"
                  />
                </div>
              ))}
            </div>

            <hr className="divider" />

            <div className="rp-input-group">
              <label className="rp-label">CHARACTER APPEARANCE</label>
              <textarea
                className="rp-textarea small"
                defaultValue={biography.appearance}
                onBlur={(e) =>
                  onRoleplayFieldBlur("appearance", e.target.value)
                }
              />
            </div>

            <div className="rp-input-group">
              <label className="rp-label">BACKSTORY</label>
              <textarea
                className="rp-textarea large"
                defaultValue={biography.backstory}
                onBlur={(e) => onRoleplayFieldBlur("backstory", e.target.value)}
              />
            </div>

            <div className="rp-input-group">
              <label className="rp-label">ALLIES & ORGANIZATIONS</label>
              <textarea
                className="rp-textarea small"
                defaultValue={biography.alliesAndOrganizations}
                onBlur={(e) =>
                  onRoleplayFieldBlur("alliesAndOrganizations", e.target.value)
                }
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// #endregion
