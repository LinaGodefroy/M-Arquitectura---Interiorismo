import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const overlay = document.querySelector("#menu-overlay");
  const closeBtn = overlay?.querySelector("[data-menu-close]");
  if (!toggle || !overlay) return;

  const open = () => overlay.classList.add("is-open");
  const close = () => overlay.classList.remove("is-open");

  toggle.addEventListener("click", () => {
    overlay.classList.contains("is-open") ? close() : open();
  });
  closeBtn?.addEventListener("click", close);
  overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  // Accordion items (Arquitectura / Interiorismo expand into their 3 áreas)
  overlay.querySelectorAll("[data-accordion-toggle]").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.classList.toggle("is-open", !isOpen);
    });
  });
}

// Splits an element's text into one <span class="word-animate"> per word,
// so each word can be staggered in individually (adapted from the
// "digital serenity" word-appear pattern, without the per-word blur filter).
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "word-animate";
    span.textContent = word;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  el.style.opacity = "1";

  // Optional forced line break on mobile only (data-break-after="3" breaks
  // after the 3rd word) — hidden from `sm:` up, where the line is fluid/nowrap.
  const breakAfter = parseInt(el.dataset.breakAfter, 10);
  if (!Number.isNaN(breakAfter)) {
    const wordSpans = el.querySelectorAll(".word-animate");
    const target = wordSpans[breakAfter - 1];
    if (target) {
      const br = document.createElement("br");
      br.className = "sm:hidden";
      target.after(br);
    }
  }

  return el.querySelectorAll(".word-animate");
}

// Soft glow that follows the pointer inside the hero only (not the whole page).
function setupHeroGlow(hero) {
  const glow = hero.querySelector("#hero-glow");
  if (!glow) return;
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    glow.style.left = `${e.clientX - r.left}px`;
    glow.style.top = `${e.clientY - r.top}px`;
    glow.style.opacity = "1";
  });
  hero.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
  });
}

// A small ripple on click, confined to the hero.
function setupHeroRipple(hero) {
  hero.addEventListener("click", (e) => {
    const r = hero.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "hero-ripple";
    ripple.style.left = `${e.clientX - r.left}px`;
    ripple.style.top = `${e.clientY - r.top}px`;
    hero.appendChild(ripple);
    setTimeout(() => ripple.remove(), 900);
  });
}

function setupMotion() {
  const mm = gsap.matchMedia();

  // Full motion for people who haven't asked for less
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero entrance: eyebrow and headline reveal word by word, then the
    // subtitle fades in as a block — a toned-down, on-brand take on the
    // "digital serenity" word-appear effect, in our palette.
    const hero = document.querySelector("[data-hero-intro]");
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      hero.querySelectorAll("[data-split-words]").forEach((el) => {
        const words = splitWords(el);
        tl.fromTo(
          words,
          { autoAlpha: 0, y: 30, scale: 0.85, filter: "blur(10px)" },
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.045, ease: "power2.out" }
        );
      });

      const rest = hero.querySelectorAll("[data-hero-item]:not([data-split-words])");
      if (rest.length) {
        tl.fromTo(rest, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9 }, "-=0.2");
      }

      // Underline that grows under the headline once the words have landed,
      // adapted from the reference prompt's text-decoration-animate.
      const underline = hero.querySelector("#hero-underline");
      if (underline) {
        tl.fromTo(underline, { width: "0%" }, { width: "100%", duration: 1, ease: "power2.out" }, "-=0.1");
      }

      setupHeroGlow(hero);
      setupHeroRipple(hero);
    }

    // Project reveals: stagger in as they enter the viewport
    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      const items = group.querySelectorAll(".reveal");
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: group,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Lone reveals outside a group
    document.querySelectorAll(".reveal:not([data-reveal-group] .reveal)").forEach((el) => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });
  });

  // Reduced motion: show everything immediately, no scroll-tied animation,
  // no pointer-following glow or ripples.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".reveal, [data-hero-item], [data-split-words]", { autoAlpha: 1, y: 0 });
    gsap.set("#hero-underline", { width: "100%" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupMotion();
});
