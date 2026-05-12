import type React from "react";
import "./RoleplayBoard.css";
import { TabBar } from "./ui/TabBar";
import { FeatureCard } from "./ui/FeatureCard";

export type RoleplayTab =
  | "features"
  | "characteristics"
  | "biography";

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
  key: string;
  kind: string;
  label: string;
}

export interface RoleplayFeature {
  id: string;
  name: string;
  description: string;
  sources: RoleplayFeatureSource[];
}

export interface RoleplayBoardViewProps {
  activeTab: RoleplayTab;
  features: RoleplayFeature[];
  characteristics: {
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };
  biography: {
    age: string;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
    appearance: string;
    backstory: string;
    alliesAndOrganizations: string;
  };
  onTabChange: (tab: RoleplayTab) => void;
  onRoleplayFieldBlur: (field: RoleplayField, value: string) => void;
}

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
              {(["age", "height", "weight", "eyes", "skin", "hair"] as const).map(
                (field) => (
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
                ),
              )}
            </div>

            <hr className="divider" />

            <div className="rp-input-group">
              <label className="rp-label">CHARACTER APPEARANCE</label>
              <textarea
                className="rp-textarea small"
                defaultValue={biography.appearance}
                onBlur={(e) => onRoleplayFieldBlur("appearance", e.target.value)}
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
