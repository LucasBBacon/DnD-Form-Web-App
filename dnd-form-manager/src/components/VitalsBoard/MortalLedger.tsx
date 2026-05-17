// #region Types and Interfaces

export interface HitDicePool {
  /* The face value of the die */
  sides: number;
  /* Total number of this specific hit die available */
  total: number;
  /* Number of this specific hit die currently expended */
  expended: number;
}

/**
 * Props for the VitalsDashboardView presentational component.
 * All data is passed as props; no hooks are used.
 */
export interface MortalLedgerProps {
  /** Armor class of the character */
  armorClass: number;
  /** Initiative bonus of the character */
  initiative: number;
  /** Speed of the character */
  speed: number;
  /** Whether the character's armor imposes a penalty */
  isArmorPenalized: boolean;

  /** Current and maximum hit points of the character */
  hp: {
    /** Current hit points */
    current: number;
    /** Maximum hit points */
    max: number;
  };
  /** Temporary hit points of the character */
  tempHp: number;

  /** Death saves of the character */
  deathSaves: {
    /** Number of successful death saves */
    success: number;
    /** Number of failed death saves */
    failure: number;
  };

  /** Level of the character */
  level: number;
  /** Number of hit dice expended */
  expendedHitDice: HitDicePool;

  // Callbacks
  onTakeDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onSetTempHp: (amount: number) => void;
  onRecordDeathSave: (type: 'success' | 'failure', checked: boolean) => void;

  onSpendHitDie: (sides: number) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

// #endregion