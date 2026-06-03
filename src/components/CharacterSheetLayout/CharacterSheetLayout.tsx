import type React from "react";
import { useState } from "react";
import "./CharacterSheetLayout.css";
import { IdentityHeaderContainer } from "../IdentityHeader/IdentityHeaderContainer";
import { BookOpen } from "lucide-react";
import { CoreStatsBoardContainer } from "../CoreStatsBoard/CoreStatsBoardContainer";
import { MortalLedgerContainer } from "../VitalsBoard/MortalLedgerContainer";
import { ActionsBoardContainer } from "../ActionsBoard/ActionsBoardContainer";
import { FeaturesBoardContainer } from "../FeaturesBoard/FeaturesBoardContainer";
import { InventoryBoard } from "../InventoryBoard/InventoryBoard";
import { RoleplayBoard } from "../RoleplayBoard/RoleplayBoard";
import { SpellbookContainer } from "../Spellbook/SpellbookContainer.tsx";

export const CharacterSheetLayout: React.FC = () => {
  const [activeRightTab, setActiveRightTab] = useState<
    "inventory" | "features" | "roleplay"
  >("features");

  const [showSpellbook, setShowSpellbook] = useState(false);

  if (showSpellbook) {
    return <SpellbookContainer />
  }

  return (
    <div className="sheet-master-layout">
      {/* BG texture */}
      <div className="parchment-background" />

      <div className="sheet-content-wrapper">
        {/* header & nav */}
        <header className="sheet-header-area">
          <div className="identity-wrapper">
            <IdentityHeaderContainer />
          </div>

          {/* Grimoire bookmark */}
          <button
            className="grimoire-bookmark"
            onClick={() => setShowSpellbook(true)}
          >
            <div className="bookmark-ribbon" />
            <BookOpen size={24} className="bookmark-icon" />
            <span className="bookmark-text">Grimoire</span>
          </button>
        </header>

        {/* Main 3 col grid */}
        <main className="sheet-main-grid">
          {/* Left: core stats */}
          <aside className="sheet-col-left">
            <CoreStatsBoardContainer />
          </aside>

          {/* Center: combat zone */}
          <section className="sheet-col-center">
            <div className="vitals-wrapper">
              <MortalLedgerContainer />
            </div>
            <div className="actions-wrapper">
              <ActionsBoardContainer />
            </div>
          </section>

          {/* Right: tabbed ledgers */}
          <aside className="sheet-col-right">
            <div className="ledger-tabs-container">
              {/* tab navigation */}
              <nav className="ledger-tabs-nav">
                {(["features", "inventory", "roleplay"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`ledger-tab ${activeRightTab === tab ? "is-active" : ""}`}
                    onClick={() => setActiveRightTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* tab content */}
              <div className="ledger-tab-content scrollable-area">
                {activeRightTab === "features" && <FeaturesBoardContainer />}
                {activeRightTab === "inventory" && <InventoryBoard />}
                {activeRightTab === "roleplay" && <RoleplayBoard />}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};
