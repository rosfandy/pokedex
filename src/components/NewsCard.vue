<script setup>
defineProps({
  tag: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, default: "" },
  alt: { type: String, default: "" },
  variant: { type: String, default: "blue" }, // green | yellow | red | purple
});

const skin = {
  green: "text-poke-green bg-poke-green/10",
  yellow: "text-poke-yellow-dark bg-poke-yellow/10",
  red: "text-poke-red bg-poke-red/10",
  blue: "text-poke-blue bg-poke-blue/10",
  purple: "text-poke-purple bg-poke-purple/10",
};
</script>

<template>
  <article
    class="group flex items-center justify-between rounded-2xl border border-gray-100/90 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md"
  >
    <div class="flex-1 space-y-2 pr-4">
      <span
        class="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase"
        :class="skin[variant]"
      >
        {{ tag }}
      </span>
      <h3
        class="text-base leading-snug font-bold text-gray-900 transition-colors group-hover:text-poke-blue"
      >
        {{ title }}
      </h3>
      <p class="text-xs font-medium text-gray-400">{{ date }}</p>
    </div>
    <div class="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
      <img
        v-if="image"
        :src="image"
        :alt="alt"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="(e) => (e.target.style.visibility = 'hidden')"
      />
    </div>
  </article>
</template>
