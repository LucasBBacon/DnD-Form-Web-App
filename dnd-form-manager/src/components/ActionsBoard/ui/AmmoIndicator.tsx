import type React from "react";
import "./AmmoIndicator.css";

interface AmmoIndicatorProps {
  ammo: { id: string; name: string | null; count: number | null };
}

export const AmmoIndicator: React.FC<AmmoIndicatorProps> = ({ ammo }) => {
  const count = ammo.count ?? 0;
  const label = ammo.name ?? "Ammunition";

  const stateClass =
    count === 0 ? "ammo-empty" : count <= 5 ? "ammo-low" : "ammo-ok";

  return (
    <div className={`ammo-indicator ${stateClass}`}>
      <span className="ammo-icon" aria-hidden="true">⬡</span>
      <span className="ammo-count">{count}</span>
      <span className="ammo-label">{label}</span>
      {count === 0 && (
        <span className="ammo-warning" role="alert">
          No ammo!
        </span>
      )}
    </div>
  );
};
