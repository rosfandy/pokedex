<script setup>
import { RouterLink } from "vue-router";

defineProps({
  adventure: { type: Object, required: true },
});
</script>

<template>
  <article
    class="relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white select-none"
    :class="adventure.tone.card"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-80"
      :class="adventure.tone.contour"
    />
    <div
      class="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl"
      :class="adventure.tone.tint"
    />

    <div class="relative flex h-full flex-col justify-between p-6">
      <div>
        <div class="mb-3 flex items-center justify-between gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold"
            :class="adventure.tone.badge"
          >
            <svg
              class="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                v-if="adventure.icon === 'forest'"
                d="M12 3l6 9h-4l5 7H5l5-7H6l6-9z"
              />
              <path
                v-else-if="adventure.icon === 'nightlight'"
                d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
              />
              <path v-else d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 6a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
            {{ adventure.tag }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            :class="[
              adventure.dangerTone === 'emerald'
                ? 'bg-emerald-50 text-emerald-700'
                : adventure.dangerTone === 'amber'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60',
            ]"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="[
                adventure.dangerTone === 'emerald'
                  ? 'bg-emerald-500'
                  : adventure.dangerTone === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-rose-500',
                adventure.dangerPulse ? 'animate-ping' : '',
              ]"
            />
            {{ adventure.danger }}
          </span>
        </div>

        <div class="mb-4">
          <span
            class="font-mono text-[10px] font-bold tracking-wider uppercase"
            :class="adventure.tone.meta"
          >
            {{ adventure.kicker }}
          </span>
          <h2
            class="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900"
          >
            {{ adventure.realm }}
          </h2>
          <p class="mt-1 truncate text-xs text-slate-500">
            {{ adventure.blurb }}
          </p>
        </div>
      </div>

      <div class="my-1">
        <div
          class="mb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
        >
          <span>{{ adventure.encounterLabel }}</span>
          <span
            class="font-mono text-[11px] font-bold lowercase"
            :class="adventure.tone.encounter"
          >
            {{ adventure.encounterMeta }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <RouterLink
            v-for="p in adventure.encounters"
            :key="p.id"
            :to="`/pokedex/${p.id}`"
            class="group flex flex-col items-center rounded-2xl bg-slate-50/70 p-2.5 transition-all hover:bg-white hover:shadow-md"
          >
            <img
              :src="p.art"
              :alt="p.name"
              loading="lazy"
              class="h-14 w-14 object-contain drop-shadow-sm transition-transform group-hover:scale-110"
            />
            <span class="mt-1.5 text-[11px] font-bold text-slate-800">
              {{ p.name }}
            </span>
            <span
              class="text-center font-mono text-[9px] font-semibold"
              :class="p.raritySkin"
            >
              {{ p.rarity }}
            </span>
          </RouterLink>
        </div>
      </div>

      <div
        class="mt-1 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5"
      >
        <div class="flex items-center gap-4 text-xs">
          <template v-for="(s, i) in adventure.specs" :key="s.label">
            <div v-if="i" class="h-7 w-px bg-slate-200" />
            <div>
              <span
                class="block text-[9px] font-medium tracking-wider text-slate-400 uppercase"
              >
                {{ s.label }}
              </span>
              <span
                class="font-mono text-xs font-bold"
                :class="
                  s.tone === 'emerald'
                    ? 'text-emerald-800'
                    : s.tone === 'indigo'
                      ? 'text-indigo-800'
                      : s.tone === 'rose'
                        ? 'text-rose-700'
                        : s.tone === 'purple'
                          ? 'text-purple-900'
                          : 'text-slate-700'
                "
              >
                {{ s.value }}
              </span>
            </div>
          </template>
        </div>
        <RouterLink
          :to="`/adventure/${adventure.region}/${adventure.slug}`"
          class="group flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg"
          :class="adventure.tone.button"
        >
          {{ adventure.cta || "Begin Adventure" }}
          <svg
            class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </RouterLink>
      </div>
    </div>
  </article>
</template>
