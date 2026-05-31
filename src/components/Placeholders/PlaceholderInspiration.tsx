import "./PlaceholderInspiration.css";

export const PlaceholderInspiration: React.FC = () => {
  return (
    <div className="placeholder-inspiration-block placeholder" aria-label="Inspiration Placeholder">
      <div className="placeholder-inspiration-value">
        10
      </div>
      <div className="placeholder-inspiration-label">
        Inspiration
      </div>
    </div>
  );
}