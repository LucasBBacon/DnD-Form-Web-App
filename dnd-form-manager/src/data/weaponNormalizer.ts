import rawWeaponPropertyCatalog from "./weaponProperties.json";
import type {
  ItemData,
  RawItemData,
  RawWeaponProperties,
  WeaponProperties,
  WeaponPropertyCatalogEntry,
  WeaponPropertyId,
  WeaponRangeBand,
  WeaponRules,
} from "../types/item";

const weaponPropertyCatalog = rawWeaponPropertyCatalog as WeaponPropertyCatalogEntry[];

const weaponPropertyDictionary: Record<WeaponPropertyId, WeaponPropertyCatalogEntry> =
  weaponPropertyCatalog.reduce(
    (dictionary, entry) => {
      dictionary[entry.id] = entry;
      return dictionary;
    },
    {} as Record<WeaponPropertyId, WeaponPropertyCatalogEntry>,
  );

const titleCase = (value: string): string =>
  value
    .replace(/^property_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getWeaponPropertyById = (
  id: string | null,
): WeaponPropertyCatalogEntry | null => {
  if (!id) return null;
  return weaponPropertyDictionary[id as WeaponPropertyId] ?? null;
};

export const getAllWeaponProperties = (): WeaponPropertyCatalogEntry[] =>
  weaponPropertyCatalog;

const parseWeaponRangeBand = (range: string): WeaponRangeBand | null => {
  const normalized = range.trim().toLowerCase().replace(/\s+feet?$/, " ft");
  const match = normalized.match(/^(\d+)(?:\/(\d+))?\s*ft$/i);

  if (!match) {
    return null;
  }

  const normal = Number(match[1]);
  const long = match[2] ? Number(match[2]) : undefined;

  if (!Number.isFinite(normal) || normal <= 0) {
    return null;
  }

  if (typeof long === "number" && (!Number.isFinite(long) || long <= normal)) {
    return null;
  }

  return typeof long === "number" ? { normal, long } : { normal };
};

const resolveWeaponPropertyEntry = (
  id: WeaponPropertyId,
): WeaponPropertyCatalogEntry =>
  weaponPropertyDictionary[id] ?? {
    id,
    name: titleCase(id),
    lore: {
      shortDescription: `${titleCase(id)} weapon property.`,
      fullText: `${titleCase(id)} weapon property.`,
    },
  };

const getWeaponRules = (
  rawWeaponProperties: RawWeaponProperties,
  propertyIds: WeaponPropertyId[],
): WeaponRules => {
  const propertyIdSet = new Set(propertyIds);
  const isRangedWeapon = rawWeaponProperties.category.includes("ranged");
  const hasFinesse = propertyIdSet.has("property_finesse");
  const hasThrown = propertyIdSet.has("property_thrown");
  const hasReach = propertyIdSet.has("property_reach");
  const hasAmmunition = propertyIdSet.has("property_ammunition");
  const hasLoading = propertyIdSet.has("property_loading");
  const hasLight = propertyIdSet.has("property_light");
  const hasHeavy = propertyIdSet.has("property_heavy");
  const hasTwoHanded = propertyIdSet.has("property_two_handed");
  const hasSpecial = propertyIdSet.has("property_special");
  const hasVersatile = propertyIdSet.has("property_versatile");
  const parsedRange = parseWeaponRangeBand(rawWeaponProperties.range);

  return {
    attackAbility: isRangedWeapon ? "dex" : hasFinesse ? "choice" : "str",
    isRangedWeapon,
    meleeReachFeet: hasReach ? 10 : 5,
    range: isRangedWeapon ? parsedRange ?? undefined : undefined,
    thrownRange: !isRangedWeapon && hasThrown ? parsedRange ?? undefined : undefined,
    requiresAmmunition: hasAmmunition,
    loading: hasLoading,
    light: hasLight,
    heavy: hasHeavy,
    twoHanded: hasTwoHanded,
    special: hasSpecial,
    finesse: hasFinesse,
    versatile: hasVersatile,
  };
};

export const normalizeWeaponProperties = (
  rawWeaponProperties: RawWeaponProperties,
): WeaponProperties => {
  const propertyIds = rawWeaponProperties.properties;

  return {
    category: rawWeaponProperties.category,
    damageDice: rawWeaponProperties.damageDice,
    versatileDamageDice: rawWeaponProperties.versatileDamageDice,
    damageType: rawWeaponProperties.damageType,
    properties: propertyIds.map(resolveWeaponPropertyEntry),
    propertyIds,
    range: rawWeaponProperties.range,
    ammoItemId: rawWeaponProperties.ammoItemId,
    rules: getWeaponRules(rawWeaponProperties, propertyIds),
  };
};

export const normalizeItemData = (rawItem: RawItemData): ItemData => {
  if (!rawItem.weaponProperties) {
    return rawItem as ItemData;
  }

  return {
    ...rawItem,
    weaponProperties: normalizeWeaponProperties(rawItem.weaponProperties),
  } as ItemData;
};
