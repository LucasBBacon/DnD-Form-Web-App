import type React from "react";
import "./TwoHandedWarningDialog.css";

interface TwoHandedWarningDialogProps {
  weaponName: string;
  conflictingShieldName: string | null;
  conflictingWeaponNames: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

export const TwoHandedWarningDialog: React.FC<TwoHandedWarningDialogProps> = ({
  weaponName,
  conflictingShieldName,
  conflictingWeaponNames,
  onCancel,
  onConfirm,
}) => (
  <div className="two-handed-dialog-backdrop" role="presentation">
    <div
      className="two-handed-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Two-handed weapon conflict"
    >
      <h3 className="two-handed-dialog-title">Two-Handed Conflict</h3>
      <p className="two-handed-dialog-copy">
        Equipping <strong>{weaponName}</strong> requires two hands. The
        following equipped items must be unequipped first:
      </p>

      <ul className="two-handed-dialog-conflicts">
        {conflictingShieldName && <li>Shield: {conflictingShieldName}</li>}
        {conflictingWeaponNames.map((name, index) => (
          <li key={`two-handed-conflict-${index}-${name}`}>Weapon: {name}</li>
        ))}
      </ul>

      <div className="two-handed-dialog-actions">
        <button type="button" className="action-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="action-btn active" onClick={onConfirm}>
          Unequip & Equip
        </button>
      </div>
    </div>
  </div>
);
