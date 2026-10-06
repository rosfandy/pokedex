<script setup>
import { computed } from "vue";

const props = defineProps({
  pokemon: { type: Object, required: true },
  catchPct: { type: Number, default: 50 },
});

const stats = computed(() => [
  { label: "HP", value: props.pokemon.stats.hp, pct: Math.min(100, (props.pokemon.stats.hp / 260) * 100) },
  { label: "ATK", value: props.pokemon.stats.atk, pct: Math.min(100, (props.pokemon.stats.atk / 180) * 100) },
  { label: "DEF", value: props.pokemon.stats.def, pct: Math.min(100, (props.pokemon.stats.def / 180) * 100) },
]);

const catTone = computed(() =>
  props.catchPct > 70
    ? "bg-emerald-500"
    : props.catchPct > 45
      ? "bg-sky-500"
      : "bg-poke-red",
);
</script>

<template>
  <article
    class="relative flex h-[430px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-poke-gray-200 bg-white p-4 shadow-2xl"
  >
    <div
      class="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
      :style="{ backgroundColor: pokemon.halo }"
    />
    <div
      class="pointer-events-none absolute -bottom-10 -right-10 text-poke-gray-900 opacity-[0.04]"
    >
      <svg class="h-72 w-72" fill="currentColor" viewBox="0 0 100 100">
        <path
          d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 12c19.1 0 34.9 13.8 37.6 32H67.4C64.9 37.6 58 32.5 50 32.5s-14.9 5.1-17.4 11.5H12.4C15.1 25.8 30.9 12 50 12zm0 76c-19.1 0-34.9-13.8-37.6-32h20.2c2.5 6.4 9.4 11.5 17.4 11.5s14.9-5.1 17.4-11.5h20.2C84.9 74.2 69.1 88 50 88zm0-30a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
    </div>

    <div class="relative z-10 flex items-center justify-between">
      <div
        class="flex items-center gap-1.5 rounded-full border border-poke-gray-200 bg-poke-gray-50 px-3 py-1 text-[11px] font-bold text-poke-gray-600"
      >
        <svg class="h-3.5 w-3.5 text-poke-red" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.6 11.2 7.3 11.8.4.3 1 .3 1.4 0C13.4 21.2 20 15.2 20 10c0-4.4-3.6-8-8-8zm0 10.5A2.5 2.5 0 1 1 12 7.5a2.5 2.5 0 0 1 0 5z"
          />
        </svg>
        <span class="tracking-wide">{{ pokemon.habitat }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full border border-poke-gray-200 bg-poke-gray-50 px-2.5 py-0.5 font-mono text-xs font-bold text-poke-gray-500"
        >
          Lv. {{ pokemon.level }}
        </span>
        <div
          class="flex items-center gap-1 rounded-full bg-poke-red px-3 py-0.5 font-mono text-xs font-black text-white shadow-sm"
        >
          <span class="text-[10px] font-extrabold text-white/80">CP</span>
          <span>{{ pokemon.stats.cp }}</span>
        </div>
      </div>
    </div>

    <div class="relative z-10 my-auto flex flex-col items-center justify-center">
      <div class="relative flex h-36 w-48 items-center justify-center">
        <div
          class="absolute bottom-2 h-5 w-32 scale-y-75 rounded-full bg-poke-gray-900/10 blur-md"
        />
        <div class="absolute bottom-3 h-2.5 w-24 rounded-full bg-poke-gray-900/15 blur-sm" />
        <img
          :alt="`${pokemon.name} artwork`"
          :src="pokemon.art"
          class="pointer-events-none relative z-10 h-36 w-36 object-contain transition-transform duration-300 hover:scale-105"
          draggable="false"
        />
      </div>

      <div class="mt-0.5 text-center">
        <div class="flex items-center justify-center gap-2">
          <h2 class="text-xl font-extrabold tracking-tight text-poke-gray-900">
            {{ pokemon.name }}
          </h2>
          <span
            class="rounded-full border border-poke-gray-200 bg-poke-gray-50 px-2 py-0.5 font-mono text-[11px] font-bold text-poke-gray-500"
          >
            #{{ String(pokemon.id).padStart(4, "0") }}
          </span>
        </div>
        <p class="mt-0.5 text-[11px] font-medium tracking-wide text-poke-gray-500">
          {{ pokemon.category }}
        </p>
      </div>
    </div>

    <div class="relative z-10 flex flex-col gap-1.5">
      <div class="flex items-center justify-center gap-2">
        <span
          v-for="(t, i) in pokemon.types"
          :key="t"
          class="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ring-1"
          :class="pokemon.typeSkins[i]"
        >
          {{ t }}
        </span>
      </div>

      <div
        class="flex flex-col gap-1.5 rounded-2xl border border-poke-gray-200 bg-poke-gray-50 p-2 shadow-sm"
      >
        <div class="grid grid-cols-3 gap-2 px-1">
          <div v-for="s in stats" :key="s.label" class="flex flex-col gap-1">
            <div class="flex justify-between text-[10px] font-bold text-poke-gray-900">
              <span class="text-poke-gray-500">{{ s.label }}</span>
              <span class="font-mono">{{ s.value }}</span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-poke-gray-200">
              <div
                class="h-full rounded-full bg-poke-red transition-all duration-300"
                :style="{ width: s.pct + '%' }"
              />
            </div>
          </div>
        </div>

        <div
          class="flex flex-col gap-1 rounded-xl border border-poke-gray-200 bg-white p-2"
        >
          <div class="flex items-center justify-between text-[11px] font-bold text-poke-gray-900">
            <span class="flex items-center gap-1 text-poke-gray-500">
              <svg class="h-3 w-3 text-poke-red" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2a10 10 0 1 0 10 10h-4a6 6 0 1 1-6-6V2z"
                />
              </svg>
              Catch Probability
            </span>
            <span class="font-mono font-extrabold">
              {{ catchPct }}%
              <span class="text-poke-gray-400">
                ({{ catchPct > 70 ? "High" : catchPct > 45 ? "Medium" : "Challenging" }})
              </span>
            </span>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-poke-gray-200">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="catTone"
              :style="{ width: catchPct + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
