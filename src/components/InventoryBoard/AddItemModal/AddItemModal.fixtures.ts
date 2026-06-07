import type { WeaponPropertyId } from "../../../types/item";
import type {
  AddItemFlowType,
  AddItemModalStep,
  AddItemPresetOption,
} from "./AddItemModal";

export const ADD_ITEM_PRESET_OPTIONS: AddItemPresetOption[] = [
  {
    id: "item_longsword",
    name: "Longsword",
    type: "weapon",
    weight: 3,
    cpCost: 1500,
    lore: {
      shortDescription: "A versatile martial blade.",
      fullText: "Favored by soldiers and duelists.",
    },
    weaponProperties: {
      category: "martial_melee",
      damageDice: "1d8",
      versatileDamageDice: "1d10",
      damageType: "slashing",
      properties: [],
      propertyIds: ["property_versatile"],
      range: "5 ft",
      rules: {
        attackAbility: "str",
        isRangedWeapon: false,
        meleeReachFeet: 5,
        requiresAmmunition: false,
        loading: false,
        light: false,
        heavy: false,
        twoHanded: false,
        special: false,
        finesse: false,
        versatile: true,
      },
    },
  },
  {
    id: "item_chain_mail",
    name: "Chain Mail",
    type: "armor",
    weight: 55,
    cpCost: 7500,
    lore: {
      shortDescription: "Interlocking rings of heavy steel.",
      fullText: "Reliable protection for disciplined formations.",
    },
    armorProperties: {
      acApplication: "set",
      armorType: "heavy",
      baseAc: 16,
      dexModifier: { mode: "none" },
      stealthDisadvantage: true,
      strengthRequirement: 13,
    },
  },
  {
    id: "item_rope_hempen",
    name: "Rope, Hempen (50 ft)",
    type: "gear",
    weight: 10,
    cpCost: 100,
    lore: {
      shortDescription: "Sturdy rope used for climbing and hauling.",
      fullText: "A trusty staple of every adventuring pack.",
    },
  },
];

export const WEAPON_PROPERTY_OPTIONS: Array<{
  id: WeaponPropertyId;
  name: string;
}> = [
  { id: "property_finesse", name: "Finesse" },
  { id: "property_light", name: "Light" },
  { id: "property_thrown", name: "Thrown" },
  { id: "property_two_handed", name: "Two-Handed" },
  { id: "property_versatile", name: "Versatile" },
];

export const WEAPON_BASE_ITEM =
  ADD_ITEM_PRESET_OPTIONS.find((item) => item.id === "item_longsword") ?? null;

export const ARMOR_BASE_ITEM =
  ADD_ITEM_PRESET_OPTIONS.find((item) => item.id === "item_chain_mail") ?? null;

export interface PresetItemFlowScenario {
  searchValue: string;
  selectedItemId: string;
  quantityInput: string;
  filteredItems: AddItemPresetOption[];
  submitDisabled: boolean;
}

export const ADD_ITEM_PRESET_FLOW_SCENARIOS: Record<
  string,
  PresetItemFlowScenario
> = {
  emptySelection: {
    searchValue: "",
    selectedItemId: "",
    quantityInput: "1",
    filteredItems: ADD_ITEM_PRESET_OPTIONS,
    submitDisabled: true,
  },
  withSelection: {
    searchValue: "long",
    selectedItemId: "item_longsword",
    quantityInput: "3",
    filteredItems: ADD_ITEM_PRESET_OPTIONS.filter((item) =>
      item.name.toLowerCase().includes("long"),
    ),
    submitDisabled: false,
  },
};

export interface CustomGenericItemFlowScenario {
  nameInput: string;
  shortDescriptionInput: string;
  fullDescriptionInput: string;
  weightInput: string;
  cpCostInput: string;
  quantityInput: string;
  submitDisabled: boolean;
}

export const ADD_ITEM_GENERIC_FLOW_SCENARIOS: Record<
  string,
  CustomGenericItemFlowScenario
> = {
  emptyForm: {
    nameInput: "",
    shortDescriptionInput: "",
    fullDescriptionInput: "",
    weightInput: "",
    cpCostInput: "",
    quantityInput: "1",
    submitDisabled: true,
  },
  readyToSubmit: {
    nameInput: "Trophy Skull",
    shortDescriptionInput: "A grim keepsake from an ancient crypt.",
    fullDescriptionInput: "Etched with runes and wrapped in old bronze wire.",
    weightInput: "2.5",
    cpCostInput: "125",
    quantityInput: "2",
    submitDisabled: false,
  },
};

export interface WeaponPropertiesEditorScenario {
  damageDiceInput: string;
  damageTypeInput: string;
  rangeInput: string;
  selectedPropertyIds: WeaponPropertyId[];
}

export const ADD_ITEM_WEAPON_EDITOR_SCENARIOS: Record<
  string,
  WeaponPropertiesEditorScenario
> = {
  meleeBaseline: {
    damageDiceInput: "1d8",
    damageTypeInput: "slashing",
    rangeInput: "5 ft",
    selectedPropertyIds: ["property_versatile"],
  },
  thrownVariant: {
    damageDiceInput: "1d6",
    damageTypeInput: "piercing",
    rangeInput: "30/120 ft",
    selectedPropertyIds: ["property_thrown", "property_light"],
  },
};

export interface ArmorPropertiesEditorScenario {
  baseAcInput: string;
  strengthRequirementInput: string;
  stealthDisadvantage: boolean;
}

export const ADD_ITEM_ARMOR_EDITOR_SCENARIOS: Record<
  string,
  ArmorPropertiesEditorScenario
> = {
  heavyArmor: {
    baseAcInput: "16",
    strengthRequirementInput: "13",
    stealthDisadvantage: true,
  },
  noStrengthReq: {
    baseAcInput: "12",
    strengthRequirementInput: "",
    stealthDisadvantage: false,
  },
};

export interface CustomFromBaseFlowScenario {
  searchValue: string;
  selectedBaseItemId: string;
  filteredBaseItems: AddItemPresetOption[];
  selectedBaseItem: AddItemPresetOption | null;
  quantityInput: string;
  customNameInput: string;
  customWeightInput: string;
  customCpCostInput: string;
  customShortDescriptionInput: string;
  customFullDescriptionInput: string;
  customDamageDiceInput: string;
  customDamageTypeInput: string;
  customWeaponRangeInput: string;
  customWeaponPropertyIds: WeaponPropertyId[];
  customArmorBaseAcInput: string;
  customArmorStrengthRequirementInput: string;
  customArmorStealthDisadvantage: boolean;
  submitDisabled: boolean;
}

export const ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS: Record<
  string,
  CustomFromBaseFlowScenario
> = {
  noBaseSelected: {
    searchValue: "",
    selectedBaseItemId: "",
    filteredBaseItems: ADD_ITEM_PRESET_OPTIONS,
    selectedBaseItem: null,
    quantityInput: "1",
    customNameInput: "",
    customWeightInput: "",
    customCpCostInput: "",
    customShortDescriptionInput: "",
    customFullDescriptionInput: "",
    customDamageDiceInput: "",
    customDamageTypeInput: "",
    customWeaponRangeInput: "",
    customWeaponPropertyIds: [],
    customArmorBaseAcInput: "",
    customArmorStrengthRequirementInput: "",
    customArmorStealthDisadvantage: false,
    submitDisabled: true,
  },
  weaponBaseSelected: {
    searchValue: "",
    selectedBaseItemId: "item_longsword",
    filteredBaseItems: ADD_ITEM_PRESET_OPTIONS,
    selectedBaseItem: WEAPON_BASE_ITEM,
    quantityInput: "2",
    customNameInput: "Longsword +1",
    customWeightInput: "4",
    customCpCostInput: "2500",
    customShortDescriptionInput: "A reforged knightly blade.",
    customFullDescriptionInput: "Rebalanced and etched with a personal crest.",
    customDamageDiceInput: "1d10",
    customDamageTypeInput: "slashing",
    customWeaponRangeInput: "10 ft",
    customWeaponPropertyIds: ["property_finesse", "property_versatile"],
    customArmorBaseAcInput: "",
    customArmorStrengthRequirementInput: "",
    customArmorStealthDisadvantage: false,
    submitDisabled: false,
  },
  armorBaseSelected: {
    searchValue: "",
    selectedBaseItemId: "item_chain_mail",
    filteredBaseItems: ADD_ITEM_PRESET_OPTIONS,
    selectedBaseItem: ARMOR_BASE_ITEM,
    quantityInput: "1",
    customNameInput: "",
    customWeightInput: "55",
    customCpCostInput: "7600",
    customShortDescriptionInput: "Repaired chain links and reinforced padding.",
    customFullDescriptionInput: "Customized for a veteran guard captain.",
    customDamageDiceInput: "",
    customDamageTypeInput: "",
    customWeaponRangeInput: "",
    customWeaponPropertyIds: [],
    customArmorBaseAcInput: "17",
    customArmorStrengthRequirementInput: "15",
    customArmorStealthDisadvantage: false,
    submitDisabled: false,
  },
};

export interface AddItemModalScenario {
  isOpen: boolean;
  step: AddItemModalStep;
  selectedFlow: AddItemFlowType | null;
  presetItems: AddItemPresetOption[];
}

export const ADD_ITEM_MODAL_SCENARIOS: Record<string, AddItemModalScenario> = {
  chooseFlow: {
    isOpen: true,
    step: "choose_flow",
    selectedFlow: null,
    presetItems: ADD_ITEM_PRESET_OPTIONS,
  },
  presetFlowDetails: {
    isOpen: true,
    step: "flow_details",
    selectedFlow: "preset",
    presetItems: ADD_ITEM_PRESET_OPTIONS,
  },
  customFromBaseFlowDetails: {
    isOpen: true,
    step: "flow_details",
    selectedFlow: "custom_from_base",
    presetItems: ADD_ITEM_PRESET_OPTIONS,
  },
  customGenericFlowDetails: {
    isOpen: true,
    step: "flow_details",
    selectedFlow: "custom_generic",
    presetItems: ADD_ITEM_PRESET_OPTIONS,
  },
};
