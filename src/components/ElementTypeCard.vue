<script setup>
import { spriteUrl } from "../data/elementalTypes";
import { RouterLink } from "vue-router";

defineProps({
  type: { type: Object, required: true },
});
</script>

<template>
  <RouterLink :to="`/elemental/${type.key}`" class="group relative block h-full">
    <article
      class="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 group-hover:shadow-xl"
      :data-type="type.key"
    >
      <div class="flex flex-col gap-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105"
            >
              <img
                :src="type.icon"
                :alt="`${type.name} Type`"
                class="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h3
                class="text-base font-bold text-poke-gray-900 transition-colors group-hover:text-poke-red-dark"
              >
                {{ type.name }}
              </h3>
              <span class="text-label-sm text-poke-gray-500/60">
                Type #{{ String(type.no).padStart(2, "0") }} • {{ type.n }}
                Species
              </span>
            </div>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-label-sm font-bold tracking-wider uppercase"
            :class="type.pillSkin"
          >
            {{ type.name }}
          </span>
        </div>

        <div class="flex flex-col gap-1.5">
          <span
            class="text-label-sm font-semibold tracking-wider text-poke-gray-500/60 uppercase"
            >Effective vs:</span
          >
          <!-- Fixed two-line height: every card occupies the same box no matter
               how many affinity chips a type has. -->
          <div
            class="flex min-h-11 flex-wrap content-start items-start gap-1 text-[11px] font-bold"
          >
            <span
              v-if="!type.strong.length"
              class="rounded-full bg-slate-200 px-2 py-0.5 text-slate-800"
            >
              None (Neutral)
            </span>
            <span
              v-for="t in type.strong"
              :key="t.label"
              class="rounded-full px-2 py-0.5"
              :class="t.skin"
            >
              {{ t.label }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="mt-4 flex items-center justify-between border-t border-poke-gray-200 pt-3"
      >
        <span class="text-label-sm text-poke-gray-500/60">Iconic Pokémon</span>
        <div class="flex -space-x-1.5 items-center">
          <img
            v-for="id in type.sprites"
            :key="id"
            :src="spriteUrl(id)"
            :alt="`Dex ${id}`"
            class="h-6 w-6 rounded-full bg-poke-gray-100 p-0.5 object-contain"
          />
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full bg-poke-gray-100 text-[10px] font-bold text-poke-gray-500"
          >
            +{{ type.more }}
          </span>
        </div>
      </div>
    </article>
  </RouterLink>
</template>
