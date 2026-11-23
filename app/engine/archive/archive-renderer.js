export function renderArchiveList({ container, entries, onSelect }) {
  container.innerHTML = "";

  const sortedEntries = [...entries].sort((a, b) => a.sequence - b.sequence);

  sortedEntries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "archive-row";
    row.innerHTML = `
      <div><strong>${entry.title}</strong></div>
      <div class="muted">${entry.deliveryType}</div>
    `;

    row.addEventListener("click", () => onSelect(entry, row));
    container.appendChild(row);
  });
}

export function renderArchiveEntry({ container, entry }) {
  container.innerHTML = `
    <h2>${entry.title}</h2>
    <div class="muted">Speaker: ${entry.speaker || "Unknown"}</div>
    <div class="journal">${entry.transcript || ""}</div>
  `;
}