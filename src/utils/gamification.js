const XP_PER_LEVEL = 1000;

function calculateLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getRarityBonus(rarity) {
  switch (rarity) {
    case "Common":
      return 0;

    case "Uncommon":
      return 25;

    case "Rare":
      return 50;

    case "Epic":
      return 100;

    case "Legendary":
      return 250;

    default:
      return 0;
  }
}

function calculateObservationXp(rarity, isNewSpecies) {
  const baseXP = 50;

  const rarityBonus = getRarityBonus(rarity);

  const newSpeciesBonus = isNewSpecies
    ? 100
    : 0;

  return (
    baseXP +
    rarityBonus +
    newSpeciesBonus
  );
}

function calculateNewStreak(lastObservationDate) {
  const today = new Date();

  const todayString =
    today.toISOString().split("T")[0];

  if (!lastObservationDate) {
    return 1;
  }

  const lastDate =
    new Date(lastObservationDate);

  const lastDateString =
    lastDate.toISOString().split("T")[0];

  if (lastDateString === todayString) {
    return null;
  }

  const yesterday = new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const yesterdayString =
    yesterday.toISOString().split("T")[0];

  if (lastDateString === yesterdayString) {
    return "increment";
  }

  return 1;
}

module.exports = {
  XP_PER_LEVEL,
  calculateLevel,
  getRarityBonus,
  calculateObservationXp,
  calculateNewStreak,
};