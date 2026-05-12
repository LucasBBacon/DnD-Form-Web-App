import type { ShortRestModalViewProps } from "./ShortRestModalView";

export type ShortRestModalScenario = Omit<
  ShortRestModalViewProps,
  | "onClose"
  | "onApplyHitDie"
  | "onFinishShortRest"
  | "onConfirmLongRest"
>;

export const SHORT_REST_MODAL_FIXTURES: Record<string, ShortRestModalScenario> = {
  shortStandard: {
    restType: "short",
    hpCurrent: 14,
    hpMax: 32,
    availableDice: 3,
    hitDie: 10,
    conMod: 2,
    recoveredHitDice: 2,
  },
  shortNoHitDice: {
    restType: "short",
    hpCurrent: 9,
    hpMax: 40,
    availableDice: 0,
    hitDie: 8,
    conMod: 1,
    recoveredHitDice: 3,
  },
  shortFullyHealed: {
    restType: "short",
    hpCurrent: 27,
    hpMax: 27,
    availableDice: 4,
    hitDie: 10,
    conMod: 3,
    recoveredHitDice: 3,
  },
  longRestConfirm: {
    restType: "long",
    hpCurrent: 6,
    hpMax: 45,
    availableDice: 1,
    hitDie: 12,
    conMod: 2,
    recoveredHitDice: 3,
  },
};
