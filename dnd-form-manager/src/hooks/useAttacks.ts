import { getClassById, getItemById, getRaceById, getSubclassById, getSubraceById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";

export const useAttacks = () => {
  const { raceId, classId, subraceId, subclassId, equippedWeaponIds, inventory } = useCharacterStore();
  const { modifiers, proficiencyBonus } = useCharacterStats();

  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  // TODO: Implement trait/feature based proficiencies...

  const weaponProficiencies = [
    ...(classData?.proficiencies?.weapons || []),
  ]

  const attacks = equippedWeaponIds
    .map((weaponId) => {
      const weaponData = getItemById(weaponId);
      if (!weaponData || !weaponData.weaponProperties) return null;

      const props = weaponData.weaponProperties;

      // region Determine governing stat (str vs dex)
      let attackStat = "str";
      if (props.category.includes("ranged")) {
        attackStat = "dex";
      } else if (props.properties.includes("finesse")) {
        // finesse lets player choose the higher stat
        attackStat = modifiers.dex > modifiers.str ? "dex" : "str";
      }

      const statMod = modifiers[attackStat as "str" | "dex"] || 0;

      // region Proficiency Check
      const isProficient = weaponProficiencies.some(prof => {
        // Check for broad category matches
        if (prof === 'simple' && props.category.includes('simple')) return true;
        if (prof === 'martial' && props.category.includes('martial')) return true;
        
        // Check for exact weapon ID matches
        if (prof === weaponData.id) return true;

        return false;
      });

      // region Calculate to-hit and damage
      const toHit = statMod + (isProficient ? proficiencyBonus : 0);
      const damageBonus = statMod;

      // region Ammunition check
      let ammoCount = null;
      let ammoName = null;
      let canAttack = true;

      if (props.properties.includes("ammunition") && props.ammoItemId) {
        const ammoItem = getItemById(props.ammoItemId);
        const inventoryRecord = inventory.find(
          (i) => i.itemId === props.ammoItemId,
        );

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
        ammo: props.ammoItemId
          ? { id: props.ammoItemId, name: ammoName, count: ammoCount }
          : null,
        canAttack,
      };
    })
    .filter(Boolean); // Filter out any nulls

  return { attacks };
};
