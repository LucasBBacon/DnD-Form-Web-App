import type React from "react";
import "./InventoryBoard.css";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useMemo } from "react";
import { getItemById } from "../data/staticDataApi";

export const InventoryBoard: React.FC = () => {
  const store = useCharacterStore();
  const { encumbrance } = useCharacterStats();

  // #region Hydration

  // Hydrate instances
  const hydratedInstances = useMemo(() => {
    return store.inventoryInstances
      .map((instance) => {
        const itemData = getItemById(instance.baseItemId);
        return { ...instance, itemData };
      })
      .filter((i) => i.itemData !== undefined);
  }, [store.inventoryInstances]);

  // Hydrate stacks
  const hydratedStacks = useMemo(() => {
    return store.inventoryStacks
      .map((stack) => {
        const itemData = getItemById(stack.baseItemId);
        return { ...stack, itemData };
      })
      .filter((s) => s.itemData !== undefined);
  }, [store.inventoryStacks]);

  // #endregion

  // #region Action Handlers

  const toggleEquipWeapon = (instanceId: string, isEquipped: boolean) => {
    if (isEquipped) store.unequipWeaponInstance(instanceId);
    else store.equipWeaponInstance(instanceId);
  };

  const toggleEquipArmor = (
    instanceId: string,
    isEquipped: boolean,
    armorType: string,
  ) => {
    if (armorType === "shield") {
      store.equipShieldInstance(isEquipped ? null : instanceId);
    } else {
      store.equipArmorInstance(isEquipped ? null : instanceId);
    }
  };

  const toggleAttunement = (instanceId: string, isAttuned: boolean) => {
    if (isAttuned) store.unattuneInstance(instanceId);
    else store.attuneInstance(instanceId);
  };

  const dropInstance = (instanceId: string) => {
    store.removeInventoryInstance(instanceId);
  };

  // //#endregion

  return (
    <section className="inventory-board card">
      {/* Wealth and Encumbrance */}
      <div className="inventory-header">
        <div className="wealth-shell">
          <span className="section-label">WEALTH</span>
          <div className="coin-grid">
            {/* readonly shells for now TODO: implement wealth logic */}
            {["CP", "SP", "EP", "GP", "PP"].map((coin) => (
              <div key={coin} className="coin-box">
                <input
                  type="number"
                  placeholder="0"
                  disabled
                  className={`coin-input ${coin.toLowerCase()}`}
                />
                <span className="coin-label">{coin}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`encumbrance-box ${encumbrance.isEncumbered ? "encumbered" : ""}`}
        >
          <span className="section-label">ENCUMBRANCE</span>
          <div className="weight-tracker">
            <span className="current-weight">
              {Math.round(encumbrance.totalWeight * 10) / 10}
            </span>
            <span className="max-weight">
              {" "}
              / {encumbrance.carryingCapacity} lbs
            </span>
          </div>
          {encumbrance.isEncumbered && (
            <div className="encumbered-warning">Encumbered (Speed - 10)</div>
          )}
        </div>
      </div>

      <hr className="divider" />

      {/* Equipment (Instances) */}
      <div className="inventory-section">
        <h3 className="section-title">EQUIPMENT & ATTUNEMENT</h3>
        {hydratedInstances.length === 0 ? (
          <p className="empty-state">No equipment.</p>
        ) : (
          <div className="item-list">
            {hydratedInstances.map(({ instanceId, itemData }) => {
              // Determine equip states
              const isWeapon = itemData?.type === "weapon";
              const isArmor = itemData?.type === "armor";
              const isShield =
                isArmor && itemData?.armorProperties?.armorType === "shield";

              const isEquipped = isWeapon
                ? store.equippedWeaponInstanceIds.includes(instanceId)
                : isShield
                  ? store.equippedShieldInstanceId === instanceId
                  : isArmor
                    ? store.equippedArmorInstanceId === instanceId
                    : false;

              const requiresAttunement =
                itemData?.magicItemProperties?.requiresAttunement;
              const isAttuned = store.attunedInstanceIds.includes(instanceId);

              return (
                <div
                  key={instanceId}
                  className={`item-row ${isEquipped ? "equipped" : ""}`}
                >
                  <div className="item-info">
                    <span className="item-name">{itemData?.name}</span>
                    <span className="item-meta">
                      {itemData?.type.replace("_", " ").toUpperCase()} •{" "}
                      {itemData?.weight} lbs
                    </span>
                  </div>

                  <div className="item-actions">
                    {/* Attunement toggle */}
                    {requiresAttunement && (
                      <button
                        className={`action-btn attune-btn ${isAttuned ? "active" : ""}`}
                        onClick={() => toggleAttunement(instanceId, isAttuned)}
                        disabled={
                          !isAttuned && store.attunedInstanceIds.length >= 3
                        }
                        title="Attunement (Max 3)"
                      >
                        {isAttuned ? "ATTUNED" : "Attune"}
                      </button>
                    )}

                    {/* Equip toggle */}
                    {(isWeapon || isArmor) && (
                      <button
                        className={`action-btn equip-btn ${isEquipped ? "active" : ""}`}
                        onClick={() =>
                          isWeapon
                            ? toggleEquipWeapon(instanceId, isEquipped)
                            : toggleEquipArmor(
                                instanceId,
                                isEquipped,
                                itemData!.armorProperties!.armorType,
                              )
                        }
                      >
                        {isEquipped ? "EQUIPPED" : "Equip"}
                      </button>
                    )}

                    {/* Drop instance */}
                    <button
                      className="action-btn drop-btn"
                      onClick={() => dropInstance(instanceId)}
                      title="Remove from inventory"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backpack (stacks) */}
      <div className="inventory-section">
        <h3 className="section title">BACKPACK (GEAR & CONSUMABLES)</h3>
        {hydratedStacks.length === 0 ? (
          <p className="empty-state">Backpack is empty.</p>
        ) : (
          <div className="item-list">
            {hydratedStacks.map(
              ({ stackId, baseItemId, quantity, itemData }) => (
                <div key={stackId} className="item-row stack-row">
                  <div className="item-info">
                    <span className="item-name">{itemData?.name}</span>
                    <span className="item-meta">
                      {itemData?.lore.shortDescription}
                    </span>
                  </div>

                  <div className="stack-actions">
                    <span className="item-weight">
                      {(itemData?.weight || 0) * quantity} lbs total
                    </span>
                    <div className="quantity-control">
                      {/* - / + direct interaction with store funcs */}
                      <button
                        onClick={() => store.removeInventoryItem(baseItemId, 1)}
                      >
                        -
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button
                        onClick={() => store.addInventoryItem(baseItemId, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
};
