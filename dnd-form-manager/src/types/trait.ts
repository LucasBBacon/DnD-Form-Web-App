export interface TraitData {
  id: string; // e.g., 'trait_darkvision', 'trait_fey_ancestry'
  name: string; // e.g., 'Darkvision', 'Fey Ancestry'
  lore: {
    short_description: string; // e.g., "You can see in dim light ..."
  };

  // TODO: Add mechanical hooks like 'grant_skill: "perception"'
}
