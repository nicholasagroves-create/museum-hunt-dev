import { gameAsset } from "../../game-config.js";
export async function loadOnboardingConfig() {
  const response = await fetch(
    gameAsset("content/settings/onboarding-sequence.json")
  );

  if (!response.ok) {
    throw new Error("Failed to load onboarding sequence config.");
  }

  return response.json();
}

export function chooseDistinctRandomCharacters(pool, count) {
  const available = [...pool];
  const chosen = [];

  while (chosen.length < count && available.length > 0) {
    const index = Math.floor(Math.random() * available.length);
    const [picked] = available.splice(index, 1);
    chosen.push(picked);
  }

  return chosen;
}

export function buildOnboardingRevealPlan(config) {
  const seededNonMercerCharacters = chooseDistinctRandomCharacters(
    config.nonMercerCharacterPool,
    config.randomNonMercerCharactersToSeed
  );

  return {
    mercer: config.mercerCharacterId,
    seededNonMercerCharacters,
    seededTransmissionRules: config.seededTransmissions,
    hintPacing: config.hintPacing,
    postTutorialFlow: config.postTutorialFlow
  };
}