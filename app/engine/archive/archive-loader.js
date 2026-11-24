import { gameAsset } from "../../game-config.js";
import { loadTransmissions } from '../narrative/transmissions-loader.js';

const GAME_ROOT = gameAsset("content/archive/");

export async function loadArchiveIndex(indexPath, gamePath) {
  const response = await fetch(indexPath);
  if (!response.ok) {
    throw new Error(`Failed to load archive index: ${indexPath}`);
  }

  const data = await response.json();

  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error("Archive index missing valid entries array.");
  }

  // ✅ load transmissions INSIDE the async function
  const transmissions = await loadTransmissions(gamePath);

  return {
    ...data,
    transmissions
  };
}

export async function loadArchiveEntry(relativeFilePath) {
  const fullPath = `${GAME_ROOT}${relativeFilePath}`;
  const response = await fetch(fullPath);

  if (!response.ok) {
    throw new Error(`Failed to load archive entry: ${fullPath}`);
  }

  return response.json();
}