export type GameVisuals = {
  thumbnail: string;
  banner: string;
};

const defaultVisuals: GameVisuals = {
  thumbnail: "/images/generic-card.jpg",
  banner: "/images/generic-banner.jpg",
};

const gameVisualConfigs: { key: string; visuals: GameVisuals }[] = [
  {
    key: "free fire",
    visuals: {
      thumbnail: "/images/freefire-card.jpg",
      banner: "/images/freefire-banner.jpg",
    },
  },
  {
    key: "garena free fire",
    visuals: {
      thumbnail: "/images/freefire-card.jpg",
      banner: "/images/freefire-banner.jpg",
    },
  },
  {
    key: "ff",
    visuals: {
      thumbnail: "/images/freefire-card.jpg",
      banner: "/images/freefire-banner.jpg",
    },
  },
];

export function getGameVisuals(gameName: string | null | undefined): GameVisuals {
  if (!gameName) return defaultVisuals;
  const normalized = gameName.toLowerCase();
  const match = gameVisualConfigs.find((entry) => normalized.includes(entry.key));
  return match?.visuals ?? defaultVisuals;
}
