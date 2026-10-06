<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import PokemonCard from "../components/PokemonCard.vue";
import PokeballLoader from "../components/PokeballLoader.vue";

const API = "https://pokeapi.co/api/v2";
const PAGE = 16;

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
// The mock only ever renders the selected pill as dark, so reuse that for types.
const activeChip = "bg-slate-900 text-white shadow-sm";

const query = ref("");
const type = ref("");
const view = ref("grid");
const shown = ref(PAGE);

// Everything loaded so far. Grows by PAGE per Load More — never preloaded.
const index = ref([]);
const total = ref(0);
// Full name list, fetched only on the first keystroke of a search. PokeAPI has
// no name-search endpoint, so filtering has to be local — but only on demand.
const searchPool = ref(null);
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
  // Raichu is rendered orange in the mock, unlike its Electric type colour.
  ...(d.id === 26 ? { color: "orange" } : null),
});

// Details for whatever is on screen now, minus anything already fetched or still
// in flight. `inflight` matters because fill() runs both from the [filtered,
// shown] watcher and from loadIndex(), which would otherwise double every request.
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

// Browse mode asks for one page at a time. Type filtering needs the whole type
// list (that is how the API works), but its details are still fetched per page.
async function loadIndex() {
  loading.value = true;
  error.value = "";
  try {
    const url = type.value
      ? `${API}/type/${type.value}`
      : `${API}/pokemon?limit=${PAGE}`;
    const d = await (await fetch(url)).json();
    index.value = type.value ? d.pokemon.map((e) => e.pokemon) : d.results;
    total.value = type.value ? d.pokemon.length : d.count;
    shown.value = PAGE;
    await fill();
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
  }
}

// Load More: fetch the next PAGE of *names* from the API, then their details.
// Typing a search, or filtering by type, only re-slices what is already local.
async function loadMore() {
  if (loadingMore.value) return;
  loadingMore.value = true;
  try {
    if (!query.value.trim() && !type.value) {
      const d = await (
        await fetch(`${API}/pokemon?limit=${PAGE}&offset=${index.value.length}`)
      ).json();
      index.value = index.value.concat(d.results);
      total.value = d.count;
    }
    shown.value += PAGE;
    await fill();
  } finally {
    loadingMore.value = false;
  }
}

// Fetch the full name list once, the first time a search is actually typed.
watch(query, async (q) => {
  if (!q.trim() || searchPool.value) return;
  try {
    const d = await (await fetch(`${API}/pokemon?limit=100000`)).json();
    searchPool.value = d.results;
  } catch {
    searchPool.value = []; // search stays limited to what is already loaded
  }
  shown.value = PAGE;
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const src = q && searchPool.value ? searchPool.value : index.value;
  return src.filter((e) => !q || e.name.includes(q));
});

const visible = computed(() =>
  filtered.value
    .slice(0, shown.value)
    .map((e) => details.value.get(idOf(e.url)))
    .filter(Boolean),
);
const remaining = computed(() => {
  // Browsing counts against the API's total, not just the pages already loaded.
  const searching = !!query.value.trim();
  return (searching ? filtered.value.length : total.value) - shown.value;
});
// Browsing reports the API total; a search reports its own match count.
const countLabel = computed(() =>
  query.value.trim() ? filtered.value.length : total.value,
);

watch(type, loadIndex, { immediate: true });
watch(query, () => (shown.value = PAGE));
// New page, new filter, or typed search — fetch only the still-missing details.
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
          <RouterLink
            to="/"
            class="group inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-transform group-hover:-translate-x-0.5"
            >
              <svg
                class="h-5 w-5 text-slate-800"
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
            </span>
            <span class="hidden sm:inline">Back to Categories</span>
          </RouterLink>

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
              Pokedex
            </h1>
            <p class="mt-1.5 text-sm font-medium text-slate-500">
              Search for Pokémon by name or explore by national Pokédex index.
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

        <!-- Bouncing Pokéball while the first details are in flight -->
        <PokeballLoader
          v-if="loading && !visible.length"
          class="col-span-full"
          label="Catching Pokémon..."
          size="h-20 w-20"
        />

        <!-- Skeletons while the next batch of details is in flight -->
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
        v-else-if="!visible.length && !loading"
        class="py-16 text-center text-sm font-medium text-slate-400"
      >
        No Pokémon match that search.
      </p>

      <div class="mt-10 flex flex-col items-center justify-center gap-2.5">
        <button
          v-if="remaining > 0"
          class="rounded-full bg-slate-900 px-7 py-3 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
          :disabled="loadingMore"
          @click="loadMore()"
        >
          Load More Pokémon
        </button>
        <span class="text-xs font-semibold text-slate-400">
          Showing {{ visible.length }} of {{ countLabel }} Pokémon
        </span>
      </div>
    </main>
  </div>
</template>
