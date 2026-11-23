export function chooseRandomEligibleSlots(slots, count) {
  const eligible = slots.filter((slot) => slot.initialRevealEligible === true);
  const pool = [...eligible];
  const chosen = [];

  while (chosen.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    const [picked] = pool.splice(index, 1);
    chosen.push(picked.id);
  }

  return chosen;
}

export function applyHintRevealToSlots(slots, revealedIds) {
  return slots.map((slot) => {
    if (revealedIds.includes(slot.id)) {
      return {
        ...slot,
        state: "hint"
      };
    }

    return slot;
  });
}