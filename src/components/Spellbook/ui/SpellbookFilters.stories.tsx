import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SpellbookFilters } from "./SpellbookFilters";
import type { SpellFilterState } from "../Spellbook";

const ALL_SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];

const makeFilters = (
  overrides: Partial<SpellFilterState> = {},
): SpellFilterState => ({
  searchQuery: "",
  levels: new Set<number>(),
  schools: new Set<string>(),
  preparedOnly: false,
  ...overrides,
});

const meta: Meta<typeof SpellbookFilters> = {
  title: "SpellBookView/SpellbookFilters",
  component: SpellbookFilters,
  tags: ["autodocs"],
  args: {
    filters: makeFilters(),
    setFilters: fn(),
    availableSchools: ALL_SCHOOLS,
  },
};

export default meta;

type Story = StoryObj<typeof SpellbookFilters>;

export const DefaultFilters: Story = {
  args: {
    filters: makeFilters(),
  },
};

export const SearchAndPreparedOnly: Story = {
  args: {
    filters: makeFilters({
      searchQuery: "hex",
      preparedOnly: true,
    }),
  },
};

export const LevelAndSchoolSelections: Story = {
  args: {
    filters: makeFilters({
      levels: new Set([0, 1, 3, 5]),
      schools: new Set(["Evocation", "Enchantment", "Necromancy"]),
    }),
    availableSchools: ALL_SCHOOLS,
  },
};

export const DenseSelectionState: Story = {
  args: {
    filters: makeFilters({
      searchQuery: "fire",
      preparedOnly: true,
      levels: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
      schools: new Set(ALL_SCHOOLS),
    }),
  },
};

export const NoAvailableSchools: Story = {
  args: {
    filters: makeFilters({
      levels: new Set([1, 2]),
      preparedOnly: true,
    }),
    availableSchools: [],
  },
};

export const WiringInteractions: Story = {
  args: {
    filters: makeFilters(),
    availableSchools: ["Evocation", "Necromancy"],
    setFilters: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText("Search incantations"), "bolt");
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: "Cantrip" }));
    await userEvent.click(canvas.getByRole("button", { name: "Evocation" }));

    await expect(args.setFilters).toHaveBeenCalled();
  },
};

export const StatefulPreview: Story = {
  render: (args) => {
    const [filters, setFilters] = useState<SpellFilterState>(args.filters);
    return (
      <SpellbookFilters
        {...args}
        filters={filters}
        setFilters={setFilters}
      />
    );
  },
  args: {
    filters: makeFilters(),
    availableSchools: ALL_SCHOOLS,
  },
};

export const Playground: Story = {};