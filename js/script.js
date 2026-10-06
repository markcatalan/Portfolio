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

const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll("#workGrid .card");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
    });
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
