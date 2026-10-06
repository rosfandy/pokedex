<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import PokeballLoader from "../components/PokeballLoader.vue";
import { generationOfId } from "../data/generations";

const API = "https://pokeapi.co/api/v2";
const MAX_ID = 1025;

const route = useRoute();

const poke = ref(null);
const species = ref(null);
const chain = ref(null);
const moves = ref([]);
const neighbors = ref({});
const tab = ref("about");
const loading = ref(true);
const error = ref("");

const id = () => Number(route.params.id);
const dex = (n) => String(n).padStart(3, "0");
const currentGen = computed(() => generationOfId(Number(route.params.id)));
const titleCase = (s) => s[0].toUpperCase() + s.slice(1);
const TABS = [
  { key: "about", label: "About" },
  { key: "stats", label: "Base Stats" },
  { key: "evolution", label: "Evolution" },
  { key: "moves", label: "Moves" },
];
const pokeIdOf = (url) => url.split("/").filter(Boolean).pop();
const sprite = (n) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n}.png`;

const STAT_LABEL = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const heroSkin = {
  grass: "bg-type-grass",
  fire: "bg-type-fire",
  water: "bg-type-water",
  electric: "bg-type-electric",
  poison: "bg-type-poison",
  ghost: "bg-type-ghost",
  normal: "bg-type-normal",
  psychic: "bg-type-psychic",
  flying: "bg-type-water",
  orange: "bg-poke-orange",
};

async function load() {
  loading.value = true;
  error.value = "";
  poke.value = species.value = chain.value = null;
  moves.value = neighbors.value = {};
  tab.value = "about";
  try {
    const [p, s] = await Promise.all([
      fetch(`${API}/pokemon/${id()}`).then((r) => r.json()),
      fetch(`${API}/pokemon-species/${id()}`).then((r) => r.json()),
    ]);
    poke.value = p;
    species.value = s;
    loadNeighbors();
  } catch {
    error.value = "Could not load this Pokémon.";
  } finally {
    loading.value = false;
  }
}

async function loadNeighbors() {
  const n = id();
  for (const k of [n - 1, n + 1]) {
    if (k < 1 || k > MAX_ID) continue;
    fetch(`${API}/pokemon/${k}`)
      .then((r) => r.json())
      .then((d) => (neighbors.value[k] = d))
      .catch(() => {});
  }
}

watch(tab, (t) => {
  if (t === "evolution" && !chain.value) {
    fetch(species.value.evolution_chain.url)
      .then((r) => r.json())
      .then((d) => (chain.value = d));
  }
  if (t === "moves" && !moves.value.length) loadMoves();
});

async function loadMoves() {
  const seen = new Map();
  for (const m of poke.value.moves) {
    const vg = m.version_group_details.find(
      (d) => d.move_learn_method.name === "level-up",
    );
    if (!vg) continue;
    if (
      !seen.has(m.move.name) ||
      seen.get(m.move.name).level > vg.level_learned_at
    ) {
      seen.set(m.move.name, {
        name: m.move.name,
        level: vg.level_learned_at,
        url: m.move.url,
      });
    }
  }
  const top = [...seen.values()].sort((a, b) => a.level - b.level).slice(0, 12);
  moves.value = await Promise.all(
    top.map(async (m) => {
      const d = await (await fetch(m.url)).json();
      return { ...m, type: d.type.name, cls: d.damage_class.name };
    }),
  );
}

watch(() => route.params.id, load, { immediate: true });

const types = computed(
  () => poke.value?.types.map((t) => titleCase(t.type.name)) ?? [],
);
const hero = computed(
  () => heroSkin[poke.value?.types[0]?.type.name] ?? "bg-poke-teal",
);
const art = computed(
  () => poke.value?.sprites?.other?.["official-artwork"]?.front_default ?? "",
);
const cry = computed(() => poke.value?.cries?.latest ?? "");

const genus = computed(
  () =>
    species.value?.genera.find((g) => g.language.name === "en")?.genus ?? "",
);
const bio = computed(() => {
  const f = species.value?.flavor_text_entries.filter(
    (e) => e.language.name === "en",
  );
  return f?.at(-1)?.flavor_text.replace(/[\n\f\r]/g, " ") ?? "";
});

const measurements = computed(() => {
  const m = (poke.value?.height ?? 0) / 10;
  const kg = (poke.value?.weight ?? 0) / 10;
  const inch = m * 39.3701;
  const ft = Math.floor(inch / 12);
  return {
    height: `${ft}' ${(inch - ft * 12).toFixed(1).padStart(4, "0")}"`,
    heightM: m.toFixed(2),
    weight: (kg * 2.20462).toFixed(1),
    weightKg: kg.toFixed(1),
  };
});

const gender = computed(() => {
  const female = (species.value?.gender_rate ?? -1) * 12.5;
  return female < 0 ? null : { female, male: 100 - female };
});

const abilities = computed(() =>
  (poke.value?.abilities ?? []).map((a) => ({
    name: titleCase(a.ability.name),
    hidden: a.is_hidden,
  })),
);

const stats = computed(() =>
  (poke.value?.stats ?? []).map((s) => ({
    label: STAT_LABEL[s.stat.name] ?? s.stat.name,
    value: s.base_stat,
    good: s.base_stat >= 65,
  })),
);
const total = computed(() => stats.value.reduce((n, s) => n + s.value, 0));
const minMax = computed(() => {
  const v = stats.value.map((s) => s.value);
  return v.length
    ? { min: Math.min(...v), max: Math.max(...v) }
    : { min: 0, max: 0 };
});

const R = 104;
const C = 150;
const RADAR_MAX = 180;
const RADAR_ORDER = [
  "special-attack",
  "special-defense",
  "speed",
  "hp",
  "defense",
  "attack",
];
const RADAR_SHORT = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

const radarPoint = (i, value) => {
  const ang = (Math.PI / 3) * i - Math.PI / 2;
  const r = (Math.min(value, RADAR_MAX) / RADAR_MAX) * R;
  return [C + r * Math.cos(ang), C + r * Math.sin(ang)];
};
const radarPoly = (vals) =>
  vals
    .map((v, i) =>
      radarPoint(i, v)
        .map((n) => n.toFixed(1))
        .join(","),
    )
    .join(" ");

const radarRings = [0.25, 0.5, 0.75, 1].map((f) =>
  radarPoly(RADAR_ORDER.map(() => RADAR_MAX * f)),
);
const radarSpokes = RADAR_ORDER.map((_, i) => radarPoint(i, RADAR_MAX));

const statByName = computed(() => {
  const map = {};
  for (const s of poke.value?.stats ?? []) map[s.stat.name] = s.base_stat;
  return map;
});
const radarShape = computed(() =>
  stats.value.length
    ? radarPoly(RADAR_ORDER.map((k) => statByName.value[k] ?? 0))
    : "",
);
const radarBenchmark = computed(() =>
  stats.value.length ? radarPoly(RADAR_ORDER.map(() => 70)) : "",
);
const radarAxes = computed(() => {
  if (!stats.value.length) return [];
  return RADAR_ORDER.map((k, i) => {
    const v = statByName.value[k] ?? 0;
    const [nx, ny] = radarPoint(i, v);
    const [lx, ly] = radarPoint(i, RADAR_MAX + 16);
    return {
      label: RADAR_SHORT[k],
      value: v,
      nx: nx.toFixed(1),
      ny: ny.toFixed(1),
      x: lx.toFixed(0),
      y: (ly + 4).toFixed(0),
      anchor: Math.abs(lx - C) < 12 ? "middle" : lx > C ? "start" : "end",
    };
  });
});

const stages = computed(() => {
  const out = [];
  const walk = (node) => {
    for (const c of node.evolves_to) {
      out.push({
        from: node.species,
        to: c.species,
        level: c.evolution_details?.[0]?.min_level,
      });
      walk(c);
    }
  };
  if (chain.value) walk(chain.value.chain);
  return out;
});

function playCry() {
  if (cry.value) new Audio(cry.value).play();
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col justify-between bg-poke-gray-50 font-jakarta text-poke-gray-900 antialiased"
  >
    <main class="mx-auto w-full max-w-6xl flex-grow px-6 pt-6 sm:px-8 lg:px-10">
      <section
        v-reveal="{ child: true }"
        class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div class="flex items-center gap-2 text-sm text-poke-gray-500">
          <RouterLink
            :to="`/pokedex/gen/${currentGen?.gen ?? 1}`"
            class="flex items-center gap-1.5 font-medium transition-colors hover:text-poke-teal"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            Back to Pokédex
          </RouterLink>
          <span class="text-poke-gray-300">/</span>
          <RouterLink
            v-if="currentGen"
            :to="`/pokedex/gen/${currentGen.gen}`"
            class="font-semibold transition-colors hover:text-poke-teal"
          >
            {{ currentGen.tag }}
          </RouterLink>
          <span class="text-poke-gray-300">/</span>
          <span class="font-semibold text-poke-gray-700">{{
            poke && titleCase(poke.name)
          }}</span>
          <span class="font-mono text-xs text-poke-gray-400">{{
            poke && `#${dex(poke.id)}`
          }}</span>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink
            v-if="neighbors[id() - 1]"
            :to="`/pokedex/${id() - 1}`"
            class="flex items-center gap-1 rounded-lg border border-poke-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-poke-gray-500 transition-colors hover:bg-poke-gray-50"
          >
            <svg
              class="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            #{{ dex(id() - 1) }} {{ titleCase(neighbors[id() - 1].name) }}
          </RouterLink>
          <RouterLink
            v-if="neighbors[id() + 1]"
            :to="`/pokedex/${id() + 1}`"
            class="flex items-center gap-1 rounded-lg border border-poke-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-poke-gray-700 transition-colors hover:bg-poke-gray-50"
          >
            #{{ dex(id() + 1) }} {{ titleCase(neighbors[id() + 1].name) }}
            <svg
              class="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </RouterLink>
        </div>
      </section>

      <PokeballLoader v-if="loading" label="Scanning Pokédex..." />
      <p
        v-else-if="error"
        class="py-16 text-center text-sm font-medium text-poke-teal"
      >
        {{ error }}
        <button class="ml-1 underline" @click="load">Retry</button>
      </p>

      <div
        v-else
        v-reveal="{ child: true, y: 40, stagger: 0.1 }"
        class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
      >
        <section
          class="relative flex min-h-[500px] flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-colors duration-500 lg:col-span-5"
          :class="hero"
        >
          <div
            class="dot-matrix pointer-events-none absolute top-5 right-5 h-12 w-16 opacity-80"
          />
          <div
            class="pokeball-watermark pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full opacity-60"
          />

          <div class="relative z-10">
            <div class="flex items-start justify-between">
              <div>
                <h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {{ titleCase(poke.name) }}
                </h1>
                <p class="mt-1 text-sm font-medium tracking-wide text-white/85">
                  {{ genus }}
                </p>
              </div>
              <span
                class="font-mono text-2xl font-black tracking-wider text-white/90"
              >
                #{{ dex(poke.id) }}
              </span>
            </div>
            <div class="mt-3.5 flex items-center gap-2">
              <span
                v-for="t in types"
                :key="t"
                class="rounded-full border border-white/20 bg-white/25 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md"
              >
                {{ t }}
              </span>
            </div>
          </div>

          <div
            class="relative z-10 my-auto flex flex-col items-center justify-center py-6"
          >
            <div
              class="pointer-events-none absolute h-60 w-60 rounded-full bg-white/15 blur-2xl"
            />
            <img
              v-if="art"
              :src="art"
              :alt="`${poke.name} detailed artwork`"
              class="relative z-10 h-56 w-56 object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105"
              @error="(e) => e.target.remove()"
            />
            <span class="mt-2 text-xs font-medium tracking-wide text-white/70">
              Pokemon Generation
              {{
                species.generation.name.replace("generation-", "").toUpperCase()
              }}
            </span>
          </div>

          <div
            class="relative z-10 flex items-center justify-between border-t border-white/20 pt-4 text-xs font-medium"
          >
            <button
              v-if="cry"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              @click="playCry"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
              Play Cry
            </button>
            <div class="flex items-center gap-2">
              <span class="rounded bg-black/15 px-2.5 py-1 text-white/90"
                >Regional #{{ dex(poke.id) }}</span
              >
              <span class="rounded bg-black/15 px-2.5 py-1 text-white/90">{{
                genus
              }}</span>
            </div>
          </div>
        </section>

        <section
          class="card-soft-shadow rounded-2xl border border-poke-gray-200/80 bg-white p-5 sm:p-6 lg:col-span-7"
        >
          <div class="border-b border-poke-gray-200">
            <nav aria-label="Pokemon Tabs" class="-mb-px flex space-x-8">
              <button
                v-for="t in TABS"
                :key="t.key"
                class="border-b-2 px-1 pb-3.5 text-sm transition-all"
                :class="
                  tab === t.key
                    ? 'border-poke-teal font-bold text-poke-gray-900'
                    : 'border-transparent font-medium text-poke-gray-500 hover:border-poke-gray-300 hover:text-poke-gray-700'
                "
                @click="tab = t.key"
              >
                {{ t.label }}
                <span
                  v-if="t.key === 'evolution'"
                  class="rounded-full bg-poke-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-poke-gray-600"
                >
                  Chain
                </span>
              </button>
            </nav>
          </div>

          <div v-if="tab === 'about'" class="space-y-6 pt-6">
            <div>
              <h2
                class="mb-2 text-xs font-bold tracking-wider text-poke-gray-400 uppercase"
              >
                Pokédex Entry
              </h2>
              <p
                class="text-sm leading-relaxed text-poke-gray-700 sm:text-base"
              >
                {{ bio }}
              </p>
            </div>

            <div
              class="grid grid-cols-2 gap-4 rounded-2xl border border-poke-gray-100 bg-poke-gray-50/90 p-4 shadow-inner"
            >
              <div class="space-y-1">
                <span class="text-xs font-semibold text-poke-gray-400"
                  >Height</span
                >
                <p class="text-base font-bold text-poke-gray-800 sm:text-lg">
                  {{ measurements.height }}
                  <span class="text-xs font-normal text-poke-gray-500"
                    >({{ measurements.heightM }} m)</span
                  >
                </p>
              </div>
              <div class="space-y-1">
                <span class="text-xs font-semibold text-poke-gray-400"
                  >Weight</span
                >
                <p class="text-base font-bold text-poke-gray-800 sm:text-lg">
                  {{ measurements.weight }} lbs
                  <span class="text-xs font-normal text-poke-gray-500"
                    >({{ measurements.weightKg }} kg)</span
                  >
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-base font-bold text-poke-gray-900">Breeding</h3>
              <div class="grid grid-cols-1 gap-y-3.5 text-sm sm:grid-cols-3">
                <div class="font-medium text-poke-gray-400">Gender</div>
                <div
                  class="flex items-center gap-6 font-semibold sm:col-span-2"
                >
                  <template v-if="gender">
                    <span
                      class="inline-flex items-center gap-1.5 text-blue-600"
                    >
                      <span class="text-base">♂</span> {{ gender.male }}%
                    </span>
                    <span
                      class="inline-flex items-center gap-1.5 text-pink-500"
                    >
                      <span class="text-base">♀</span> {{ gender.female }}%
                    </span>
                  </template>
                  <span v-else class="text-poke-gray-500">Genderless</span>
                </div>
                <div class="font-medium text-poke-gray-400">Egg Groups</div>
                <div class="font-medium text-poke-gray-800 sm:col-span-2">
                  {{
                    species.egg_groups.map((e) => titleCase(e.name)).join(", ")
                  }}
                </div>
                <div class="font-medium text-poke-gray-400">Egg Cycle</div>
                <div class="font-medium text-poke-gray-800 sm:col-span-2">
                  {{ titleCase(species.growth_rate.name) }}
                </div>
              </div>
            </div>

            <div class="space-y-3 border-t border-poke-gray-100 pt-3">
              <h3 class="text-base font-bold text-poke-gray-900">
                Training &amp; Abilities
              </h3>
              <div class="grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-3">
                <div class="font-medium text-poke-gray-400">Abilities</div>
                <div class="flex flex-wrap items-center gap-2 sm:col-span-2">
                  <span
                    v-for="a in abilities"
                    :key="a.name"
                    class="rounded-lg bg-poke-gray-100 px-2.5 py-1 text-xs font-medium"
                    :class="
                      a.hidden ? 'text-poke-gray-500' : 'text-poke-gray-700'
                    "
                  >
                    {{ a.name }}
                    <span
                      v-if="a.hidden"
                      class="text-[10px] font-semibold text-poke-teal italic"
                    >
                      (Hidden)
                    </span>
                  </span>
                </div>
                <div class="font-medium text-poke-gray-400">Base Exp</div>
                <div class="font-semibold text-poke-gray-800 sm:col-span-2">
                  {{ poke.base_experience }}
                </div>
                <div class="font-medium text-poke-gray-400">Catch Rate</div>
                <div class="font-medium text-poke-gray-800 sm:col-span-2">
                  {{ species.capture_rate }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="tab === 'stats'" class="space-y-4 pt-6">
            <h3 class="mb-2 text-base font-bold text-poke-gray-900">
              Base Statistics
            </h3>

            <div
              class="flex flex-col items-center gap-3 rounded-2xl border border-poke-gray-200/70 bg-poke-gray-50/60 p-4"
            >
              <div
                class="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center"
              >
                <svg
                  class="h-full w-full overflow-visible"
                  viewBox="0 0 300 300"
                >
                  <defs>
                    <radialGradient id="stat-radar-fill" r="50%">
                      <stop
                        offset="0%"
                        stop-color="#3ba99c"
                        stop-opacity="0.45"
                      />
                      <stop
                        offset="100%"
                        stop-color="#3ba99c"
                        stop-opacity="0.1"
                      />
                    </radialGradient>
                  </defs>

                  <polygon
                    v-for="(ring, i) in radarRings"
                    :key="`sring-${i}`"
                    :points="ring"
                    fill="none"
                    stroke="#dae3f0"
                    :stroke-dasharray="i % 2 ? undefined : '2 2'"
                    :stroke-width="i === radarRings.length - 1 ? 1.5 : 1"
                  />
                  <line
                    v-for="(sp, i) in radarSpokes"
                    :key="`sspoke-${i}`"
                    x1="150"
                    y1="150"
                    :x2="sp[0].toFixed(1)"
                    :y2="sp[1].toFixed(1)"
                    stroke="#dae3f0"
                    stroke-width="1"
                  />

                  <polygon
                    :points="radarBenchmark"
                    fill="none"
                    opacity="0.45"
                    stroke="#8d706c"
                    stroke-dasharray="3 3"
                    stroke-width="1.2"
                  />
                  <polygon
                    :points="radarShape"
                    fill="url(#stat-radar-fill)"
                    stroke="#2f8d82"
                    stroke-width="2.5"
                  />
                  <circle
                    v-for="(a, i) in radarAxes"
                    :key="`snode-${i}`"
                    :cx="a.nx"
                    :cy="a.ny"
                    fill="#2f8d82"
                    r="4.5"
                  />
                  <text
                    v-for="(a, i) in radarAxes"
                    :key="`slabel-${i}`"
                    :x="a.x"
                    :y="a.y"
                    :text-anchor="a.anchor"
                    class="fill-poke-gray-900 text-[12px] font-bold"
                  >
                    {{ a.label }} ({{ a.value }})
                  </text>
                </svg>
              </div>

              <div
                class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-poke-gray-400"
              >
                <span class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-sm bg-poke-teal"
                  />
                  {{ titleCase(poke?.name ?? "") }} stats
                </span>
                <span class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2.5 w-4 rounded-sm border-t-2 border-dashed border-[#8d706c]"
                  />
                  70/stat average
                </span>
              </div>
            </div>

            <div class="space-y-3.5 text-sm">
              <div
                v-for="s in stats"
                :key="s.label"
                class="grid grid-cols-12 items-center gap-2"
              >
                <span class="col-span-3 font-medium text-poke-gray-400">{{
                  s.label
                }}</span>
                <span
                  class="col-span-2 pr-2 text-right font-bold text-poke-gray-800"
                  >{{ s.value }}</span
                >
                <div
                  class="col-span-7 h-2.5 overflow-hidden rounded-full bg-poke-gray-100"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="s.good ? 'bg-emerald-500' : 'bg-poke-teal'"
                    :style="{ width: `${Math.min(100, s.value / 2)}%` }"
                  />
                </div>
              </div>
              <div
                class="grid grid-cols-12 items-center gap-2 border-t border-poke-gray-100 pt-2"
              >
                <span class="col-span-3 font-bold text-poke-gray-900"
                  >Total</span
                >
                <span
                  class="col-span-2 pr-2 text-right font-extrabold text-poke-teal"
                  >{{ total }}</span
                >
                <div class="col-span-7 text-xs text-poke-gray-400">
                  Min: {{ minMax.min }} — Max: {{ minMax.max }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="tab === 'evolution'" class="space-y-6 pt-6">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-poke-gray-900">
                Evolution Chain
              </h3>
              <span class="text-xs text-poke-gray-400"
                >{{ stages.length + 1 }}-Stage Evolution</span
              >
            </div>
            <div v-if="stages.length" class="space-y-4">
              <div
                v-for="(s, i) in stages"
                :key="i"
                class="flex items-center justify-between rounded-2xl border border-poke-gray-100 bg-poke-gray-50 p-4 transition-colors hover:border-poke-teal/40"
              >
                <RouterLink
                  :to="`/pokedex/${pokeIdOf(s.from.url)}`"
                  class="flex flex-col items-center text-center"
                >
                  <div
                    class="flex h-18 w-18 items-center justify-center rounded-full border border-poke-gray-200/60 bg-white p-2 shadow-sm sm:h-20 sm:w-20"
                  >
                    <img
                      :src="sprite(pokeIdOf(s.from.url))"
                      :alt="`${s.from.name} avatar`"
                      class="h-14 w-14 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span
                    class="mt-2 text-xs font-bold text-poke-gray-800 sm:text-sm"
                    >{{ titleCase(s.from.name) }}</span
                  >
                  <span class="font-mono text-[11px] text-poke-gray-400"
                    >#{{ dex(pokeIdOf(s.from.url)) }}</span
                  >
                </RouterLink>

                <div class="flex flex-col items-center px-4">
                  <div
                    class="flex items-center text-xs font-bold text-poke-teal"
                  >
                    <span
                      class="mr-1 hidden font-normal text-poke-gray-400 sm:inline"
                    >
                      {{ s.level ? "Level" : "Other" }}
                    </span>
                    <span
                      class="rounded border border-poke-gray-200 bg-white px-2 py-0.5 shadow-2xs"
                    >
                      {{ s.level ? `Lvl ${s.level}` : "—" }}
                    </span>
                    <svg
                      class="ml-1 h-5 w-5 stroke-[2.5] text-poke-teal"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <RouterLink
                  :to="`/pokedex/${pokeIdOf(s.to.url)}`"
                  class="flex flex-col items-center text-center"
                >
                  <div
                    class="flex h-18 w-18 items-center justify-center rounded-full border border-poke-gray-200/60 bg-white p-2 shadow-sm sm:h-20 sm:w-20"
                  >
                    <img
                      :src="sprite(pokeIdOf(s.to.url))"
                      :alt="`${s.to.name} avatar`"
                      class="h-14 w-14 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span
                    class="mt-2 text-xs font-bold text-poke-gray-800 sm:text-sm"
                    >{{ titleCase(s.to.name) }}</span
                  >
                  <span class="font-mono text-[11px] text-poke-gray-400"
                    >#{{ dex(pokeIdOf(s.to.url)) }}</span
                  >
                </RouterLink>
              </div>
            </div>
            <p v-else class="text-sm text-poke-gray-400">
              This Pokémon does not evolve.
            </p>
          </div>

          <div v-else class="space-y-4 pt-6">
            <h3 class="mb-2 text-base font-bold text-poke-gray-900">
              Natural Learnset (Level Up)
            </h3>
            <div
              v-if="moves.length"
              class="divide-y divide-poke-gray-100 text-sm"
            >
              <div
                v-for="m in moves"
                :key="m.name"
                class="flex items-center justify-between py-2.5"
              >
                <div>
                  <span class="font-bold text-poke-gray-800">{{
                    titleCase(m.name)
                  }}</span>
                  <span class="block text-xs text-poke-gray-400">
                    {{ titleCase(m.type) }} •
                    {{ titleCase(m.cls || m.damage_class) }}
                  </span>
                </div>
                <span
                  class="rounded bg-poke-gray-100 px-2 py-1 text-xs font-semibold text-poke-gray-600"
                >
                  Lvl {{ m.level }}
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-poke-gray-400">No level-up moves.</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
