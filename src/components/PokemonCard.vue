<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  types: { type: Array, required: true },
  image: { type: String, default: "" },
  color: { type: String, default: "" },
  compact: { type: Boolean, default: false },
});

const skin = {
  grass: "bg-type-grass shadow-card-green",
  fire: "bg-type-fire shadow-card-red",
  water: "bg-type-water shadow-glow-water",
  electric: "bg-type-electric shadow-card-yellow",
  poison: "bg-type-poison shadow-card-green",
  ghost: "bg-type-ghost shadow-card-purple",
  normal: "bg-type-normal shadow-card-brown",
  psychic: "bg-type-psychic shadow-card-red",
  flying: "bg-type-water shadow-card-blue",
  orange: "bg-poke-orange shadow-lg shadow-orange-300/40",
};

const dex = String(props.id).padStart(3, "0");
</script>

<template>
  <RouterLink
    :to="`/pokedex/${props.id}`"
    class="group relative cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl bg-pokeball-overlay"
    :class="[
      skin[color || types[0]] ?? skin.normal,
      compact ? 'flex items-center gap-4' : 'flex flex-col',
    ]"
  >
    <span
      v-if="!compact"
      class="absolute top-3 right-3.5 text-[11px] font-extrabold text-black/15 select-none"
    >
      #{{ dex }}
    </span>

    <div :class="compact ? 'flex-1' : 'flex flex-col justify-between'">
      <h3
        class="font-extrabold tracking-tight text-white"
        :class="compact ? 'text-base' : 'text-lg'"
      >
        {{ name }}
      </h3>
      <div
        class="flex gap-1.5"
        :class="compact ? 'mt-1.5' : 'mt-2 flex-col items-start'"
      >
        <span
          v-for="type in types"
          :key="type"
          class="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-sm"
        >
          {{ type }}
        </span>
      </div>
    </div>

    <div :class="compact ? 'shrink-0' : 'flex items-end justify-end pt-1'">
      <img
        :src="image"
        :alt="name"
        loading="lazy"
        class="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
        :class="compact ? 'h-12 w-12' : 'h-24 w-24'"
        @error="(e) => e.target.remove()"
      />
    </div>
  </RouterLink>
</template>
