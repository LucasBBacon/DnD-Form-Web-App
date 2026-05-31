import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WizardSpellSelectionStageView } from "./WizardSpellSelectionStageView";
import { WIZARD_SPELL_SELECTION_FIXTURES } from "./WizardSpellSelectionStage.fixtures";

const meta: Meta<typeof WizardSpellSelectionStageView> = {
  title: "Wizard/WizardSpellSelectionStage",
  component: WizardSpellSelectionStageView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof WizardSpellSelectionStageView>;

const baseCallbacks = {
  onCantripToggle: () => {},
  onSpellToggle: () => {},
};

export const ClassNotSelected: Story = {
  args: {
    ...WIZARD_SPELL_SELECTION_FIXTURES.classNotSelected,
    ...baseCallbacks,
  },
};

export const NonSpellcasterClass: Story = {
  args: {
    ...WIZARD_SPELL_SELECTION_FIXTURES.nonSpellcasterClass,
    ...baseCallbacks,
  },
};

export const PreparedCaster: Story = {
  args: {
    ...WIZARD_SPELL_SELECTION_FIXTURES.preparedCaster,
    ...baseCallbacks,
  },
};

export const KnownCasterAtCap: Story = {
  args: {
    ...WIZARD_SPELL_SELECTION_FIXTURES.knownCasterAtCap,
    ...baseCallbacks,
  },
};

export const WithDomainSpells: Story = {
  args: {
    ...WIZARD_SPELL_SELECTION_FIXTURES.withDomainSpells,
    ...baseCallbacks,
  },
};

export const InteractivePreparedCaster: Story = {
  render: () => {
    const fixture = WIZARD_SPELL_SELECTION_FIXTURES.preparedCaster;
    const [selectedCantripIds, setSelectedCantripIds] = useState(
      fixture.selectedCantripIds,
    );
    const [selectedSpellIds, setSelectedSpellIds] = useState(
      fixture.selectedSpellIds,
    );

    return (
      <WizardSpellSelectionStageView
        {...fixture}
        selectedCantripIds={selectedCantripIds}
        selectedSpellIds={selectedSpellIds}
        onCantripToggle={(spellId) => {
          setSelectedCantripIds((current) =>
            current.includes(spellId)
              ? current.filter((id) => id !== spellId)
              : current.length < fixture.cantripMax
                ? [...current, spellId]
                : current,
          );
        }}
        onSpellToggle={(spellId) => {
          setSelectedSpellIds((current) =>
            current.includes(spellId)
              ? current.filter((id) => id !== spellId)
              : current.length < fixture.spellMax
                ? [...current, spellId]
                : current,
          );
        }}
      />
    );
  },
};
