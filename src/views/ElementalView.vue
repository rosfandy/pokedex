<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import ElementTypeCard from "../components/ElementTypeCard.vue";
import PokeballLoader from "../components/PokeballLoader.vue";
import { chipSkin, iconic, pillSkin, typeIcon } from "../data/elementalTypes";

const API = "https://pokeapi.co/api/v2";
const CANONICAL = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "steel",
  "dark",
  "fairy",
];

const loading = ref(true);
const error = ref("");
const types = ref([]);

const cap = (s) => s[0].toUpperCase() + s.slice(1);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const idx = await (await fetch(`${API}/type?limit=100`)).json();
    const list = idx.results.filter((e) => CANONICAL.includes(e.name));
    list.sort((a, b) => CANONICAL.indexOf(a.name) - CANONICAL.indexOf(b.name));
    const pages = await Promise.all(
      list.map((e) => fetch(e.url).then((r) => r.json())),
    );
    types.value = pages.map((d) => {
      const ids = iconic[d.name] || [];
      return {
        key: d.name,
        name: cap(d.name),
        no: CANONICAL.indexOf(d.name) + 1,
        n: d.pokemon.length,
        strong: d.damage_relations.double_damage_to.map((t) => ({
          label: cap(t.name),
          skin: chipSkin[t.name],
        })),
        icon: typeIcon(d.name),
        sprites: ids,
        more: d.pokemon.length - ids.length,
        pillSkin: pillSkin[d.name],
      };
    });
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden font-jakarta">
    <div
      class="pointer-events-none absolute top-0 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <PokeballLoader v-if="loading" label="Scanning elemental types..." />
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
      <div class="flex flex-col pt-8 pb-12">
        <!-- Title & context -->
        <div
          class="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          <div class="max-w-xl">
            <RouterLink
              to="/pokedex"
              class="group mb-4 inline-flex items-center gap-2 text-sm font-semibold text-poke-gray-500 transition-colors hover:text-poke-gray-900"
            >
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:-translate-x-0.5"
              >
                <svg
                  class="h-4 w-4 text-poke-gray-900"
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
              Back to Pokédex
            </RouterLink>
            <h1
              class="text-headline-lg font-extrabold tracking-tight text-poke-gray-900"
            >
              Elemental Types
            </h1>
            <p class="mt-2 text-body-md text-poke-gray-500">
              All 18 elemental affinities in the Pokémon world — offensive
              advantages, defensive resistances, and iconic representative
              species.
            </p>
          </div>
        </div>

        <!-- Type cards -->
        <div
          v-reveal="{ child: true, y: 24 }"
          class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          id="types-grid"
        >
          <ElementTypeCard v-for="t in types" :key="t.key" :type="t" />
        </div>

        <!-- Result meta -->
        <div
          class="mt-6 flex flex-col items-center justify-center gap-3 pt-4 text-center"
        >
          <span class="text-body-sm text-poke-gray-500">
            Showing all
            <span class="font-bold text-poke-gray-900">{{ types.length }}</span>
            of
            <span class="font-bold text-poke-gray-900">18</span>
            Types • Complete Type Registry
          </span>
        </div>
      </div>
    </main>
  </div>
</template>
