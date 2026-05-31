import type { UUID } from "../types/common";
import type { ItemInstanceData } from "../types/item";

/**
 * Looks up an item instance by UUID from the inventory instances array.
 * Returns null if instanceId is null or no matching entry exists.
 */
export function resolveInstance(
  instanceId: UUID | null,
  instances: ItemInstanceData[],
): ItemInstanceData | null {
  if (!instanceId) return null;
  return instances.find((i) => i.instanceId === instanceId) ?? null;
}
