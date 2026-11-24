import { gameAsset } from "../../game-config.js";
export async function loadCharacterArchive(characterId) {
  const fileMap = {
    mercer: gameAsset("content/archive/mercer-archive.json"),
    russell: gameAsset("content/archive/russell-archive.json"),
    hannah: gameAsset("content/archive/hannah-archive.json"),
    megan: gameAsset("content/archive/megan-archive.json"),
    elias: gameAsset("content/archive/elias-archive.json"),
    lila: gameAsset("content/archive/lila-archive.json")
  };

  const path = fileMap[characterId];

  if (!path) {
    throw new Error(`No archive file configured for character: ${characterId}`);
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load archive data for ${characterId}: ${path}`);
  }

  const data = await response.json();

  if (!data.slots || !Array.isArray(data.slots)) {
    throw new Error(`Archive data for ${characterId} is missing a valid slots array.`);
  }

  return data;
}