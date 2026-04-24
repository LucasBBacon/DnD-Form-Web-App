import type React from "react";
import { useState } from "react";
import { useAttacks } from "../hooks/useAttacks";
import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";
import "./ActionsBoard.css";

type ActionTab = "at-will" | "spells";

export const ActionsBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActionTab>("at-will");

  const attacks = useAttacks();
  const spellcasting = useSpellcasting();
  const { expendSpellSlot, restoreSpellSlot, expendPactSlot } =
    useCharacterStore();

  // Helper to check if there are spells, disables tab if not
  const hasSpells =
    spellcasting.isSpellcaster || spellcasting.pools.innate.length > 0;

  return (
    <section className="actions-board-container card">
      {/* Segmented control (tabs) */}
      <div className="tab-controls">
        <button
          className={`tab-btn ${activeTab === "at-will" ? "active" : ""}`}
          onClick={() => setActiveTab("at-will")}
        >
          AT-WILL ATTACKS
        </button>
        <button
          className={`tab-btn ${activeTab === "spells" ? "active" : ""}`}
          onClick={() => setActiveTab("spells")}
          disabled={!hasSpells}
        >
          SPELLS & SLOTS
        </button>
      </div>

      <div className="tab-content">
        {/* --- TAB 1: AT-WILL (Weapons) --- */}
        {activeTab === "at-will" && (
          <div className="attack-list">
            <div className="list-header">
              <span className="col-name">WEAPON</span>
              <span className="col-atk">ATK BONUS</span>
              <span className="col-dmg">DAMAGE/TYPE</span>
            </div>

            {attacks.attacks.length === 0 ? (
              <div className="empty-state">No equipped weapons.</div>
            ) : (
              attacks.attacks.map((atk, index) => (
                <div key={`${atk?.weaponId}-${index}`} className="attack-row">
                  <div className="atk-name-col">
                    <strong>{atk?.name}</strong>
                    {atk?.range && (
                      <span className="atk-subtext">{atk.range}</span>
                    )}
                  </div>
                  <div className="atk-bonus-col">
                    <button className="roll-btn">
                      {(atk?.toHit ?? 0) >= 0
                        ? `+${atk?.toHit ?? 0}`
                        : atk?.toHit}
                    </button>
                  </div>
                  <div className="atk-dmg-col">
                    <span className="dmg-string">{atk?.damageString}</span>
                    {/* Ammo tracker inline */}
                    {atk?.ammo && (
                      <span className="ammo-tracker">
                        Ammo: {atk?.ammo.count}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            {/* TODO: map cantrips here */}
          </div>
        )}

        {/* --- TAB 2: SPELLS AND SLOTS --- */}
        {activeTab === "spells" && hasSpells && (
          <div className="spells-view">
            {/* Slots tracker pinned to top */}
            <div className="slot-trackers-grid">
              {/* Pact slots (if applicable) */}
              {spellcasting.slots.pact && (
                <div className="slot-box pact-slot">
                  <span className="slot-label">
                    PACT (LVL {spellcasting.slots.pact.level})
                  </span>
                  <div className="slot-bubbles">
                    {Array.from({ length: spellcasting.slots.pact.total }).map(
                      (_, i) => (
                        <input
                          key={`pact-${i}`}
                          type="checkbox"
                          checked={i < (spellcasting.slots.pact?.expended ?? 0)}
                          onChange={expendPactSlot}
                          className="slot-checkbox"
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Shared Slots (lvl 1-9) */}
              {Object.entries(spellcasting.slots.shared).map(
                ([level, slotData]) => {
                  if (slotData.total === 0) return null;
                  const lvlNum = parseInt(level);
                  return (
                    <div key={`slot-lvl-${level}`} className="slot-box">
                      <span className="slot-label">LEVEL {level}</span>
                      <div className="slot-bubbles">
                        {Array.from({ length: slotData.total }).map((_, i) => (
                          <input
                            key={`shared-${level}-${i}`}
                            type="checkbox"
                            checked={i < slotData.expended}
                            onChange={(e) => {
                              e.target.checked
                                ? expendSpellSlot(lvlNum)
                                : restoreSpellSlot(lvlNum);
                            }}
                            className="slot-checkbox"
                          />
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* TODO: List of spells, grouped by level */}
            <div className="spell-book-hint">
              {/* TODO: Map out state.spellsPrepared / state.spellsKnown here,
              use an Accordion for each spell level */}
              <p className="empty-state">Spell list accordions go here...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
