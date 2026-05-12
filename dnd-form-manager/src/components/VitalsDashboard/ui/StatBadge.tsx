import type React from "react";
import "./StatBadge.css";

// #region Interface

interface StatBadgeProps {
  /** The label for the stat badge */
  label: string;
  /** The value for the stat badge */
  value: string | number;
  /** Additional class names for the stat badge */
  className?: string;
  /** The title attribute for the stat badge */
  title?: string;
  /** Whether to display a warning icon */
  warning?: boolean;
  /** The icon to display when warning is true */
  warningIcon?: React.ReactNode;
}

// #endregion

// #region Component

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  className = "",
  title,
  warning = false,
  warningIcon = <span className="warning-icon">⚠️</span>,
}) => (
  <div className={`stat-badge ${className}`} title={title}>
    <span className="stat-value">
      {value}
      {warning && warningIcon}
    </span>
    <span className="stat-label">{label}</span>
  </div>
);

// #endregion
