import { initSupportWidget } from "./support-widget.js";

export function initNavigation() {
  initSupportWidget();
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const updateBackToTopVisibility = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 300);
    };
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    updateBackToTopVisibility();
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (!menuButton || !navigation) return;

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Mở menu" : "Đóng menu");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Mở menu");
      navigation.classList.remove("is-open");
    });
  });
}