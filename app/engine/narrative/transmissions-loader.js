export async function loadTransmissions(gamePath) {
  const response = await fetch(`${gamePath}/content/transmissions/transmissions.json`);

  if (!response.ok) {
    throw new Error(`Failed to load transmissions: ${response.status}`);
  }

  const transmissions = await response.json();

  if (!Array.isArray(transmissions)) {
    throw new Error('Transmissions file must be an array.');
  }

  return transmissions;
}