const params = new URLSearchParams(window.location.search);
const productId = params.get("product") || params.get("id") || "";
const isPreview = params.get("preview") === "1";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function brandClass(brand) {
  const map = {
    DJI: "brand-dji",
    XAG: "brand-xag",
    Insta360: "brand-insta"
  };
  return map[brand] || "brand-dji";
}

function brandFallback(brand) {
  const map = {
    DJI: "assets/gallery/dji-001.jpg",
    XAG: "assets/gallery/xag-001.jpg",
    Insta360: "assets/gallery/insta-001.jpg"
  };
  return map[brand] || "assets/gallery/dji-001.jpg";
}

async function loadProduct() {
  const main = document.getElementById("productViewMain");
  const notFound = `
    <section class="product-hero" aria-labelledby="productTitle">
      <div class="product-hero-copy">
        <p class="eyebrow hero-eyebrow">航野视界</p>
        <h1 id="productTitle">产品未找到</h1>
        <p class="product-summary">请返回首页选择其他产品，或从管理中心重新发布。</p>
        <div class="product-hero-actions">
          <a class="btn btn-light" href="index.html#specs">返回产品档案</a>
        </div>
      </div>
    </section>`;

  let catalog = [];
  try {
    const response = await fetch("assets/catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog not found");
    catalog = await response.json();
  } catch (error) {
    main.innerHTML = notFound;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const product = catalog.find((item) => item.id === productId);
  if (!product || (!product.active && !isPreview)) {
    main.innerHTML = notFound;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const brandTag = `<span class="brand-tag ${brandClass(product.brand)}">${escapeHtml(product.brand)}</span>`;
  document.getElementById("productBrand").innerHTML = `${brandTag} · ${escapeHtml(product.category || "产品档案")}`;
  document.title = `航野视界 | ${product.name} 详细参数`;
  document.querySelector('meta[name="description"]').setAttribute("content", `航野视界，${product.name} 完整参数、价格方案与相关素材。`);
  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productPrice").innerHTML = `${escapeHtml(product.price)} <span>${escapeHtml(product.priceNote || "")}</span>`;
  document.getElementById("productSummary").textContent = product.summary || "";
  document.getElementById("productHeroImage").src = product.image;
  document.getElementById("productHeroImage").alt = `${product.name} 产品主图`;

  const specs = Array.isArray(product.specs) ? product.specs : [];
  document.getElementById("productSpecList").innerHTML = specs.map((spec) => `
    <div>
      <dt>${escapeHtml(spec.label)}</dt>
      <dd>${escapeHtml(spec.value)}</dd>
    </div>
  `).join("");

  const planGrid = document.getElementById("productPlanGrid");
  planGrid.innerHTML = `
    <article class="product-plan">
      <span>官方价格</span>
      <strong>${escapeHtml(product.price || "按官方页面")}</strong>
      <p>${escapeHtml(product.priceNote || "以官方最新页面为准")}</p>
    </article>
    <article class="product-plan">
      <span>官方配置</span>
      <strong>按官方页面</strong>
      <p>${escapeHtml(product.sourceLabel || "前往官方来源确认当前配置")}</p>
    </article>
  `;

  const sourceLink = document.getElementById("productSourceLink");
  sourceLink.href = product.sourceUrl || "#";
  sourceLink.textContent = product.sourceLabel || "前往官方页面";
  document.getElementById("productSourceText").textContent = `数据来源：${product.sourceLabel || "官方公开页面"}；价格、参数与图片以官方最新信息为准。`;

  const scenes = Array.isArray(product.scenes) ? product.scenes.slice(0, 6) : [];
  while (scenes.length < 3) {
    scenes.push(product.image || brandFallback(product.brand));
  }
  document.getElementById("productMaterialGrid").innerHTML = scenes.map((src, index) => `
    <figure>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(product.name)} 相关素材 ${index + 1}" loading="lazy">
      <figcaption>${index === 0 ? `${escapeHtml(product.name)} 主视觉` : `${escapeHtml(product.name)} 相关素材 ${index + 1}`}</figcaption>
    </figure>
  `).join("");

  if (window.lucide) lucide.createIcons();
}

loadProduct();
