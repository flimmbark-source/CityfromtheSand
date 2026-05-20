export const CHARACTERS = {
  mason: {
    id: 'mason',
    name: 'The Mason',
    flavor: 'A steady builder of walls, workshops, and strong foundations.',
    stats: { hand: 5, build: 1, convert: 1, refresh: 0 },
    startingDeck: [
      { resource: 'stone', count: 4 },
      { resource: 'sand', count: 3 },
      { resource: 'water', count: 2 },
      { resource: 'greenery', count: 1 },
    ],
  },
  water_planner: {
    id: 'water_planner',
    name: 'The Water Planner',
    flavor: 'A careful organizer who keeps the city flowing and the plans connected.',
    stats: { hand: 4, build: 1, convert: 0, refresh: 2 },
    startingDeck: [
      { resource: 'water', count: 4 },
      { resource: 'stone', count: 3 },
      { resource: 'greenery', count: 2 },
      { resource: 'sand', count: 1 },
    ],
  },
};
