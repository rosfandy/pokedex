<script setup>
import { ref } from "vue";
import CategoryCard from "../components/CategoryCard.vue";
import NewsCard from "../components/NewsCard.vue";
import PokeballIcon from "../components/PokeballIcon.vue";

const query = ref("");

const categories = [
  { label: "Pokedex", meta: "1025 Pokémon", to: "/pokedex", variant: "green" },
  {
    label: "Elemental",
    meta: "18 Type Affinities",
    to: "/elemental",
    variant: "brown",
  },
  {
    label: "Adventure",
    meta: "10 Regions • 700+ Realms",
    to: "/adventure",
    variant: "blue",
  },
];

const popular = [
  { label: "Pikachu", variant: "green" },
  { label: "Charizard", variant: "red" },
  { label: "Water Gun", variant: "blue" },
  { label: "Master Ball", variant: "yellow" },
];

const news = [
  {
    tag: "Mobile Game",
    title: "Pokémon Rumble Rush Arrives Soon",
    date: "15 May 2019",
    variant: "green",
    alt: "Pokémon Rumble Rush Artwork",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdxqWo8oAEXORriQgY_p3S11pLl_tN_VfQ1YFdycLfviRhbJXnLgCdXYsua0mJohiCPfEaP-HG1qwTdQ2IU-sm5r647U97juiRqHp-nlpkzBNlaMqcca-CwwGCgbcDSKxCGayGdsXpvWM3nRflM96McePZ0amlP_dtxaq3zdFqiqzQ_fPFkJzGhyN7CWLFDTKmkf5jgqngqVOzqnDViJzsGKGboVIs2L5kfwt33kadQsQ9wkwSWhon1g",
  },
  {
    tag: "Movie Crossover",
    title: "Detective Pikachu Sleuths into Pokémon GO",
    date: "10 May 2019",
    variant: "yellow",
    alt: "Detective Pikachu in Pokémon GO",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDW0rPwqQwB6lcyz-dAM0lVMTgvMEARn1BEW00Wg7z171x_300REwPFOP9PnipvuWHMuE2e8TaB_-mqOdDzxTjE7vYEUE9_a-7JOvoImnW41mJbCPmxnW4sUb5kQIOARfECRP8qADMBE4kfTp3-_Vs5LUDhXgg0xi0FUMHwmSO7CL5Y_hUyIGtydkfAANQN7usEED76ruPbZB_wg_Zc-N8OILG8-KmPML41R-ET7VTMz-eKuqtpxVxxkQ",
  },
  {
    tag: "Championship",
    title: "World Championships Format and Rules Revealed",
    date: "18 May 2019",
    variant: "red",
    alt: "Pokémon Championship Trophy",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIoHfO9njltpkMctNlE5GI2vVrNaVQpfWfwhKWoAN3S2mO4tUbLzrH5F--Ijo2CBxhSRSHGZKd6r5L_ntZIAM5bUEwSekibR9tr8ZODLrmZZFp128SWaI9Ql3zp2wo4FoGaY5BGsihsKIYTfukwqmxjmqixXc2LEYjtPFFVo3nOro_JFeykpmOaP5OXYXa8Xzi20SQo849iMHHdAwq97wQUBgrJxEh2J-BzA_441Cg_RFDQxIH23Fcqw",
  },
  {
    tag: "Special Event",
    title: "Mythical Discovery: Mew Returns to Special Research",
    date: "21 May 2019",
    variant: "purple",
    alt: "Mew Special Research Event",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXIUcHjP0x-73ccGWbMx7ge9794XbJHCv5XtCMNPenTuIVJq89mPXH5vRTzEr_MdYn9JP3hTLJIzqMDmAxfbPmWSEiwUV7XA6o6bzVCXa4aj8V5lQ_bNglnBFi5WcBBU_RhDDhE5Yn7nm25nR_ttvXuD5eQQ-Un-jO03-p7o2qpVJXUZWSAqmlkS0o4mWTIg10rf1BCQNi2uoPvo3PzbVnvn3K5xJuC_pfU_Uc35f5f3CWIWzEEEr6Mg",
  },
];

const chipSkin = {
  green: "hover:border-poke-green hover:text-poke-green",
  red: "hover:border-poke-red hover:text-poke-red",
  blue: "hover:border-poke-blue hover:text-poke-blue",
  yellow: "hover:border-poke-yellow hover:text-poke-yellow",
};

function submit() {
  console.log("search:", query.value);
}
</script>

<template>
  <PokeballIcon
    class="bg-pokeball-watermark absolute -top-20 -right-20 h-[480px] w-[480px] text-poke-dark-text opacity-[0.035]"
  />

  <main
    class="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 lg:px-10"
  >
    <!-- Hero & search -->
    <section
      v-reveal="{ child: true, y: 36, stagger: 0.1 }"
      class="mx-auto max-w-3xl pt-3 pb-8 text-left md:text-center"
    >
      <h1
        class="mb-6 text-3xl leading-tight font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
      >
        What Pokemon<br class="hidden sm:inline" />
        are you looking for?
      </h1>

      <div class="relative mx-auto max-w-xl">
        <form
          class="relative flex w-full items-center"
          @submit.prevent="submit"
        >
          <div class="pointer-events-none absolute left-6 text-gray-400">
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
              />
            </svg>
          </div>
          <input
            v-model="query"
            type="text"
            aria-label="Search Pokemon, Move, Ability etc"
            placeholder="Search Pokemon, Move, Ability etc"
            class="w-full rounded-full border border-gray-100/80 bg-white py-4 pr-28 pl-16 text-base font-medium text-gray-800 shadow-pill transition-all duration-200 placeholder:text-gray-400 focus:border-poke-blue focus:ring-4 focus:ring-poke-blue/20 focus:outline-none sm:py-5 sm:text-lg"
          />
          <button
            type="submit"
            class="absolute right-3.5 hidden items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-poke-blue sm:inline-flex"
          >
            Search
          </button>
        </form>

        <div
          class="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-500"
        >
          <span class="font-normal text-gray-400">Popular searches:</span>
          <a
            v-for="chip in popular"
            :key="chip.label"
            href="#"
            class="rounded-full border border-gray-200 bg-white px-2.5 py-1 transition-colors"
            :class="chipSkin[chip.variant]"
          >
            {{ chip.label }}
          </a>
        </div>
      </div>
    </section>

    <!-- Category cards -->
    <section
      id="categories"
      v-reveal="{ child: true }"
      class="mx-auto my-5 max-w-4xl"
    >
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 sm:gap-5">
        <CategoryCard
          v-for="card in categories"
          :key="card.label"
          v-bind="card"
        />
      </div>
    </section>

    <!-- News -->
    <!-- <section id="news" v-reveal="{ child: true }" class="mx-auto mt-16 max-w-5xl pt-6"> -->
    <!--   <div class="mb-8 flex items-center justify-between border-b border-gray-100 pb-3"> -->
    <!--     <div> -->
    <!--       <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"> -->
    <!--         Pokémon News -->
    <!--       </h2> -->
    <!--       <p class="mt-1 text-xs text-gray-500 sm:text-sm"> -->
    <!--         Updates, events, and releases from the Pokémon franchise -->
    <!--       </p> -->
    <!--     </div> -->
    <!--     <a -->
    <!--       href="#all-news" -->
    <!--       class="group flex items-center text-sm font-bold text-poke-blue transition-colors hover:text-poke-blue-dark" -->
    <!--     > -->
    <!--       View All -->
    <!--       <svg -->
    <!--         class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" -->
    <!--         fill="none" -->
    <!--         stroke="currentColor" -->
    <!--         viewBox="0 0 24 24" -->
    <!--       > -->
    <!--         <path -->
    <!--           d="M9 5l7 7-7 7" -->
    <!--           stroke-linecap="round" -->
    <!--           stroke-linejoin="round" -->
    <!--           stroke-width="2.5" -->
    <!--         /> -->
    <!--       </svg> -->
    <!--     </a> -->
    <!--   </div> -->
    <!---->
    <!--   <div class="grid grid-cols-1 gap-6 md:grid-cols-2"> -->
    <!--     <NewsCard v-for="item in news" :key="item.title" v-bind="item" /> -->
    <!--   </div> -->
    <!-- </section> -->
  </main>
</template>
