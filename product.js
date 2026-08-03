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
