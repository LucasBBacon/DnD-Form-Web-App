import type React from "react";
import { useMemo } from "react";
import { getClassById } from "../../data/staticDataApi";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { HitDie } from "../../types/common";
import { MortalLedger, type HitDicePool } from "./MortalLedger";

const toHitDieSides = (hitDie: HitDie | undefined): number => hitDie ?? 8;

export const MortalLedgerContainer: React.FC = () => {
  const stats = useCharacterStats();
  const store = useCharacterStore();

  const hitDicePools = useMemo<HitDicePool[]>(() => {
    const tracks =
      store.classTracks.length > 0
        ? store.classTracks
        : store.classId
          ? [
              {
                classId: store.classId,
                subclassId: store.subclassId,
                level: store.level,
              },
            ]
          : [];

    const totalsBySides = new Map<number, number>();

    tracks.forEach((track) => {
      const classData = getClassById(track.classId);
      const sides = toHitDieSides(classData?.hitDie);
      totalsBySides.set(sides, (totalsBySides.get(sides) ?? 0) + track.level);
    });

    const pools = Array.from(totalsBySides.entries())
      .map(([sides, total]) => ({ sides, total, expended: 0 }))
      .sort((a, b) => b.sides - a.sides);

    let remainingExpended = store.expendedHitDice;

    pools.forEach((pool) => {
      if (remainingExpended <= 0) return;
      const spent = Math.min(pool.total, remainingExpended);
      pool.expended = spent;
      remainingExpended -= spent;
    });

    return pools;
  }, [
    store.classId,
    store.classTracks,
    store.expendedHitDice,
    store.level,
    store.subclassId,
  ]);

  return (
    <MortalLedger
      armorClass={stats.combat.armorClass}
      initiative={stats.combat.initiative}
      speed={stats.combat.speed}
      isArmorPenalized={stats.combat.isArmorPenalized}
      hp={stats.combat.hp}
      tempHp={store.tempHp}
      deathSaves={store.deathSaves}
      level={store.level}
      hitDicePools={hitDicePools}
      onTakeDamage={store.takeDamage}
      onHeal={store.heal}
      onSetTempHp={store.setTempHp}
      onRecordSave={(type, count) => {
        const current = store.deathSaves[type];
        store.recordDeathSave(type, count > current);
      }}
      onSpendHitDie={() => store.expendHitDie()}
      onShortRest={store.takeShortRest}
      onLongRest={store.takeLongRest}
    />
  );
};
