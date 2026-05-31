import type React from "react";
import type { WeaponPropertyCatalogEntry } from "../../../types/item";
import "./WeaponPropertyBadges.css";

interface WeaponPropertyBadgesProps {
  properties: WeaponPropertyCatalogEntry[];
}

export const WeaponPropertyBadges: React.FC<WeaponPropertyBadgesProps> = ({
  properties,
}) => {
  if (properties.length === 0) return null;

  return (
    <div className="weapon-property-badges">
      {properties.map((prop) => (
        <span
          key={prop.id}
          className="weapon-property-badge"
          title={prop.lore.fullText}
          aria-label={`${prop.name}: ${prop.lore.shortDescription}`}
        >
          {prop.name}
        </span>
      ))}
    </div>
  );
};
