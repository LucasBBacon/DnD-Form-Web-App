import type React from "react";
import "./RoleplayBoard.css";
import { useMemo, useState } from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllCharacterTraits } from "../utils/traitUtils";

type RoleplayTab = "features" | "characteristics" | "biography";

export const RoleplayBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RoleplayTab>("features");
  const store = useCharacterStore();
  type RoleplayFiled = Parameters<typeof store.updateRoleplayField>[0];

  // #region Mechanical Features

  const activeFeatures = useMemo(() => {
    return getAllCharacterTraits(
      store.level,
      store.raceId,
      store.subraceId,
      store.classId,
      store.subclassId,
      false,
      store.choicesByLevel,
      store.acquiredFeats,
      store.classTracks,
    );
  }, [store]);

  // #endregion

  // #region Edit helpers

  const handleTextBlur = (
    field: RoleplayFiled,
    e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (store[field] !== e.target.value) {
      store.updateRoleplayField(field, e.target.value);
    }
  };

  // #endregion

  return (
    <section className="roleplay-board card">
      {/* Tabs */}
      <div className="tab-controls">
        <button
          className={`tab-btn ${activeTab === "features" ? "active" : ""}`}
          onClick={() => setActiveTab("features")}
        >
          FEATURES & TRAITS
        </button>
        <button
          className={`tab-btn ${activeTab === "characteristics" ? "active" : ""}`}
          onClick={() => setActiveTab("characteristics")}
        >
          CHARACTERISTICS
        </button>
        <button
          className={`tab-btn ${activeTab === "biography" ? "active" : ""}`}
          onClick={() => setActiveTab("biography")}
        >
          BIOGRAPHY
        </button>
      </div>
      <div className="tab-content">
        {/* Mechanical features */}
        {activeTab === "features" && (
          <div className="features-list">
            {activeFeatures.length === 0 ? (
              <p className="empty-state">No features acquired yet.</p>
            ) : (
              activeFeatures.map((trait, idx) => (
                <div key={`${trait.name}-${idx}`} className="feature-card">
                  <div className="feature-header">
                    <span className="feature-name">{trait.name}</span>
                    {/* TODO: Add source property to traits, like "Fighter level 2" or "Racial" */}
                    <span className="feature-source">TODO</span>
                  </div>
                  <div className="feature-description">
                    {trait.lore.shortDescription}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Characteristics */}
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
                    defaultValue={store[field] as string}
                    onBlur={(e) => handleTextBlur(field, e)}
                    placeholder={`Enter your ${field.toLocaleLowerCase()}...`}
                  />
                </div>
              ),
            )}
          </div>
        )}

        {/* Biography */}
        {activeTab === "biography" && (
          <div className="biography-layout">
            {/* physical attributes */}
            <div className="physical-attributes-grid">
              {(
                ["age", "height", "weight", "eyes", "skin", "hair"] as const
              ).map((field) => (
                <div key={field} className="rp-input-group inline">
                  <label className="rp-label">{field.toUpperCase()}</label>
                  <input
                    type="text"
                    className="rp-input"
                    defaultValue={store[field] as string}
                    onBlur={(e) => handleTextBlur(field, e)}
                    placeholder="-"
                  />
                </div>
              ))}
            </div>

            <hr className="divider" />

            {/* Long form text */}
            <div className="rp-input-group">
              <label className="rp-label">CHARACTER APPEARANCE</label>
              <textarea
                className="rp-textarea small"
                defaultValue={store.appearance}
                onBlur={(e) => handleTextBlur("appearance", e)}
              />
            </div>

            <div className="rp-input-group">
              <label className="rp-label">BACKSTORY</label>
              <textarea
                className="rp-textarea large"
                defaultValue={store.backstory}
                onBlur={(e) => handleTextBlur("backstory", e)}
              />
            </div>

            <div className="rp-input-group">
              <label className="rp-label">ALLIES & ORGANIZATIONS</label>
              <textarea
                className="rp-textarea small"
                defaultValue={store.alliesAndOrganizations}
                onBlur={(e) => handleTextBlur("alliesAndOrganizations", e)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
