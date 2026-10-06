const ICONS =
  "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons";
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

const CHIP = {
  grass: "bg-emerald-100 text-emerald-800",
  fire: "bg-orange-100 text-orange-800",
  water: "bg-blue-100 text-blue-800",
  electric: "bg-[#f6c744]/25 text-[#633a00]",
  ice: "bg-cyan-100 text-cyan-800",
  fighting: "bg-orange-100 text-orange-800",
  poison: "bg-indigo-100 text-indigo-900",
  ground: "bg-amber-100 text-amber-900",
  flying: "bg-indigo-100 text-indigo-800",
  psychic: "bg-pink-100 text-pink-800",
  bug: "bg-emerald-100 text-emerald-800",
  rock: "bg-stone-200 text-stone-800",
  ghost: "bg-[#5c6bc0]/20 text-[#1a237e]",
  dragon: "bg-[#5c6bc0]/20 text-[#1a237e]",
  dark: "bg-amber-100 text-amber-900",
  steel: "bg-slate-200 text-slate-800",
  fairy: "bg-pink-100 text-pink-800",
  normal: "bg-slate-200 text-slate-800",
};

export const chipSkin = CHIP;

const PILL = {
  normal: "bg-stone-200 text-stone-800",
  fire: "bg-[#fa6555]/20 text-[#93000a]",
  water: "bg-[#459be5]/20 text-[#004a79]",
  grass: "bg-[#56dcbb]/25 text-[#005141]",
  electric: "bg-[#f6c744]/25 text-[#633a00]",
  ice: "bg-cyan-100 text-cyan-800",
  fighting: "bg-orange-100 text-orange-800",
  poison: "bg-indigo-100 text-indigo-900",
  ground: "bg-amber-100 text-amber-900",
  flying: "bg-indigo-100 text-indigo-800",
  psychic: "bg-pink-100 text-pink-800",
  bug: "bg-emerald-100 text-emerald-800",
  rock: "bg-stone-200 text-stone-800",
  ghost: "bg-[#5c6bc0]/20 text-[#1a237e]",
  dragon: "bg-[#5c6bc0]/20 text-[#1a237e]",
  steel: "bg-slate-200 text-slate-800",
  dark: "bg-amber-100 text-amber-900",
  fairy: "bg-pink-100 text-pink-800",
};

export const pillSkin = PILL;

const TILE = {
  normal: "bg-[#f4f4ec] text-[#6b6b47]",
  fire: "bg-[#fff0ed] text-[#af2f25]",
  water: "bg-[#e5f2ff] text-[#004f85]",
  grass: "bg-[#eef7ee] text-[#1e5828]",
  electric: "bg-[#fff8e5] text-[#7a5a00]",
  ice: "bg-[#ecf9fb] text-[#006272]",
  fighting: "bg-[#ffeded] text-[#9b2a2a]",
  poison: "bg-[#f2ecfa] text-[#4d2c88]",
  ground: "bg-[#f7efe6] text-[#714b1f]",
  flying: "bg-[#f0f4ff] text-[#4d63a8]",
  psychic: "bg-[#fcedf5] text-[#8a2456]",
  bug: "bg-[#f2f8eb] text-[#4d6614]",
  rock: "bg-[#f4f1ea] text-[#6b582b]",
  ghost: "bg-[#f4edfc] text-[#603e91]",
  dragon: "bg-[#f0f2ff] text-[#3f3f95]",
  steel: "bg-[#eef2f6] text-[#3e5060]",
  dark: "bg-[#f1eeea] text-[#4f4234]",
  fairy: "bg-[#fcedf5] text-[#8a2456]",
};

export const tileSkin = TILE;

export const accentColor = {
  normal: "#a8a878",
  fire: "#af2f25",
  water: "#459be5",
  grass: "#56dcbb",
  electric: "#f6c744",
  ice: "#5bc0de",
  fighting: "#d2543f",
  poison: "#9f5bba",
  ground: "#c9a227",
  flying: "#7b8fd4",
  psychic: "#f85888",
  bug: "#8bbf3f",
  rock: "#b8a172",
  ghost: "#7c538c",
  dragon: "#5c6bc0",
  steel: "#8b93a7",
  dark: "#6b5b4b",
  fairy: "#ee8fc0",
};

export const typeIcon = (key) => `${ICONS}/${key}.svg`;
export const spriteUrl = (id) => `${SPRITES}/${id}.png`;

export const iconic = {
  normal: [143, 133, 132],
  fire: [6, 59, 38],
  water: [9, 130, 131],
  grass: [3, 103, 154],
  electric: [25, 26, 145],
  ice: [144, 471, 473],
  fighting: [68, 448, 257],
  poison: [94, 34, 89],
  ground: [383, 445, 260],
  flying: [18, 384, 823],
  psychic: [150, 65, 282],
  bug: [212, 214, 637],
  rock: [248, 95, 142],
  ghost: [94, 778, 487],
  dragon: [149, 445, 384],
  steel: [376, 448, 483],
  dark: [197, 248, 491],
  fairy: [700, 468, 282],
};
