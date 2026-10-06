<script setup>
defineProps({
  label: { type: String, default: "Loading..." },
  size: { type: String, default: "h-20 w-20" },
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
    role="status"
    :aria-label="label"
  >
    <div class="relative" :class="size">
      <div
        class="animate-pokeball-shadow absolute bottom-0 left-1/2 h-2.5 w-3/4 rounded-full bg-slate-900 blur-[3px]"
      />
      <svg
        class="animate-pokeball-bounce absolute inset-0 h-full w-full drop-shadow-md"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" fill="#ffffff" />
        <path d="M4 50a46 46 0 0 1 92 0z" fill="#fb6c6c" />
        <rect x="4" y="45" width="92" height="10" fill="#1d2939" />
        <circle cx="50" cy="50" r="15" fill="#1d2939" />
        <circle cx="50" cy="50" r="10.5" fill="#ffffff" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="#1d2939"
          stroke-width="5"
        />
      </svg>
    </div>
    <p class="text-sm font-semibold tracking-wide text-slate-400">
      {{ label }}
    </p>
  </div>
</template>
