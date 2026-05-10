import type React from "react";

interface StatBadgeProps {
  label: string;
  value: string | number;
  className?: string;
  title?: string;
  warning?: boolean;
  warningIcon?: React.ReactNode;
}

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
