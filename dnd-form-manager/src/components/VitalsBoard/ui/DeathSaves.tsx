import type React from "react";
import "./DeathSaves.css";
import { Skull } from "lucide-react";

export interface DeathSavesProps {
  success: number;
  failure: number;
  onRecordSave: (type: "success" | "failure", count: number) => void;
}

export const DeathSaves: React.FC<DeathSavesProps> = ({
  success,
  failure,
  onRecordSave,
}) => {
  const handleSealClick = (
    type: "success" | "failure",
    index: number,
    currentValue: number,
  ) => {
    // if clicking the currently highest filled seal, un-fill it
    // otherwise, fill up the clicked seal (exact count)
    const newCount = index + 1 === currentValue ? index : index + 1;
    onRecordSave(type, newCount);
  };

  return (
    <div className="death-saves-container fadeIn">
      <div className="death-saves-header">
        <Skull size={18} className="death-icon" />
        <span className="death-saves-title">Death Saves</span>
      </div>

      <div className="saves-grid">
        {/* SUCCESSES */}
        <div className="save-row">
          <span className="save-label success-label">Successes</span>
          <div className="seal-tracker">
            {[0, 1, 2].map((index) => (
              <button
                key={`success-${index}`}
                className={`save-seal success-seal ${index < success ? "is-filled" : "is-empty"}`}
                onClick={() => handleSealClick("success", index, success)}
                aria-label={`Death Save Success ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* FAILURES */}
        <div className="save-row">
          <span className="save-label failure-label">Failures</span>
          <div className="seal-tracker">
            {[0, 1, 2].map((index) => (
              <button
                key={`failure-${index}`}
                className={`save-seal failure-seal ${index < failure ? "is-filled" : "is-empty"}`}
                onClick={() => handleSealClick("failure", index, failure)}
                aria-label={`Death Save Failure ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {(success >= 3 || failure >= 3) && (
        <div className="death-save-resolution">
          {success >= 3 ? "Stable" : "Deceased"}
        </div>
      )}
    </div>
  );
};
