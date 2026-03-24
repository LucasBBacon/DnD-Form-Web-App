export type SpellSchool =
  | "abjuration"
  | "alteration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy";

export interface SpellComponents {
  vocal: boolean;
  somatic: boolean;
  material: boolean;
  material_materials?: string; // e.g., "A pinch of sulfur"
}

export interface SpellData {
  id: string; // e.g., 'spell_fireball'
  name: string; // e.g., 'Fireball'
  level: number; // 0 for cantrips, 1-9 for leveled spells
  school: SpellSchool;

  classes: string[];

  // Filtering properties
  casting_time: string; // e.g., "1 action", "1 bonus action", "1 minute"
  range: string; // e.g., "150 feet", "Touch", "Self (15-foot cone)"
  duration: string; // e.g., "Instantaneous", "1 hour"
  concentration: boolean;
  ritual: boolean;

  components: SpellComponents;

  lore: {
    short_description: string; // "Hurls a fiery bead that explodes..."
    full_text: string;
    higher_level?: string; // "when you cast this spell using a spell slot of 4th level..."
  };
}
