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
  santaclara: { day: 'DAY 1 · 16:30', kicker: 'START / FINISH', title: 'Santa Clara', text: '8月12日16:30出发；8月14日约19:30–20:30返回。全程只有你一位驾驶者。', image: 'assets/bixby.jpg', query: 'Santa Clara California' },
  monterey: { day: 'DAY 1 · 18:35', kicker: 'MONTEREY SUNSET', title: 'Lovers Point · Monterey', text: '第一天唯一风景主站：看海与日落前金色光线，之后在Monterey补电并吃晚饭。', image: 'assets/lovers.jpg', query: 'Lovers Point Park' },
  carmel: { day: 'DAY 2 · 10:55', kicker: 'MUST-SEE VILLAGE', title: 'Carmel-by-the-Sea', text: '利用Car Week免费接驳，停一次逛Ocean Avenue、童话庭院与小店，并在镇上完成午餐；共保留约2.5小时。', image: 'assets/carmel.jpg', query: 'Carmel Plaza Carmel-by-the-Sea' },
  bigsur: { day: 'DAY 2 · 14:15', kicker: 'THE WILD COAST', title: 'Big Sur', text: 'Carmel之后只保留Bixby、McWay路边观景与象海豹；删除重复餐停和耗时支线。', image: 'assets/mcway.jpg', query: 'Big Sur California' },
  hearst: { day: 'DAY 3 · 12:00', kicker: 'ARCHITECTURE & ART', title: 'Hearst Castle', text: 'Grand Rooms Tour：提前20分钟报到，连同上下山接驳共预留约两小时；结束后经CA-46前往Paso。', image: 'assets/hearst-castle.jpg', query: 'Hearst Castle Visitor Center' },
  pismo: { day: 'NIGHT 2 + DAY 3', kicker: 'SOUTHERN TURNAROUND', title: 'Pismo Beach', text: '第二晚入住 Inn at the Pier；第三天早餐后10:20出发，北上前往Hearst Castle。', image: 'assets/pismo.jpg', query: 'Pismo Beach Pier' },
  paso: { day: 'DAY 3 · 15:35', kicker: 'FINAL CHARGE', title: 'Paso Robles', text: 'Golden Hill Road Supercharger补电20–25分钟，然后沿US-101北返Santa Clara。', image: 'assets/hearst-castle.jpg', query: 'Tesla Supercharger 2421 Golden Hill Road Paso Robles' }
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
