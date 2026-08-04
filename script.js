const saved = JSON.parse(localStorage.getItem('calTripChecklist') || '{}');
document.querySelectorAll('[data-save]').forEach((box) => {
  box.checked = Boolean(saved[box.dataset.save]);
  box.addEventListener('change', () => {
    saved[box.dataset.save] = box.checked;
    localStorage.setItem('calTripChecklist', JSON.stringify(saved));
  });
});

const navLinks = [...document.querySelectorAll('.mobile-day-nav a, .desktop-nav a')];
const sections = [...document.querySelectorAll('#overview, #day1, #day2, #day3, #checklist')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => observer.observe(section));

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    const icon = detail.querySelector('summary span');
    if (icon) icon.setAttribute('aria-label', detail.open ? '收起' : '展开');
  });
});
