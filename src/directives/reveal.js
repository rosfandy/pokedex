import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const reveal = {
  mounted(el, binding) {
    if (REDUCED) return;
    const {
      y = 30,
      duration = 0.7,
      delay = 0,
      stagger = 0.07,
      child = false,
    } = binding.value || {};
    const targets = child ? Array.from(el.children) : [el];
    if (!targets.length) return;

    const anim = gsap.from(targets, {
      autoAlpha: 0,
      y,
      duration,
      delay,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
        // A trigger mounted below the fold is never evaluated until something
        // scrolls, which leaves the panel stuck at autoAlpha 0 forever.
        invalidateOnRefresh: true,
      },
      onComplete: () => gsap.set(targets, { clearProps: "all" }),
    });
    // Belt and braces: if the trigger never fires (mounted after the layout has
    // already settled), stamp the final state ourselves.
    anim.scrollTrigger?.refresh();
    el.__reveal = anim;
  },
  unmounted(el) {
    el.__reveal?.scrollTrigger?.kill();
    el.__reveal?.kill();
  },
};

export const smoothScrollTo = (target, duration = 0.8) => {
  if (REDUCED) {
    window.scrollTo(0, typeof target === "number" ? target : 0);
    return;
  }
  gsap.to(window, {
    scrollTo: { y: target, autoKill: true },
    duration,
    ease: "power2.inOut",
  });
};

export function interceptAnchors() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hash.length < 2) return;
    const el = document.querySelector(a.hash);
    if (!el) return;
    e.preventDefault();
    if (REDUCED) return el.scrollIntoView();
    gsap.to(window, {
      scrollTo: { y: el, autoKill: true },
      duration: 0.9,
      ease: "power2.inOut",
    });
  });
}
