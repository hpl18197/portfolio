(function () {
  function observeReveal(scope, selector) {
    const root = scope || document;
    const items = [...root.querySelectorAll(selector || "[data-reveal], .project-card, .spec-card, .gallery-item, .product-plan, .product-spec-list > div, .product-material-grid figure, .admin-panel, .admin-row, .admin-stats > div")].filter(
      (el) => !el.dataset.revealObserved
    );

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => {
      el.dataset.revealObserved = "true";
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  function animateCounters(scope, selector) {
    const root = scope || document;
    const items = [...root.querySelectorAll(selector || "[data-count]")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    items.forEach((el) => {
      const target = Number.parseInt(el.dataset.count || el.textContent || "0", 10) || 0;
      const pad = Number.parseInt(el.dataset.pad || "0", 10) || 0;
      const duration = 900;

      if (reduceMotion) {
        el.textContent = pad ? String(target).padStart(pad, "0") : String(target);
        return;
      }

      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = pad ? String(value).padStart(pad, "0") : String(value);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function initTilt(scope, selector) {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = scope || document;
    const cards = [...root.querySelectorAll(selector || "[data-tilt]")];

    cards.forEach((card) => {
      let frame = 0;
      card.addEventListener("pointermove", (event) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          const px = ((event.clientX - rect.left) / rect.width) * 100;
          const py = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-3px)`;
          card.style.setProperty("--mx", `${px.toFixed(2)}%`);
          card.style.setProperty("--my", `${py.toFixed(2)}%`);
        });
      });
      card.addEventListener("pointerleave", () => {
        cancelAnimationFrame(frame);
        card.style.transform = "";
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress)).toFixed(4)})`;
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function initHeroCanvas() {
    const canvas = document.querySelector(".hero-fx");
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const pointer = { x: -9999, y: -9999, active: false };
    const palette = ["23,114,246", "23,178,106", "238,95,71", "227,162,75"];
    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;

    function resize() {
      const rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;

      const count = Math.min(72, Math.max(28, Math.round((rect.width * rect.height) / 19000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22 * dpr,
        vy: (Math.random() - 0.5) * 0.22 * dpr,
        r: (0.8 + Math.random() * 2.1) * dpr,
        color: palette[Math.floor(Math.random() * palette.length)]
      }));
    }

    function step() {
      if (!visible || document.hidden) {
        raf = requestAnimationFrame(step);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const linkDistance = 120 * dpr;
      const pointerDistance = 230 * dpr;

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -24) particle.x = width + 24;
        if (particle.x > width + 24) particle.x = -24;
        if (particle.y < -24) particle.y = height + 24;
        if (particle.y > height + 24) particle.y = -24;
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > linkDistance) continue;
          const alpha = (1 - dist / linkDistance) * 0.16;
          ctx.strokeStyle = `rgba(${a.color},${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.5, dpr * 0.7);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (pointer.active) {
        const px = pointer.x * dpr;
        const py = pointer.y * dpr;
        ctx.strokeStyle = "rgba(23,114,246,0.22)";
        ctx.lineWidth = Math.max(1, dpr);
        ctx.beginPath();
        ctx.arc(px, py, 34 * dpr, 0, Math.PI * 2);
        ctx.stroke();

        for (const particle of particles) {
          const dx = particle.x - px;
          const dy = particle.y - py;
          const dist = Math.hypot(dx, dy);
          if (dist > pointerDistance) continue;
          ctx.strokeStyle = `rgba(23,114,246,${(0.28 * (1 - dist / pointerDistance)).toFixed(3)})`;
          ctx.lineWidth = Math.max(0.5, dpr * 0.6);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();
        }
      }

      for (const particle of particles) {
        ctx.fillStyle = `rgba(${particle.color},0.62)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    }

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });
    hero.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      }, { threshold: 0 }).observe(hero);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    raf = requestAnimationFrame(step);
  }

  function initBackToTop() {
    const button = document.querySelector(".back-to-top");
    if (!button) return;

    const update = () => {
      button.classList.toggle("is-visible", window.scrollY > 700);
    };
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
  }

  window.HVEFFECTS = {
    observeReveal,
    animateCounters,
    initTilt,
    initBackToTop,
    initHeroCanvas,
    initScrollProgress
  };

  initScrollProgress();
  initHeroCanvas();
})();
