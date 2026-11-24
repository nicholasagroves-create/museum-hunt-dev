// Active game configuration. Paths are relative to the application entry page.
export const gameConfig = Object.freeze({
  id: "natgeo-dc",
  basePath: "./app/games/nc-natural-sciences"
});
export function gameAsset(path) {
  return `${gameConfig.basePath}/${path}`;
}
