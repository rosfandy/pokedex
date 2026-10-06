<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import PokeballLoader from "../components/PokeballLoader.vue";
import { loadRegion, rarityLabel, regionByKey } from "../data/adventures";

const API = "https://pokeapi.co/api/v2";
const PAGE = 24;

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref("");
const realm = ref(null);
const region = ref(regionByKey(route.params.region));
const shown = ref(PAGE);
const detail = ref(new Map());

const visible = computed(() =>
  realm.value
    ? realm.value.species.slice(0, shown.value).map((r) => ({
        ...r,
        art:
          detail.value.get(r.id) ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${r.id}.png`,
        types: detail.value.get(`t${r.id}`) || [],
      }))
    : [],
);

const remaining = computed(() =>
  realm.value ? realm.value.species.length - shown.value : 0,
);
const canLoadMore = computed(() => !loading.value && remaining.value > 0);

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

async function loadTypes(rows) {
  await Promise.all(
    rows
      .filter((r) => !detail.value.has(`t${r.id}`))
      .map((r) =>
        fetch(`${API}/pokemon/${r.id}`)
          .then((res) => res.json())
          .then((d) => {
            detail.value.set(
              `t${r.id}`,
              d.types.map((t) => cap(t.type.name)),
            );
            detail.value.set(
              r.id,
              d.sprites?.other?.["official-artwork"]?.front_default || "",
            );
          })
          .catch(() => {}),
      ),
  );
  detail.value = new Map(detail.value);
}

async function load() {
  loading.value = true;
  error.value = "";
  realm.value = null;
  shown.value = PAGE;
  detail.value = new Map();
  region.value = regionByKey(route.params.region);
  try {
    const all = await loadRegion(region.value.key);
    const found = all.find((r) => r.slug === route.params.slug);
    if (!found) {
      router.replace({ name: "adventure-region", params: { region: region.value.key } });
      return;
    }
    realm.value = found;
    await loadTypes(found.species.slice(0, PAGE));
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
  }
}

watch(() => [route.params.region, route.params.slug], load, { immediate: true });

async function loadMore() {
  const next = realm.value.species.slice(shown.value, shown.value + PAGE);
  shown.value += PAGE;
  await loadTypes(next);
}
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip font-jakarta">
    <div
      class="pointer-events-none absolute top-0 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <PokeballLoader v-if="loading" label="Mapping the encounter table..." size="h-20 w-20" />

    <p
      v-else-if="error"
      class="relative z-10 mx-auto max-w-md pt-32 text-center text-sm font-medium text-poke-gray-500"
    >
      {{ error }}
      <button class="ml-1 underline" @click="load">Retry</button>
    </p>

    <main
      v-else-if="realm"
      class="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10"
    >
      <div class="pt-8 pb-12">
        <div
          class="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase"
        >
          <RouterLink
            to="/"
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
          <RouterLink
            :to="`/adventure/${realm.region}`"
            class="transition-colors hover:text-poke-red"
          >
            {{ realm.regionLabel }}
          </RouterLink>
          <span>/</span>
          <span class="text-slate-600">{{ realm.realm }}</span>
        </div>

        <div
          class="mb-6 flex flex-col justify-between gap-4 border-b border-poke-gray-200 pb-5 sm:flex-row sm:items-baseline"
        >
          <div>
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span
                class="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                :class="realm.tone.badge"
              >
                {{ realm.tag }}
              </span>
              <span
                class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600"
              >
                {{ realm.danger }}
              </span>
              <span
                class="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600"
              >
                {{ realm.version }}
              </span>
            </div>
            <h1
              class="text-headline-lg font-extrabold tracking-tight text-poke-gray-900"
            >
              {{ realm.realm }}
            </h1>
            <p class="mt-1.5 text-body-md text-slate-500">
              {{ realm.species.length }} species across
              {{ realm.areas.length }}
              {{ realm.areas.length === 1 ? "area" : "areas" }}
            </p>
          </div>
          <div class="flex gap-3">
            <div
              v-for="s in realm.specs"
              :key="s.label"
              class="rounded-xl border border-poke-gray-200 bg-white px-4 py-2.5"
            >
              <span
                class="block text-[10px] font-bold tracking-wider text-slate-400 uppercase"
              >
                {{ s.label }}
              </span>
              <span class="font-mono text-sm font-bold text-poke-gray-900">
                {{ s.value }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-reveal="{ child: true, y: 24 }"
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          <RouterLink
            v-for="p in visible"
            :key="p.id"
            :to="`/pokedex/${p.id}`"
            class="group flex flex-col overflow-hidden rounded-2xl border border-poke-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="relative flex items-center justify-center bg-poke-gray-50 py-4"
            >
              <img
                :src="p.art"
                :alt="p.name"
                loading="lazy"
                class="h-24 w-24 object-contain drop-shadow-sm transition-transform group-hover:scale-110"
              />
              <span
                class="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold text-poke-gray-500"
              >
                #{{ String(p.id).padStart(3, "0") }}
              </span>
            </div>
            <div class="flex flex-col gap-1.5 p-3.5">
              <h3
                class="truncate text-sm font-bold text-poke-gray-900 transition-colors group-hover:text-poke-red"
              >
                {{ p.name }}
              </h3>
              <div v-if="p.types.length" class="flex flex-wrap gap-1">
                <span
                  v-for="t in p.types"
                  :key="t"
                  class="rounded-full bg-poke-gray-100 px-2 py-0.5 text-[10px] font-bold text-poke-gray-600"
                >
                  {{ t }}
                </span>
              </div>
              <span class="font-mono text-[10px] font-semibold text-slate-500">
                {{ rarityLabel(p) }}
              </span>
              <span class="truncate text-[10px] text-slate-400">
                {{ p.method }}
              </span>
            </div>
          </RouterLink>
        </div>

        <p
          v-if="!visible.length"
          class="py-16 text-center text-sm font-medium text-slate-400"
        >
          No species recorded in this area for {{ realm.version }}.
        </p>

        <div class="mt-10 flex flex-col items-center justify-center gap-2.5">
          <button
            v-if="canLoadMore"
            class="cursor-pointer rounded-full bg-slate-900 px-7 py-3 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
            @click="loadMore"
          >
            Load More Species
          </button>
          <span
            v-if="visible.length"
            class="text-xs font-semibold text-slate-400"
          >
            Showing {{ visible.length }} of {{ realm.species.length }} species
          </span>
        </div>
      </div>
    </main>
  </div>
</template>
