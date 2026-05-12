import type { Meta, StoryObj } from "@storybook/react-vite";
import { VitalsDashboardView } from "./VitalsDashboardView";
import { VITALS_DASHBOARD_FIXTURES } from "./VitalsDashboard.fixtures";

const meta: Meta<typeof VitalsDashboardView> = {
  title: "Boards/VitalsDashboard",
  component: VitalsDashboardView,
  tags: ["autodocs"],
  argTypes: {
    activeHealthMode: {
      control: "select",
      options: [null, "damage", "heal", "temp"],
    },
    healthInput: {
      control: "text",
    },
  },
};
export default meta;

type Story = StoryObj<typeof VitalsDashboardView>;

/**
 * Healthy scenario - character at full health with no issues.
 */
export const Healthy: Story = {
  args: {
    armorClass: VITALS_DASHBOARD_FIXTURES.healthy.combat.armorClass,
    initiative: VITALS_DASHBOARD_FIXTURES.healthy.combat.initiative,
    speed: VITALS_DASHBOARD_FIXTURES.healthy.combat.speed,
    isArmorPenalized:
      VITALS_DASHBOARD_FIXTURES.healthy.combat.isArmorPenalized,
    hp: VITALS_DASHBOARD_FIXTURES.healthy.combat.hp,
    tempHp: VITALS_DASHBOARD_FIXTURES.healthy.tempHp,
    deathSaves: VITALS_DASHBOARD_FIXTURES.healthy.deathSaves,
    level: VITALS_DASHBOARD_FIXTURES.healthy.level,
    expendedHitDice: VITALS_DASHBOARD_FIXTURES.healthy.expendedHitDice,
    healthInput: VITALS_DASHBOARD_FIXTURES.healthy.localState.healthInput,
    activeHealthMode:
      VITALS_DASHBOARD_FIXTURES.healthy.localState.activeHealthMode,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};

/**
 * Healthy with temporary HP - shows the temp HP display.
 */
export const WithTempHp: Story = {
  args: {
    ...Healthy.args,
    tempHp: VITALS_DASHBOARD_FIXTURES.withTempHp.tempHp,
  },
};

/**
 * Bloodied scenario - character has taken significant damage.
 */
export const Bloodied: Story = {
  args: {
    armorClass: VITALS_DASHBOARD_FIXTURES.bloodied.combat.armorClass,
    initiative: VITALS_DASHBOARD_FIXTURES.bloodied.combat.initiative,
    speed: VITALS_DASHBOARD_FIXTURES.bloodied.combat.speed,
    isArmorPenalized:
      VITALS_DASHBOARD_FIXTURES.bloodied.combat.isArmorPenalized,
    hp: VITALS_DASHBOARD_FIXTURES.bloodied.combat.hp,
    tempHp: VITALS_DASHBOARD_FIXTURES.bloodied.tempHp,
    deathSaves: VITALS_DASHBOARD_FIXTURES.bloodied.deathSaves,
    level: VITALS_DASHBOARD_FIXTURES.bloodied.level,
    expendedHitDice: VITALS_DASHBOARD_FIXTURES.bloodied.expendedHitDice,
    healthInput: VITALS_DASHBOARD_FIXTURES.bloodied.localState.healthInput,
    activeHealthMode:
      VITALS_DASHBOARD_FIXTURES.bloodied.localState.activeHealthMode,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};

/**
 * Critical scenario - character is nearly dead.
 */
export const Critical: Story = {
  args: {
    armorClass: VITALS_DASHBOARD_FIXTURES.critical.combat.armorClass,
    initiative: VITALS_DASHBOARD_FIXTURES.critical.combat.initiative,
    speed: VITALS_DASHBOARD_FIXTURES.critical.combat.speed,
    isArmorPenalized:
      VITALS_DASHBOARD_FIXTURES.critical.combat.isArmorPenalized,
    hp: VITALS_DASHBOARD_FIXTURES.critical.combat.hp,
    tempHp: VITALS_DASHBOARD_FIXTURES.critical.tempHp,
    deathSaves: VITALS_DASHBOARD_FIXTURES.critical.deathSaves,
    level: VITALS_DASHBOARD_FIXTURES.critical.level,
    expendedHitDice: VITALS_DASHBOARD_FIXTURES.critical.expendedHitDice,
    healthInput: VITALS_DASHBOARD_FIXTURES.critical.localState.healthInput,
    activeHealthMode:
      VITALS_DASHBOARD_FIXTURES.critical.localState.activeHealthMode,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};

/**
 * At zero HP scenario - character is down and needs death saves.
 */
export const AtZero: Story = {
  args: {
    armorClass: VITALS_DASHBOARD_FIXTURES.atZero.combat.armorClass,
    initiative: VITALS_DASHBOARD_FIXTURES.atZero.combat.initiative,
    speed: VITALS_DASHBOARD_FIXTURES.atZero.combat.speed,
    isArmorPenalized: VITALS_DASHBOARD_FIXTURES.atZero.combat.isArmorPenalized,
    hp: VITALS_DASHBOARD_FIXTURES.atZero.combat.hp,
    tempHp: VITALS_DASHBOARD_FIXTURES.atZero.tempHp,
    deathSaves: VITALS_DASHBOARD_FIXTURES.atZero.deathSaves,
    level: VITALS_DASHBOARD_FIXTURES.atZero.level,
    expendedHitDice: VITALS_DASHBOARD_FIXTURES.atZero.expendedHitDice,
    healthInput: VITALS_DASHBOARD_FIXTURES.atZero.localState.healthInput,
    activeHealthMode: VITALS_DASHBOARD_FIXTURES.atZero.localState.activeHealthMode,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};

/**
 * At zero with death saves in progress.
 */
export const AtZeroWithSaves: Story = {
  args: {
    ...AtZero.args,
    deathSaves: VITALS_DASHBOARD_FIXTURES.atZeroWithSaves.deathSaves,
  },
};

/**
 * At max HP scenario - fully healed.
 */
export const AtMax: Story = {
  args: {
    armorClass: VITALS_DASHBOARD_FIXTURES.atMax.combat.armorClass,
    initiative: VITALS_DASHBOARD_FIXTURES.atMax.combat.initiative,
    speed: VITALS_DASHBOARD_FIXTURES.atMax.combat.speed,
    isArmorPenalized: VITALS_DASHBOARD_FIXTURES.atMax.combat.isArmorPenalized,
    hp: VITALS_DASHBOARD_FIXTURES.atMax.combat.hp,
    tempHp: VITALS_DASHBOARD_FIXTURES.atMax.tempHp,
    deathSaves: VITALS_DASHBOARD_FIXTURES.atMax.deathSaves,
    level: VITALS_DASHBOARD_FIXTURES.atMax.level,
    expendedHitDice: VITALS_DASHBOARD_FIXTURES.atMax.expendedHitDice,
    healthInput: VITALS_DASHBOARD_FIXTURES.atMax.localState.healthInput,
    activeHealthMode: VITALS_DASHBOARD_FIXTURES.atMax.localState.activeHealthMode,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};

/**
 * Armor penalized scenario - heavy armor with stealth disadvantage.
 */
export const ArmorPenalized: Story = {
  args: {
    armorClass: VITALS_DASHBOARD_FIXTURES.armorPenalized.combat.armorClass,
    initiative: VITALS_DASHBOARD_FIXTURES.armorPenalized.combat.initiative,
    speed: VITALS_DASHBOARD_FIXTURES.armorPenalized.combat.speed,
    isArmorPenalized:
      VITALS_DASHBOARD_FIXTURES.armorPenalized.combat.isArmorPenalized,
    hp: VITALS_DASHBOARD_FIXTURES.armorPenalized.combat.hp,
    tempHp: VITALS_DASHBOARD_FIXTURES.armorPenalized.tempHp,
    deathSaves: VITALS_DASHBOARD_FIXTURES.armorPenalized.deathSaves,
    level: VITALS_DASHBOARD_FIXTURES.armorPenalized.level,
    expendedHitDice: VITALS_DASHBOARD_FIXTURES.armorPenalized.expendedHitDice,
    healthInput:
      VITALS_DASHBOARD_FIXTURES.armorPenalized.localState.healthInput,
    activeHealthMode:
      VITALS_DASHBOARD_FIXTURES.armorPenalized.localState.activeHealthMode,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};

/**
 * Playground scenario - fully interactive with Storybook controls for manual testing.
 */
export const Playground: Story = {
  args: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: { current: 45, max: 52 },
    tempHp: 0,
    deathSaves: { success: 0, failure: 0 },
    level: 5,
    expendedHitDice: 0,
    healthInput: "",
    activeHealthMode: null,
    onHealthInputChange: () => {},
    onHealthModeSelect: () => {},
    onHealthSubmit: () => {},
    onHealthCancel: () => {},
    onTakeDamage: () => {},
    onHeal: () => {},
    onSetTempHp: () => {},
    onRecordDeathSave: () => {},
    onShortRest: () => {},
    onLongRest: () => {},
  },
};
