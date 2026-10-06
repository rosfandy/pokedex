<script setup>
import { RouterLink } from "vue-router";
import GenerationCard from "../components/GenerationCard.vue";
import { generations } from "../data/generations";
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip font-jakarta">
    <div
      class="pointer-events-none absolute top-0 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <main
      class="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10"
    >
      <div class="flex flex-col pt-8 pb-12">
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
          <span class="text-slate-600">Generations</span>
        </div>

        <div
          class="mb-6 flex flex-col justify-between gap-4 border-b border-poke-gray-200 pb-5 sm:flex-row sm:items-baseline"
        >
          <div>
            <h1
              class="text-headline-lg font-extrabold tracking-tight text-poke-gray-900"
            >
              Pokémon Generations
            </h1>
            <p class="mt-1.5 text-body-md text-slate-500">
              Browse Pokémon by release region and starter trios
            </p>
          </div>
          <div
            class="self-start rounded-full border border-slate-200/60 bg-poke-gray-100/70 px-3.5 py-1.5 text-xs font-bold text-slate-500 sm:self-auto"
          >
            {{ generations.length }} Generations Cataloged
          </div>
        </div>

        <section
          v-reveal="{ child: true, y: 24 }"
          class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <GenerationCard
            v-for="g in generations"
            :key="g.gen"
            :generation="g"
          />
        </section>
      </div>
    </main>
  </div>
</template>
