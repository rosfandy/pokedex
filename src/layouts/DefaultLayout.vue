<template>
  <div class="flex min-h-screen flex-col">
    <div class="relative flex-1 py-4">
      <RouterView />
    </div>

    <footer
      class="relative z-10 border-t border-poke-gray-200/70 bg-white py-6"
    >
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs font-medium text-poke-gray-500 sm:flex-row sm:px-8 lg:px-10"
      >
        <div class="font-semibold text-poke-gray-800">PokéDex</div>
        <div class="text-center sm:text-right">© 2026 PokéDex Catalog.</div>
      </div>
    </footer>
  </div>
</template>
