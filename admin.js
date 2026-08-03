const $ = (id) => document.getElementById(id);

const state = {
  repo: "hpl18197/portfolio",
  token: "",
  catalog: [],
  catalogSha: null,
  editingId: null,
  pendingHero: null,
  pendingScenes: []
};

function saveSettings() {
  localStorage.setItem("hvAdminRepo", state.repo);
  localStorage.setItem("hvAdminToken", state.token);
}

function restoreSettings() {
  state.repo = localStorage.getItem("hvAdminRepo") || state.repo;
  state.token = localStorage.getItem("hvAdminToken") || "";
  $("repoInput").value = state.repo;
  $("tokenInput").value = state.token;
}

function setStatus(message, isError = false) {
  const status = $("connectStatus");
  status.textContent = message;
  status.style.color = isError ? "#9f3d2c" : "";
}

let toastTimer = null;
function toast(message, isError = false) {
  const el = $("adminToast");
  el.textContent = message;
  el.classList.toggle("is-error", isError);
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3600);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function encodeText(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function api(path, options = {}) {
  const headers = {
    Authorization: `token ${state.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.headers || {})
  };
  const response = await fetch(`https://api.github.com/repos/${state.repo}/${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (error) {
      // keep status text
    }
    throw new Error(message);
  }
  return response.json();
}

async function getFileSha(path) {
  try {
    const data = await api(`contents/${path}`);
    return data.sha;
  } catch (error) {
    return null;
  }
}

async function uploadFile(path, file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const content = btoa(binary);
  const sha = await getFileSha(path);
  const body = {
    message: `Upload ${path}`,
    content
  };
  if (sha) body.sha = sha;
  await api(`contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
}

async function deleteFile(path) {
  const sha = await getFileSha(path);
  if (!sha) return;
  await api(`contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({ message: `Delete ${path}`, sha }),
    headers: { "Content-Type": "application/json" }
  });
}

async function saveCatalog(message) {
  const content = encodeText(JSON.stringify(state.catalog, null, 2));
  const body = {
    message: message || "Update product catalog",
    content
  };
  if (state.catalogSha) body.sha = state.catalogSha;
  const data = await api("contents/assets/catalog.json", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
  state.catalogSha = data.content.sha;
}

function renderStats() {
  const active = state.catalog.filter((item) => item.active !== false).length;
  $("statTotal").textContent = String(state.catalog.length);
  $("statActive").textContent = String(active);
  $("statHidden").textContent = String(state.catalog.length - active);
  $("adminMeta").textContent = state.token
    ? `已连接 ${state.repo}，保存后会自动发布到 GitHub Pages。`
    : "未连接仓库，当前显示本地产品档案。";
}

function renderList() {
  const list = $("productList");
  const query = $("searchInput").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const items = state.catalog.filter((product) => {
    const matchesQuery = !query ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      (product.category || "").toLowerCase().includes(query);
    const matchesStatus =
      status === "all" ||
      (status === "active" && product.active !== false) ||
      (status === "hidden" && product.active === false);
    return matchesQuery && matchesStatus;
  });

  if (!items.length) {
    list.innerHTML = `<div class="admin-empty">没有找到符合条件的产品</div>`;
    return;
  }

  list.innerHTML = items.map((product) => {
    const statusClass = product.active === false ? "is-hidden" : "is-active";
    const statusText = product.active === false ? "已下架" : "已上架";
    const toggleText = product.active === false ? "上架" : "下架";
    const toggleAction = product.active === false ? "publish" : "unpublish";
    return `
      <article class="admin-row">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)} 产品图">
        <div class="admin-product-info">
          <div class="admin-product-title">
            <strong>${escapeHtml(product.name)}</strong>
            <span>${escapeHtml(product.brand)}</span>
          </div>
          <span>${escapeHtml(product.category || "产品档案")}</span>
        </div>
        <div class="admin-price">${escapeHtml(product.price || "按官方页面")}</div>
        <span class="admin-status ${statusClass}">${statusText}</span>
        <div class="admin-actions">
          <a class="admin-btn" href="product-view.html?product=${encodeURIComponent(product.id)}&preview=1" target="_blank" rel="noopener" title="预览">
            <i data-lucide="eye" aria-hidden="true"></i>
            预览
          </a>
          <button class="admin-btn" type="button" data-action="edit" data-id="${escapeHtml(product.id)}">编辑</button>
          <button class="admin-btn" type="button" data-action="${toggleAction}" data-id="${escapeHtml(product.id)}">${toggleText}</button>
          <button class="admin-btn admin-btn-danger" type="button" data-action="delete" data-id="${escapeHtml(product.id)}">删除</button>
        </div>
      </article>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

function renderAll() {
  renderStats();
  renderList();
}

function addSpecRow(label = "", value = "") {
  const row = document.createElement("div");
  row.className = "admin-spec-row";
  row.innerHTML = `
    <input class="spec-label" placeholder="参数名" value="${escapeHtml(label)}">
    <input class="spec-value" placeholder="参数值" value="${escapeHtml(value)}">
    <button class="admin-btn admin-btn-ghost" type="button" aria-label="删除参数">
      <i data-lucide="trash-2" aria-hidden="true"></i>
    </button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  $("specRows").appendChild(row);
  if (window.lucide) lucide.createIcons();
}

function collectSpecs() {
  return [...document.querySelectorAll("#specRows .admin-spec-row")]
    .map((row) => ({
      label: row.querySelector(".spec-label").value.trim(),
      value: row.querySelector(".spec-value").value.trim()
    }))
    .filter((item) => item.label || item.value);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileExtension(file) {
  const name = String(file.name || "image.png");
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "png";
}

function renderScenePreview() {
  const holder = $("scenePreview");
  const scenes = state.pendingScenes.length
    ? state.pendingScenes
    : (state.catalog.find((item) => item.id === state.editingId)?.scenes || []);
  holder.innerHTML = scenes.slice(0, 6).map((src) => {
    if (src instanceof File) {
      return `<img src="${URL.createObjectURL(src)}" alt="场景图预览">`;
    }
    return `<img src="${escapeHtml(src)}" alt="场景图预览">`;
  }).join("");
}

function openNewProduct() {
  state.editingId = null;
  state.pendingHero = null;
  state.pendingScenes = [];
  $("editorTitle").textContent = "新增产品";
  $("productForm").reset();
  $("fieldId").removeAttribute("readonly");
  $("fieldId").value = `product-${Date.now()}`;
  $("fieldBrand").value = "DJI";
  $("fieldActive").checked = true;
  $("imagePreview").removeAttribute("src");
  $("specRows").innerHTML = "";
  addSpecRow();
  renderScenePreview();
  $("editorDialog").showModal();
  if (window.lucide) lucide.createIcons();
}

function openEditProduct(id) {
  const product = state.catalog.find((item) => item.id === id);
  if (!product) return;
  state.editingId = product.id;
  state.pendingHero = null;
  state.pendingScenes = [];
  $("editorTitle").textContent = `编辑 ${product.name}`;
  $("productForm").reset();
  $("fieldId").value = product.id;
  $("fieldId").setAttribute("readonly", "readonly");
  $("fieldName").value = product.name || "";
  $("fieldBrand").value = product.brand || "DJI";
  $("fieldCategory").value = product.category || "";
  $("fieldPrice").value = product.price || "";
  $("fieldPriceNote").value = product.priceNote || "";
  $("fieldSummary").value = product.summary || "";
  $("fieldSourceLabel").value = product.sourceLabel || "";
  $("fieldSourceUrl").value = product.sourceUrl || "";
  $("fieldActive").checked = product.active !== false;
  $("imagePreview").src = product.image || "";
  $("specRows").innerHTML = "";
  (Array.isArray(product.specs) && product.specs.length ? product.specs : [{}]).forEach((spec) => {
    addSpecRow(spec.label || "", spec.value || "");
  });
  renderScenePreview();
  $("editorDialog").showModal();
  if (window.lucide) lucide.createIcons();
}

function closeEditor() {
  $("editorDialog").close();
}

async function saveProduct(event) {
  event.preventDefault();
  const name = $("fieldName").value.trim();
  if (!name) {
    toast("请填写产品名称", true);
    return;
  }

  const rawId = $("fieldId").value.trim();
  const id = rawId || slugify(name) || `product-${Date.now()}`;
  const existing = state.catalog.find((item) => item.id === id);
  if (existing && existing.id !== state.editingId) {
    toast("产品 ID 已存在，请换一个", true);
    return;
  }

  const isNew = !state.editingId;
  if (isNew && !state.pendingHero) {
    toast("新产品必须上传一张产品主图", true);
    return;
  }

  $("editorDialog").close();
  toast("正在上传并发布产品...");

  try {
    let image = existing?.image || "";
    let scenes = Array.isArray(existing?.scenes) ? [...existing.scenes] : [];

    if (state.pendingHero) {
      const heroPath = `assets/uploads/${id}-hero.${fileExtension(state.pendingHero)}`;
      await uploadFile(heroPath, state.pendingHero);
      image = heroPath;
    }

    for (let index = 0; index < state.pendingScenes.length; index += 1) {
      const file = state.pendingScenes[index];
      const scenePath = `assets/uploads/${id}-scene${index + 1}.${fileExtension(file)}`;
      await uploadFile(scenePath, file);
      if (index < scenes.length) {
        scenes[index] = scenePath;
      } else {
        scenes.push(scenePath);
      }
    }

    const product = {
      id,
      brand: $("fieldBrand").value,
      name,
      category: $("fieldCategory").value.trim(),
      price: $("fieldPrice").value.trim(),
      priceNote: $("fieldPriceNote").value.trim(),
      summary: $("fieldSummary").value.trim(),
      image,
      scenes,
      specs: collectSpecs(),
      sourceLabel: $("fieldSourceLabel").value.trim(),
      sourceUrl: $("fieldSourceUrl").value.trim(),
      active: $("fieldActive").checked,
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    if (existing) {
      Object.assign(existing, product);
    } else {
      state.catalog.push(product);
    }

    await saveCatalog(isNew ? `Add product: ${name}` : `Update product: ${name}`);
    renderAll();
    toast(`已发布：${name}`);
  } catch (error) {
    toast(`发布失败：${error.message}`, true);
    $("editorDialog").showModal();
  }
}

async function toggleProduct(id, publish) {
  const product = state.catalog.find((item) => item.id === id);
  if (!product) return;
  const next = publish ? true : false;
  product.active = next;
  try {
    await saveCatalog(`${publish ? "上架" : "下架"}：${product.name}`);
    renderAll();
    toast(`${product.name} 已${publish ? "上架" : "下架"}`);
  } catch (error) {
    toast(`操作失败：${error.message}`, true);
    renderAll();
  }
}

async function deleteProduct(id) {
  const product = state.catalog.find((item) => item.id === id);
  if (!product) return;
  const confirmed = window.confirm(`确定删除“${product.name}”吗？此操作会移除产品档案。`);
  if (!confirmed) return;

  toast("正在删除产品...");
  try {
    const uploadedPaths = [product.image, ...(product.scenes || [])]
      .filter((path) => path && path.startsWith("assets/uploads/"));
    for (const path of uploadedPaths) {
      await deleteFile(path);
    }
    state.catalog = state.catalog.filter((item) => item.id !== id);
    await saveCatalog(`Delete product: ${product.name}`);
    renderAll();
    toast(`已删除：${product.name}`);
  } catch (error) {
    toast(`删除失败：${error.message}`, true);
    renderAll();
  }
}

async function connectRepo(event) {
  if (event) event.preventDefault();
  state.repo = $("repoInput").value.trim();
  state.token = $("tokenInput").value.trim();
  if (!state.repo || !state.token) {
    setStatus("请填写仓库和 GitHub Token。", true);
    return;
  }
  saveSettings();
  setStatus("正在连接 GitHub 并读取产品档案...");
  try {
    const data = await api("contents/assets/catalog.json");
    state.catalog = JSON.parse(decodeBase64(data.content));
    state.catalogSha = data.sha;
    renderAll();
    setStatus(`已连接 ${state.repo}，当前产品档案已从 GitHub 载入。`);
    toast("已连接仓库");
  } catch (error) {
    setStatus(`连接失败：${error.message}。当前仍显示本地产品档案。`, true);
    renderAll();
  }
}

async function loadLocalCatalog() {
  try {
    const response = await fetch("assets/catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog not found");
    state.catalog = await response.json();
    renderAll();
  } catch (error) {
    $("adminMeta").textContent = "本地产品档案读取失败。";
  }
}

function init() {
  restoreSettings();
  $("connectForm").addEventListener("submit", connectRepo);
  $("newProductBtn").addEventListener("click", openNewProduct);
  $("closeEditorBtn").addEventListener("click", closeEditor);
  $("cancelEditorBtn").addEventListener("click", closeEditor);
  $("productForm").addEventListener("submit", saveProduct);
  $("addSpecBtn").addEventListener("click", () => addSpecRow());
  $("searchInput").addEventListener("input", renderList);
  $("statusFilter").addEventListener("change", renderList);
  $("fieldImage").addEventListener("change", (event) => {
    state.pendingHero = event.target.files[0] || null;
    if (state.pendingHero) {
      $("imagePreview").src = URL.createObjectURL(state.pendingHero);
    }
  });
  $("fieldScenes").addEventListener("change", (event) => {
    state.pendingScenes = Array.from(event.target.files || []);
    renderScenePreview();
  });
  $("productList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    if (action === "edit") openEditProduct(id);
    if (action === "publish") toggleProduct(id, true);
    if (action === "unpublish") toggleProduct(id, false);
    if (action === "delete") deleteProduct(id);
  });
  loadLocalCatalog();
  if (window.lucide) lucide.createIcons();
}

init();
