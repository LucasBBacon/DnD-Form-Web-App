import { useRef, useState, type ChangeEvent } from "react";
import { SaveLoad } from "../../SaveLoad/SaveLoad";
import { ConfirmationModal } from "../ConfirmationModal/ConfirmationModal";
import { useCharacterStore } from "../../../store/useCharacterStore";
import {
  migrateIfNeeded,
  serializeCharacter,
  validateAndDeserialize,
} from "../../../store/characterPersistence";

export const SaveLoadControls = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const hydrateCharacter = useCharacterStore((state) => state.hydrateCharacter);

  const loadFile = async (file: File) => {
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
      const message =
        error instanceof Error ? error.message : "Unable to load save file.";
      setErrorMessage(message);
    }
  };

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

  const handleConfirmLoad = async () => {
    if (!pendingFile) {
      setIsConfirmationOpen(false);
      return;
    }

    setIsConfirmationOpen(false);
    await loadFile(pendingFile);
    setPendingFile(null);
  };

  const handleCancelLoad = () => {
    setIsConfirmationOpen(false);
    setPendingFile(null);
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const currentState = useCharacterStore.getState();

    if (
      (currentState.isSetupComplete || currentState.name.trim().length > 0) &&
      file
    ) {
      setPendingFile(file);
      setIsConfirmationOpen(true);
      return;
    }

    await loadFile(file);
  };

  return (
    <>
      <SaveLoad
        onSave={handleSave}
        onLoadRequest={handleLoadClick}
        errorMessage={errorMessage}
        clearError={() => setErrorMessage(null)}
      />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        title="Overwrite Existing Save?"
        message="Loading this file will replace your current character state. This cannot be undone."
        onConfirm={handleConfirmLoad}
        onCancel={handleCancelLoad}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileSelected}
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: "none" }}
        hidden
      />
    </>
  );
};
