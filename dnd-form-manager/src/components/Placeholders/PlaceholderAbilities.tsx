import "./PlaceholderAbilities.css";

const abilities = [
  "STRENGTH",
  "DEXTERITY",
  "CONSTITUTION",
  "INTELLIGENCE",
  "WISDOM",
  "CHARISMA",
];

export const PlaceholderAbilities = () => {
  return (
    <section className="placeholder-abilities-block placeholder">
      {abilities.map((ability) => (
        <article key={ability} className="placeholder-ability">
          <div className="placeholder-ability-name">
            {ability}
          </div>
          <div className="placeholder-ability-score">
            10
          </div>
          <div className="placeholder-ability-modifier">
            +3
          </div>
        </article>
      ))}
    </section>
  );
};
