<script setup>
import { RouterLink } from "vue-router";

defineProps({
  generation: { type: Object, required: true },
});
</script>

<template>
  <RouterLink
    :to="`/pokedex/gen/${generation.gen}`"
    class="group relative flex min-h-[290px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    :data-gen="generation.gen"
  >
    <div class="pokeball-watermark" />

    <div class="z-10 flex items-start justify-between">
      <div>
        <h2
          class="text-xl font-bold text-slate-900 transition-colors group-hover:text-poke-red"
        >
          {{ generation.label }}
        </h2>
        <p class="mt-0.5 text-xs font-semibold text-slate-400">
          {{ generation.region }}
        </p>
      </div>
      <span
        class="rounded-full bg-poke-gray-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-slate-600"
      >
        {{ generation.tag }}
      </span>
    </div>

    <div class="z-10 my-auto flex items-center justify-center gap-4 py-5">
      <div
        v-for="(s, i) in generation.starters"
        :key="s.id"
        class="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1.5"
        :style="{ transitionDelay: `${i * 75}ms` }"
      >
        <img
          :src="s.art"
          :alt="s.name"
          loading="lazy"
          class="h-16 w-16 object-contain drop-shadow-md transition-transform duration-200 hover:scale-110 sm:h-20 sm:w-20"
        />
      </div>
    </div>

    <div
      class="z-10 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"
    >
      <span class="font-mono font-bold tracking-wide text-slate-400">
        {{ generation.range }}
      </span>
      <span
        class="inline-flex items-center gap-1 font-bold text-poke-red transition-transform group-hover:translate-x-1"
      >
        Explore →
      </span>
    </div>
  </RouterLink>
</template>
