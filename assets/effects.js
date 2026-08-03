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
          card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-3px)`;
        });
      });
      card.addEventListener("pointerleave", () => {
        cancelAnimationFrame(frame);
        card.style.transform = "";
      });
    });
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
    initBackToTop
  };
})();
