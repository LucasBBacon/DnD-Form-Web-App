import "./PlaceholderProfBonus.css";

export const PlaceholderProfBonus: React.FC = () => {
  return (
    <div className="prof-bonus-block placeholder" aria-label="Proficiency Bonus Placeholder">
      <div className="prof-bonus-value">
        +2
      </div>
      <div className="prof-bonus-label">
        Proficiency Bonus
      </div>
    </div>
  );
};
