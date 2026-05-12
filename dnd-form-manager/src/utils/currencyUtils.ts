export interface CoinageFormatOptions {
  allowElectrum?: boolean;
  allowPlatinum?: boolean;
}

type CoinDenomination = {
  key: "cp" | "sp" | "ep" | "gp" | "pp";
  valueInCp: number;
  label: string;
};

const BASE_DENOMINATIONS: CoinDenomination[] = [
  { key: "gp", valueInCp: 100, label: "GP" },
  { key: "sp", valueInCp: 10, label: "SP" },
  { key: "cp", valueInCp: 1, label: "CP" },
];

const ELECTRUM_DENOMINATION: CoinDenomination = {
  key: "ep",
  valueInCp: 50,
  label: "EP",
};

const PLATINUM_DENOMINATION: CoinDenomination = {
  key: "pp",
  valueInCp: 1000,
  label: "PP",
};

const toSafeCp = (value: number): number => Math.max(0, Math.floor(value));

const getDenominations = (options?: CoinageFormatOptions): CoinDenomination[] => {
  const includeElectrum = options?.allowElectrum ?? false;
  const includePlatinum = options?.allowPlatinum ?? false;

  const denominations = [...BASE_DENOMINATIONS];

  if (includeElectrum) {
    denominations.splice(1, 0, ELECTRUM_DENOMINATION);
  }

  if (includePlatinum) {
    denominations.unshift(PLATINUM_DENOMINATION);
  }

  return denominations;
};

export const formatCpAsCoinage = (
  cpValue: number,
  options?: CoinageFormatOptions,
): string => {
  let remaining = toSafeCp(cpValue);
  const denominations = getDenominations(options);
  const parts: string[] = [];

  denominations.forEach((denomination) => {
    if (remaining === 0) {
      return;
    }

    const quantity = Math.floor(remaining / denomination.valueInCp);
    if (quantity > 0) {
      parts.push(`${quantity} ${denomination.label}`);
      remaining -= quantity * denomination.valueInCp;
    }
  });

  return parts.length > 0 ? parts.join(" ") : "0 CP";
};
