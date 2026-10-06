<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import PokemonCard from "../components/PokemonCard.vue";
import PokeballLoader from "../components/PokeballLoader.vue";
import { generationByGen } from "../data/generations";

const API = "https://pokeapi.co/api/v2";
const PAGE = 16;

const route = useRoute();
const router = useRouter();
const generation = computed(() => generationByGen(route.params.gen));

const filters = [
  { label: "All", value: "", skin: "" },
  {
    label: "Grass",
    value: "grass",
    skin: "bg-type-grass/15 text-type-grass-ink hover:bg-type-grass/25",
  },
  {
    label: "Fire",
    value: "fire",
    skin: "bg-type-fire/15 text-type-fire-ink hover:bg-type-fire/25",
  },
  {
    label: "Water",
    value: "water",
    skin: "bg-type-water/15 text-type-water-ink hover:bg-type-water/25",
  },
  {
    label: "Electric",
    value: "electric",
    skin: "bg-type-electric/20 text-type-electric-ink hover:bg-type-electric/35",
  },
  {
    label: "Poison",
    value: "poison",
    skin: "bg-type-poison/15 text-type-poison-ink hover:bg-type-poison/25",
  },
  {
    label: "Ghost",
    value: "ghost",
    skin: "bg-type-ghost/15 text-type-ghost-ink hover:bg-type-ghost/25",
  },
  {
    label: "Normal",
    value: "normal",
    skin: "bg-slate-200/60 text-slate-600 hover:bg-slate-200",
  },
];

const idleChip =
  "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50";
const activeChip = "bg-slate-900 text-white shadow-sm";

const query = ref("");
const type = ref("");
const view = ref("grid");
const shown = ref(PAGE);

const index = ref([]);
const total = ref(0);
const details = ref(new Map());

const loading = ref(true);
const loadingMore = ref(false);
const error = ref("");

const idOf = (url) => Number(url.split("/").filter(Boolean).pop());

const toCard = (d) => ({
  id: d.id,
  name: d.name[0].toUpperCase() + d.name.slice(1),
  types: d.types.map((t) => t.type.name),
  image: d.sprites?.other?.["official-artwork"]?.front_default ?? "",
  ...(d.id === 26 ? { color: "orange" } : null),
});

const inflight = new Set();

async function fill() {
  await Promise.all(
    filtered.value
      .slice(0, shown.value)
      .filter(
        (e) => !details.value.has(idOf(e.url)) && !inflight.has(idOf(e.url)),
      )
      .map((e) => {
        const id = idOf(e.url);
        inflight.add(id);
        return fetch(e.url)
          .then((r) => r.json())
          .then((d) => details.value.set(id, toCard(d)))
          .finally(() => inflight.delete(id));
      }),
  );
}

async function loadIndex() {
  const gen = generation.value;
  if (!gen) return router.replace({ name: "pokedex" });
  loading.value = true;
  error.value = "";
  details.value = new Map();
  try {
    const span = gen.to - gen.from + 1;
    const d = await (
      await fetch(`${API}/pokemon?limit=${span}&offset=${gen.from - 1}`)
    ).json();
    index.value = d.results;
    total.value = d.results.length;
    if (type.value) {
      const t = await (await fetch(`${API}/type/${type.value}`)).json();
      const inType = new Set(t.pokemon.map((e) => idOf(e.pokemon.url)));
      index.value = index.value.filter((e) => inType.has(idOf(e.url)));
    }
    shown.value = PAGE;
    await fill();
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loadingMore.value) return;
  loadingMore.value = true;
  try {
    shown.value += PAGE;
    await fill();
  } finally {
    loadingMore.value = false;
  }
}

const nameIndex = ref(null); // cached {name,url}[] for partial matching
const exact = ref(null); // raw /pokemon/{query} payload, if the name matched
const searching = ref(false);
const searchResults = ref(null);
let debounce = null;

async function searchPoke(q) {
  const gen = generation.value;
  if (!gen) return;
  searching.value = true;
  const hits = [];
  try {
    try {
      const d = await (await fetch(`${API}/pokemon/${q}`)).json();
      if (d && d.id && d.id >= gen.from && d.id <= gen.to) {
        exact.value = d;
        details.value.set(d.id, toCard(d));
        hits.push({ name: d.name, url: `${API}/pokemon/${d.id}/` });
      } else {
        exact.value = null;
      }
    } catch {
      exact.value = null; // 404 for most partial words; not an error worth showing
    }

    if (!nameIndex.value) {
      const d = await (await fetch(`${API}/pokemon?limit=100000`)).json();
      nameIndex.value = d.results;
    }
    for (const e of nameIndex.value) {
      const id = idOf(e.url);
      if (id < gen.from || id > gen.to) continue;
      if (!e.name.includes(q)) continue;
      if (hits.some((h) => h.name === e.name)) continue;
      hits.push(e);
    }
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    searchResults.value = hits;
    shown.value = PAGE;
    searching.value = false;
    fill();
  }
}

watch(query, (q) => {
  clearTimeout(debounce);
  const term = q.trim().toLowerCase();
  if (!term) {
    searchResults.value = null;
    exact.value = null;
    shown.value = PAGE;
    return;
  }
  if (term.length < 2) return; // one letter matches almost everything
  debounce = setTimeout(() => searchPoke(term), 300);
});

const filtered = computed(() => {
  if (searchResults.value) return searchResults.value;
  return index.value;
});

const visible = computed(() =>
  filtered.value
    .slice(0, shown.value)
    .map((e) => details.value.get(idOf(e.url)))
    .filter(Boolean),
);
const remaining = computed(() => filtered.value.length - shown.value);
const countLabel = computed(() => filtered.value.length);
const isSearching = computed(() => searchResults.value !== null);
const canLoadMore = computed(
  () =>
    !isSearching.value &&
    !loading.value &&
    !loadingMore.value &&
    remaining.value > 0,
);

watch([() => route.params.gen, type], loadIndex, { immediate: true });
watch([filtered, shown], fill);
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden font-jakarta">
    <div
      class="pointer-events-none absolute top-0 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <main
      class="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-14 sm:px-8 lg:px-10"
    >
      <section class="mb-6">
        <div class="mb-3 flex items-center justify-between">
          <div
            class="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase"
          >
            <RouterLink
              to="/pokedex"
              class="inline-flex items-center gap-1.5 transition-colors hover:text-poke-red"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Back to Pokédex
            </RouterLink>
            <span>/</span>
            <span class="text-slate-600">{{ generation?.tag ?? "GEN" }}</span>
          </div>

          <div
            class="flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm"
          >
            <button
              class="rounded-xl p-2 transition-colors"
              :class="
                view === 'grid'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              "
              title="Grid View"
              aria-label="Grid View"
              @click="view = 'grid'"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"
                />
              </svg>
            </button>
            <button
              class="rounded-xl p-2 transition-colors"
              :class="
                view === 'list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              "
              title="List View"
              aria-label="List View"
              @click="view = 'list'"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          class="flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <h1
              class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              {{ generation?.label ?? "Pokedex" }}
            </h1>
            <p class="mt-1.5 text-sm font-medium text-slate-500">
              {{ generation?.region }} — National Dex
              {{ generation?.range }}
            </p>
          </div>

          <div class="w-full md:w-72">
            <div class="relative">
              <input
                v-model="query"
                type="text"
                placeholder="Search Pokémon, type, ability..."
                class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm font-medium shadow-sm transition-all placeholder:text-slate-400 focus:border-poke-red focus:ring-2 focus:ring-poke-red/40 focus:outline-none"
              />
              <svg
                class="absolute top-3 left-3 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto py-3"
        >
          <button
            v-for="f in filters"
            :key="f.label"
            class="shrink-0 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors"
            :class="type === f.value ? activeChip : f.skin || idleChip"
            @click="type = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </section>

      <div
        class="gap-5"
        :class="
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'flex flex-col'
        "
      >
        <PokemonCard
          v-for="p in visible"
          :key="p.id"
          v-bind="p"
          :compact="view === 'list'"
          v-reveal="{ y: 26, duration: 0.55 }"
        />

        <PokeballLoader
          v-if="(loading || searching) && !visible.length"
          class="col-span-full"
          :label="searching ? 'Searching the Pokédex…' : 'Catching Pokémon...'"
          size="h-20 w-20"
        />

        <div
          v-for="n in loadingMore ? PAGE : 0"
          :key="`sk${n}`"
          class="h-[184px] animate-pulse rounded-2xl bg-slate-200/70"
        />
      </div>

      <p
        v-if="error"
        class="py-16 text-center text-sm font-medium text-poke-red"
      >
        {{ error }}
        <button class="ml-1 underline" @click="loadIndex">Retry</button>
      </p>
      <p
        v-else-if="!visible.length && !loading && !searching"
        class="py-16 text-center text-sm font-medium text-slate-400"
      >
        {{ isSearching ? "No Pokémon match that search." : "No Pokémon here yet." }}
      </p>

      <div class="mt-10 flex flex-col items-center justify-center gap-2.5">
        <button
          v-if="canLoadMore"
          class="rounded-full bg-slate-900 px-7 py-3 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
          :disabled="loadingMore"
          @click="loadMore()"
        >
          Load More Pokémon
        </button>
        <span
          v-if="visible.length"
          class="text-xs font-semibold text-slate-400"
        >
          Showing {{ visible.length }} of {{ countLabel }} Pokémon
        </span>
      </div>
    </main>
  </div>
</template>
