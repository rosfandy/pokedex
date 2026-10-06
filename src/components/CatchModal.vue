<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import gsap from "gsap";
import { ballByKey, berryByKey, catchProbability, candyReward, expReward } from "../data/encounters";

const props = defineProps({
  open: { type: Boolean, default: false },
  pokemon: { type: Object, default: null },
  ballKey: { type: String, default: "poke" },
  berryKey: { type: String, default: null },
});

const emit = defineEmits(["close", "result", "next"]);

const PHASE = { idle: "idle", throwing: "throwing", absorbing: "absorbing", shaking: "shaking", done: "done" };

const phase = ref(PHASE.idle);
const shake = ref(0);
const outcome = ref(null);
const stage = ref(null);
const ball = ref(null);
const sprite = ref(null);
const burst = ref(null);
const stars = ref(null);
const dust = ref(null);
const timeline = ref(null);

const sounds = {
  pop: new Audio("/pokeball_pop.mp3"),
  roll: new Audio("/pokeball_roll.mp3"),
  caught: new Audio("/pokeball_caught.mp3"),
  failed: new Audio("/pokeball_failed.mp3"),
};
sounds.pop.preload = "auto";
sounds.roll.preload = "auto";
sounds.caught.preload = "auto";
sounds.failed.preload = "auto";

function playSound(key) {
  const sound = sounds[key];
  if (!sound) return;
  try {
    sound.currentTime = 0;
    const attempt = sound.play();
    if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
  } catch {
    return;
  }
}

function stopSound(key) {
  const sound = sounds[key];
  if (!sound) return;
  try {
    sound.pause();
    sound.currentTime = 0;
  } catch {
    return;
  }
}

function stopAllSounds() {
  stopSound("pop");
  stopSound("roll");
  stopSound("caught");
  stopSound("failed");
}

const ballInfo = computed(() => ballByKey(props.ballKey));
const berryInfo = computed(() => berryByKey(props.berryKey));
const chance = computed(() =>
  props.pokemon
    ? catchProbability({
        captureRate: props.pokemon.captureRate,
        ballRate: ballInfo.value.rate,
        berryBonus: berryInfo.value?.bonus ?? 0,
      })
    : { pct: 50, label: "Medium" },
);

const shakeDots = computed(() => [1, 2, 3].map((n) => shake.value >= n));

const statusText = computed(() => {
  if (phase.value === PHASE.throwing) return `Deploying ${ballInfo.value.label}...`;
  if (phase.value === PHASE.absorbing) return "Target captured! Absorbing energy...";
  if (phase.value === PHASE.shaking) return `Shake ${shake.value} of 3... Calibrating lock!`;
  if (outcome.value === "caught") return "Gotcha! Target registered!";
  if (outcome.value === "fled") return `${props.pokemon?.name} broke free!`;
  return "Preparing capture capsule...";
});

const exp = computed(() => (props.pokemon ? expReward(props.pokemon.level) : 0));
const candies = computed(() => {
  const base = props.pokemon ? candyReward(props.pokemon.captureRate) : 1;
  return props.berryKey === "pinap" ? base * 2 : base;
});

function stop() {
  if (timeline.value) {
    timeline.value.kill();
    timeline.value = null;
  }
  stopAllSounds();
}

function reset() {
  stop();
  phase.value = PHASE.idle;
  shake.value = 0;
  outcome.value = null;
  if (ball.value) gsap.set(ball.value, { autoAlpha: 0, y: 180, scale: 0.35, rotate: 0 });
  if (sprite.value) gsap.set(sprite.value, { autoAlpha: 1, scale: 1, y: 0, filter: "none" });
  if (burst.value) gsap.set(burst.value, { autoAlpha: 0, scale: 0.1 });
  if (stars.value) gsap.set(stars.value, { autoAlpha: 0, scale: 0.2 });
  if (dust.value) gsap.set(dust.value, { autoAlpha: 0, scale: 0.3 });
}

function run() {
  if (!props.pokemon) return;
  if (
    phase.value === PHASE.throwing ||
    phase.value === PHASE.absorbing ||
    phase.value === PHASE.shaking
  )
    return;
  reset();

  const roll = Math.random() * 100;
  const succeeded = roll <= chance.value.pct;

  const tl = gsap.timeline({
    onComplete: () => {
      phase.value = PHASE.done;
      outcome.value = succeeded ? "caught" : "fled";
      emit("result", {
        outcome: succeeded ? "caught" : "fled",
        pokemon: props.pokemon,
        ball: ballInfo.value,
        pct: chance.value.pct,
      });
    },
  });
  timeline.value = tl;

  phase.value = PHASE.throwing;
  playSound("pop");
  tl.set(ball.value, { autoAlpha: 1 })
    .fromTo(
      ball.value,
      { y: 200, scale: 0.35, rotate: 0 },
      { y: -40, scale: 1, rotate: 540, duration: 0.75, ease: "power2.out" },
    )
    .to(ball.value, { y: 0, duration: 0.2, ease: "power1.in" }, "+=0.05")
    .add(() => {
      phase.value = PHASE.absorbing;
    })
    .to(burst.value, { autoAlpha: 0.95, scale: 1.4, duration: 0.3, ease: "power2.out" }, "<")
    .to(sprite.value, { autoAlpha: 0, scale: 0.08, y: 60, duration: 0.7, ease: "power2.in" }, "<")
    .to(burst.value, { autoAlpha: 0, scale: 1.9, duration: 0.4 }, ">-0.1")
    .to(ball.value, { y: 40, duration: 0.6, ease: "bounce.out" }, "<")
    .add(() => {
      phase.value = PHASE.shaking;
    });

  for (let i = 1; i <= 3; i += 1) {
    tl.add(() => {
      shake.value = i;
      playSound("roll");
    })
      .to(ball.value, { rotate: -24, duration: 0.2, ease: "sine.inOut" })
      .to(ball.value, { rotate: 22, duration: 0.2, ease: "sine.inOut" })
      .to(ball.value, { rotate: -13, duration: 0.18, ease: "sine.inOut" })
      .to(ball.value, { rotate: 7, duration: 0.14, ease: "sine.inOut" })
      .to(ball.value, { rotate: 0, duration: 0.1, ease: "sine.out" })
      .to(ball.value, { duration: 0.24 });
  }

  if (succeeded) {
    tl.add(() => {
      stopSound("roll");
      playSound("caught");
    })
      .to(ball.value, { scale: 1.08, duration: 0.25, ease: "back.out(2)" })
      .to(ball.value, { scale: 1, duration: 0.25 })
      .to(stars.value, { autoAlpha: 1, scale: 1.5, rotate: 45, duration: 0.8, ease: "power2.out" }, "<");
  } else {
    tl.add(() => {
      stopSound("roll");
      playSound("failed");
    })
      .to(ball.value, { autoAlpha: 0, scale: 1.3, duration: 0.2 })
      .to(dust.value, { autoAlpha: 0.95, scale: 1.7, duration: 0.6, ease: "power2.out" }, "<")
      .to(sprite.value, { autoAlpha: 1, scale: 1.05, y: 0, duration: 0.5, ease: "back.out(2)" }, "<0.15")
      .to(dust.value, { autoAlpha: 0, duration: 0.4 });
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      reset();
      requestAnimationFrame(run);
    } else {
      stop();
    }
  },
);

onBeforeUnmount(stop);
</script>

<template>
  <div
    v-if="open && pokemon"
    class="fixed inset-0 z-50 flex items-center justify-center bg-poke-gray-900/60 p-4 backdrop-blur-md"
  >
    <div
      class="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-poke-gray-200 bg-white p-6 shadow-2xl md:p-8"
    >
      <div
        class="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
        :style="{ backgroundColor: pokemon.halo }"
      />

      <div
        class="relative z-10 mb-4 flex items-start justify-between border-b border-poke-gray-100 pb-3"
      >
        <div class="flex flex-col">
          <span
            class="flex items-center gap-2 text-[11px] font-bold tracking-wider text-poke-red uppercase"
          >
            <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-poke-red" />
            Capture Sequence
          </span>
          <div class="mt-0.5 flex items-center gap-2">
            <h3 class="text-xl font-extrabold text-poke-gray-900">{{ pokemon.name }}</h3>
            <span
              class="rounded-full bg-poke-gray-100 px-2 py-0.5 font-mono text-xs text-poke-gray-500"
            >
              Lv. {{ pokemon.level }}
            </span>
            <span class="font-mono text-xs font-bold text-poke-red">
              CP {{ pokemon.stats.cp }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-1.5 rounded-full bg-poke-gray-100 px-2.5 py-1 text-xs font-bold text-poke-gray-900"
          >
            <img :alt="ballInfo.label" :src="ballInfo.icon" class="h-4 w-4 object-contain" />
            <span>{{ ballInfo.label }}</span>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-poke-gray-100 text-poke-gray-500 transition-colors hover:bg-poke-gray-200 hover:text-poke-gray-900"
            aria-label="Cancel capture"
            @click="emit('close')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref="stage"
        class="relative z-10 flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-poke-gray-200 bg-gradient-to-b from-poke-gray-50 to-poke-gray-100 p-4"
      >
        <div class="absolute bottom-6 h-8 w-44 scale-y-75 rounded-full bg-poke-gray-900/10 blur-md" />
        <div class="absolute bottom-8 h-3.5 w-32 rounded-full bg-poke-gray-900/15 blur-sm" />

        <img
          ref="sprite"
          :alt="`${pokemon.name} target`"
          :src="pokemon.art"
          class="pointer-events-none relative z-10 h-40 w-40 object-contain"
        />

        <div
          ref="burst"
          class="pointer-events-none absolute z-20 h-36 w-36 rounded-full bg-gradient-to-r from-red-500/80 via-white to-red-400/80 opacity-0 blur-md"
        />
        <div
          ref="dust"
          class="pointer-events-none absolute z-20 h-40 w-40 rounded-full bg-slate-200/90 opacity-0 blur-lg"
        />
        <div
          ref="stars"
          class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0"
        >
          <span class="text-5xl text-amber-400">★</span>
          <span class="absolute -translate-y-10 translate-x-8 text-4xl text-emerald-400">✦</span>
          <span class="absolute -translate-x-10 -translate-y-6 text-4xl text-poke-red">✦</span>
        </div>

        <img
          ref="ball"
          :alt="ballInfo.label"
          :src="ballInfo.icon"
          class="pointer-events-none absolute z-30 h-14 w-14 object-contain opacity-0 drop-shadow-xl"
        />

        <div
          class="absolute bottom-3 z-30 flex items-center gap-2 rounded-full bg-poke-gray-900/90 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="outcome === 'fled' ? 'bg-rose-400' : 'animate-ping bg-emerald-300'"
          />
          <span>{{ statusText }}</span>
        </div>
      </div>

      <div class="relative z-10 mt-4 flex flex-col">
        <div v-if="outcome === null" class="flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs font-bold text-poke-gray-500">
            <span>Locking Capsules Status</span>
            <span class="font-mono text-poke-red">
              {{ phase === PHASE.shaking ? "Locking in progress..." : "Charging..." }}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(on, i) in shakeDots"
              :key="i"
              class="h-2 overflow-hidden rounded-full bg-poke-gray-200"
            >
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="i === 2 ? 'bg-emerald-500' : 'bg-poke-red'"
                :style="{ width: on ? '100%' : '0%' }"
              />
            </div>
          </div>
        </div>

        <div v-else-if="outcome === 'caught'" class="flex flex-col gap-3">
          <div
            class="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-black text-white shadow-md"
              >
                ✓
              </div>
              <div>
                <h4 class="text-sm font-bold tracking-wider text-emerald-700 uppercase">
                  Gotcha!
                </h4>
                <p class="text-xs font-semibold text-poke-gray-900">
                  {{ pokemon.name }} was caught with a {{ ballInfo.label }}!
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-right">
              <div
                class="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-poke-red"
              >
                +{{ exp }} EXP
              </div>
              <div
                class="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-emerald-600"
              >
                +{{ candies }} Candies
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-poke-red py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-poke-red/90"
              @click="emit('next')"
            >
              Next Encounter
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-xl bg-poke-gray-100 px-4 py-2.5 text-sm font-bold text-poke-gray-900 transition-colors hover:bg-poke-gray-200"
              @click="emit('close')"
            >
              Safari Log
            </button>
          </div>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            class="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xl font-black text-white shadow-md"
            >
              ✕
            </div>
            <div>
              <h4 class="text-sm font-bold tracking-wider text-rose-600 uppercase">
                Break Free!
              </h4>
              <p class="text-xs text-poke-gray-500">
                Oh no! {{ pokemon.name }} broke free from the {{ ballInfo.label }}!
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-poke-red py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-poke-red/90"
              @click="run"
            >
              Throw Another Ball
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-xl bg-poke-gray-100 px-4 py-2.5 text-sm font-bold text-poke-gray-900 transition-colors hover:bg-poke-gray-200"
              @click="emit('close')"
            >
              Run Away
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
