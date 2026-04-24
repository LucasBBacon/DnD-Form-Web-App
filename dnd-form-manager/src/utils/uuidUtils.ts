import type { UUID } from "../types/common";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const randomNibble = (): number => Math.floor(Math.random() * 16);

// Fallback UUID v4 generator for environments where crypto.randomUUID is unavailable.
const fallbackUuidV4 = (): UUID => {
  const bytes = Array.from({ length: 16 }, () => randomNibble() * 16 + randomNibble());

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const generateUuidV4 = (): UUID => {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID() as UUID;
  }

  return fallbackUuidV4();
};

export const isUuidV4 = (value: string | null | undefined): value is UUID =>
  typeof value === "string" && UUID_V4_PATTERN.test(value);
