import type React from "react";
import "./TabBar.css"

export interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

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
