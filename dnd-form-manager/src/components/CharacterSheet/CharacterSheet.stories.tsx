import { useState } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { CharacterSheetView } from "./CharacterSheetView";
import {
  VitalsDashboardView,
  type VitalsDashboardViewProps,
} from "../VitalsDashboard/VitalsDashboardView";
import {
  VITALS_DASHBOARD_FIXTURES,
  type VitalsDashboardScenario,
} from "../VitalsDashboard/VitalsDashboard.fixtures";
import {
  ActionsBoardView,
  type ActionsBoardViewProps,
} from "../ActionsBoard/ActionsBoardView";
import {
  ACTIONS_BOARD_FIXTURES,
  type ActionsBoardScenario,
} from "../ActionsBoard/ActionsBoard.fixtures";
import {
  InventoryBoardView,
  type InventoryBoardViewProps,
} from "../InventoryBoard/InventoryBoardView";
import {
  INVENTORY_BOARD_FIXTURES,
  type InventoryBoardScenario,
} from "../InventoryBoard/InventoryBoard.fixtures";
import {
  RoleplayBoardView,
  type RoleplayBoardViewProps,
} from "../RoleplayBoard/RoleplayBoardView";
import {
  ROLEPLAY_BOARD_FIXTURES,
  type RoleplayBoardScenario,
} from "../RoleplayBoard/RoleplayBoard.fixtures";
import { SpellBookView } from "../SpellBookView/SpellBookView";
import { WealthTracker } from "../InventoryBoard/ui/WealthTracker";
import type { SpellcastingFixture } from "../../types/fixtures";
import {
  IdentityHeaderView,
  type IdentityHeaderViewProps,
} from "../IdentityHeader/IdentityHeaderView";
import {
  IDENTITY_HEADER_FIXTURES,
  type IdentityHeaderScenario,
} from "../IdentityHeader/IdentityHeader.fixtures";
import {
  CoreStatsBoardView,
  type CoreStatsBoardViewProps,
} from "../CoreStatsBoard/CoreStatsBoardView";
import {
  CORE_STATS_BOARD_FIXTURES,
  type CoreStatsBoardScenario,
} from "../CoreStatsBoard/CoreStatsBoard.fixtures";
import { SPELLBOOK_BOARD_FIXTURES } from "../SpellBookBoard/SpellBookBoard.fixtures";
import {
  CHARACTER_SHEET_SCENARIO_REFS,
  resolveCharacterSheetScenario,
  type CharacterSheetScenarioKey,
} from "./CharacterSheet.fixtures";

const toRomanNumeral = (level: number) =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] ||
  level.toString();

function fixtureToSlotHudRows(
  spellcasting: SpellcastingFixture,
): Array<{ label: string; text: string }> {
  const rows: Array<{ label: string; text: string }> = [];

  Object.entries(spellcasting.spellSlotsByLevel).forEach(([level, slotData]) => {
    const remaining = slotData.available - slotData.used;
    const bubbles = "o".repeat(remaining).padEnd(slotData.available, " ");
    rows.push({
      label: `Lvl ${level}`,
      text: `[${bubbles}]`,
    });
  });

  if (spellcasting.pactSlots) {
    const remaining = spellcasting.pactSlots.available - spellcasting.pactSlots.used;
    const bubbles = "o".repeat(remaining).padEnd(spellcasting.pactSlots.available, " ");
    rows.push({
      label: "Pact",
      text: `[${bubbles}]`,
    });
  }

  return rows;
}

function buildVitalsProps(scenario: VitalsDashboardScenario): VitalsDashboardViewProps {
  return {
    armorClass: scenario.combat.armorClass,
    initiative: scenario.combat.initiative,
    speed: scenario.combat.speed,
    isArmorPenalized: scenario.combat.isArmorPenalized,
    hp: scenario.combat.hp,
    tempHp: scenario.tempHp,
    deathSaves: scenario.deathSaves,
    level: scenario.level,
    expendedHitDice: scenario.expendedHitDice,
    healthInput: scenario.localState.healthInput,
    activeHealthMode: scenario.localState.activeHealthMode,
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
  };
}

function buildActionsProps(scenario: ActionsBoardScenario): ActionsBoardViewProps {
  return {
    slotHudRows: fixtureToSlotHudRows(scenario.spellcasting),
    sections: scenario.sections,
    activeRoller: scenario.activeRoller,
    attackRollModes: scenario.attackRollModes,
    rollResultsByEntry: scenario.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  };
}

function buildInventoryProps(
  scenario: InventoryBoardScenario,
): InventoryBoardViewProps {
  return {
    ...scenario,
    wealthView: <WealthTracker />,
    onToggleWeaponEquip: () => {},
    onToggleArmorEquip: () => {},
    onToggleAttunement: () => {},
    onDropInstance: () => {},
    onStackIncrement: () => {},
    onStackDecrement: () => {},
  };
}

function buildRoleplayProps(
  scenario: RoleplayBoardScenario,
): RoleplayBoardViewProps {
  return {
    ...scenario,
    onTabChange: () => {},
    onRoleplayFieldBlur: () => {},
  };
}

function buildIdentityProps(
  scenario: IdentityHeaderScenario,
): IdentityHeaderViewProps {
  return {
    ...scenario,
    onCharacterNameChange: () => {},
    onPlayerNameChange: () => {},
    onAlignmentChange: () => {},
    onXpChange: () => {},
    onLevelUpModeChange: () => {},
    onClassModalClick: () => {},
    onBackgroundModalClick: () => {},
    onRaceModalClick: () => {},
  };
}

function buildCoreStatsProps(
  scenario: CoreStatsBoardScenario,
): CoreStatsBoardViewProps {
  return {
    ...scenario,
  };
}

interface CharacterSheetStoryArgs {
  scenarioKey: CharacterSheetScenarioKey;
}

const withScenarioSelector: Decorator = (Story, context) => {
  const [selectedScenario, setSelectedScenario] = useState<CharacterSheetScenarioKey>(
    (context.args.scenarioKey as CharacterSheetScenarioKey) ?? "balanced",
  );

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="card" style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <label htmlFor="sheet-scenario">Sheet scenario</label>
        <select
          id="sheet-scenario"
          value={selectedScenario}
          onChange={(event) =>
            setSelectedScenario(event.target.value as CharacterSheetScenarioKey)
          }
        >
          {Object.entries(CHARACTER_SHEET_SCENARIO_REFS).map(([key, scenario]) => (
            <option key={key} value={key}>
              {scenario.label}
            </option>
          ))}
        </select>
      </div>
      <Story args={{ ...context.args, scenarioKey: selectedScenario }} />
    </div>
  );
};

const meta: Meta<CharacterSheetStoryArgs> = {
  title: "Sheets/CharacterSheet",
  component: CharacterSheetView,
  decorators: [withScenarioSelector],
  args: {
    scenarioKey: "balanced",
  },
  argTypes: {
    scenarioKey: {
      table: {
        disable: true,
      },
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<CharacterSheetStoryArgs>;

export const ComposedBoards: Story = {
  render: ({ scenarioKey }) => {
    const scenario = resolveCharacterSheetScenario(scenarioKey);

    return (
      <CharacterSheetView
        header={<IdentityHeaderView {...buildIdentityProps(scenario.identity)} />}
        vitals={<VitalsDashboardView {...buildVitalsProps(scenario.vitals)} />}
        stats={<CoreStatsBoardView {...buildCoreStatsProps(scenario.stats)} />}
        actions={<ActionsBoardView {...buildActionsProps(scenario.actions)} />}
        inventory={
          <InventoryBoardView {...buildInventoryProps(scenario.inventory)} />
        }
        roleplay={<RoleplayBoardView {...buildRoleplayProps(scenario.roleplay)} />}
        spellbook={<SpellBookView spellcasting={scenario.spellbook} />}
      />
    );
  },
};
