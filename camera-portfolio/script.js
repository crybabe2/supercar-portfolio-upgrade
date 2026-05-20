document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canUsePointerMotion = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1041px)");
const revealTargets = [...document.querySelectorAll(".reveal")];
const progressLinks = [...document.querySelectorAll(".progress-rail a")];
const progressSections = progressLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const scrollProgressBar = document.querySelector(".scroll-progress span");

const staggerSelectors = [
  ".section-header",
  ".thesis-body",
  ".info-card",
  ".insight-card",
  ".research-note",
  ".bridge-note",
  ".design-key",
  ".process-step",
  ".object-copy",
  ".detail-visual",
  ".callout-card",
  ".design-detail-card",
  ".dimension-card",
  ".spec-card",
  ".scenario-card",
  ".archive-copy",
  ".archive-frame",
  ".next-step",
].join(",");

revealTargets.forEach((section) => {
  if (section.classList.contains("hero")) return;
  [...section.querySelectorAll(staggerSelectors)].forEach((item, index) => {
    item.classList.add("stagger-item");
    item.style.setProperty("--stagger-index", String(Math.min(index, 10)));
  });
});

function markVisible(target) {
  target.classList.add("is-visible");
}

if (prefersReducedMotion.matches) {
  revealTargets.forEach(markVisible);
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) markVisible(entry.target);
      });
    },
    { threshold: 0.14 }
  );
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach(markVisible);
}

const progressObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      progressLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
);

progressSections.forEach((section) => progressObserver.observe(section));

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const safeProgress = Math.min(1, Math.max(0, progress));
  document.documentElement.style.setProperty("--page-progress", safeProgress.toFixed(4));
  if (scrollProgressBar) scrollProgressBar.style.transform = `scaleX(${safeProgress})`;
}

let progressFrame = 0;
function queueScrollProgress() {
  if (progressFrame) return;
  progressFrame = window.requestAnimationFrame(() => {
    updateScrollProgress();
    progressFrame = 0;
  });
}

window.addEventListener("scroll", queueScrollProgress, { passive: true });
window.addEventListener("resize", queueScrollProgress);
updateScrollProgress();

document.querySelectorAll(".product-frame").forEach((frame) => {
  if (prefersReducedMotion.matches || !canUsePointerMotion.matches) return;

  let tiltFrame = 0;
  let pointerPosition = null;

  function applyTilt() {
    if (!pointerPosition) return;
    const { x, y } = pointerPosition;
    const tiltX = (0.5 - y) * 5;
    const tiltY = (x - 0.5) * 7;

    frame.classList.add("is-tilting");
    frame.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    frame.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    frame.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
    frame.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
    tiltFrame = 0;
  }

  frame.addEventListener("pointermove", (event) => {
    const rect = frame.getBoundingClientRect();
    pointerPosition = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
    if (!tiltFrame) tiltFrame = window.requestAnimationFrame(applyTilt);
  });

  frame.addEventListener("pointerleave", () => {
    if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    pointerPosition = null;
    frame.classList.remove("is-tilting");
    frame.style.removeProperty("--tilt-x");
    frame.style.removeProperty("--tilt-y");
    frame.style.removeProperty("--glow-x");
    frame.style.removeProperty("--glow-y");
  });
});

const processTimeline = document.querySelector(".process-timeline");
const processSection = document.querySelector("#process");
const processSteps = [...document.querySelectorAll(".process-step")];

if (processTimeline && prefersReducedMotion.matches) {
  processTimeline.style.setProperty("--timeline-progress", "1");
  processSteps.forEach((step) => step.classList.add("is-active"));
} else if (processTimeline && "IntersectionObserver" in window) {
  const timelineObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) processTimeline.style.setProperty("--timeline-progress", "1");
    },
    { rootMargin: "-12% 0px -42% 0px", threshold: 0.08 }
  );
  timelineObserver.observe(processSection || processTimeline);

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { rootMargin: "-10% 0px -16% 0px", threshold: 0.16 }
  );
  processSteps.forEach((step) => stepObserver.observe(step));
} else {
  processTimeline?.style.setProperty("--timeline-progress", "1");
  processSteps.forEach((step) => step.classList.add("is-active"));
}

const hotspots = [...document.querySelectorAll(".hotspot")];
const calloutCards = [...document.querySelectorAll(".callout-card[data-hotspot]")];

function setHotspotState(key, isActive) {
  [...hotspots, ...calloutCards].forEach((item) => {
    item.classList.toggle("is-active", Boolean(isActive && item.dataset.hotspot === key));
  });
}

[...hotspots, ...calloutCards].forEach((item) => {
  const key = item.dataset.hotspot;
  item.addEventListener("mouseenter", () => setHotspotState(key, true));
  item.addEventListener("mouseleave", () => setHotspotState(key, false));
  item.addEventListener("focus", () => setHotspotState(key, true));
  item.addEventListener("blur", () => setHotspotState(key, false));
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxPrev = lightbox?.querySelector(".lightbox-prev");
const lightboxNext = lightbox?.querySelector(".lightbox-next");
const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
const lightboxCount = lightbox?.querySelector(".lightbox-count");
const galleryItems = [...document.querySelectorAll("[data-lightbox]")].map((frame) => {
  const image = frame.querySelector("img");
  const caption = frame.querySelector("figcaption")?.textContent?.trim();
  return { image, caption: caption || image?.alt || "" };
});
let currentLightboxIndex = 0;
let closeTimer = 0;

function updateLightbox(index) {
  const item = galleryItems[index];
  if (!item?.image || !lightboxImage) return;
  currentLightboxIndex = index;
  lightboxImage.src = item.image.currentSrc || item.image.src;
  lightboxImage.alt = item.image.alt;
  if (lightboxCaption) lightboxCaption.textContent = item.caption || item.image.alt;
  if (lightboxCount) {
    lightboxCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
  }
}

function openLightbox(index) {
  if (!lightbox || !lightboxImage) return;
  window.clearTimeout(closeTimer);
  updateLightbox(index);
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  window.requestAnimationFrame(() => lightbox.classList.add("is-open"));
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("is-open");
  document.body.classList.remove("lightbox-open");
  closeTimer = window.setTimeout(() => {
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  }, prefersReducedMotion.matches ? 0 : 280);
}

function shiftLightbox(direction) {
  if (!lightbox || lightbox.hidden || galleryItems.length < 2) return;
  const nextIndex = (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
  updateLightbox(nextIndex);
}

galleryItems.forEach((item, index) => {
  item.image?.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => shiftLightbox(-1));
lightboxNext?.addEventListener("click", () => shiftLightbox(1));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") shiftLightbox(-1);
  if (event.key === "ArrowRight") shiftLightbox(1);
});
