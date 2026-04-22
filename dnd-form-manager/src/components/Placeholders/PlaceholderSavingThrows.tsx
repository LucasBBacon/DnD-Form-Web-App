import "./PlaceholderSavingThrows.css";

const abilities = [
  "STRENGTH",
  "DEXTERITY",
  "CONSTITUTION",
  "INTELLIGENCE",
  "WISDOM",
  "CHARISMA",
];

export const PlaceholderSavingThrows = () => {
  return (
    <div
      className="saving-throws-block placeholder"
      aria-label="Saving Throws Placeholder"
    >
      <ul className="saving-throw-list">
        {abilities.map((ability) => (
          <li key={ability} className="saving-throw">
            <span className="saving-throw-proficient" />
            <span className="save-value-wrap">
              <span className="saving-throw-value">+3</span>
            </span>
            <span className="saving-throw-name">{ability}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
