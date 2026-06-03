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
  const classTracks = useCharacterStore((state) => state.classTracks);
  const classId = useCharacterStore((state) => state.classId);
  const subclassId = useCharacterStore((state) => state.subclassId);
  const level = useCharacterStore((state) => state.level);
  const expendedHitDice = useCharacterStore((state) => state.expendedHitDice);
  const tempHp = useCharacterStore((state) => state.tempHp);
  const deathSaves = useCharacterStore((state) => state.deathSaves);

  const takeDamage = useCharacterStore((state) => state.takeDamage);
  const heal = useCharacterStore((state) => state.heal);
  const setTempHp = useCharacterStore((state) => state.setTempHp);
  const recordDeathSave = useCharacterStore((state) => state.recordDeathSave);
  const expendHitDie = useCharacterStore((state) => state.expendHitDie);
  const takeShortRest = useCharacterStore((state) => state.takeShortRest);
  const takeLongRest = useCharacterStore((state) => state.takeLongRest);

  const hitDicePools = useMemo<HitDicePool[]>(() => {
    const tracks =
      classTracks.length > 0
        ? classTracks
        : classId
          ? [
              {
                classId,
                subclassId,
                level,
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

    let remainingExpended = expendedHitDice;

    pools.forEach((pool) => {
      if (remainingExpended <= 0) return;
      const spent = Math.min(pool.total, remainingExpended);
      pool.expended = spent;
      remainingExpended -= spent;
    });

    return pools;
  }, [
    classId,
    classTracks,
    expendedHitDice,
    level,
    subclassId,
  ]);

  return (
    <MortalLedger
      armorClass={stats.combat.armorClass}
      initiative={stats.combat.initiative}
      speed={stats.combat.speed}
      isArmorPenalized={stats.combat.isArmorPenalized}
      hp={stats.combat.hp}
      tempHp={tempHp}
      deathSaves={deathSaves}
      level={level}
      hitDicePools={hitDicePools}
      onTakeDamage={takeDamage}
      onHeal={heal}
      onSetTempHp={setTempHp}
      onRecordSave={(type, count) => {
        const current = deathSaves[type];
        recordDeathSave(type, count > current);
      }}
      onSpendHitDie={() => expendHitDie()}
      onShortRest={takeShortRest}
      onLongRest={takeLongRest}
    />
  );
};
