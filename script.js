const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");
const galleryGrid = document.getElementById("galleryGrid");
const galleryStatus = document.getElementById("galleryStatus");
const loadMore = document.getElementById("loadMore");
const filterButtons = document.querySelectorAll(".filter-btn");

let galleryData = [];
let currentFilter = "all";
let visibleCount = 30;

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

navToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

function closeNav() {
  primaryNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "打开导航");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function filteredGallery() {
  if (currentFilter === "all") return galleryData;
  return galleryData.filter((item) => item.category === currentFilter);
}

function updateCounts() {
  const count = (category) => galleryData.filter((item) => item.category === category).length;
  document.getElementById("countAll").textContent = String(galleryData.length);
  document.getElementById("countDji").textContent = String(count("dji"));
  document.getElementById("countXag").textContent = String(count("xag"));
  document.getElementById("countInsta").textContent = String(count("insta"));
}

function renderGallery() {
  const items = filteredGallery();
  const visibleItems = items.slice(0, visibleCount);

  galleryGrid.innerHTML = visibleItems.map((item) => `
    <figure class="gallery-item">
      <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy" width="720" height="540">
      <figcaption>${escapeHtml(item.title)}</figcaption>
    </figure>
  `).join("");

  galleryStatus.textContent = `已载入 ${Math.min(visibleCount, items.length)} / ${items.length} 张`;
  loadMore.style.display = visibleCount < items.length ? "" : "none";
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    currentFilter = button.dataset.filter;
    visibleCount = 30;
    renderGallery();
  });
});

loadMore.addEventListener("click", () => {
  visibleCount += 30;
  renderGallery();
});

async function initGallery() {
  try {
    const response = await fetch("assets/gallery.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Gallery not found");
    galleryData = await response.json();
  } catch (error) {
    galleryStatus.textContent = "素材加载失败，请刷新页面重试";
    loadMore.style.display = "none";
    return;
  }

  updateCounts();
  renderGallery();
}

document.addEventListener("scroll", onScroll, { passive: true });
onScroll();
initGallery();

if (window.lucide) {
  lucide.createIcons();
}
