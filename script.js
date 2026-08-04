const saved = JSON.parse(localStorage.getItem('calTripChecklist') || '{}');
document.querySelectorAll('[data-save]').forEach((box) => {
  box.checked = Boolean(saved[box.dataset.save]);
  box.addEventListener('change', () => {
    saved[box.dataset.save] = box.checked;
    localStorage.setItem('calTripChecklist', JSON.stringify(saved));
  });
});

const navLinks = [...document.querySelectorAll('.mobile-day-nav a, .desktop-nav a')];
const sections = [...document.querySelectorAll('#overview, #trending, #day1, #day2, #day3, #checklist')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => observer.observe(section));

const mapStops = {
  stanford: { day: 'DAY 1 · 10:00', kicker: 'START / FINISH', title: 'Stanford University', text: '8 月 12 日 10:00 出发；8 月 14 日约 19:45–20:30 返回。全程只有你一位驾驶者。', image: 'assets/bixby.jpg', query: 'Stanford University' },
  pigeon: { day: 'DAY 1 · 11:35', kicker: 'LIGHTHOUSE STOP', title: 'Pigeon Point', text: '30 分钟灯塔外景与轻松海岸观景。', image: 'assets/pigeon.jpg', query: 'Pigeon Point Lighthouse' },
  monterey: { day: 'DAY 1 · 15:10', kicker: 'MONTEREY COAST', title: 'Lovers Point · Monterey', text: 'Lovers Point、Cannery Row、晚餐与充电；晚上住 Salinas。', image: 'assets/lovers.jpg', query: 'Lovers Point Park' },
  bigsur: { day: 'DAY 2 · 12:45', kicker: 'THE WILD COAST', title: 'Big Sur', text: 'Bixby、McWay 路边观景、Ragged Point 休息与象海豹观景。', image: 'assets/mcway.jpg', query: 'Big Sur California' },
  morro: { day: 'DAY 3 · 14:15', kicker: 'HARBOR STOP', title: 'Morro Bay', text: 'Embarcadero 港湾与 Morro Rock 轻松观景，15:20 硬性离开。', image: 'assets/morro.jpg', query: 'Morro Rock' },
  pismo: { day: 'NIGHT 2 + DAY 3', kicker: 'SOUTHERN TURNAROUND', title: 'Pismo Beach', text: '第二晚入住 Inn at the Pier；第三天睡到自然醒，早餐后看海。', image: 'assets/pismo.jpg', query: 'Pismo Beach Pier' },
  paso: { day: 'DAY 3 · 16:05', kicker: 'FINAL CHARGE', title: 'Paso Robles', text: 'Golden Hill Road Supercharger 补电 20–25 分钟，然后沿 US-101 北返。', image: 'assets/morro.jpg', query: 'Tesla Supercharger 2421 Golden Hill Road Paso Robles' }
};

const mapDetail = {
  image: document.querySelector('#map-detail-image'),
  day: document.querySelector('#map-detail-day'),
  kicker: document.querySelector('#map-detail-kicker'),
  title: document.querySelector('#map-detail-title'),
  text: document.querySelector('#map-detail-text'),
  link: document.querySelector('#map-detail-link')
};

function activateMapStop(pin) {
  const stop = mapStops[pin.dataset.mapStop];
  if (!stop || !mapDetail.image) return;
  document.querySelectorAll('.map-pin').forEach((item) => item.classList.toggle('active', item === pin));
  mapDetail.image.classList.add('switching');
  window.setTimeout(() => {
    mapDetail.image.src = stop.image;
    mapDetail.image.alt = stop.title;
    mapDetail.day.textContent = stop.day;
    mapDetail.kicker.textContent = stop.kicker;
    mapDetail.title.textContent = stop.title;
    mapDetail.text.textContent = stop.text;
    mapDetail.link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.query)}`;
    mapDetail.image.classList.remove('switching');
  }, 120);
}

document.querySelectorAll('.map-pin').forEach((pin) => {
  pin.addEventListener('click', () => activateMapStop(pin));
  pin.addEventListener('mouseenter', () => activateMapStop(pin));
  pin.addEventListener('focus', () => activateMapStop(pin));
  pin.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    activateMapStop(pin);
  });
});

const floatingPreview = document.createElement('figure');
floatingPreview.className = 'hover-preview';
floatingPreview.setAttribute('aria-hidden', 'true');
floatingPreview.innerHTML = '<img alt=""><figcaption></figcaption>';
document.body.append(floatingPreview);

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const previewImage = floatingPreview.querySelector('img');
const previewCaption = floatingPreview.querySelector('figcaption');

function positionPreview(x, y) {
  const width = 340;
  const height = 250;
  floatingPreview.style.left = `${Math.min(x + 24, window.innerWidth - width - 18)}px`;
  floatingPreview.style.top = `${Math.min(Math.max(y - 80, 18), window.innerHeight - height - 18)}px`;
}

document.querySelectorAll('.timeline-item[data-preview]').forEach((item) => {
  item.tabIndex = 0;
  const label = item.dataset.previewLabel || item.querySelector('h3')?.textContent || '景点照片';
  const hint = document.createElement('span');
  hint.className = 'preview-hint';
  hint.textContent = canHover.matches ? '悬停看图 ↗' : '点击看图 ＋';
  item.querySelector(':scope > div')?.append(hint);

  const inline = document.createElement('figure');
  inline.className = 'inline-preview';
  inline.innerHTML = `<img src="${item.dataset.preview}" alt="${label}" loading="lazy"><figcaption>${label}</figcaption>`;
  item.querySelector(':scope > div')?.append(inline);

  const show = (event) => {
    if (!canHover.matches) return;
    previewImage.src = item.dataset.preview;
    previewImage.alt = label;
    previewCaption.textContent = label;
    positionPreview(event.clientX || item.getBoundingClientRect().right, event.clientY || item.getBoundingClientRect().top + 60);
    floatingPreview.classList.add('visible');
  };
  item.addEventListener('mouseenter', show);
  item.addEventListener('mousemove', (event) => canHover.matches && positionPreview(event.clientX, event.clientY));
  item.addEventListener('mouseleave', () => floatingPreview.classList.remove('visible'));
  item.addEventListener('focus', show);
  item.addEventListener('blur', () => floatingPreview.classList.remove('visible'));
  item.addEventListener('click', (event) => {
    if (canHover.matches || event.target.closest('a')) return;
    document.querySelectorAll('.timeline-item.is-preview-open').forEach((openItem) => {
      if (openItem !== item) openItem.classList.remove('is-preview-open');
    });
    item.classList.toggle('is-preview-open');
  });
});

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    const icon = detail.querySelector('summary span');
    if (icon) icon.setAttribute('aria-label', detail.open ? '收起' : '展开');
  });
});
