// SalesFlow — app.js
// Lógica compartida por todas las vistas: navegación.

/* ── Nav mobile toggle ─────────────────────────────── */
const toggle = document.querySelector('.nav__toggle');
const links  = document.querySelector('.nav__links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

/* ── Active nav link ───────────────────────────────── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('nav__link--active');
  }
});
