import { gameAsset } from "../../../game-config.js";

export const initialCharacterId = "mercer";
export const placeholderRevealCharacterId = "megan";

export function createCharacters() {
  return [
  {
    id: "mercer",
    name: "Mercer",
    active: true,
    locked: false,
    portrait: gameAsset("content/characters/portraits/mercer.png")
  },
  {
    id: "russell",
    name: "Russell",
    active: false,
    locked: true,
    portrait: gameAsset("content/characters/portraits/russell.png")
  },
  {
    id: "hannah",
    name: "Hannah",
    active: false,
    locked: true,
    portrait: gameAsset("content/characters/portraits/hannah.png")
  },
  {
    id: "megan",
    name: "Megan",
    active: false,
    locked: true,
    portrait: gameAsset("content/characters/portraits/megan.png")
  },
  {
    id: "elias",
    name: "Elias",
    active: false,
    locked: true,
    portrait: gameAsset("content/characters/portraits/elias.png")
  },
  {
    id: "lila",
    name: "Lila",
    active: false,
    locked: true,
    portrait: gameAsset("content/characters/portraits/lila.png")
  }
  ];
}

export const characterSheetData = {
  mercer: {
    name: "Dr. Jonathan Mercer",
    role: "Expedition Lead / Systems Archaeologist",
    portrait: gameAsset("content/characters/portraits/mercer.png"),
    description: `
Mercer led the original expedition into the museum complex.

His work focused on identifying and activating the underlying system connecting the site’s mechanisms. Early logs suggest he was the first to recognize that the structure was not a collection of exhibits, but a unified system.

Most recovered records originate from Mercer.

His final transmissions are incomplete.
    `
  },
  megan: {
  name: "Megan Vale",
  role: "Archivist / Records Specialist",
  portrait: gameAsset("content/characters/portraits/megan.png"),
  description: `
Megan was responsible for documenting and preserving the expedition’s findings.

Her logs indicate a deep awareness of inconsistencies in the records—gaps, omissions, patterns that didn’t align.

She began to suspect that not everything was being recorded.

Some things may have been deliberately left out.
  `
  }
};
