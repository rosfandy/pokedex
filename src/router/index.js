import { createRouter, createWebHistory } from "vue-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import HomeView from "../views/HomeView.vue";
import PokedexView from "../views/PokedexView.vue";
import PokedexDetailView from "../views/PokedexDetailView.vue";
import ElementalView from "../views/ElementalView.vue";
import ElementalDetailView from "../views/ElementalDetailView.vue";
import GenerationsView from "../views/GenerationsView.vue";
import { smoothScrollTo } from "../directives/reveal";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: DefaultLayout,
      children: [
        { path: "", name: "home", component: HomeView },
        { path: "pokedex", name: "pokedex", component: GenerationsView },
        {
          path: "pokedex/gen/:gen",
          name: "pokedex-generation",
          component: PokedexView,
        },
        {
          path: "pokedex/:id",
          name: "pokedex-detail",
          component: PokedexDetailView,
        },
        { path: "elemental", name: "elemental", component: ElementalView },
        {
          path: "elemental/:type",
          name: "elemental-detail",
          component: ElementalDetailView,
        },
      ],
    },
  ],
});

router.beforeResolve((to) => {
  if (!to.matched.length) return { name: "home" };
});

router.afterEach((to, from) => {
  ScrollTrigger.refresh();
  if (to.path !== from.path) smoothScrollTo(0);
});

export default router;
