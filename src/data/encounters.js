const API = "https://pokeapi.co/api/v2";

const ITEM =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dream-world";

const itemIcon = (name) => `${ITEM}/${name}.png`;

const ART =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const pretty = (s) => (s ? s.split("-").map(cap).join(" ") : s);

export const BALLS = [
  {
    key: "poke",
    label: "Poké Ball",
    rate: 1,
    note: "Catch Rate 1.0×",
    shell: "poke",
    tone: "text-poke-red",
    icon: itemIcon("poke-ball"),
  },
  {
    key: "great",
    label: "Great Ball",
    rate: 1.5,
    note: "Catch Rate 1.5×",
    shell: "great",
    tone: "text-sky-600",
    icon: itemIcon("great-ball"),
  },
  {
    key: "ultra",
    label: "Ultra Ball",
    rate: 2,
    note: "Catch Rate 2.0×",
    shell: "ultra",
    tone: "text-amber-600",
    icon: itemIcon("ultra-ball"),
  },
  {
    key: "master",
    label: "Master Ball",
    rate: 255,
    note: "Guaranteed Catch",
    shell: "master",
    tone: "text-purple-600",
    icon: itemIcon("master-ball"),
    locked: true,
  },
];

export const BERRIES = [
  {
    key: "razz",
    label: "Razz Berry",
    bonus: 20,
    note: "+20% Catch",
    tone: "text-rose-500",
    icon: itemIcon("razz-berry"),
  },
  {
    key: "nanab",
    label: "Nanab Berry",
    bonus: 8,
    note: "Target Calmed",
    tone: "text-amber-500",
    icon: itemIcon("nanab-berry"),
  },
  {
    key: "pinap",
    label: "Pinap Berry",
    bonus: 4,
    note: "2× Candies",
    tone: "text-emerald-500",
    icon: itemIcon("pinap-berry"),
  },
];

export const ballByKey = (key) => BALLS.find((b) => b.key === key) ?? BALLS[0];
export const berryByKey = (key) => BERRIES.find((b) => b.key === key) ?? null;

const TYPE_SKIN = {
  normal: "bg-slate-100 text-slate-700 ring-slate-200",
  fire: "bg-orange-100 text-orange-800 ring-orange-200",
  water: "bg-sky-100 text-sky-800 ring-sky-200",
  electric: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  grass: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  ice: "bg-cyan-100 text-cyan-800 ring-cyan-200",
  fighting: "bg-red-100 text-red-800 ring-red-200",
  poison: "bg-purple-100 text-purple-800 ring-purple-200",
  ground: "bg-amber-100 text-amber-800 ring-amber-200",
  flying: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  psychic: "bg-pink-100 text-pink-800 ring-pink-200",
  bug: "bg-lime-100 text-lime-800 ring-lime-200",
  rock: "bg-stone-100 text-stone-800 ring-stone-200",
  ghost: "bg-violet-100 text-violet-800 ring-violet-200",
  dragon: "bg-blue-100 text-blue-800 ring-blue-200",
  dark: "bg-neutral-200 text-neutral-800 ring-neutral-300",
  steel: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  fairy: "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200",
};

const HALO = {
  normal: "#94a3b8",
  fire: "#fa6555",
  water: "#3b82f6",
  electric: "#facc15",
  grass: "#22c55e",
  ice: "#22d3ee",
  fighting: "#dc2626",
  poison: "#a855f7",
  ground: "#d97706",
  flying: "#818cf8",
  psychic: "#ec4899",
  bug: "#84cc16",
  rock: "#78716c",
  ghost: "#7c3aed",
  dragon: "#2563eb",
  dark: "#404040",
  steel: "#71717a",
  fairy: "#d946ef",
};

export const typeSkin = (type) => TYPE_SKIN[type] ?? TYPE_SKIN.normal;
export const typeHalo = (type) => HALO[type] ?? "#94a3b8";

const REGION_HABITAT = {
  kanto: "Kanto Wilds",
  johto: "Johto Wilds",
  hoenn: "Hoenn Wilds",
  sinnoh: "Sinnoh Wilds",
  unova: "Unova Wilds",
  kalos: "Kalos Wilds",
  alola: "Alola Wilds",
  galar: "Galar Wilds",
  hisui: "Hisui Wilds",
  paldea: "Paldea Wilds",
};

export const regionHabitat = (key) => REGION_HABITAT[key] ?? "Wild Expanse";

export function rollLevel(min, max) {
  const lo = min ?? 5;
  const hi = max ?? lo;
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

export function scaledStats(stats, level) {
  const at = (name) => stats.find((s) => s.stat.name === name)?.base_stat ?? 50;
  const ramp = (base) => Math.round(base + (base * level) / 55);
  const hp = Math.round(at("hp") * 2 + level + 10);
  const atk = ramp(at("attack"));
  const def = ramp(at("defense"));
  const spa = ramp(at("special-attack"));
  const spd = ramp(at("special-defense"));
  const spe = ramp(at("speed"));
  const cp = Math.round(
    ((atk + def + spa + spd + spe) * Math.sqrt(Math.max(hp, 1))) / 12,
  );
  return { hp, atk, def, spa, spd, spe, cp };
}

export function catchProbability({ captureRate, ballRate, berryBonus }) {
  const base = (captureRate / 255) * 100;
  let pct = base * (0.55 + ballRate * 0.42) + berryBonus;
  pct = Math.max(1, Math.min(95, Math.round(pct)));
  const label = pct > 70 ? "High" : pct > 45 ? "Medium" : "Challenging";
  return { pct, label };
}

export function catchTone(pct) {
  if (pct > 70) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct > 45) return { bar: "bg-sky-500", text: "text-sky-600" };
  return { bar: "bg-poke-red", text: "text-poke-red" };
}

function buildEncounters(rows, regionKey, origin) {
  return rows.map((r) => ({
    ...r,
    art: `${ART}/${r.id}.png`,
    habitat: `${pretty(origin)} • ${regionHabitat(regionKey)}`,
    min: r.min ?? 5,
    max: r.max ?? r.min ?? 5,
  }));
}

export async function loadLocationPool(regionKey, slug, origin, rows) {
  const species = await Promise.all(
    rows.slice(0, 24).map((r) =>
      fetch(`${API}/pokemon-species/${r.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ),
  );
  const forms = await Promise.all(
    rows.slice(0, 24).map((r) =>
      fetch(`${API}/pokemon/${r.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ),
  );

  const merged = species
    .map((s, i) => {
      const p = forms[i];
      if (!s || !p) return null;
      const id = s.id;
      const types = p.types.map((t) => t.type.name);
      return {
        id,
        slug: s.name,
        name: pretty(s.name),
        category: s.genera.find((g) => g.language.name === "en")?.genus ?? "Unknown Pokémon",
        flavor: (s.flavor_text_entries.find((f) => f.language.name === "en")?.flavor_text ?? "")
          .replace(/\s+/g, " ")
          .trim(),
        captureRate: s.capture_rate,
        types,
        typeSkins: types.map((t) => typeSkin(t)),
        halo: typeHalo(types[0]),
        height: (p.height / 10).toFixed(1),
        weight: (p.weight / 10).toFixed(1),
        ability: pretty(
          p.abilities.find((a) => !a.is_hidden)?.ability.name ?? "unknown",
        ),
        base: p.stats,
        min: rows[i].min,
        max: rows[i].max,
        method: rows[i].method,
        chance: rows[i].chance,
        art: `${ART}/${id}.png`,
        habitat: `${pretty(origin)} • ${regionHabitat(regionKey)}`,
      };
    })
    .filter(Boolean);

  return merged.length ? merged : buildEncounters(rows, regionKey, origin);
}

export function spawnFrom(pool, levelRange) {
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const level = rollLevel(levelRange?.min ?? pick.min, levelRange?.max ?? pick.max);
  const stats = scaledStats(pick.base, level);
  return {
    ...pick,
    level,
    stats,
    encounteredAt: Date.now(),
  };
}

export function drawDeck(pool, levelRange, size = 5) {
  if (!pool.length) return [];
  const out = [];
  const used = new Set();
  let guard = 0;
  while (out.length < size && guard < size * 12) {
    guard += 1;
    const pick = spawnFrom(pool, levelRange);
    if (used.has(`${pick.id}-${pick.level}`)) continue;
    used.add(`${pick.id}-${pick.level}`);
    out.push(pick);
  }
  return out;
}

export function expReward(level) {
  return Math.max(50, Math.round(level * 18));
}

export function candyReward(captureRate) {
  return captureRate >= 120 ? 3 : captureRate >= 45 ? 2 : 1;
}
