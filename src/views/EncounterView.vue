<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import gsap from "gsap";
import EncounterCard from "../components/EncounterCard.vue";
import CatchModal from "../components/CatchModal.vue";
import PokeballLoader from "../components/PokeballLoader.vue";
import { loadRegion, regionByKey } from "../data/adventures";
import { BALLS, BERRIES, ballByKey, catchProbability, drawDeck, expReward, loadLocationPool } from "../data/encounters";

const route = useRoute();
const router = useRouter();

const DECK_SIZE = 6;

const loading = ref(true);
const error = ref("");
const realm = ref(null);
const region = ref(regionByKey(route.params.region));
const pool = ref([]);
const deck = ref([]);
const cursor = ref(0);
const equipped = ref("poke");
const activeBerry = ref(null);
const modalOpen = ref(false);
const dragging = ref(false);
const swipe = ref(0);
const busy = ref(false);
const stage = ref(null);
const card = ref(null);
const toast = ref("");

const counters = ref({ poke: 18, great: 6, ultra: 2 });
const berryCounters = ref({ razz: 5, nanab: 3, pinap: 4 });

const log = ref([]);
const stats = ref({ seen: 0, caught: 0, streak: 0 });
const history = ref([]);
let toastTimer = null;

const current = computed(() => deck.value[cursor.value] ?? null);

const equippedInfo = computed(() => ballByKey(equipped.value));

const chance = computed(() =>
  current.value
    ? catchProbability({
        captureRate: current.value.captureRate,
        ballRate: equippedInfo.value.rate,
        berryBonus: activeBerry.value?.bonus ?? 0,
      })
    : { pct: 50, label: "Medium" },
);

const levelRange = computed(() => {
  const s = realm.value?.species ?? [];
  if (!s.length) return { min: 5, max: 5 };
  const mins = s.map((r) => r.min).filter((n) => n != null);
  const maxs = s.map((r) => r.max).filter((n) => n != null);
  return {
    min: mins.length ? Math.min(...mins) : 5,
    max: maxs.length ? Math.max(...maxs) : 5,
  };
});

function pop(msg) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = "";
  }, 2200);
}

function refillDeck() {
  deck.value = drawDeck(pool.value, levelRange.value, DECK_SIZE);
  cursor.value = 0;
}

async function load(key) {
  loading.value = true;
  error.value = "";
  realm.value = null;
  pool.value = [];
  deck.value = [];
  log.value = [];
  history.value = [];
  region.value = regionByKey(key);
  try {
    const all = await loadRegion(region.value.key);
    const found = all.find((r) => r.slug === route.params.slug);
    if (!found) {
      router.replace({ name: "adventure-region", params: { region: region.value.key } });
      return;
    }
    realm.value = found;
    pool.value = await loadLocationPool(
      region.value.key,
      found.slug,
      found.realm,
      found.species,
    );
    refillDeck();
  } catch {
    error.value = "Could not reach the Pokédex API.";
  } finally {
    loading.value = false;
  }
}

function selectBall(key) {
  const info = ballByKey(key);
  if (info.locked) {
    pop("Master Ball belum tersedia untuk ekspedisi ini.");
    return;
  }
  if (counters.value[key] <= 0) {
    pop(`Stok ${info.label} habis!`);
    return;
  }
  equipped.value = key;
}

function feedBerry(key) {
  if (busy.value || modalOpen.value) return;
  const info = BERRIES.find((b) => b.key === key);
  if (!info) return;
  if (berryCounters.value[key] <= 0) {
    pop(`Stok ${info.label} habis!`);
    return;
  }
  berryCounters.value[key] -= 1;
  activeBerry.value = activeBerry.value?.key === key ? null : info;
  pop(
    activeBerry.value
      ? `${info.label} dilempar — ${info.note}.`
      : `${info.label} diambil kembali.`,
  );
}

function pushLog(entry) {
  log.value = [entry, ...log.value].slice(0, 12);
}

function advance() {
  modalOpen.value = false;
  if (cursor.value + 1 >= deck.value.length) {
    refillDeck();
    pop("Sekawanan baru mendekat.");
  } else {
    cursor.value += 1;
  }
  activeBerry.value = null;
}

function onOpened() {
  busy.value = true;
}

function onResult({ outcome, pokemon }) {
  busy.value = false;
  stats.value.seen += 1;
  if (outcome === "caught") {
    stats.value.caught += 1;
    stats.value.streak += 1;
    pushLog({
      id: `${pokemon.id}-${pokemon.encounteredAt}`,
      name: pokemon.name,
      art: pokemon.art,
      level: pokemon.level,
      cp: pokemon.stats.cp,
      ball: equippedInfo.value.label,
      ballIcon: equippedInfo.value.icon,
      exp: expReward(pokemon.level),
      when: "Just now",
      ok: true,
    });
  } else {
    stats.value.streak = 0;
    history.value = [pokemon, ...history.value].slice(0, 6);
  }
}

function openCatch() {
  if (busy.value || !current.value) return;
  if (counters.value[equipped.value] <= 0) {
    pop(`Stok ${equippedInfo.value.label} habis! Pilih bola lain.`);
    return;
  }
  counters.value[equipped.value] -= 1;
  modalOpen.value = true;
}

function flee() {
  if (busy.value || !current.value) return;
  const gone = current.value;
  history.value = [gone, ...history.value].slice(0, 6);
  stats.value.seen += 1;
  stats.value.streak = 0;
  pushLog({
    id: `${gone.id}-flee-${gone.encounteredAt}`,
    name: gone.name,
    art: gone.art,
    level: gone.level,
    cp: gone.stats.cp,
    ball: "Fled",
    ballIcon: equippedInfo.value.icon,
    exp: 0,
    when: "Just now",
    ok: false,
  });
  if (card.value) {
    gsap.to(card.value, {
      x: -520,
      y: 40,
      rotate: -28,
      autoAlpha: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        advance();
        if (card.value) gsap.set(card.value, { x: 0, y: 0, rotate: 0, autoAlpha: 1 });
      },
    });
  } else {
    advance();
  }
}

function recall() {
  if (busy.value || !history.value.length) {
    pop("Tidak ada Pokémon untuk dipanggil ulang.");
    return;
  }
  const [last, ...rest] = history.value;
  history.value = rest;
  deck.value = [last, ...deck.value];
  cursor.value = 0;
  pop(`${last.name} kembali menghadang.`);
}

let startX = 0;

function onDown(e) {
  if (busy.value || modalOpen.value) return;
  dragging.value = true;
  startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
}

function onMove(e) {
  if (!dragging.value) return;
  const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - startX;
  swipe.value = x;
  if (card.value) gsap.set(card.value, { x, rotate: x * 0.06 });
}

function onUp() {
  if (!dragging.value) return;
  dragging.value = false;
  if (swipe.value > 130) {
    swipe.value = 0;
    if (card.value) gsap.set(card.value, { x: 0, rotate: 0 });
    openCatch();
  } else if (swipe.value < -130) {
    swipe.value = 0;
    flee();
  } else {
    swipe.value = 0;
    if (card.value) {
      gsap.to(card.value, { x: 0, rotate: 0, duration: 0.3, ease: "power3.out" });
    }
  }
}

function onKey(e) {
  if (modalOpen.value) return;
  if (e.key === "ArrowRight") openCatch();
  if (e.key === "ArrowLeft") flee();
  if (e.code === "Space") {
    e.preventDefault();
    feedBerry("razz");
  }
}

watch(() => [route.params.region, route.params.slug], ([r, s]) => {
  if (r && s) load(r);
}, { immediate: true });

onMounted(() => {
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  window.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onUp);
  window.removeEventListener("keydown", onKey);
  clearTimeout(toastTimer);
});
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip font-jakarta">
    <div
      class="pointer-events-none absolute top-0 right-0 z-0 h-[520px] w-[520px] bg-pokeball-watermark"
    />

    <PokeballLoader
      v-if="loading"
      :label="`Tracking wild Pokémon in ${region.label}...`"
      size="h-20 w-20"
    />

    <p
      v-else-if="error"
      class="relative z-10 mx-auto max-w-md pt-32 text-center text-sm font-medium text-poke-gray-500"
    >
      {{ error }}
      <button class="ml-1 underline" @click="load(region.key)">Coba lagi</button>
    </p>

    <main
      v-else-if="realm"
      class="relative z-10 mx-auto w-full max-w-7xl px-6 pt-6 pb-16 sm:px-8 lg:px-12"
    >
      <section class="mb-6 flex flex-col gap-2">
        <div
          class="flex flex-wrap items-center gap-1.5 text-xs font-bold tracking-wide text-poke-gray-500"
        >
          <RouterLink to="/adventure" class="transition-colors hover:text-poke-red">
            Adventures
          </RouterLink>
          <span class="opacity-40">›</span>
          <RouterLink
            :to="`/adventure/${realm.region}`"
            class="transition-colors hover:text-poke-red"
          >
            {{ realm.regionLabel }}
          </RouterLink>
          <span class="opacity-40">›</span>
          <span class="font-bold text-poke-red">{{ realm.realm }}</span>
        </div>

        <div class="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-poke-gray-900">Adventures</h1>
            <p class="mt-0.5 text-xs text-poke-gray-500">
              Scan the tall grass — swipe left to scout ahead, swipe right to deploy capture capsules.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full border px-3 py-1.5 text-xs font-bold"
              :class="realm.tone.badge"
            >
              {{ realm.tag }}
            </span>
            <span
              class="rounded-full bg-poke-gray-100 px-3 py-1.5 font-mono text-xs font-bold text-poke-gray-600"
            >
              {{ realm.version }}
            </span>
            <span
              class="rounded-full bg-poke-gray-100 px-3 py-1.5 font-mono text-xs font-bold text-poke-gray-600"
            >
              Lv. {{ levelRange.min }}–{{ levelRange.max }}
            </span>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        <aside class="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-3">
          <div
            class="relative overflow-hidden rounded-2xl border border-poke-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-poke-gray-900">
              <svg class="h-4 w-4 text-poke-red" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Ball Pocket
            </h2>
            <div class="flex flex-col gap-2">
              <button
                v-for="b in BALLS"
                :key="b.key"
                type="button"
                :disabled="b.locked"
                class="flex cursor-pointer items-center justify-between rounded-xl border border-poke-gray-200 p-2.5 text-left transition-all"
                :class="
                  b.locked
                    ? 'cursor-not-allowed opacity-45'
                    : equipped === b.key
                      ? 'border-poke-red/40 bg-poke-gray-50 ring-2 ring-poke-red'
                      : 'bg-white hover:bg-poke-gray-50'
                "
                @click="selectBall(b.key)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-poke-gray-50 ring-1 ring-poke-gray-200"
                  >
                    <img :alt="b.label" :src="b.icon" class="h-7 w-7 object-contain" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-poke-gray-900">{{ b.label }}</p>
                    <p class="text-[11px] text-poke-gray-500">{{ b.note }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-mono text-sm font-bold" :class="b.tone">
                    {{ b.locked ? "—" : `x${counters[b.key]}` }}
                  </span>
                  <span
                    v-if="equipped === b.key && !b.locked"
                    class="block text-[10px] font-bold tracking-wider text-poke-red uppercase"
                  >
                    Equipped
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div
            class="relative overflow-hidden rounded-2xl border border-poke-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-poke-gray-900">
              <svg class="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 15a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" />
              </svg>
              Berry Pouch
            </h2>
            <div class="flex flex-col gap-2">
              <button
                v-for="b in BERRIES"
                :key="b.key"
                type="button"
                class="flex cursor-pointer items-center justify-between rounded-xl border border-poke-gray-200 p-2.5 text-left transition-all"
                :class="
                  activeBerry?.key === b.key
                    ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-400'
                    : 'bg-white hover:bg-poke-gray-50'
                "
                @click="feedBerry(b.key)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-poke-gray-50 ring-1 ring-poke-gray-200"
                  >
                    <img :alt="b.label" :src="b.icon" class="h-7 w-7 object-contain" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-poke-gray-900">{{ b.label }}</p>
                    <p class="text-[11px] text-poke-gray-500">{{ b.note }}</p>
                  </div>
                </div>
                <span class="font-mono text-sm font-bold text-poke-gray-600">
                  x{{ berryCounters[b.key] }}
                </span>
              </button>
            </div>
            <p class="mt-3 text-[11px] text-poke-gray-500">
              Aktif:
              <span class="font-bold text-emerald-600">
                {{ activeBerry ? activeBerry.label : "None Applied" }}
              </span>
            </p>
          </div>
        </aside>

        <section
          class="order-1 flex flex-col items-center justify-center lg:order-2 lg:col-span-6"
        >
          <div
            ref="stage"
            class="relative flex h-[510px] w-full max-w-[380px] touch-none select-none items-center justify-center"
            @pointerdown="onDown"
          >
            <div
              class="pointer-events-none absolute h-[460px] w-[336px] -translate-y-4 scale-95 rounded-3xl bg-poke-gray-200 opacity-50 shadow-sm"
            />
            <div
              class="pointer-events-none absolute h-[480px] w-[358px] -translate-y-2 scale-[0.98] rounded-3xl bg-poke-gray-100 opacity-70 shadow-sm"
            />

            <div
              v-if="current"
              ref="card"
              class="absolute z-10 w-full cursor-grab will-change-transform active:cursor-grabbing"
            >
              <EncounterCard :pokemon="current" :catch-pct="chance.pct" />
            </div>

            <div
              class="pointer-events-none absolute top-8 left-6 z-30 rotate-[-18deg] rounded-lg border-4 border-rose-500 bg-white/90 px-4 py-1 text-base font-black tracking-wider text-rose-500 uppercase shadow-lg backdrop-blur-sm transition-opacity duration-150"
              :style="{ opacity: swipe < -30 ? Math.min(1, Math.abs(swipe + 30) / 100) : 0 }"
            >
              Flee / Skip
            </div>
            <div
              class="pointer-events-none absolute top-8 right-6 z-30 rotate-[18deg] rounded-lg border-4 border-emerald-500 bg-white/90 px-4 py-1 text-base font-black tracking-wider text-emerald-500 uppercase shadow-lg backdrop-blur-sm transition-opacity duration-150"
              :style="{ opacity: swipe > 30 ? Math.min(1, (swipe - 30) / 100) : 0 }"
            >
              Catch It!
            </div>
          </div>

          <div class="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              class="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-poke-gray-500 shadow-md transition-transform hover:scale-105 hover:bg-poke-gray-100 active:scale-95"
              title="Recall last fled species"
              @click="recall"
            >
              <svg class="h-4 w-4 transition-transform group-hover:-rotate-45" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              class="group flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white text-rose-500 shadow-lg transition-all hover:scale-110 hover:bg-rose-50 active:scale-95"
              title="Flee from encounter [Left Arrow]"
              @click="flee"
            >
              <svg class="h-7 w-7 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
              </svg>
            </button>

            <button
              type="button"
              class="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-poke-red to-orange-400 text-white shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Throw ball [Right Arrow or Swipe Right]"
              @click="openCatch"
            >
              <img
                :alt="equippedInfo.label"
                :src="equippedInfo.icon"
                class="h-10 w-10 object-contain drop-shadow"
              />
              <span
                class="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-white/30 opacity-40"
              />
            </button>

            <button
              type="button"
              class="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-500 shadow-md transition-all hover:scale-110 hover:bg-emerald-50 active:scale-95"
              title="Throw Razz Berry [Spacebar]"
              @click="feedBerry('razz')"
            >
              <img alt="Razz Berry" :src="BERRIES[0].icon" class="h-7 w-7 object-contain" />
            </button>

            <button
              type="button"
              class="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-poke-gray-500 shadow-md transition-transform hover:scale-105 hover:bg-poke-gray-100 active:scale-95"
              title="Inspect encounter pool"
              @click="pop(`${pool.length} species terdeteksi di ${realm.realm}.`)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5zm4 0v14" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <p class="mt-4 text-center font-mono text-xs font-semibold text-poke-gray-400">
            Encounter
            <span class="font-bold text-poke-gray-700">{{ cursor + 1 }}</span>
            <span class="text-poke-gray-300">/</span>
            <span>{{ deck.length }}</span>
            <span class="ml-2 text-poke-gray-400">• {{ pool.length }} species pool</span>
          </p>
        </section>

        <aside class="order-3 flex flex-col gap-4 lg:col-span-3">
          <div
            class="relative overflow-hidden rounded-2xl border border-poke-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-poke-gray-900">
              <svg class="h-4 w-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
              Session
            </h2>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="rounded-xl bg-poke-gray-50 p-2">
                <span class="block font-mono text-lg font-bold text-poke-gray-900">
                  {{ stats.seen }}
                </span>
                <span class="text-[10px] font-bold tracking-wider text-poke-gray-500 uppercase">
                  Seen
                </span>
              </div>
              <div class="rounded-xl bg-emerald-50 p-2">
                <span class="block font-mono text-lg font-bold text-emerald-600">
                  {{ stats.caught }}
                </span>
                <span class="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                  Caught
                </span>
              </div>
              <div class="rounded-xl bg-amber-50 p-2">
                <span class="block font-mono text-lg font-bold text-amber-600">
                  {{ stats.streak }}
                </span>
                <span class="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                  Streak
                </span>
              </div>
            </div>
          </div>

          <div
            class="relative overflow-hidden rounded-2xl border border-poke-gray-200 bg-white p-5 shadow-sm"
          >
            <div class="mb-3 flex items-center justify-between">
              <h2 class="flex items-center gap-2 text-sm font-bold text-poke-gray-900">
                <svg class="h-4 w-4 text-sky-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M4 7h16v13H4zM4 7l4-3h8l4 3M9 12h6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Recent Catches
              </h2>
              <span
                class="rounded-full bg-poke-gray-100 px-2 py-0.5 text-[10px] font-bold text-poke-gray-500"
              >
                {{ stats.caught }} in inventory
              </span>
            </div>

            <div v-if="log.length" class="flex max-h-[360px] flex-col gap-2.5 overflow-y-auto pr-1">
              <div
                v-for="item in log"
                :key="item.id"
                class="flex items-center justify-between rounded-xl border border-poke-gray-200 bg-poke-gray-50 p-2 transition-colors hover:bg-poke-gray-100"
              >
                <div class="flex items-center gap-2.5">
                  <img
                    :alt="`${item.name} avatar`"
                    :src="item.art"
                    class="h-10 w-10 object-contain drop-shadow-sm"
                  />
                  <div>
                    <p class="text-sm font-bold text-poke-gray-900">{{ item.name }}</p>
                    <div class="flex items-center gap-1.5 text-[10px] text-poke-gray-500">
                      <span>Lv. {{ item.level }}</span>
                      <span>•</span>
                      <span>CP {{ item.cp }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="flex items-center justify-end gap-1 font-mono text-[11px] font-bold"
                    :class="item.ok ? 'text-emerald-600' : 'text-rose-500'"
                  >
                    <img
                      v-if="item.ok"
                      :alt="item.ball"
                      :src="item.ballIcon"
                      class="h-3.5 w-3.5 object-contain"
                    />
                    {{ item.ball }}
                  </span>
                  <span class="block text-[10px] text-poke-gray-400">
                    {{ item.ok ? `+${item.exp} EXP` : "Escaped" }}
                  </span>
                </div>
              </div>
            </div>

            <p v-else class="py-8 text-center text-xs text-poke-gray-400">
              Belum ada tangkapan. Lemparkan bola ke Pokémon liar.
            </p>
          </div>
        </aside>
      </div>
    </main>

    <CatchModal
      :open="modalOpen"
      :pokemon="current"
      :ball-key="equipped"
      :berry-key="activeBerry?.key ?? null"
      @close="modalOpen = false"
      @result="onResult"
      @next="advance"
    />

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-3"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0 translate-y-3"
    >
      <div
        v-if="toast"
        class="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-poke-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-2xl"
      >
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>
