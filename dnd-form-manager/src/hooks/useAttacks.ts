import { getItemById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";

export const useAttacks = () => {
  const { equippedWeaponIds, inventory } = useCharacterStore();
  const { modifiers, proficiencyBonus } = useCharacterStats();

  const attacks = equippedWeaponIds.map((weaponId) => {
    const weaponData = getItemById(weaponId);
    if (!weaponData || !weaponData.weaponProperties) return null;

    const props = weaponData.weaponProperties;

    // Determine governing stat (str vs dex)
    let attackStat = "str";
    if (props.category.includes("ranged")) {
      attackStat = "dex";
    } else if (props.properties.includes("finesse")) {
      // finesse lets player choose the higher stat
      attackStat = modifiers.dex > modifiers.str ? "dex" : "str";
    }

    const statMod = modifiers[attackStat as 'str' | 'dex'] || 0;

    // Proficiency check
    // TODO: cross-reference props.category with classData.proficiencies.weapons
    // for now, assume true for the MVP
    const isProficient = true;

    // Calculate to-hit and damage
    const toHit = statMod + (isProficient ? proficiencyBonus : 0);
    const damageBonus = statMod;

    // Ammunition check
    let ammoCount = null;
    let ammoName = null;
    let canAttack = true;

    if (props.properties.includes('ammunition') && props.ammoItemId) {
      const ammoItem = getItemById(props.ammoItemId);
      const inventoryRecord = inventory.find(i => i.itemId === props.ammoItemId);

      ammoCount = inventoryRecord?.quantity || 0;
      ammoName = ammoItem?.name || "Ammunition";

      if (ammoCount === 0) canAttack = false;
    }

    return {
      weaponId: weaponData.id,
      name: weaponData.name,
      toHit,
      damageString: `${props.damageDice} ${damageBonus >= 0 ? `+ ${damageBonus}` : `- ${Math.abs(damageBonus)}`} ${props.damageType}`,
      properties: props.properties,
      range: props.range,
      ammo: props.ammoItemId ? { id: props.ammoItemId, name: ammoName, count: ammoCount } : null,
      canAttack
    };
  }).filter(Boolean); // Filter out any nulls

  return {attacks}
};
