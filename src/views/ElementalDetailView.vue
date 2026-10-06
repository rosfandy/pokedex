<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import PokeballLoader from "../components/PokeballLoader.vue";
import { accentColor, tileSkin } from "../data/elementalTypes";

const API = "https://pokeapi.co/api/v2";
const STATS = [
  { key: "hp", short: "HP" },
  { key: "attack", short: "Attack" },
  { key: "defense", short: "Defense" },
  { key: "special-attack", short: "Sp. Atk" },
  { key: "special-defense", short: "Sp. Def" },
  { key: "speed", short: "Speed" },
];

const CATALOG = 8;

const route = useRoute();
const loading = ref(true);
const error = ref("");
const type = ref(null);

const shown = ref(CATALOG);
const catalog = computed(() =>
  type.value ? type.value.roster.slice(0, shown.value) : [],
);
const remaining = computed(() =>
  type.value ? type.value.roster.length - shown.value : 0,
);
const loadMore = () => (shown.value += CATALOG);

const cap = (s) => s[0].toUpperCase() + s.slice(1);

const title = (s) => s.split("-").map(cap).join(" ");
const idOf = (url) => Number(url.split("/").filter(Boolean).pop());
const median = (xs) => {
  const a = [...xs].sort((p, q) => p - q);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
};

async function load(name) {
  loading.value = true;
  error.value = "";
  type.value = null;
  shown.value = CATALOG;
  try {
    const d = await (await fetch(`${API}/type/${name}`)).json();

    const ids = d.pokemon.map((e) => idOf(e.pokemon.url));
    const pages = await Promise.all(
      ids.map((id) => fetch(`${API}/pokemon/${id}`).then((r) => r.json())),
    );

    const lines = pages.map((p) => {
      const byStat = Object.fromEntries(
        p.stats.map((s) => [s.stat.name, s.base_stat]),
      );
      return {
        id: p.id,
        name: title(p.name),
        bst: p.stats.reduce((n, s) => n + s.base_stat, 0),
        types: p.types.map((t) => t.type.name),
        ability: p.abilities
          .filter((a) => !a.is_hidden)
          .map((a) => title(a.ability.name))
          .join(" / "),
        stats: byStat,
        art:
          p.sprites?.other?.["official-artwork"]?.front_default ??
          p.sprites?.front_default ??
          "",
      };
    });

    const rel = d.damage_relations;
    type.value = {
      key: d.name,
      name: cap(d.name),
      accent: accentColor[d.name],
      n: d.pokemon.length,
      moves: d.moves.length,
      medianStats: Object.fromEntries(
        STATS.map((s) => [s.key, median(lines.map((l) => l.stats[s.key]))]),
      ),
      medianBst: median(lines.map((l) => l.bst)),
      globalBst: Math.round(
        lines.reduce((n, l) => n + l.bst, 0) / (lines.length || 1),
      ),
      strong: rel.double_damage_to.map((t) => t.name),
      resists: rel.half_damage_from.map((t) => t.name),
      weak: rel.double_damage_from.map((t) => t.name),
      resisted: rel.half_damage_to.map((t) => t.name),
      roster: [...lines]
        .filter((l) => l.id <= 1025)
        .sort((a, b) => b.bst - a.bst),
    };
    shown.value = CATALOG;
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.params.type,
  (n) => n && load(n),
  { immediate: true },
);

const R = 110;
const C = 150;
const MAX = 120;

const point = (i, value) => {
  const ang = (Math.PI / 3) * i - Math.PI / 2;
  const r = (Math.min(value, MAX) / MAX) * R;
  return [C + r * Math.cos(ang), C + r * Math.sin(ang)];
};
const poly = (vals) =>
  vals
    .map((v, i) =>
      point(i, v)
        .map((n) => n.toFixed(1))
        .join(","),
    )
    .join(" ");

const ORDER = [
  "special-attack",
  "special-defense",
  "speed",
  "hp",
  "defense",
  "attack",
];

const rings = [0.25, 0.5, 0.75, 1].map((f) => poly(ORDER.map(() => MAX * f)));
const spokes = ORDER.map((_, i) => point(i, MAX));
const shape = computed(() =>
  type.value ? poly(ORDER.map((k) => type.value.medianStats[k])) : "",
);
const benchmark = computed(() => (type.value ? poly(ORDER.map(() => 70)) : ""));
const axes = computed(() => {
  if (!type.value) return [];
  return ORDER.map((k, i) => {
    const v = type.value.medianStats[k];
    const [nx, ny] = point(i, v);
    const [lx, ly] = point(i, MAX + 18);
    return {
      label: STATS.find((s) => s.key === k).short,
      value: v,
      nx: nx.toFixed(1),
      ny: ny.toFixed(1),
      x: lx.toFixed(0),
      y: (ly + 4).toFixed(0),
      anchor: Math.abs(lx - C) < 12 ? "middle" : lx > C ? "start" : "end",
    };
  });
});

const chips = (names) =>
  names.map((n) => ({ name: cap(n), skin: tileSkin[n] }));

const groups = computed(() =>
  type.value
    ? [
        {
          id: "strong",
          mult: "2.0×",
          tone: "good",
          title: "Offense: Super Effective Output",
          note: "Deals double damage against targets bearing these elements:",
          items: chips(type.value.strong),
        },
        {
          id: "resists",
          mult: "1⁄2×",
          tone: "good",
          title: "Defense: Key Resistances",
          note: "Receives half damage when struck by incoming moves of these types:",
          items: chips(type.value.resists),
        },
        {
          id: "weak",
          mult: "2.0×",
          tone: "bad",
          title: "Defensive Hazard: Critical Vulnerabilities",
          note: "Suffers double damage when defending against:",
          items: chips(type.value.weak),
        },
        {
          id: "resisted",
          mult: "1⁄2×",
          tone: "bad",
          title: "Offensive Ineffectiveness",
          note: "Deals half damage when attacking targets with these elements:",
          items: chips(type.value.resisted),
        },
      ]
    : [],
);
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden font-jakarta">
    <div
      class="pointer-events-none absolute top-0 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <PokeballLoader v-if="loading" label="Analysing type matrix..." />
    <p
      v-else-if="error"
      class="relative z-10 mx-auto max-w-md pt-32 text-center text-sm font-medium text-poke-gray-500"
    >
      {{ error }}
    </p>

    <main
      v-else
      class="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10"
    >
      <div class="flex flex-col gap-6 pt-8 pb-12">
        <!-- Breadcrumb, title, accent -->
        <div class="flex flex-col gap-3">
          <RouterLink
            to="/elemental"
            class="inline-flex w-fit items-center gap-2 text-label-md font-bold tracking-wider text-poke-gray-500 uppercase transition-colors hover:text-poke-red-dark"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back to Types Directory
          </RouterLink>

          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center">
              <img
                :src="`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/${type.key}.svg`"
                :alt="`${type.name} Symbol`"
                class="h-full w-full object-contain"
              />
            </div>
            <h1
              class="text-headline-lg font-extrabold tracking-tight text-poke-gray-900"
            >
              {{ type.name }} Elemental Type
            </h1>
          </div>

          <p class="max-w-3xl text-body-md text-poke-gray-500">
            Deep-dive analysis of offensive output, defensive resistances,
            vulnerability matrices, and species catalog.
          </p>
        </div>

        <!-- Radar + matchup matrices -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div
            class="flex h-full flex-col justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm lg:col-span-5"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-col">
                <span
                  class="text-label-sm tracking-wider text-poke-gray-500/70 uppercase"
                  >Performance Benchmark</span
                >
                <h3 class="text-headline-sm font-bold text-poke-gray-900">
                  Median Base Stats Profile
                </h3>
              </div>
              <div
                class="flex items-center gap-1.5 rounded-full bg-poke-gray-100 px-2 py-1"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :style="{ backgroundColor: type.accent }"
                />
                <span class="text-label-sm font-bold text-poke-gray-600">
                  BST {{ type.medianBst }} Median
                </span>
              </div>
            </div>

            <div
              class="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center py-2"
            >
              <svg class="h-full w-full overflow-visible" viewBox="0 0 300 300">
                <defs>
                  <radialGradient :id="`radar-${type.key}`" r="50%">
                    <stop
                      offset="0%"
                      :stop-color="type.accent"
                      stop-opacity="0.45"
                    />
                    <stop
                      offset="100%"
                      :stop-color="type.accent"
                      stop-opacity="0.1"
                    />
                  </radialGradient>
                </defs>

                <polygon
                  v-for="(ring, i) in rings"
                  :key="`ring-${i}`"
                  :points="ring"
                  fill="none"
                  :stroke="i % 2 ? '#dae3f0' : '#dae3f0'"
                  :stroke-dasharray="i % 2 ? undefined : '2 2'"
                  :stroke-width="i === rings.length - 1 ? 1.5 : 1"
                />
                <line
                  v-for="(sp, i) in spokes"
                  :key="`spoke-${i}`"
                  x1="150"
                  y1="150"
                  :x2="sp[0].toFixed(1)"
                  :y2="sp[1].toFixed(1)"
                  stroke="#dae3f0"
                  stroke-width="1"
                />

                <!-- All-species benchmark: average 70 per stat -->
                <polygon
                  :points="benchmark"
                  fill="none"
                  opacity="0.45"
                  stroke="#8d706c"
                  stroke-dasharray="3 3"
                  stroke-width="1.2"
                />
                <polygon
                  :points="shape"
                  :fill="`url(#radar-${type.key})`"
                  :stroke="type.accent"
                  stroke-width="2.5"
                />
                <circle
                  v-for="(a, i) in axes"
                  :key="`node-${i}`"
                  :cx="a.nx"
                  :cy="a.ny"
                  :fill="type.accent"
                  r="4.5"
                />
                <text
                  v-for="(a, i) in axes"
                  :key="`label-${i}`"
                  :x="a.x"
                  :y="a.y"
                  :text-anchor="a.anchor"
                  class="fill-poke-gray-900 text-[12px] font-bold"
                >
                  {{ a.label }} ({{ a.value }})
                </text>
              </svg>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <div
                class="flex items-center justify-between rounded-xl bg-poke-gray-100 p-2"
              >
                <span class="text-body-sm text-poke-gray-500"
                  >{{ type.name }} Median BST</span
                >
                <span
                  class="text-sm font-bold"
                  :style="{ color: type.accent }"
                  >{{ type.medianBst }}</span
                >
              </div>
              <div
                class="flex items-center justify-between rounded-xl bg-poke-gray-100 p-2"
              >
                <span class="text-body-sm text-poke-gray-500"
                  >Roster Average</span
                >
                <span class="font-bold text-poke-gray-900">{{
                  type.globalBst
                }}</span>
              </div>
            </div>

            <div
              class="rounded-xl bg-poke-gray-100/60 p-4 text-body-sm text-poke-gray-500"
            >
              <span class="font-bold" :style="{ color: type.accent }"
                >Insight:</span
              >
              {{ type.n }} species carry the {{ type.name }} type, with a median
              base stat total of {{ type.medianBst }} against a roster average
              of {{ type.globalBst }}.
            </div>
          </div>

          <div class="flex flex-col gap-6 lg:col-span-7">
            <!-- Advantages panel -->
            <div class="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 5v14M5 12h14" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <h3 class="text-headline-sm font-bold text-poke-gray-900">
                      Offensive &amp; Defensive Advantages
                    </h3>
                    <span class="text-label-sm text-poke-gray-500"
                      >Attacking advantages and innate type resistances</span
                    >
                  </div>
                </div>
                <span
                  class="hidden rounded-full bg-emerald-100 px-4 py-1 text-label-md font-bold text-emerald-800 sm:inline"
                  >Advantage Suite</span
                >
              </div>

              <div
                v-for="g in groups.slice(0, 2)"
                :key="g.id"
                class="flex flex-col gap-2"
              >
                <div class="flex items-center justify-between gap-3">
                  <span
                    class="flex items-center gap-1.5 text-label-md font-bold text-poke-gray-900"
                    >{{ g.title }}</span
                  >
                  <span
                    class="rounded bg-emerald-100/60 px-2 py-0.5 text-xs font-bold text-emerald-800"
                    >{{ g.id === "strong" ? "+2.0× DMG" : "-0.5× TAKEN" }}</span
                  >
                </div>
                <p class="mb-1 text-body-sm text-poke-gray-500">{{ g.note }}</p>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div
                    v-for="it in g.items"
                    :key="it.name"
                    class="flex items-center gap-2 rounded-xl px-3 py-2"
                    :class="it.skin"
                  >
                    <img
                      :src="`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/${it.name.toLowerCase()}.svg`"
                      :alt="it.name"
                      class="h-4 w-4 object-contain"
                    />
                    <span class="text-label-md font-bold">{{ it.name }}</span>
                    <span class="ml-auto text-xs font-bold">{{
                      g.id === "strong" ? "2.0×" : "1⁄2×"
                    }}</span>
                  </div>
                  <p
                    v-if="!g.items.length"
                    class="col-span-full text-body-sm text-poke-gray-400"
                  >
                    None.
                  </p>
                </div>
              </div>
            </div>

            <!-- Vulnerabilities panel -->
            <div class="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-800"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <h3 class="text-headline-sm font-bold text-poke-gray-900">
                      Vulnerabilities &amp; Resistance Penalties
                    </h3>
                    <span class="text-label-sm text-poke-gray-500"
                      >Incoming weaknesses and reduced damage thresholds</span
                    >
                  </div>
                </div>
                <span
                  class="hidden rounded-full bg-red-100 px-4 py-1 text-label-md font-bold text-red-800 sm:inline"
                  >Threat Matrix</span
                >
              </div>

              <div
                v-for="g in groups.slice(2)"
                :key="g.id"
                class="flex flex-col gap-2"
              >
                <div class="flex items-center justify-between gap-3">
                  <span
                    class="flex items-center gap-1.5 text-label-md font-bold text-poke-gray-900"
                    >{{ g.title }}</span
                  >
                  <span
                    class="rounded px-2 py-0.5 text-xs font-bold"
                    :class="
                      g.id === 'weak'
                        ? 'bg-red-100/60 text-red-800'
                        : 'bg-poke-gray-100 text-poke-gray-500'
                    "
                  >
                    {{ g.id === "weak" ? "+2.0× TAKEN" : "-0.5× RESISTED" }}
                  </span>
                </div>
                <p class="mb-1 text-body-sm text-poke-gray-500">{{ g.note }}</p>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div
                    v-for="it in g.items"
                    :key="it.name"
                    class="flex items-center gap-2 rounded-xl px-3 py-2"
                    :class="it.skin"
                  >
                    <img
                      :src="`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/${it.name.toLowerCase()}.svg`"
                      :alt="it.name"
                      class="h-4 w-4 object-contain"
                    />
                    <span class="text-label-md font-bold">{{ it.name }}</span>
                    <span class="ml-auto text-xs font-bold">
                      {{ g.id === "weak" ? "2.0×" : "1⁄2×" }}
                    </span>
                  </div>
                  <p
                    v-if="!g.items.length"
                    class="col-span-full text-body-sm text-poke-gray-400"
                  >
                    None.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Species catalogue -->
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <span
              class="text-label-sm tracking-wider text-poke-gray-500/70 uppercase"
              >Field Catalog</span
            >
            <h2
              class="text-headline-md font-extrabold tracking-tight text-poke-gray-900"
            >
              Notable {{ type.name }}-Type Pokémon ({{ type.n }} Cataloged)
            </h2>
          </div>

          <div
            v-reveal="{ child: true, y: 24 }"
            class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            <RouterLink
              v-for="p in catalog"
              :key="p.id"
              :to="`/pokedex/${p.id}`"
              class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              <div
                class="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]"
                aria-hidden="true"
              >
                <svg fill="currentColor" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <line
                    x1="2"
                    x2="98"
                    y1="50"
                    y2="50"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <circle cx="50" cy="50" r="14" fill="currentColor" />
                </svg>
              </div>
              <div class="relative">
                <div class="flex items-center justify-between">
                  <span class="text-label-md font-bold text-poke-gray-500/70"
                    >#{{ String(p.id).padStart(4, "0") }}</span
                  >
                  <span
                    class="rounded-full bg-poke-gray-100 px-2 py-0.5 text-label-sm text-poke-gray-500"
                    >BST {{ p.bst }}</span
                  >
                </div>
                <div class="my-2 flex h-36 items-center justify-center">
                  <img
                    :src="p.art"
                    :alt="p.name"
                    class="h-28 w-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 md:h-32 md:w-32"
                  />
                </div>
                <h3 class="text-base font-bold text-poke-gray-900">
                  {{ p.name }}
                </h3>
                <p class="mt-0.5 text-body-sm text-poke-gray-500">
                  Ability: {{ p.ability }}
                </p>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
                <span
                  v-for="t in p.types"
                  :key="t"
                  class="rounded-full px-2.5 py-0.5 text-label-sm font-bold"
                  :class="tileSkin[t]"
                >
                  {{ cap(t) }}
                </span>
              </div>
            </RouterLink>
          </div>

          <div class="flex flex-col items-center gap-2 pt-2">
            <button
              v-if="remaining > 0"
              type="button"
              class="rounded-full bg-poke-gray-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-poke-gray-700"
              @click="loadMore"
            >
              Load More
            </button>
            <span class="text-body-sm text-poke-gray-500">
              Showing
              <span class="font-bold text-poke-gray-900">{{
                catalog.length
              }}</span>
              of
              <span class="font-bold text-poke-gray-900">{{
                type.roster.length
              }}</span>
              Pokémon with the {{ type.name }} type
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
