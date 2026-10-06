<script setup>
import PokeballIcon from "./PokeballIcon.vue";
import { RouterLink } from "vue-router";

defineProps({
  label: { type: String, required: true },
  meta: { type: String, default: "" },
  to: { type: String, default: "#" },
  variant: { type: String, default: "green" },
});

const skin = {
  green: "bg-poke-green shadow-card-green",
  red: "bg-poke-red shadow-card-red",
  blue: "bg-poke-blue shadow-card-blue",
  yellow: "bg-poke-yellow shadow-card-yellow",
  purple: "bg-poke-purple shadow-card-purple",
  brown: "bg-poke-brown shadow-card-brown",
};
</script>

<template>
  <RouterLink
    :to="to"
    class="category-card group relative overflow-hidden rounded-2xl p-5 text-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    :class="skin[variant]"
  >
    <div class="relative z-10 flex h-16 flex-col justify-between sm:h-20">
      <span class="text-base font-bold tracking-wide sm:text-xl">{{
        label
      }}</span>
      <span class="text-[11px] font-medium tracking-wider text-white/80 uppercase">
        {{ meta }}
      </span>
    </div>
    <PokeballIcon
      class="card-pokeball-overlay absolute -right-[15px] top-1/2 h-28 w-28 -translate-y-1/2 opacity-[0.22] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1/2 group-hover:rotate-[25deg] group-hover:scale-110 group-hover:opacity-[0.32]"
    />
  </RouterLink>
</template>
