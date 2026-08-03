const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

navToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开导航");
  });
});

document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (window.lucide) {
  lucide.createIcons();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const embeddedGallery = {
  data: [],
  brand: "all",
  visible: 24
};

function brandKey(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("insta") || text.includes("影石")) return "insta";
  if (text.includes("xag") || text.includes("极飞")) return "xag";
  if (text.includes("dji") || text.includes("大疆")) return "dji";
  return "all";
}

function pageBrandKey() {
  const brandNode = document.getElementById("productBrand");
  return brandKey(`${document.title} ${brandNode?.textContent || ""}`);
}

function buildEmbeddedGallery() {
  if (document.getElementById("official-gallery")) return;
  const main = document.querySelector("main");
  if (!main) return;

  const section = document.createElement("section");
  section.className = "gallery-band embedded-gallery";
  section.id = "official-gallery";
  section.setAttribute("aria-labelledby", "embeddedGalleryTitle");
  section.innerHTML = `
    <div class="section gallery-section">
      <div class="section-heading" data-reveal>
        <p class="eyebrow">Official Gallery</p>
        <h2 id="embeddedGalleryTitle">官方素材档案</h2>
        <p>全部素材按品牌分类，可切换查看大疆、极飞与影石官方图库。</p>
      </div>
      <div class="gallery-toolbar">
        <div class="gallery-filters" role="group" aria-label="素材品牌分类">
          <button class="filter-btn" data-embedded-filter="all" type="button">全部 <span></span></button>
          <button class="filter-btn" data-embedded-filter="dji" type="button">大疆 <span></span></button>
          <button class="filter-btn" data-embedded-filter="xag" type="button">极飞 <span></span></button>
          <button class="filter-btn" data-embedded-filter="insta" type="button">影石 <span></span></button>
        </div>
        <p class="gallery-status" id="embeddedGalleryStatus" aria-live="polite">正在载入官方素材</p>
      </div>
      <div class="gallery-grid" id="embeddedGalleryGrid"></div>
      <div class="gallery-more">
        <button class="btn btn-primary" id="embeddedLoadMore" type="button">
          继续加载素材
          <i data-lucide="plus" aria-hidden="true"></i>
        </button>
      </div>
      <p class="spec-empty" id="embeddedGalleryEmpty" hidden>没有找到素材，试试其他品牌。</p>
    </div>
  `;
  main.appendChild(section);

  document.getElementById("embeddedLoadMore").addEventListener("click", () => {
    embeddedGallery.visible += 24;
    renderEmbeddedGallery();
  });

  document.querySelectorAll("[data-embedded-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      embeddedGallery.brand = button.dataset.embeddedFilter || "all";
      embeddedGallery.visible = 24;
      document.querySelectorAll("[data-embedded-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderEmbeddedGallery();
    });
  });
}

function updateEmbeddedCounts() {
  const count = (category) => embeddedGallery.data.filter((item) => item.category === category).length;
  const buttons = [...document.querySelectorAll("[data-embedded-filter]")];
  const values = {
    all: embeddedGallery.data.length,
    dji: count("dji"),
    xag: count("xag"),
    insta: count("insta")
  };
  buttons.forEach((button) => {
    const span = button.querySelector("span");
    if (span) span.textContent = String(values[button.dataset.embeddedFilter] || 0);
  });
}

function renderEmbeddedGallery() {
  const grid = document.getElementById("embeddedGalleryGrid");
  const status = document.getElementById("embeddedGalleryStatus");
  const empty = document.getElementById("embeddedGalleryEmpty");
  const loadMore = document.getElementById("embeddedLoadMore");
  if (!grid) return;

  const items = embeddedGallery.brand === "all"
    ? embeddedGallery.data
    : embeddedGallery.data.filter((item) => item.category === embeddedGallery.brand);
  const visibleItems = items.slice(0, embeddedGallery.visible);

  grid.innerHTML = visibleItems.map((item) => `
    <figure class="gallery-item" data-brand="${escapeHtml(item.brand || "")}" data-category="${escapeHtml(item.category || "")}">
      <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.brand)} ${escapeHtml(item.title)}" loading="lazy" decoding="async" width="720" height="540">
      <figcaption><span>${escapeHtml(item.brand)}</span> · ${escapeHtml(item.title)}</figcaption>
    </figure>
  `).join("");

  if (status) status.textContent = `已载入 ${Math.min(embeddedGallery.visible, items.length)} / ${items.length} 张`;
  if (empty) empty.hidden = items.length !== 0;
  if (loadMore) loadMore.style.display = embeddedGallery.visible < items.length ? "" : "none";
  if (window.HVEFFECTS) window.HVEFFECTS.observeReveal(grid);
  if (window.lucide) lucide.createIcons();
}

function setEmbeddedBrand(value) {
  const key = brandKey(value);
  embeddedGallery.brand = key;
  embeddedGallery.visible = 24;
  document.querySelectorAll("[data-embedded-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.embeddedFilter === key);
  });
  renderEmbeddedGallery();
}

async function initEmbeddedGallery() {
  buildEmbeddedGallery();
  try {
    const response = await fetch("assets/gallery.json");
    if (!response.ok) throw new Error("Gallery not found");
    let userPhotos = [];
    try {
      userPhotos = JSON.parse(localStorage.getItem("hvUserPhotos") || "[]");
    } catch (error) {
      userPhotos = [];
    }
    embeddedGallery.data = [...userPhotos, ...(await response.json())];
    updateEmbeddedCounts();
    setEmbeddedBrand(pageBrandKey());
  } catch (error) {
    const grid = document.getElementById("embeddedGalleryGrid");
    const status = document.getElementById("embeddedGalleryStatus");
    if (grid) grid.innerHTML = `<p class="detail-empty">官方素材加载失败，请刷新页面重试。</p>`;
    if (status) status.textContent = "素材加载失败";
    const loadMore = document.getElementById("embeddedLoadMore");
    if (loadMore) loadMore.style.display = "none";
  }
}

window.HVEmbeddedGallery = {
  setBrand: setEmbeddedBrand,
  refresh: renderEmbeddedGallery
};

initEmbeddedGallery();
