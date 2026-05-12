import type React from "react";
import "./TabBar.css";

// #region Interfaces

export interface Tab {
  /** The unique identifier for the tab */
  id: string;
  /** The display label for the tab */
  label: string;
}

interface TabBarProps {
  /** The tabs to display in the tab bar */
  tabs: Tab[];
  /** The ID of the currently active tab */
  activeId: string;

  /** Callback when a tab is clicked */
  onChange: (id: string) => void;
}

// #endregion

// #region Component

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeId, onChange }) => (
  <div className="tab-controls">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={`tab-btn ${activeId === tab.id ? "active" : ""}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// #endregion
