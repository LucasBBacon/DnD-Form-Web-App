import type React from "react";
import "./RoleplayBoard.css";
import { useMemo, useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllCharacterTraitsWithSources } from "../../utils/traitUtils";
import { useSpellcasting } from "../../hooks/useSpellcasting";
import { TabBar } from "./ui/TabBar";
import { FeatureCard } from "./ui/FeatureCard";
import { SpellBookView } from "../SpellBookView/SpellBookView";

type RoleplayTab = "features" | "characteristics" | "biography" | "spellbook";

export const RoleplayBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RoleplayTab>("features");
  const store = useCharacterStore();
  const spellcasting = useSpellcasting();
  type RoleplayFiled = Parameters<typeof store.updateRoleplayField>[0];

  // #region Mechanical Features

  const activeFeatures = useMemo(() => {
    return getAllCharacterTraitsWithSources(
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
      <TabBar
        tabs={[
          { id: "features", label: "FEATURES & TRAITS" },
          { id: "characteristics", label: "CHARACTERISTICS" },
          { id: "biography", label: "BIOGRAPHY" },
          { id: "spellbook", label: "SPELLBOOK" },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as RoleplayTab)}
      />
      <div className="tab-content">
        {/* Mechanical features */}
        {activeTab === "features" && (
          <div className="features-list">
            {activeFeatures.length === 0 ? (
              <p className="empty-state">No features acquired yet.</p>
            ) : (
              activeFeatures.map(({ trait, sources }, idx) => (
                <FeatureCard
                  key={`${trait.name}-${idx}`}
                  name={trait.name}
                  sources={sources.map((source) => ({
                    key: `${trait.id}-${source.kind}-${source.sourceId ?? source.label}-${source.level ?? 0}`,
                    kind: source.kind,
                    label: source.label,
                  }))}
                  description={trait.lore.shortDescription ?? ""}
                />
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

        {/* Spellbook */}
        {activeTab === "spellbook" && (
          <SpellBookView spellcasting={spellcasting} />
        )}
      </div>
    </section>
  );
};
