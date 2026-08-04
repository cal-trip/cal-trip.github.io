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
  santacruz: { day: 'DAY 1 · 13:45', kicker: 'WHARF STOP', title: 'Santa Cruz', text: 'Wharf、海滩和 Boardwalk 外景短停 40 分钟；14:30 硬性离开。', image: 'assets/santa-cruz.jpg', query: 'Santa Cruz Wharf' },
  monterey: { day: 'DAY 1 · 15:35', kicker: 'MONTEREY COAST', title: 'Lovers Point · Monterey', text: '25 分钟海岸观景；停车困难时直接略过，把时间留给 Carmel。', image: 'assets/lovers.jpg', query: 'Lovers Point Park' },
  carmel: { day: 'DAY 1 · 16:45', kicker: 'MUST-SEE VILLAGE', title: 'Carmel-by-the-Sea', text: 'Ocean Avenue、童话庭院与小店；使用 Car Week 免费接驳，停一次、轻松逛，并在镇上吃晚餐。', image: 'assets/carmel.jpg', query: 'Carmel Plaza Carmel-by-the-Sea' },
  bigsur: { day: 'DAY 2 · 12:45', kicker: 'THE WILD COAST', title: 'Big Sur', text: 'Bixby、McWay 路边观景、Ragged Point 休息与象海豹观景。', image: 'assets/mcway.jpg', query: 'Big Sur California' },
  hearst: { day: 'DAY 3 · 12:00', kicker: 'ARCHITECTURE & ART', title: 'Hearst Castle', text: 'Grand Rooms Tour：提前20分钟报到，连同上下山接驳共预留约两小时；结束后经CA-46前往Paso。', image: 'assets/hearst-castle.jpg', query: 'Hearst Castle Visitor Center' },
  pismo: { day: 'NIGHT 2 + DAY 3', kicker: 'SOUTHERN TURNAROUND', title: 'Pismo Beach', text: '第二晚入住 Inn at the Pier；第三天早餐后10:20出发，北上前往Hearst Castle。', image: 'assets/pismo.jpg', query: 'Pismo Beach Pier' },
  paso: { day: 'DAY 3 · 15:35', kicker: 'FINAL CHARGE', title: 'Paso Robles', text: 'Golden Hill Road Supercharger 补电20–25分钟，然后沿US-101北返。', image: 'assets/hearst-castle.jpg', query: 'Tesla Supercharger 2421 Golden Hill Road Paso Robles' }
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

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const stageTimers = new WeakMap();

function updateVisualStage(item) {
  if (!canHover.matches) return;
  const day = item.closest('.day-section');
  const stage = day?.querySelector('[data-visual-stage]');
  if (!stage) return;
  const label = item.dataset.previewLabel || item.querySelector('h3')?.textContent || '景点照片';
  const time = item.querySelector('time')?.textContent.trim() || '';
  const kicker = item.querySelector('.eyeline')?.textContent.trim() || 'SCENIC STOP';
  const description = item.querySelector('p:not(.eyeline)')?.textContent.trim() || '';
  const image = stage.querySelector('img');
  const caption = stage.querySelector('figcaption');
  day.querySelectorAll('.timeline-item').forEach((entry) => entry.classList.toggle('is-stage-active', entry === item));
  window.clearTimeout(stageTimers.get(stage));
  stage.classList.add('switching');
  stageTimers.set(stage, window.setTimeout(() => {
    image.src = item.dataset.preview;
    image.alt = label;
    caption.querySelector('p').textContent = `${time} · ${kicker}`;
    caption.querySelector('h3').textContent = label;
    caption.querySelector('span').textContent = description;
    stage.classList.remove('switching');
  }, 110));
}

document.querySelectorAll('.timeline-item[data-preview]').forEach((item) => {
  item.tabIndex = 0;
  const label = item.dataset.previewLabel || item.querySelector('h3')?.textContent || '景点照片';
  const hint = document.createElement('span');
  hint.className = 'preview-hint';
  hint.textContent = canHover.matches ? '悬停切换右侧大图 →' : '点击展开大图 ＋';
  item.querySelector(':scope > div')?.append(hint);

  const inline = document.createElement('figure');
  inline.className = 'inline-preview';
  inline.innerHTML = `<img src="${item.dataset.preview}" alt="${label}" loading="lazy"><figcaption>${label}</figcaption>`;
  item.querySelector(':scope > div')?.append(inline);

  item.addEventListener('mouseenter', () => updateVisualStage(item));
  item.addEventListener('focus', () => updateVisualStage(item));
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
