import type React from "react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;

    if (!trigger || !tooltip) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 12;
    let nextPlacement: "top" | "bottom" = "top";

    let left = triggerRect.left + triggerRect.width / 2;
    let top = triggerRect.top - tooltipRect.height - gap;

    if (top < viewportPadding) {
      top = triggerRect.bottom + gap;
      nextPlacement = "bottom";
    }

    const halfWidth = tooltipRect.width / 2;
    if (left - halfWidth < viewportPadding) {
      left = viewportPadding + halfWidth;
    }

    if (left + halfWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - viewportPadding - halfWidth;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.visibility = "visible";
    tooltip.classList.toggle("placement-top", nextPlacement === "top");
    tooltip.classList.toggle("placement-bottom", nextPlacement === "bottom");
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const handleViewportChange = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  return (
    <div className={`tooltip-wrapper ${className}`}>
      {/* The trigger element */}
      <div
        ref={triggerRef}
        className={`tooltip-trigger ${showIndicator ? "has-indicator" : ""}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-describedby={isOpen ? tooltipId : undefined}
      >
        {children}
      </div>

      {/* The floating tooltip content */}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            className="manuscript-tooltip-content is-visible"
            style={{ visibility: "hidden" }}
            role="tooltip"
          >
            {title && <span className="tooltip-title">{title}</span>}
            <span className="tooltip-body">{content}</span>
          </div>,
          document.body,
        )}
    </div>
  );
};
