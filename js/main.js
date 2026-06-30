"use strict";

/** Set up the accessible mobile navigation. */
function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    nav.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("nav-open", willOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

/** Highlight the navigation link for the section currently in view. */
function setupActiveNavigation() {
  const links = [...document.querySelectorAll("[data-nav-link]")];
  if (!links.length || !("IntersectionObserver" in window)) return;

  const linkById = new Map(
    links.map((link) => [link.getAttribute("href").slice(1), link])
  );
  const sections = [...linkById.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      links.forEach((link) => {
        const active = link === linkById.get(visible.target.id);
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-28% 0px -62%", threshold: [0, 0.1, 0.35] }
  );

  sections.forEach((section) => observer.observe(section));
}

/** Reveal content once as it enters the viewport. */
function setupReveal() {
  const items = [...document.querySelectorAll("[data-reveal]")];
  if (!items.length) return;

  items.forEach((item) => item.classList.add("reveal"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 }
  );

  items.forEach((item) => observer.observe(item));
}

/** Replace a broken image with the readable fallback already in its frame. */
function setupImageFallbacks() {
  document.querySelectorAll(".media-frame img").forEach((image) => {
    const showFallback = () => {
      const frame = image.closest(".media-frame");
      if (frame) frame.classList.add("is-missing");
    };

    image.addEventListener("error", showFallback);
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
}

/** Show the CV download only when docs/cv.pdf can be reached. */
async function setupCvLink() {
  const cvLink = document.querySelector("[data-cv-link]");
  if (!cvLink) return;

  try {
    const response = await fetch("docs/cv.pdf", { method: "HEAD" });
    cvLink.hidden = !response.ok;
  } catch {
    cvLink.hidden = true;
  }
}

/** Keep the copyright year current without requiring annual edits. */
function setCurrentYear() {
  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
}

setupMenu();
setupActiveNavigation();
setupReveal();
setupImageFallbacks();
setupCvLink();
setCurrentYear();
