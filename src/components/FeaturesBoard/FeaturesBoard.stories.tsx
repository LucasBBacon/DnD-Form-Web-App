import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeaturesBoard } from "./FeaturesBoard";
import { RaceFeature, ClassFeature, MultipleSourceBadges } from "./FeatureCard/FeatureCard.stories";
import type { FeatureCardProps } from "./FeatureCard/FeatureCard";

const meta: Meta<typeof FeaturesBoard> = {
	title: "RoleplayBoard/FeaturesBoard",
	component: FeaturesBoard,
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FeaturesBoard>;

export const Empty: Story = {
	args: {
		features: [],
	},
};

export const SingleFeature: Story = {
	args: {
		features: [RaceFeature.args as FeatureCardProps],
	},
};

export const MultipleFeatures: Story = {
	args: {
		features: [
			RaceFeature.args as FeatureCardProps,
			ClassFeature.args as FeatureCardProps,
			MultipleSourceBadges.args as FeatureCardProps,
		],
	},
};

export const Playground: Story = {
	args: {
		features: [
			RaceFeature.args as FeatureCardProps,
			ClassFeature.args as FeatureCardProps,
			MultipleSourceBadges.args as FeatureCardProps,
		],
	},
};
