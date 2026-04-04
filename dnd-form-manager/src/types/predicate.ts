export type PredicateType =
  | "armor_required"
  | "armor_prohibited" // e.g., Barbarian unarmored defense
  | "shield_prohibited" // e.g., Monk marital arts
  | "stat_minimum" // e.g., Multiclassing requires 13 STR
  | "requires_trait" // e.g., A sub feature that requires another feature
  | "weapon_property" // e.g., Sneak attack requires 'finesse' or 'ranged'
  | "environment_condition";
export interface Predicate {
  type: PredicateType;
  value?: string | number | boolean; // e.g., 'heavy', 13, true
  target?: string; // e.g., 'str', 'trait_darkvision'
}
