<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import gsap from "gsap";
import AdventureCard from "../components/AdventureCard.vue";
import PokeballLoader from "../components/PokeballLoader.vue";
import {
  REGIONS,
  adventureShort,
  loadRegion,
  regionByKey,
} from "../data/adventures";

const route = useRoute();
const router = useRouter();

const active = ref(0);
const stage = ref(null);
const cards = ref([]);
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loading = ref(true);
const error = ref("");
const realms = ref([]);
const region = ref(regionByKey(route.params.region));

const setCard = (i) => {
  if (!realms.value.length) return;
  active.value = (i + realms.value.length) % realms.value.length;
};

const prev = () => setCard(active.value - 1);
const next = () => setCard(active.value + 1);

const layout = (animate = true) => {
  const els = cards.value.filter(Boolean);
  if (!els.length) return;
  const n = els.length;
  const mobile = window.innerWidth < 640;

  els.forEach((el, i) => {
    let diff = (i - active.value + n) % n;
    if (diff === n - 1) diff = -1;

    const front = diff === 0;
    const side = diff === -1 || diff === 1;
    const offX = front ? 0 : diff < 0 ? (mobile ? -14 : -28) : mobile ? 14 : 28;
    const state = {
      xPercent: offX,
      y: front ? 0 : 12,
      rotate: front ? 0 : diff < 0 ? -2.5 : 2.5,
      scale: front ? 1 : side ? 0.88 : 0.75,
      autoAlpha: front ? 1 : side ? 0.62 : 0,
      zIndex: front ? 30 : side ? 20 : 10,
    };

    if (animate && !reduce) {
      gsap.to(el, {
        ...state,
        duration: 0.55,
        ease: "power3.out",
        overwrite: true,
      });
    } else {
      gsap.set(el, state);
    }

    el.style.pointerEvents = front || side ? "auto" : "none";

    const shell = el.firstElementChild;
    if (shell) {
      shell.style.cursor = front ? "default" : "pointer";
      shell.style.boxShadow = front
        ? "0 25px 50px -12px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.05)"
        : "0 15px 30px -10px rgba(15,23,42,0.12)";
    }
  });
};

async function load(key) {
  loading.value = true;
  error.value = "";
  active.value = 0;
  realms.value = [];
  region.value = regionByKey(key);
  try {
    realms.value = await loadRegion(region.value.key);
    if (!realms.value.length)
      error.value = "No encounter data for this region.";
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
    await nextTick();
    await nextTick();
    requestAnimationFrame(() => layout(false));
  }
}

function goRegion(key) {
  if (key === region.value.key) return;
  router.replace({ name: "adventure-region", params: { region: key } });
}

onMounted(() => load(route.params.region));

watch(
  () => route.params.region,
  (key) => load(key),
);

watch(active, () => layout(true), { flush: "post" });

const onKey = (e) => {
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
};

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

const reset = () => {
  const el = stage.value;
  if (!el) return;
  layout(true);
};
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip font-jakarta">
    <div
      class="pointer-events-none absolute -top-10 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <PokeballLoader
      v-if="loading"
      :label="`Scouting ${region.label} expedition realms...`"
      size="h-20 w-20"
    />

    <p
      v-else-if="error"
      class="relative z-10 mx-auto max-w-md pt-32 text-center text-sm font-medium text-poke-gray-500"
    >
      {{ error }}
      <button class="ml-1 underline" @click="load(region.key)">Retry</button>
    </p>

    <main
      v-else
      class="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10"
    >
      <header class="mb-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-poke-gray-500 transition-colors hover:text-poke-red"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to Pokédex
          </RouterLink>
          <span
            class="font-mono text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
          >
            {{ region.label }} Expeditions
          </span>
        </div>

        <div class="mx-auto max-w-3xl space-y-1.5 text-center">
          <h1
            class="text-headline-lg font-extrabold tracking-tight text-poke-gray-900 sm:text-headline-xl"
          >
            Adventure Realm
          </h1>
          <p class="text-body-md leading-relaxed text-slate-600">
            Explore {{ realms.length }} wild encounter locations across
            {{ region.label }}
          </p>
        </div>
      </header>

      <div
        class="no-scrollbar mb-6 flex items-center justify-start gap-2 overflow-x-auto pb-1 sm:justify-center"
        role="tablist"
        aria-label="Region"
      >
        <button
          v-for="r in REGIONS"
          :key="r.key"
          type="button"
          role="tab"
          :aria-selected="r.key === region.key"
          class="shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all"
          :class="
            r.key === region.key
              ? 'bg-poke-gray-900 text-white shadow-sm'
              : 'bg-white text-poke-gray-600 ring-1 ring-poke-gray-200 hover:bg-poke-gray-100 hover:text-poke-gray-900'
          "
          @click="goRegion(r.key)"
        >
          {{ r.label }}
        </button>
      </div>

      <section
        ref="stage"
        class="relative mx-auto flex w-full max-w-5xl items-center justify-center pt-2 pb-0"
      >
        <button
          type="button"
          aria-label="Previous realm card"
          class="absolute left-1 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-800 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-slate-50 active:scale-95 sm:left-4 md:left-6"
          @click="prev"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Next realm card"
          class="absolute right-1 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-800 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-slate-50 active:scale-95 sm:right-4 md:right-6"
          @click="next"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div class="relative grid w-full max-w-md place-items-start">
          <div
            v-for="(a, i) in realms"
            :key="a.slug"
            ref="cards"
            class="deck-card col-start-1 row-start-1 w-full will-change-transform"
            :data-card-index="i"
          >
            <AdventureCard :adventure="a" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
