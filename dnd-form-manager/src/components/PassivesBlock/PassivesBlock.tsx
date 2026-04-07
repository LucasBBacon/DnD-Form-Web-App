import type { useSkills } from "../../hooks/useSkills";

type Passives = ReturnType<typeof useSkills>["passives"];

type PassivesBlockProps = {
  passives: Passives;
};

export const PassivesBlock = ({ passives }: PassivesBlockProps) => {
  return (
    <div className="passives-row">
      <div className="passive-box">
        <span className="passive-val">{passives.perception}</span>
        <span className="passive-label">Passive Perception</span>
      </div>
      <div className="passive-box">
        <span className="passive-val">{passives.investigation}</span>
        <span className="passive-label">Passive Investigation</span>
      </div>
      <div className="passive-box">
        <span className="passive-val">{passives.insight}</span>
        <span className="passive-label">Passive Insight</span>
      </div>
    </div>
  );
};
