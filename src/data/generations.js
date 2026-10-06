const art = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const generations = [
  {
    gen: 1,
    label: "Generation I",
    tag: "GEN I",
    region: "Kanto Region",
    from: 1,
    to: 151,
    starters: [
      { id: 1, name: "Bulbasaur" },
      { id: 4, name: "Charmander" },
      { id: 7, name: "Squirtle" },
    ],
  },
  {
    gen: 2,
    label: "Generation II",
    tag: "GEN II",
    region: "Johto Region",
    from: 152,
    to: 251,
    starters: [
      { id: 152, name: "Chikorita" },
      { id: 155, name: "Cyndaquil" },
      { id: 158, name: "Totodile" },
    ],
  },
  {
    gen: 3,
    label: "Generation III",
    tag: "GEN III",
    region: "Hoenn Region",
    from: 252,
    to: 386,
    starters: [
      { id: 252, name: "Treecko" },
      { id: 255, name: "Torchic" },
      { id: 258, name: "Mudkip" },
    ],
  },
  {
    gen: 4,
    label: "Generation IV",
    tag: "GEN IV",
    region: "Sinnoh Region",
    from: 387,
    to: 493,
    starters: [
      { id: 387, name: "Turtwig" },
      { id: 390, name: "Chimchar" },
      { id: 393, name: "Piplup" },
    ],
  },
  {
    gen: 5,
    label: "Generation V",
    tag: "GEN V",
    region: "Unova Region",
    from: 494,
    to: 649,
    starters: [
      { id: 495, name: "Snivy" },
      { id: 498, name: "Tepig" },
      { id: 501, name: "Oshawott" },
    ],
  },
  {
    gen: 6,
    label: "Generation VI",
    tag: "GEN VI",
    region: "Kalos Region",
    from: 650,
    to: 721,
    starters: [
      { id: 650, name: "Chespin" },
      { id: 653, name: "Fennekin" },
      { id: 656, name: "Froakie" },
    ],
  },
  {
    gen: 7,
    label: "Generation VII",
    tag: "GEN VII",
    region: "Alola Region",
    from: 722,
    to: 809,
    starters: [
      { id: 722, name: "Rowlet" },
      { id: 725, name: "Litten" },
      { id: 728, name: "Popplio" },
    ],
  },
  {
    gen: 8,
    label: "Generation VIII",
    tag: "GEN VIII",
    region: "Galar Region",
    from: 810,
    to: 905,
    starters: [
      { id: 810, name: "Grookey" },
      { id: 813, name: "Scorbunny" },
      { id: 816, name: "Sobble" },
    ],
  },
  {
    gen: 9,
    label: "Generation IX",
    tag: "GEN IX",
    region: "Paldea Region",
    from: 906,
    to: 1025,
    starters: [
      { id: 906, name: "Sprigatito" },
      { id: 909, name: "Fuecoco" },
      { id: 912, name: "Quaxly" },
    ],
  },
].map((g) => ({
  ...g,
  starters: g.starters.map((s) => ({ ...s, art: art(s.id) })),
  range: `#${String(g.from).padStart(4, "0")} - #${String(g.to).padStart(4, "0")}`,
}));

export const generationByGen = (n) =>
  generations.find((g) => g.gen === Number(n)) ?? null;

export const generationOfId = (id) =>
  generations.find((g) => id >= g.from && id <= g.to) ?? null;
