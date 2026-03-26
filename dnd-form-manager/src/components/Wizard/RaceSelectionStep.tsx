import { useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllRaces, getSubracesForRace } from "../../data/staticDataApi";

export const RaceSelectionStep = ({ onNext }: { onNext: () => void }) => {
  const { setRace, setSubrace } = useCharacterStore();

  // Local state for previewing before locking in
  const [previewRaceId, setPreviewRaceId] = useState<string | null>(null);
  const [previewSubraceId, setPreviewSubraceId] = useState<string | null>(null);

  const availableRaces = getAllRaces();
  const availableSubraces = previewRaceId
    ? getSubracesForRace(previewRaceId)
    : [];

  const handleLockIn = () => {
    if (!previewRaceId) return;

    // Only block if this race actually has subraces to chose from
    if (availableSubraces.length > 0 && !previewSubraceId) return;

    setRace(previewRaceId);
    if (previewRaceId) setSubrace(previewSubraceId);
    onNext();
  };

  return (
    <div className="wizard-step race-step">
      <h2>Choose a Race</h2>

      <div className="split-view">
        {/* Left: Parent list */}
        <div className="options-list">
          {availableRaces.map((race) => (
            <button
              key={race.id}
              className={`option-card ${previewRaceId === race.id ? "selected" : ""}`}
              onClick={() => {
                setPreviewRaceId(race.id);
                setPreviewSubraceId(null); // Reset subrace if parent changes
              }}
            >
              <h3>{race.name}</h3>
              <p>{race.lore.short_description}</p>
            </button>
          ))}
        </div>

        {/* Right: Subrace / Preview details */}
        <div className="preview-pane">
          {!previewRaceId ? (
            <p className="placeholder-text">Select a race to view details...</p>
          ) : (
            <>
              {availableSubraces.length > 0 && (
                <div className="sub-options">
                  <h3>Select a Lineage:</h3>
                  {availableSubraces.map((sub) => (
                    <button
                      key={sub.id}
                      className={`sub-card ${previewSubraceId === sub.id ? "selected" : ""}`}
                      onClick={() => setPreviewSubraceId(sub.id)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Show the lore of either the subrace (if selected) or the base race */}
              <div className="lore-box">
                {/* TODO: Render the full text/traits here based on static data */}
              </div>

              <button
                className="lock-in-btn"
                disabled={
                  !previewRaceId ||
                  (availableSubraces.length > 0 && !previewSubraceId)
                }
                onClick={handleLockIn}
              >
                Lock In Race
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
