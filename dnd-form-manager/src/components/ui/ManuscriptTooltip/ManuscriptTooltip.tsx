import type React from "react";
import "./ManuscriptTooltip.css";

export interface ManuscriptTooltipProps {
  /** The element that triggers the tooltip on hover */
  children: React.ReactNode;
  /** The main body text of the tooltip */
  content: React.ReactNode;
  /** Optional header for the tooltip */
  title?: string;
  /** Custom classes for the outer wrapper */
  className?: string;
  /** Whether to show the dotted underline indicator */
  showIndicator?: boolean;
}

export const ManuscriptTooltip: React.FC<ManuscriptTooltipProps> = ({
  children,
  content,
  title,
  className = "",
  showIndicator = true,
}) => {
  return (
    <div className={`tooltip-wrapper ${className}`}>
      {/* The trigger element */}
      <div
        className={`tooltip-trigger ${showIndicator ? "has-indicator" : ""}`}
      >
        {children}
      </div>

      {/* The floating tooltip content */}
      <div className="manuscript-tooltip-content">
        {title && <span className="tooltip-title">{title}</span>}
        <span className="tooltip-body">{content}</span>
      </div>
    </div>
  );
};