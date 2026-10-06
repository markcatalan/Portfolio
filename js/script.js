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

// Hero entrance (GSAP + SplitText)
(function () {
  const root = document.documentElement;
  if (!root.classList.contains("hero-anim")) return; // reduced motion
  if (!window.gsap || !window.SplitText) {
    root.classList.remove("hero-anim"); // CDN failed: just show everything
    return;
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
      .from(".hero-media-cap", { y: 10, autoAlpha: 0, duration: 0.5 }, "-=0.4");
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

// Food menu lightbox
(function () {
  const lightbox = document.getElementById("foodMenuLightbox");
  const slides = lightbox.querySelectorAll(".lightbox-slide");
  const dotsWrap = document.getElementById("lightboxDots");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  const closeBtn = document.getElementById("lightboxClose");
  const triggers = document.querySelectorAll('[data-lightbox="food-menu"]');
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "lightbox-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to image " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".lightbox-dot");

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === current));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
  }
  function open() {
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    goTo(0);
  }
  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

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
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
})();

// Brand logo lightbox
(function () {
  const lightbox = document.getElementById("logoLightbox");
  const slides = lightbox.querySelectorAll(".lightbox-slide");
  const dotsWrap = document.getElementById("logoLightboxDots");
  const prevBtn = document.getElementById("logoLightboxPrev");
  const nextBtn = document.getElementById("logoLightboxNext");
  const closeBtn = document.getElementById("logoLightboxClose");
  const triggers = document.querySelectorAll('[data-lightbox="brand-logo"]');
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "lightbox-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to image " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".lightbox-dot");

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === current));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
  }
  function open() {
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    goTo(0);
  }
  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

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
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
})();

// Static ads lightbox
(function () {
  const lightbox = document.getElementById("staticAdsLightbox");
  const slides = lightbox.querySelectorAll(".lightbox-slide");
  const dotsWrap = document.getElementById("staticAdsLightboxDots");
  const prevBtn = document.getElementById("staticAdsLightboxPrev");
  const nextBtn = document.getElementById("staticAdsLightboxNext");
  const closeBtn = document.getElementById("staticAdsLightboxClose");
  const triggers = document.querySelectorAll('[data-lightbox="static-ads"]');
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "lightbox-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to image " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".lightbox-dot");

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === current));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
  }
  function open() {
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    goTo(0);
  }
  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

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
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
})();

// Vision board lightbox (single image)
(function () {
  const lightbox = document.getElementById("visionBoardLightbox");
  const closeBtn = document.getElementById("visionBoardLightboxClose");
  const triggers = document.querySelectorAll('[data-lightbox="vision-board"]');

  function open() {
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
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
    if (!lightbox.classList.contains("open")) return;
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
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
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
      if (!lightbox.classList.contains("open")) return; // closed while loading
      loader.classList.remove("show");
      video.controls = true;
      video.play().catch(() => {});
    });
  }
  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
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
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
  });
})();
