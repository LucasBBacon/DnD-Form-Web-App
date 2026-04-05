import { useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllClasses, getSubclassesForClass } from "../../data/staticDataApi";

export const ClassSelectionStep = ({ onNext }: { onNext: () => void }) => {
  const { setClass, setSubclass, setLevel } = useCharacterStore();

  const [previewClassId, setPreviewClassId] = useState<string | null>(null);
  const [previewSubclassId, setPreviewSubclassId] = useState<string | null>(
    null,
  );

  const availableClasses = getAllClasses();
  const previewClassData = previewClassId
    ? availableClasses.find((c) => c.id === previewClassId)
    : null;
  const availableSubclasses = previewClassId
    ? getSubclassesForClass(previewClassId)
    : [];

  // Does this class pick a subclass at level 1?
  const picksSubclassNow = previewClassData?.subclassInfo.choiceLevel === 1;

  const handleLockIn = () => {
    if (!previewClassId) return;
    if (picksSubclassNow && !previewSubclassId) return;

    setClass(previewClassId);
    setLevel(1); // Ensure they start at level 1

    // Only save the subclass to zustand if legally allowed to pick it
    if (picksSubclassNow && previewSubclassId) {
      setSubclass(previewSubclassId);
    } else {
      setSubclass(null);
    }

    onNext();
  };

  return (
    <div className="wizard-step class-step">
      <h2>Choose a Class</h2>

      <div className="split-view">
        <div className="options-list">
          {availableClasses.map((cls) => (
            <button
              key={cls.id}
              className={`option-card ${previewClassId === cls.id ? "selected" : ""}`}
              onClick={() => {
                setPreviewClassId(cls.id);
                setPreviewSubclassId(null);
              }}
            >
              <h3>{cls.name}</h3>
              <p>Hit Die: d{cls.hitDie}</p>
            </button>
          ))}
        </div>

        <div className="preview-pane">
          {!previewClassData ? (
            <p className="placeholder-text">
              Select a class to view details...
            </p>
          ) : (
            <>
              <div className="sub-options">
                <h3>
                  {picksSubclassNow
                    ? `Choose your ${previewClassData.subclassInfo.name}:`
                    : `Preview ${previewClassData.subclassInfo.name}s (Chosen at Level ${previewClassData.subclassInfo.choiceLevel}):`}
                </h3>

                {availableSubclasses.map((sub) => (
                  <button
                    key={sub.id}
                    className={`sub-card ${previewSubclassId === sub.id ? "selected" : ""}`}
                    onClick={() => setPreviewSubclassId(sub.id)}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              <button
                className="lock-in-btn"
                disabled={
                  !previewClassId || (picksSubclassNow && !previewSubclassId)
                }
                onClick={handleLockIn}
              >
                Lock In Class
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
