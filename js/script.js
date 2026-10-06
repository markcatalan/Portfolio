const navToggle = document.getElementById("navToggle");
const navlinks = document.getElementById("navlinks");
navToggle.addEventListener("click", () => {
  const open = navlinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
navlinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navlinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", false);
  }),
);

// Resolves when the hero intro is nearly done (right away if it doesn't run),
// so animations just below the hero wait their turn instead of competing
let heroIntroDone;
const heroIntro = new Promise((r) => (heroIntroDone = r));

// Hero entrance (GSAP + SplitText)
(function () {
  const root = document.documentElement;
  if (!root.classList.contains("hero-anim")) return heroIntroDone(); // reduced motion
  if (!window.gsap || !window.SplitText) {
    root.classList.remove("hero-anim"); // CDN failed: just show everything
    return heroIntroDone();
  }
  gsap.registerPlugin(SplitText);

  const h1 = document.querySelector(".hero h1");
  const media = document.querySelector(".hero-media");
  const layers = media.querySelectorAll(".hero-layer");
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

  // Split after Fraunces loads so line breaks match the final layout
  fontsReady.then(() => {
    const split = SplitText.create(h1, {
      type: "lines, words",
      linesClass: "hero-line",
      mask: "lines",
    });
    const accentWords = split.words.filter((w) => w.closest(".accent"));
    const plainWords = split.words.filter((w) => !w.closest(".accent"));

    gsap.set(h1, { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        split.revert(); // restore plain text so it reflows on resize
        initParallax();
      },
    });

    tl.from(plainWords, { yPercent: 110, duration: 0.8, stagger: 0.07 })
      .from(
        accentWords,
        { yPercent: 110, duration: 0.9, stagger: 0.09 },
        "-=0.35",
      )
      .from(".hero-copy", { y: 18, autoAlpha: 0, duration: 0.7 }, "-=0.5")
      .from(
        ".hero-actions .btn",
        { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.1 },
        "-=0.45",
      )
      .from(
        layers,
        {
          y: 48,
          rotation: (i) => [-3, 3, -2][i],
          autoAlpha: 0,
          duration: 1,
          stagger: 0.15,
        },
        0.25,
      )
      .from(".hero-media-cap", { y: 10, autoAlpha: 0, duration: 0.5 }, "-=0.4")
      .call(heroIntroDone, null, "-=0.6");
  });

  // Subtle mouse parallax on the stacked windows (desktop pointers only)
  function initParallax() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const depths = [10, 18, 26];
    const movers = [...layers].map((el) => ({
      x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
    }));

    media.addEventListener("pointermove", (e) => {
      const r = media.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      movers.forEach((m, i) => {
        m.x(px * depths[i]);
        m.y(py * depths[i]);
      });
    });
    media.addEventListener("pointerleave", () =>
      movers.forEach((m) => {
        m.x(0);
        m.y(0);
      }),
    );
  }
})();

// Pipeline strip: 01 → 02 → 03 slide in from the left, one after another
(function () {
  const row = document.querySelector(".pipeline-row");
  // hero-anim is only kept when motion is allowed and GSAP loaded
  const canAnimate =
    row &&
    document.documentElement.classList.contains("hero-anim") &&
    "IntersectionObserver" in window;
  if (!canAnimate) {
    document.documentElement.classList.add("pipeline-static");
    return;
  }

  const items = row.querySelectorAll(".pipeline-item");
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  items.forEach((item, i) => {
    const at = i * 0.18;
    tl.from(item.querySelector(".num"), { y: 10, autoAlpha: 0, duration: 0.5 }, at)
      .from(item.querySelector("p"), { x: -24, autoAlpha: 0, duration: 0.7 }, at + 0.08);
  });

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      heroIntro.then(() => tl.play());
    },
    { threshold: 0.3 },
  );
  io.observe(row);
})();

// Work filter (animated with GSAP Flip when available)
const filters = document.querySelectorAll(".filter");
const workGrid = document.getElementById("workGrid");
const cards = workGrid.querySelectorAll(".card");
const canFlip =
  window.gsap &&
  window.Flip &&
  matchMedia("(prefers-reduced-motion: no-preference)").matches;
if (canFlip) gsap.registerPlugin(Flip);
let filterFlip;

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) return;
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    const applyFilter = () =>
      cards.forEach((c) => {
        c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
      });

    if (!canFlip) return applyFilter();

    // Rapid clicks: finish the previous animation so no card is left half-faded
    if (filterFlip) filterFlip.progress(1);
    gsap.getTweensOf([workGrid, ...cards]).forEach((t) => t.progress(1));

    const state = Flip.getState(cards);
    const startHeight = workGrid.offsetHeight;
    applyFilter();
    const endHeight = workGrid.offsetHeight;

    // Flip measures the final layout now, before the height tween touches the grid
    filterFlip = Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      stagger: 0.03,
      absoluteOnLeave: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { autoAlpha: 0, scale: 0.94 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            delay: 0.2,
            stagger: 0.05,
            ease: "power2.out",
            overwrite: "auto",
          },
        ),
      onLeave: (els) =>
        gsap.to(els, {
          autoAlpha: 0,
          scale: 0.94,
          duration: 0.35,
          ease: "power2.in",
          overwrite: "auto",
        }),
    });

    // Ease the grid height so the sections below don't jump
    gsap.fromTo(
      workGrid,
      { height: startHeight },
      {
        height: endHeight,
        duration: 0.6,
        ease: "power3.inOut",
        clearProps: "height",
      },
    );
  });
});

const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// Skill bars: fill from 0 and count up the percentage when scrolled into view
(function () {
  const cols = [...document.querySelectorAll(".stack-col")];
  const canAnimate =
    window.gsap &&
    "IntersectionObserver" in window &&
    matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (!canAnimate || !cols.length) return;

  // Store each bar's target width and percentage, then reset to 0
  const rowsByCol = cols.map((col) =>
    [...col.querySelectorAll(".skill-row")].map((row) => {
      const bar = row.querySelector(".skill-bar i");
      const label = row.querySelector(".skill-row-top span:last-child");
      const target = parseFloat(bar.style.width);
      gsap.set(bar, { width: 0 });
      label.textContent = "0%";
      return { bar, label, target };
    }),
  );

  const io = new IntersectionObserver(
    (entries) => {
      // k = order among columns entering together (desktop: all 3 at once)
      const visible = entries.filter((entry) => entry.isIntersecting);
      visible.forEach((entry, k) => {
        io.unobserve(entry.target);
        const rows = rowsByCol[cols.indexOf(entry.target)];
        rows.forEach(({ bar, label, target }, i) => {
          const count = { v: 0 };
          const vars = {
            duration: 1.2,
            ease: "power3.out",
            delay: 0.25 + k * 0.15 + i * 0.12,
          };
          gsap.to(bar, { ...vars, width: target + "%" });
          gsap.to(count, {
            ...vars,
            v: target,
            onUpdate: () => (label.textContent = Math.round(count.v) + "%"),
          });
        });
      });
    },
    { threshold: 0.35 },
  );
  cols.forEach((col) => io.observe(col));
})();

// Process: steps appear in sequence, each connector line drawing to the next
(function () {
  const row = document.querySelector(".process-row");
  const canAnimate =
    row &&
    window.gsap &&
    "IntersectionObserver" in window &&
    matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (!canAnimate) return;

  const steps = [...row.querySelectorAll(".process-step")];
  const tl = gsap.timeline({ paused: true });

  steps.forEach((step, i) => {
    const num = step.querySelector(".step-num");
    const text = step.querySelectorAll("h3, p");
    gsap.set(num, { autoAlpha: 0, scale: 0.5 });
    gsap.set(text, { autoAlpha: 0, y: 12 });
    gsap.set(step, { "--line-progress": 0 });

    // each step pops in just before the previous line finishes drawing
    tl.to(
      num,
      { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)" },
      i ? "-=0.15" : 0,
    )
      .to(
        text,
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "<0.1",
      )
      // line draws from this step toward the next one
      .to(
        step,
        { "--line-progress": 1, duration: 0.55, ease: "power2.inOut" },
        "<0.1",
      );
  });

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      tl.play();
    },
    { threshold: 0.4 },
  );
  io.observe(row);
})();

// Pricing: prices count up from $0 and the "Most popular" badge pops in
(function () {
  const priceEls = [...document.querySelectorAll(".hourly-price, .tier-price")];
  const canAnimate =
    priceEls.length &&
    window.gsap &&
    "IntersectionObserver" in window &&
    matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (!canAnimate) return;

  // "$25<span>/ project</span>": wrap the "$25" text node so it can be counted
  const prices = priceEls.map((el) => {
    const textNode = el.firstChild;
    const num = document.createElement("span");
    num.className = "price-num";
    const finalText = textNode.textContent.trim();
    textNode.replaceWith(num);
    num.textContent = "$0";
    const target = parseInt(finalText.replace(/\D/g, ""), 10);
    return { el, num, target, finalText };
  });

  const badge = document.querySelector(".tier-badge");
  if (badge) gsap.set(badge, { autoAlpha: 0, scale: 0.4 });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const { num, target, finalText } = prices.find(
          (p) => p.el === entry.target,
        );
        // Reserve the final width (measured now, after fonts have loaded)
        // so the "/ project" label doesn't shift while the digits grow
        num.textContent = finalText;
        num.style.minWidth = num.offsetWidth + "px";
        num.textContent = "$0";
        const count = { v: 0 };
        gsap.to(count, {
          v: target,
          duration: 1.2,
          delay: 0.2, // let the card's fade-in start first
          ease: "power2.out",
          onUpdate: () => (num.textContent = "$" + Math.round(count.v)),
        });
        if (badge && entry.target.closest(".tier") === badge.closest(".tier")) {
          gsap.to(badge, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            delay: 0.6,
            ease: "back.out(2)",
          });
        }
      });
    },
    { threshold: 0.6 },
  );
  prices.forEach((p) => io.observe(p.el));
})();

// ---------- Lightboxes ----------
const lbMotion =
  window.gsap && matchMedia("(prefers-reduced-motion: no-preference)").matches;
const lbTimelines = new WeakMap();
// aria-hidden flips immediately, while the .open class stays until the
// close animation ends, so use this to ask "is it open?"
const isOpen = (lightbox) => lightbox.getAttribute("aria-hidden") === "false";

// Backdrop fades in, then the stage rises and scales up into place
function showLightbox(lightbox) {
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  if (!lbMotion) return;
  const stage = lightbox.querySelector(".lightbox-stage");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  if (lbTimelines.has(lightbox)) lbTimelines.get(lightbox).kill();
  const tl = gsap
    .timeline()
    .fromTo(
      lightbox,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
    )
    .fromTo(
      stage,
      { autoAlpha: 0, y: 24, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
      "<0.05",
    )
    .fromTo(
      closeBtn,
      { autoAlpha: 0, rotation: -90 },
      { autoAlpha: 1, rotation: 0, duration: 0.4, ease: "power2.out" },
      "<0.15",
    );
  lbTimelines.set(lightbox, tl);
}

// Reverse of the above; the lightbox stays displayed until the fade ends
function hideLightbox(lightbox) {
  lightbox.setAttribute("aria-hidden", "true");
  if (!lbMotion) return lightbox.classList.remove("open");
  const stage = lightbox.querySelector(".lightbox-stage");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  if (lbTimelines.has(lightbox)) lbTimelines.get(lightbox).kill();
  const tl = gsap
    .timeline({
      onComplete: () => {
        lightbox.classList.remove("open");
        gsap.set([lightbox, stage, closeBtn], {
          clearProps: "opacity,visibility,transform",
        });
      },
    })
    .to(stage, {
      autoAlpha: 0,
      y: 16,
      scale: 0.97,
      duration: 0.25,
      ease: "power2.in",
    })
    .to(lightbox, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, "<0.05");
  lbTimelines.set(lightbox, tl);
}

// Crossfade between slides with a small slide in the direction of travel
function swapSlides(from, to, dir) {
  gsap.killTweensOf([from, to]);
  to.classList.remove("leaving");
  from.classList.remove("active");
  from.classList.add("leaving"); // keep it displayed while it fades out
  to.classList.add("active");
  gsap.fromTo(
    to,
    { autoAlpha: 0, xPercent: 6 * dir },
    { autoAlpha: 1, xPercent: 0, duration: 0.45, ease: "power3.out" },
  );
  gsap.to(from, {
    autoAlpha: 0,
    xPercent: -6 * dir,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => {
      from.classList.remove("leaving");
      gsap.set(from, { clearProps: "opacity,visibility,transform" });
    },
  });
}

// Multi-image gallery lightbox with prev/next, dots and arrow keys
function setupGallery({ lightboxId, dotsId, prevId, nextId, closeId, trigger }) {
  const lightbox = document.getElementById(lightboxId);
  const slides = [...lightbox.querySelectorAll(".lightbox-slide")];
  const dotsWrap = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const closeBtn = document.getElementById(closeId);
  const triggers = document.querySelectorAll(`[data-lightbox="${trigger}"]`);
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "lightbox-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to image " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".lightbox-dot");

  function goTo(i, animate = true) {
    const prev = current;
    const dir = i > prev ? 1 : -1; // before wrapping, so last→first still moves "next"
    current = (i + slides.length) % slides.length;
    dots.forEach((d, idx) => d.classList.toggle("active", idx === current));

    if (lbMotion && animate && current !== prev) {
      return swapSlides(slides[prev], slides[current], dir);
    }
    // Instant switch (opening, or reduced motion): reset any in-flight fades
    if (lbMotion) {
      gsap.killTweensOf(slides);
      gsap.set(slides, { clearProps: "opacity,visibility,transform" });
    }
    slides.forEach((s, idx) => {
      s.classList.remove("leaving");
      s.classList.toggle("active", idx === current);
    });
  }
  function open() {
    goTo(0, false);
    showLightbox(lightbox);
  }
  const close = () => hideLightbox(lightbox);

  triggers.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    }),
  );
  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen(lightbox)) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
}

setupGallery({
  lightboxId: "foodMenuLightbox",
  dotsId: "lightboxDots",
  prevId: "lightboxPrev",
  nextId: "lightboxNext",
  closeId: "lightboxClose",
  trigger: "food-menu",
});
setupGallery({
  lightboxId: "logoLightbox",
  dotsId: "logoLightboxDots",
  prevId: "logoLightboxPrev",
  nextId: "logoLightboxNext",
  closeId: "logoLightboxClose",
  trigger: "brand-logo",
});
setupGallery({
  lightboxId: "staticAdsLightbox",
  dotsId: "staticAdsLightboxDots",
  prevId: "staticAdsLightboxPrev",
  nextId: "staticAdsLightboxNext",
  closeId: "staticAdsLightboxClose",
  trigger: "static-ads",
});

// Vision board lightbox (single image)
(function () {
  const lightbox = document.getElementById("visionBoardLightbox");
  const closeBtn = document.getElementById("visionBoardLightboxClose");
  const triggers = document.querySelectorAll('[data-lightbox="vision-board"]');
  const close = () => hideLightbox(lightbox);

  triggers.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      showLightbox(lightbox);
    }),
  );
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen(lightbox)) return;
    if (e.key === "Escape") close();
  });
})();

// Reel video lightbox
(function () {
  const lightbox = document.getElementById("reelVideoLightbox");
  const closeBtn = document.getElementById("reelVideoLightboxClose");
  const video = document.getElementById("reelVideoPlayer");
  const loader = document.getElementById("reelVideoLoader");
  const triggers = document.querySelectorAll('[data-lightbox="reel-video"]');
  const MIN_LOADING_MS = 1500;
  let loadingTimer = null;

  function open() {
    showLightbox(lightbox);
    loader.classList.add("show");
    video.controls = false; // hide the browser's own loading spinner
    video.load(); // start buffering now (preload="none")

    // Play once BOTH the minimum delay has passed and the video can play
    const delay = new Promise(
      (r) => (loadingTimer = setTimeout(r, MIN_LOADING_MS)),
    );
    const ready = new Promise((r) =>
      video.readyState >= 3
        ? r()
        : video.addEventListener("canplay", r, { once: true }),
    );
    Promise.all([delay, ready]).then(() => {
      if (!isOpen(lightbox)) return; // closed (or closing) while loading
      loader.classList.remove("show");
      video.controls = true;
      video.play().catch(() => {});
    });
  }
  function close() {
    hideLightbox(lightbox);
    clearTimeout(loadingTimer);
    loader.classList.remove("show");
    video.pause();
    video.currentTime = 0;
  }

  triggers.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    }),
  );
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen(lightbox)) return;
    if (e.key === "Escape") close();
  });
})();
