export async function loadCharacterArchive(characterId) {
  const fileMap = {
    mercer: "./app/games/nc-natural-sciences/content/archive/mercer-archive.json",
    russell: "./app/games/nc-natural-sciences/content/archive/russell-archive.json",
    hannah: "./app/games/nc-natural-sciences/content/archive/hannah-archive.json",
    megan: "./app/games/nc-natural-sciences/content/archive/megan-archive.json",
    elias: "./app/games/nc-natural-sciences/content/archive/elias-archive.json",
    lila: "./app/games/nc-natural-sciences/content/archive/lila-archive.json"
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