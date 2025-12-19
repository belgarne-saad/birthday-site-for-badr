// Simple cyberpunk birthday experience
// - Shows only an OPEN button on load
// - On click: reveal starfield, animated title, and SVG heart drawing

document.addEventListener("DOMContentLoaded", () => {
  // ===== Page fade-in / navigation transition (both pages) =====
  document.body.classList.add("page-transition");
  // allow styles to apply before fading in
  requestAnimationFrame(() => {
    document.body.classList.add("page-transition--in");
  });

  const transitionLinks = document.querySelectorAll("[data-transition-link]");
  transitionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      document.body.classList.remove("page-transition--in");
      document.body.classList.add("page-transition--out");
      setTimeout(() => {
        window.location.href = href;
      }, 320);
    });
  });

  const gate = document.getElementById("gate");
  const openButton = document.getElementById("openButton");
  const experience = document.getElementById("experience");
  const titleEl = document.getElementById("birthdayTitle");
  const heartsContainer = document.getElementById("hearts");
  const heartPaths = heartsContainer
    ? Array.from(heartsContainer.querySelectorAll(".heart__path"))
    : [];

  const canvas = document.getElementById("starCanvas");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (!openButton || !gate || !experience || !canvas || !ctx || !titleEl) {
    // Critical nodes missing, abort JS logic to avoid errors.
    return;
  }

  // ===== STARFIELD SETUP =====
  const STAR_COLORS = ["#ff7be9", "#ffd46b", "#ffffff"];
  const STAR_COUNT_BASE = 150; // scaled with viewport area
  let stars = [];

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createStars();
  }

  function createStars() {
    const area = window.innerWidth * window.innerHeight;
    const densityFactor = area / (1280 * 720);
    const count = Math.round(STAR_COUNT_BASE * Math.max(0.6, densityFactor));

    stars = new Array(count).fill(0).map(() => {
      const size = Math.random() * 1.2 + 0.4;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: size,
        baseAlpha: Math.random() * 0.4 + 0.2,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.12,
        driftY: (Math.random() - 0.5) * 0.12,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      };
    });
  }

  let fadeInProgress = 0; // 0 -> 1

  function drawStars(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gentle fade-in of all stars after experience is visible
    const globalAlphaTarget = Math.min(1, fadeInProgress);
    ctx.save();
    ctx.globalAlpha = globalAlphaTarget;

    const t = timestamp * 0.0015;
    for (const star of stars) {
      const twinkle =
        Math.sin(t * 2 + star.twinkleOffset) * 0.35 +
        Math.sin(t * 1.3 + star.twinkleOffset * 1.7) * 0.25;
      const alpha = Math.min(
        1,
        Math.max(0.08, star.baseAlpha + twinkle * 0.25)
      );

      star.x += star.driftX;
      star.y += star.driftY;

      // wrap around edges
      if (star.x < -5) star.x = window.innerWidth + 5;
      if (star.x > window.innerWidth + 5) star.x = -5;
      if (star.y < -5) star.y = window.innerHeight + 5;
      if (star.y > window.innerHeight + 5) star.y = -5;

      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha * globalAlphaTarget;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    requestAnimationFrame(drawStars);
  }

  // ===== TITLE ANIMATION =====
  function buildTitleLetters(text) {
    titleEl.textContent = "";
    const chars = text.split("");

    chars.forEach((ch, index) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.classList.add("birthday-title__char");

      // space should still take width but no animation jump
      if (ch === " ") {
        span.style.width = "0.4em";
      }

      // stagger animation delay for letter-by-letter reveal
      const delay = 0.06 * index;
      span.style.animationDelay = `${delay}s`;

      titleEl.appendChild(span);
    });
  }

  // ===== HEART DRAW ANIMATION =====
  function triggerHeartDrawing() {
    heartPaths.forEach((path, index) => {
      const delay = 0.4 * index;
      setTimeout(() => {
        path.classList.add("heart__path--draw");
      }, delay * 1000);
    });
  }

  // ===== OPEN BUTTON FLOW =====
  function startExperience() {
    // Hide the gate
    gate.classList.add("gate--hidden");

    // After gate fade: show main experience
    setTimeout(() => {
      experience.classList.add("experience--visible");
      experience.setAttribute("aria-hidden", "false");
      // enable UI that should only appear after the reveal (e.g. message icon)
      document.body.classList.add("body--experience");

      // Prepare starfield
      resizeCanvas();
      fadeInProgress = 0;

      // gradually ramp the star alpha up
      const fadeDuration = 1600;
      const fadeStart = performance.now();

      function updateFade(now) {
        const elapsed = now - fadeStart;
        fadeInProgress = Math.min(1, elapsed / fadeDuration);
        if (fadeInProgress < 1) {
          requestAnimationFrame(updateFade);
        }
      }
      requestAnimationFrame(updateFade);

      // Kick off continuous animation loop
      requestAnimationFrame(drawStars);

      // After a short delay, show title letters
      setTimeout(() => {
        buildTitleLetters("HAPPY BIRTHDAY MY LOVE");

        // After letters settle, draw hearts
        setTimeout(() => {
          triggerHeartDrawing();
        }, 1200);
      }, 400);
    }, 480);
  }

  openButton.addEventListener("click", () => {
    startExperience();
  });

  // Keep canvas responsive
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
});


