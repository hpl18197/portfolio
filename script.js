const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");
const galleryGrid = document.getElementById("galleryGrid");
const galleryStatus = document.getElementById("galleryStatus");
const loadMore = document.getElementById("loadMore");
const filterButtons = document.querySelectorAll(".filter-btn");
const specGrid = document.querySelector(".spec-grid");
const heroProductCount = document.querySelectorAll(".hero-metrics strong")[2];
const specHeadingNote = document.querySelector(".spec-heading p");

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
  if (window.HVEFFECTS) {
    window.HVEFFECTS.observeReveal(galleryGrid);
  }
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

const productDetails = {
  dji: {
    brand: "DJI",
    brandClass: "brand-dji",
    categoryLabel: "大疆",
    product: "Mavic 4 Pro",
    image: "assets/gallery/dji-002.jpg",
    price: "¥13,888 起",
    priceNote: "DJI RC 2 套装，以官方商城最新价格为准",
    summary: "面向专业航拍创作的旗舰级折叠无人机，把高像素影像、长续航和全向感知整合进完整创作链路。",
    source: "https://www.dji.com/cn/mavic-4-pro",
    highlights: ["1 亿像素哈苏影像", "51 分钟续航", "O4+ 图传"],
    specs: [
      { label: "起飞重量", value: "约 1063 g" },
      { label: "折叠尺寸", value: "257.6 × 124.8 × 106.6 mm" },
      { label: "最大飞行时间", value: "51 分钟" },
      { label: "最大水平速度", value: "25 m/s" },
      { label: "最大上升 / 下降速度", value: "10 m/s" },
      { label: "最大起飞海拔", value: "6000 m" },
      { label: "主摄", value: "4/3 CMOS 哈苏 1 亿像素" },
      { label: "中长焦", value: "70 mm，4800 万像素" },
      { label: "长焦", value: "168 mm，5000 万像素" },
      { label: "视频能力", value: "6K/60fps HDR" },
      { label: "动态范围", value: "最高 15.5 挡" },
      { label: "图传系统", value: "O4+，FCC 30 km / SRRC 15 km" },
      { label: "避障系统", value: "0.1 lux 微光级全向主动避障" },
      { label: "激光雷达", value: "前视激光雷达" },
      { label: "云台", value: "360° 万象云台，俯仰 -90° 至 +70°" },
      { label: "电池", value: "6654 mAh / 95.3 Wh" },
      { label: "机载内存", value: "64 GB" },
      { label: "创作者套装", value: "512 GB 版本支持 ALL-I 10bit 4:2:2" }
    ],
    plans: [
      { tag: "基础套装", price: "¥13,888 起", note: "DJI RC 2 套装，包含主机、RC 2 遥控器与标准电池方案。" },
      { tag: "创作者套装", price: "按官方配置", note: "支持更大机载存储与 ALL-I 10bit 4:2:2，适合完整航拍创作流程。" }
    ]
  },
  xag: {
    brand: "XAG",
    brandClass: "brand-xag",
    categoryLabel: "极飞",
    product: "P100 Pro 2023",
    image: "assets/gallery/xag-002.jpg",
    price: "按配置方案询价",
    priceNote: "官方未公开中文统一指导价",
    summary: "面向大规模农业作业的无人机平台，通过喷洒、播撒、雷达和遥控系统组合，覆盖精准农业核心作业场景。",
    source: "https://www.xa.com/p100pro-2023/specs",
    highlights: ["50 kg 额定载重", "最大 22 L/min 喷洒", "4D 成像雷达"],
    specs: [
      { label: "额定载重", value: "50 kg，可升级 60 kg" },
      { label: "飞行平台质量", value: "约 46 kg（含电池）" },
      { label: "展开尺寸", value: "2927 × 2868 × 323 mm" },
      { label: "折叠尺寸", value: "893 × 1095 × 345 mm" },
      { label: "最大飞行速度", value: "13.8 m/s" },
      { label: "喷洒流量", value: "最大 22 L/min" },
      { label: "药箱容量", value: "50 L" },
      { label: "播撒系统容量", value: "80 L" },
      { label: "播撒下料量", value: "最大 150 kg/min" },
      { label: "防护等级", value: "IPX6K" },
      { label: "感知雷达", value: "4D 成像雷达，测距 1.5-80 m" },
      { label: "电机", value: "A50，单电机额定 4100 W" },
      { label: "最大拉力", value: "52 kg" },
      { label: "双手遥控器", value: "ARC3 Pro，信号约 1 km" },
      { label: "单手遥控器", value: "ACS3" }
    ],
    plans: [
      { tag: "整机方案", price: "询价制", note: "官方未公开中文统一指导价，按喷洒、播撒、电池与售后配置报价。" },
      { tag: "升级方案", price: "按方案报价", note: "额定载重 50 kg 可升级至 60 kg，需结合具体作业场景配置。" }
    ]
  },
  insta: {
    brand: "Insta360",
    brandClass: "brand-insta",
    categoryLabel: "影石",
    product: "X5",
    image: "assets/gallery/insta-002.jpg",
    price: "¥3,298",
    priceNote: "官方中国区售价",
    summary: "面向全景创作与运动记录的双镜头相机，在 8K 全景视频、防水能力和智能防抖之间取得均衡。",
    source: "https://www.insta360.com/cn/product/insta360-x5",
    highlights: ["8K30 全景视频", "裸机 15 m 防水", "FlowState 防抖"],
    specs: [
      { label: "机身重量", value: "200 g" },
      { label: "机身尺寸", value: "46.0 × 124.5 × 38.2 mm" },
      { label: "传感器", value: "双 1/1.28 英寸" },
      { label: "全景照片", value: "7200 万像素，11904 × 5952" },
      { label: "全景视频", value: "8K30fps / 5.7K60fps" },
      { label: "单镜头视频", value: "4K60fps" },
      { label: "动态范围", value: "最高 13.5 挡" },
      { label: "防抖", value: "FlowState 防抖" },
      { label: "水平矫正", value: "360° 水平矫正" },
      { label: "防水能力", value: "裸机 15 m" },
      { label: "电池", value: "2400 mAh，最长 208 分钟" },
      { label: "快充", value: "20 分钟充至 80%" },
      { label: "芯片", value: "2 块专业影像芯片 + 5nm AI 芯片" },
      { label: "智能功能", value: "隐形自拍杆、动态跟拍 2.0" },
      { label: "镜头保护", value: "可拆换镜头保护镜" }
    ],
    plans: [
      { tag: "标准版", price: "¥3,298", note: "官方中国区售价，包含机身与基础包装。" },
      { tag: "配件方案", price: "按需配置", note: "可搭配隐形自拍杆、电池、保护镜、防水壳等配件。" }
    ]
  }
};

const detailDialogs = {};

function buildDetailDialog(key) {
  const detail = productDetails[key];
  const specsHtml = detail.specs.map((spec) => `
    <div>
      <dt>${escapeHtml(spec.label)}</dt>
      <dd>${escapeHtml(spec.value)}</dd>
    </div>
  `).join("");
  const plansHtml = detail.plans.map((plan) => `
    <article class="detail-plan">
      <span>${escapeHtml(plan.tag)}</span>
      <strong>${escapeHtml(plan.price)}</strong>
      <p>${escapeHtml(plan.note)}</p>
    </article>
  `).join("");
  const highlightsHtml = detail.highlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  const dialog = document.createElement("dialog");
  dialog.className = "detail-dialog";
  dialog.id = `detail-${key}`;
  dialog.setAttribute("aria-labelledby", `detailTitle-${key}`);
  dialog.innerHTML = `
    <div class="detail-shell">
      <button class="detail-close" type="button" aria-label="关闭详细参数">
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
      <div class="detail-hero">
        <img src="${detail.image}" alt="${escapeHtml(detail.product)} 详细参数主图">
        <div class="detail-hero-content">
          <div class="detail-brand-row">
            <span class="brand-tag ${detail.brandClass}">${detail.brand}</span>
            <span>${escapeHtml(detail.categoryLabel)}</span>
          </div>
          <h3 id="detailTitle-${key}">${escapeHtml(detail.product)}</h3>
          <p class="detail-price">${escapeHtml(detail.price)} <span>${escapeHtml(detail.priceNote)}</span></p>
          <p class="detail-summary">${escapeHtml(detail.summary)}</p>
          <div class="detail-highlights">${highlightsHtml}</div>
          <a class="detail-source" href="${detail.source}" target="_blank" rel="noopener">
            查看官方页面
            <i data-lucide="arrow-up-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
      <div class="detail-tabs" role="tablist" aria-label="${escapeHtml(detail.product)} 详细参数">
        <button class="detail-tab is-active" type="button" role="tab" aria-selected="true" data-tab="specs">完整参数</button>
        <button class="detail-tab" type="button" role="tab" aria-selected="false" data-tab="plans">价格方案</button>
        <button class="detail-tab" type="button" role="tab" aria-selected="false" data-tab="gallery">相关素材</button>
      </div>
      <div class="detail-body">
        <section class="detail-panel is-active" data-panel="specs" role="tabpanel">
          <div class="detail-section-title">
            <h4>完整参数</h4>
            <p>整理自官方公开页面，具体版本与规格以官方最新信息为准。</p>
          </div>
          <dl class="detail-spec-list">${specsHtml}</dl>
        </section>
        <section class="detail-panel" data-panel="plans" role="tabpanel">
          <div class="detail-section-title">
            <h4>价格方案</h4>
            <p>价格与可选配置可能随活动更新，请以下单时官方页面为准。</p>
          </div>
          <div class="detail-plan-grid">${plansHtml}</div>
        </section>
        <section class="detail-panel" data-panel="gallery" role="tabpanel">
          <div class="detail-section-title">
            <h4>相关素材</h4>
            <p>从本站 200 张官方图库中筛选当前产品相关影像。</p>
          </div>
          <div class="detail-gallery" data-detail-gallery="${key}"></div>
        </section>
      </div>
    </div>
  `;

  dialog.querySelector(".detail-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

  dialog.querySelectorAll(".detail-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      dialog.querySelectorAll(".detail-tab").forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      dialog.querySelectorAll(".detail-panel").forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.panel === tab.dataset.tab);
      });
    });
  });

  return dialog;
}

function renderDetailGallery(key) {
  const holder = document.querySelector(`[data-detail-gallery="${key}"]`);
  if (!holder) return;
  const items = galleryData.filter((item) => item.category === key).slice(0, 6);
  if (!items.length) {
    holder.innerHTML = `<p class="detail-empty">素材加载中</p>`;
    return;
  }
  holder.innerHTML = items.map((item) => `
    <figure class="detail-gallery-item">
      <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy">
      <figcaption>${escapeHtml(item.title)}</figcaption>
    </figure>
  `).join("");
}

function openDetail(key) {
  if (!productDetails[key]) return;
  let dialog = detailDialogs[key];
  if (!dialog) {
    dialog = buildDetailDialog(key);
    document.body.appendChild(dialog);
    detailDialogs[key] = dialog;
  }
  if (!dialog.dataset.galleryRendered) {
    renderDetailGallery(key);
    dialog.dataset.galleryRendered = "true";
  }
  dialog.showModal();
  document.body.classList.add("modal-open");
  if (window.lucide) lucide.createIcons();
}

const productPages = {
  dji: "product-dji.html",
  xag: "product-xag.html",
  insta: "product-insta.html"
};

specGrid.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  const card = event.target.closest(".spec-card");
  if (!card) return;
  const link = card.querySelector(".spec-open");
  if (link) window.open(link.href, "_blank", "noopener");
});

document.querySelectorAll(".spec-open").forEach((link) => {
  link.addEventListener("click", (event) => event.stopPropagation());
});

function productBrandClass(brand) {
  const map = {
    DJI: "brand-dji",
    XAG: "brand-xag",
    Insta360: "brand-insta"
  };
  return map[brand] || "brand-dji";
}

function renderProductCatalog(catalog) {
  const activeProducts = catalog.filter((item) => item.active !== false);
  specGrid.innerHTML = activeProducts.map((product) => {
    const specs = (Array.isArray(product.specs) ? product.specs : []).slice(0, 8);
    const specsHtml = specs.map((spec) => `
      <div><dt>${escapeHtml(spec.label)}</dt><dd>${escapeHtml(spec.value)}</dd></div>
    `).join("");
    const detailUrl = `product-view.html?product=${encodeURIComponent(product.id)}`;
    return `
      <article class="spec-card" data-product="${escapeHtml(product.id)}" data-tilt>
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)} 官方产品图">
        <div class="spec-content">
          <div class="spec-meta">
            <span class="brand-tag ${productBrandClass(product.brand)}">${escapeHtml(product.brand)}</span>
            <span>${escapeHtml(product.category || "产品档案")}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="spec-price">${escapeHtml(product.price || "按官方页面")} <span>${escapeHtml(product.priceNote || "")}</span></p>
          <dl class="spec-list">${specsHtml}</dl>
          <p class="spec-source">来源：${escapeHtml(product.sourceLabel || "官方公开页面")}</p>
          <a class="spec-open" href="${detailUrl}" target="_blank" rel="noopener" data-product="${escapeHtml(product.id)}">
            打开详细参数页面
            <i data-lucide="corner-down-right" aria-hidden="true"></i>
          </a>
        </div>
      </article>
    `;
  }).join("");

  if (heroProductCount) heroProductCount.textContent = String(activeProducts.length);
  if (specHeadingNote) specHeadingNote.textContent = `${activeProducts.length} 款核心产品档案，参数与价格来自官方公开页面，可能存在更新；极飞采用按配置方案询价制。`;
  if (window.HVEFFECTS) {
    window.HVEFFECTS.observeReveal(specGrid);
    window.HVEFFECTS.initTilt(specGrid, "[data-tilt]");
    window.HVEFFECTS.animateCounters(document.querySelector(".hero-metrics"));
  }
  if (window.lucide) lucide.createIcons();
}

async function initProductCatalog() {
  try {
    const response = await fetch("assets/catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog not found");
    const catalog = await response.json();
    renderProductCatalog(catalog);
  } catch (error) {
    console.warn("Product catalog unavailable, keeping static fallback.", error);
  }
}

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
initProductCatalog();
if (window.HVEFFECTS) {
  window.HVEFFECTS.observeReveal(document.body);
  window.HVEFFECTS.initBackToTop();
}

if (window.lucide) {
  lucide.createIcons();
}
