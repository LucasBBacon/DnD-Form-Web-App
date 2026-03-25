import { useAttacks } from "../hooks/useAttacks";
import { useCharacterStore } from "../store/useCharacterStore";

export const AttacksBlock = () => {
  const { attacks } = useAttacks();
  const { removeInventoryItem } = useCharacterStore();

  if (!attacks || attacks.length === 0) {
    return (
      <div className="attacks-block empty">
        <h3>Attacks & Weapons</h3>
        <p>No weapons currently equipped.</p>
      </div>
    );
  }

  return (
    <div className="attacks-block">
      <h3>Attacks & Spellcasting</h3>

      <div className="attacks-list">
        {attacks.map((attack) => {
          if (!attack) return null;

          return (
            <div
              key={attack.weaponId}
              className={`attack-row ${!attack.canAttack ? "disabled" : ""}`}
            >
              <div className="attack-info">
                <strong>{attack.name}</strong>
                <span className="attack-range">{attack.range}</span>
              </div>

              <div className="attack-stats">
                <span className="to-hit">
                  {attack.toHit >= 0 ? `+${attack.toHit}` : attack.toHit}
                </span>
                <span className="damage">{attack.damageString}</span>
              </div>

              {/* Ammunition controls */}
              {attack.ammo && (
                <div className="ammo-controls">
                  <span
                    className={`ammo-count ${attack.ammo.count === 0 ? "out-of-ammo" : ""}`}
                  >
                    {attack.ammo.count} {attack.ammo.name}s
                  </span>
                  <button
                    disabled={!attack.canAttack}
                    onClick={() => removeInventoryItem(attack.ammo!.id, 1)}
                  >
                    Fire
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
