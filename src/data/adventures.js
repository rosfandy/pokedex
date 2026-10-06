const ART =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const API = "https://pokeapi.co/api/v2";

const art = (id) => `${ART}/${id}.png`;
const idOf = (url) => Number(String(url).split("/").filter(Boolean).pop());
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const pretty = (s) => (s ? s.split("-").map(cap).join(" ") : s);

export const REGIONS = [
  { key: "kanto", label: "Kanto", versions: ["firered", "leafgreen", "lets-go-pikachu", "lets-go-eevee", "red", "blue", "yellow"], gen: 1 },
  { key: "johto", label: "Johto", versions: ["heartgold", "soulsilver", "gold", "silver", "crystal"], gen: 2 },
  { key: "hoenn", label: "Hoenn", versions: ["emerald", "ruby", "sapphire", "omega-ruby", "alpha-sapphire"], gen: 3 },
  { key: "sinnoh", label: "Sinnoh", versions: ["platinum", "diamond", "pearl", "brilliant-diamond", "shining-pearl"], gen: 4 },
  { key: "unova", label: "Unova", versions: ["black-2", "white-2", "black", "white"], gen: 5 },
  { key: "kalos", label: "Kalos", versions: ["x", "y"], gen: 6 },
  { key: "alola", label: "Alola", versions: ["ultra-sun", "ultra-moon", "sun", "moon"], gen: 7 },
  { key: "galar", label: "Galar", versions: ["sword", "shield"], gen: 8 },
  { key: "hisui", label: "Hisui", versions: ["legends-arceus"], gen: 8 },
  { key: "paldea", label: "Paldea", versions: ["scarlet", "violet"], gen: 9 },
];

export const regionByKey = (key) =>
  REGIONS.find((r) => r.key === key) ?? REGIONS[0];

const PALETTE = [
  {
    card: "border-emerald-100/90",
    badge: "bg-emerald-100/80 text-emerald-900 border-emerald-200",
    meta: "text-emerald-700",
    encounter: "text-emerald-700",
    stat: "text-emerald-800",
    button:
      "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-700/20",
    tint: "bg-emerald-100/70",
    contour: "contour-lines",
    dot: "bg-emerald-500",
    pillOn:
      "border-emerald-400 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-400/50",
  },
  {
    card: "border-indigo-100/90",
    badge: "bg-indigo-100/80 text-indigo-900 border-indigo-200",
    meta: "text-indigo-700",
    encounter: "text-indigo-700",
    stat: "text-indigo-800",
    button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
    tint: "bg-indigo-100/70",
    contour: "contour-lines-indigo",
    dot: "bg-indigo-500",
    pillOn:
      "border-indigo-400 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-400/50",
  },
  {
    card: "border-purple-100/90",
    badge: "bg-purple-100/80 text-purple-900 border-purple-200",
    meta: "text-purple-700",
    encounter: "text-purple-700",
    stat: "text-purple-900",
    button: "bg-purple-700 hover:bg-purple-800 shadow-purple-700/20",
    tint: "bg-purple-100/70",
    contour: "contour-lines-purple",
    dot: "bg-purple-500",
    pillOn:
      "border-purple-400 bg-purple-50 text-purple-950 ring-1 ring-purple-400/50",
  },
  {
    card: "border-rose-100/90",
    badge: "bg-rose-100/80 text-rose-900 border-rose-200",
    meta: "text-rose-700",
    encounter: "text-rose-700",
    stat: "text-rose-800",
    button: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
    tint: "bg-rose-100/70",
    contour: "contour-lines",
    dot: "bg-rose-500",
    pillOn: "border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400/50",
  },
  {
    card: "border-amber-100/90",
    badge: "bg-amber-100/80 text-amber-900 border-amber-200",
    meta: "text-amber-700",
    encounter: "text-amber-700",
    stat: "text-amber-800",
    button:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-600/20",
    tint: "bg-amber-100/70",
    contour: "contour-lines",
    dot: "bg-amber-500",
    pillOn:
      "border-amber-400 bg-amber-50 text-amber-950 ring-1 ring-amber-400/50",
  },
  {
    card: "border-sky-100/90",
    badge: "bg-sky-100/80 text-sky-900 border-sky-200",
    meta: "text-sky-700",
    encounter: "text-sky-700",
    stat: "text-sky-800",
    button: "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20",
    tint: "bg-sky-100/70",
    contour: "contour-lines-indigo",
    dot: "bg-sky-500",
    pillOn: "border-sky-400 bg-sky-50 text-sky-950 ring-1 ring-sky-400/50",
  },
];

const RARITY_RAMP = [
  "text-emerald-600",
  "text-indigo-600",
  "text-slate-500",
  "text-slate-500",
];

const KIND = [
  { test: /forest|woods|jungle|garden|park|meadow/i, tag: "Dense Woodlands", icon: "forest", tone: "emerald" },
  { test: /cave|cavern|tunnel|mine|underground|tunnel/i, tag: "Subterranean", icon: "nightlight", tone: "indigo" },
  { test: /sea|water|beach|lake|bay|ocean|harbor|cove|island/i, tag: "Tidal Waters", icon: "wave", tone: "sky" },
  { test: /tower|temple|ruins|mansion|lab|manor|shrine|crypt/i, tag: "Ancient Site", icon: "psychology", tone: "purple" },
  { test: /mountain|mt-|peak|volcano|crater|summit/i, tag: "Highland", icon: "nightlight", tone: "amber" },
  { test: /route|path|road|plain|field/i, tag: "Open Route", icon: "forest", tone: "rose" },
];

const KIND_MAP = Object.fromEntries(KIND.map((k) => [k.tone, k]));
const PALETTE_MAP = {
  emerald: PALETTE[0],
  indigo: PALETTE[1],
  purple: PALETTE[2],
  rose: PALETTE[3],
  amber: PALETTE[4],
  sky: PALETTE[5],
};

const EXTRA_TONES = ["indigo", "purple", "sky", "amber", "rose", "emerald"];

const dangerFor = (areas, species) => {
  if (species >= 40 || areas >= 4)
    return { label: "Danger: Boss Tier", tone: "rose", pulse: true };
  if (species >= 18 || areas >= 2)
    return { label: "Danger: Moderate", tone: "amber", pulse: false };
  return { label: "Danger: Low", tone: "emerald", pulse: false };
};

function classify(locationName) {
  for (const k of KIND) {
    if (k.test.test(locationName)) return k;
  }
  return { tag: "Wild Expanse", icon: "forest", tone: "indigo" };
}

export function speciesRows(area, versions) {
  const allow = Array.isArray(versions) ? new Set(versions) : null;
  return (area.pokemon_encounters || [])
    .map((entry) => {
      const id = idOf(entry.pokemon.url);
      const detail = entry.version_details.find(
        (v) => (!allow || allow.has(v.version.name)) && v.encounter_details.length,
      );
      if (!detail) return null;
      let best = null;
      for (const ed of detail.encounter_details) {
        const chance = ed.chance * (detail.max_chance / 100);
        if (!best || chance > best.chance) {
          best = {
            chance,
            min: ed.min_level,
            max: ed.max_level,
            method: ed.method.name,
          };
        }
      }
      return { id, slug: entry.pokemon.name, version: detail.version.name, ...best };
    })
    .filter((r) => r && r.id && r.id <= 1025 && r.chance != null);
}

export function bestVersion(areas, preferred) {
  const tally = new Map();
  for (const area of areas) {
    for (const entry of area.pokemon_encounters || []) {
      for (const vd of entry.version_details) {
        if (!vd.encounter_details.length) continue;
        const set = tally.get(vd.version.name) || new Set();
        set.add(entry.pokemon.name);
        tally.set(vd.version.name, set);
      }
    }
  }
  let best = null;
  for (const [name, set] of tally) {
    const rank = preferred.indexOf(name);
    const bonus = rank === -1 ? 0 : (preferred.length - rank) * 3;
    const score = set.size + bonus;
    if (!best || score > best.score) best = { name, score, size: set.size };
  }
  return best ? best.name : preferred[0];
}

export function rarityLabel(row) {
  const pct = row.chance;
  const shown = pct > 0 && pct < 1 ? "<1" : String(Math.round(pct));
  const band =
    row.min != null && row.max != null
      ? row.min === row.max
        ? `Lv. ${row.min}`
        : `Lv. ${row.min}–${row.max}`
      : "";
  const tier =
    pct >= 100
      ? "Always"
      : pct >= 20
        ? "Common"
        : pct >= 5
          ? "Uncommon"
          : "Rare";
  const odds = pct >= 100 ? "" : ` • ${shown}%`;
  return `${tier}${odds}${band ? ` • ${band}` : ""}`;
}

function medians(rows) {
  const mins = rows.map((r) => r.min).filter((n) => n != null);
  const maxs = rows.map((r) => r.max).filter((n) => n != null);
  if (!mins.length || !maxs.length) return null;
  const pick = (xs) => {
    const a = [...xs].sort((p, q) => p - q);
    return a.length % 2
      ? a[a.length >> 1]
      : Math.round((a[a.length / 2 - 1] + a[a.length / 2]) / 2);
  };
  return { medMin: pick(mins), medMax: pick(maxs) };
}

export function buildRealm(location, areas, region, index) {
  const version = bestVersion(areas, region.versions);
  const kind = classify(location.name);

  const perArea = areas.map((a) => ({
    name: a.name,
    rows: speciesRows(a, [version]),
  }));
  const rows = perArea
    .flatMap((a) => a.rows)
    .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    .sort((a, b) => (b.chance !== a.chance ? b.chance - a.chance : a.id - b.id));

  if (!rows.length) return null;

  const showcased = rows.slice(0, 3);
  const levels = rows.flatMap((r) => [r.min, r.max]).filter((n) => n != null);
  const lo = levels.length ? Math.min(...levels) : null;
  const hi = levels.length ? Math.max(...levels) : null;
  const mid = medians(rows);
  const danger = dangerFor(areas.length, rows.length);

  const palette =
    PALETTE_MAP[kind.tone] ||
    PALETTE_MAP[EXTRA_TONES[index % EXTRA_TONES.length]];

  return {
    slug: location.name,
    region: region.key,
    regionLabel: region.label,
    realm: pretty(location.name),
    kicker: `${region.label} • ${areas.length} ${areas.length === 1 ? "area" : "areas"}`,
    tag: kind.tag,
    icon: kind.icon,
    danger: danger.label,
    dangerTone: danger.tone,
    dangerPulse: danger.pulse,
    blurb: `${rows.length} recorded species across ${areas.length} ${
      areas.length === 1 ? "area" : "areas"
    } of ${pretty(location.name)}.`,
    version,
    areas: perArea.map((a) => ({ name: a.name, count: a.rows.length })),
    tone: { ...palette, ramp: RARITY_RAMP },
    encounters: showcased.map((r, i) => ({
      id: r.id,
      name: pretty(r.slug),
      rarity: rarityLabel(r),
      raritySkin: RARITY_RAMP[i] || "text-slate-500",
      method: pretty(r.method),
      art: art(r.id),
    })),
    encounterLabel: rows.length >= 40 ? "Apex Forces" : "Wild Encounters",
    encounterMeta: `${rows.length} species`,
    species: rows,
    specs: [
      {
        label: "Level Range",
        value: lo != null ? `Lv. ${lo} – ${hi}` : "—",
        tone: danger.tone,
      },
      {
        label: "Typical Level",
        value: mid ? `Lv. ~${mid.medMin} – ${mid.medMax}` : "—",
        tone: "slate",
      },
    ],
  };
}

export async function loadRegion(key) {
  const region = regionByKey(key);
  const reg = await (await fetch(`${API}/region/${region.key}`)).json();
  const locations = reg.locations || [];

  const details = await Promise.all(
    locations.map((l) => fetch(l.url).then((r) => r.json())),
  );

  const pairs = details.map((d) => ({
    location: d,
    areas: [],
  }));

  const areaFetches = [];
  pairs.forEach((p, pi) => {
    (p.location.areas || []).forEach((a) =>
      areaFetches.push(
        fetch(a.url)
          .then((r) => r.json())
          .then((ar) => {
            if ((ar.pokemon_encounters || []).length) {
              pairs[pi].areas.push(ar);
            }
          })
          .catch(() => {}),
      ),
    );
  });
  await Promise.all(areaFetches);

  return pairs
    .filter((p) => p.areas.length)
    .map((p, i) => buildRealm(p.location, p.areas, region, i))
    .filter(Boolean)
    .sort((a, b) => b.species.length - a.species.length);
}

export const adventureShort = (realm) =>
  realm
    .replace(/^Kanto Route /, "Route ")
    .replace(/^Johto Route /, "Route ")
    .replace(/\s+(City|Town)$/, "");
