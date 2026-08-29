document.documentElement.classList.add("js");

document.getElementById("year").textContent = new Date().getFullYear();

const header = document.getElementById("site-header");
const onScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const form = document.getElementById("apply-form");
const successMessage = document.getElementById("apply-success");
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Request failed");
      form.hidden = true;
      successMessage.hidden = false;
      successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar Solicitud";
      alert(
        "No hemos podido enviar tu solicitud en este momento. Escríbenos directamente a admin@labs24kfranquicias.com."
      );
    }
  });
}
