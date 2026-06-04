import { useRef, useState, type ChangeEvent } from "react";
import { useCharacterStore } from "../../../store/useCharacterStore";
import {
  migrateIfNeeded,
  serializeCharacter,
  validateAndDeserialize,
} from "../../../store/characterPersistence";

export const SaveLoadControls = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    name,
    isSetupComplete,
    hydrateCharacter,
  } = useCharacterStore((state) => ({
    name: state.name,
    isSetupComplete: state.isSetupComplete,
    hydrateCharacter: state.hydrateCharacter,
  }));

  const handleSave = () => {
    setErrorMessage(null);

    const state = useCharacterStore.getState();
    const serialized = serializeCharacter(state);
    const blob = new Blob([serialized], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (state.name || "character").trim().replace(/\s+/g, "-");

    link.href = url;
    const savedDate = new Date().toISOString().slice(0, 10);

    link.download = `${safeName}-${savedDate}.dnd5e.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      (isSetupComplete || name.trim().length > 0) &&
      !window.confirm("Load this save and replace the current character?")
    ) {
      return;
    }

    try {
      const text = await file.text();
      const result = validateAndDeserialize(text);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      const migrated = migrateIfNeeded(result.data);
      hydrateCharacter(migrated.character);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load save file.";
      setErrorMessage(message);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleSave}>
        Save
      </button>
      <button type="button" onClick={handleLoadClick}>
        Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileSelected}
        hidden
      />
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};