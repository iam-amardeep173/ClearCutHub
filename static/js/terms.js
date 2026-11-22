document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navLinkItems = document.querySelectorAll(".nav-links li a");
  const footerModal = document.getElementById("footerModal");

  // Toggle navigation menu for mobile
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });

  // Close menu when a link is clicked
  navLinkItems.forEach(link =>
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("open");
    })
  );

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("open");
    }
  });

  // Sticky navbar scroll effect (optional shrink)
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Footer modal toggling logic (you must define a button/link to toggle it)
  const modalTrigger = document.querySelector("#openFooterModal");
  const modalClose = document.querySelector("#closeFooterModal");

  if (modalTrigger && modalClose && footerModal) {
    modalTrigger.addEventListener("click", () => {
      footerModal.classList.add("active");
    });

    modalClose.addEventListener("click", () => {
      footerModal.classList.remove("active");
    });

    // Close modal if clicked outside
    window.addEventListener("click", (e) => {
      if (e.target === footerModal) {
        footerModal.classList.remove("active");
      }
    });
  }
});
