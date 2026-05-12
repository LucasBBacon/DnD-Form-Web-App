import type React from "react";
import "./OptionCard.css";
import type { SelectionOption } from "../../../types/wizardSelection";

interface OptionCardProps {
  /** The option to be displayed in the card */
  option: SelectionOption;
  /** Whether the option is currently selected */
  isSelected: boolean;
  /** Callback function when the card is clicked */
  onClick: () => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  isSelected,
  onClick,
}) => (
  <div
    className={`option-card ${isSelected ? "selected" : ""}`}
    onClick={onClick}
  >
    {isSelected && <div className="selected-badge">CHOSEN</div>}
    <div className="card-visual-placeholder">
      {/* TODO: ADD IMAGE HERE */}
      <span className="card-initial">{option.name.charAt(0)}</span>
    </div>
    <div className="card-footer">
      <h3 className="card-name">{option.name}</h3>
      <p className="card-tagline">{option.tagline}</p>
    </div>
  </div>
);
