export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

export interface ArmorItem {
    id: string;
    name: string;
    armorType: ArmorType;
    baseAc: number;
    stealthDisadvantage: boolean;
    strengthRequirement?: number;
}