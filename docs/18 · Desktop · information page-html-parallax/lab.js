/* Curiosity info page: GSAP + ScrollTrigger lab animation.
   Without GSAP (offline/blocked) or with prefers-reduced-motion, the page stays fully visible and static. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const root = document.documentElement;
  const motion = !!(window.gsap && window.ScrollTrigger) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motion) root.classList.remove('js');
  else { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  /* ---------- copy ---------- */
  const COPY = {
    en: { nav1: 'Programs', nav2: 'How booking works', nav3: 'TOAD truck', nav4: 'FAQ', signIn: 'Sign in', book: 'Book a visit', explore: 'Explore programs',
      headline: 'Bring your class to real science.', sub: 'Book the Curiosity Cube, the Curiosity Lab or the TOAD truck in under 3 minutes, without email back-and-forth.' },
    de: { nav1: 'Programme', nav2: 'So funktioniert die Buchung', nav3: 'TOAD-Truck', nav4: 'FAQ', signIn: 'Anmelden', book: 'Besuch buchen', explore: 'Programme ansehen',
      headline: 'Echte Wissenschaft für Ihre Klasse.', sub: 'Buchen Sie Curiosity Cube, Curiosity Lab oder den TOAD-Truck, in unter 3 Minuten und ohne Papierkram.' }
  };
  const STEPS = [
    { title: 'How would you like to visit?', rows: [['Onsite STEM visit', 'Instant', 'var(--brand-mint)', 1], ['TOAD truck visit', 'Approval', 'var(--brand-magenta)', 0]] },
    { title: 'Thu, 15 Oct · Cube first', rows: [['09:00 → 10:30', '30 seats', 'var(--brand-mint)', 1], ['10:30 → 12:00', '12 seats', 'var(--brand-yellow)', 0], ['12:00 → 13:30', 'Full', 'var(--muted)', 0]] },
    { title: 'Grade 4 · 24 students', rows: [['Wheelchair access', 'Added', 'var(--primary)', 1], ['Hearing support', '', 'var(--muted)', 0]] },
    { title: 'You are booked!', rows: [['Add to calendar', '.ics', 'var(--brand-yellow)', 0], ['Pre-visit kit', '4 steps', 'var(--brand-purple)', 1]] }
  ];

  /* ---------- text split (words rise out of a mask, like liquid out of a tube) ---------- */
  function splitWords(el, text = el.textContent.trim()) {
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
    if (motion) { gsap.set($$('.w > span', el), { yPercent: 115 }); el.style.visibility = 'visible'; }
  }
  const rise = el => gsap.to($$('.w > span', el), { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .06 });

  /* ---------- language ---------- */
  const h1 = $('#headline');
  function setLang(l, first) {
    root.lang = l;
    $$('[data-i18n]').forEach(e => { if (e !== h1) e.textContent = COPY[l][e.dataset.i18n]; });
    splitWords(h1, COPY[l].headline);
    if (motion && !first) rise(h1);
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
  }
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang('en', true);
  $$('h2[data-split]').forEach(h => {
    splitWords(h);
    if (motion) ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => rise(h) });
  });

  /* ---------- header menu ---------- */
  const hdr = $('.hdr'), burger = $('.burger');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', hdr.classList.toggle('open')));
  $$('.nav a').forEach(a => a.addEventListener('click', () => { hdr.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

  /* ---------- FAQ (one open at a time; animation is CSS) ---------- */
  $$('.faq__item button').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item'), was = item.classList.contains('open');
    $$('.faq__item').forEach(i => { i.classList.remove('open'); $('button', i).setAttribute('aria-expanded', 'false'); });
    if (!was) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  }));

  /* ---------- periodic strip + wave paths (markup generated, not typed) ---------- */
  const TILES = [[1, 'H', 'Hydrogen'], [2, 'He', 'Helium'], [3, 'Li', 'Lithium'], [6, 'C', 'Carbon'], [7, 'N', 'Nitrogen'], [8, 'O', 'Oxygen'], [9, 'F', 'Fluorine'], [11, 'Na', 'Sodium'], [12, 'Mg', 'Magnesium'], [14, 'Si', 'Silicon'], [16, 'S', 'Sulfur'], [17, 'Cl', 'Chlorine'], [19, 'K', 'Potassium'], [20, 'Ca', 'Calcium'], [26, 'Fe', 'Iron'], [29, 'Cu', 'Copper'], [47, 'Ag', 'Silver'], [79, 'Au', 'Gold']];
  const BRAND = ['--brand-mint', '--brand-yellow', '--brand-magenta', '--brand-lime', '--brand-cyan'];
  $$('.mq-row').forEach((row, r) => {
    const list = r ? [...TILES].reverse() : TILES;
    row.innerHTML = list.map(([n, s, name], i) => `<div class="el" style="--c:var(${BRAND[(i + r * 2) % BRAND.length]})"><small>${n}</small><b>${s}</b><span>${name}</span></div>`).join('');
  });
  // data-wave="baselineY amplitude segmentWidth segments": seamless, loops when shifted by two segments
  $$('[data-wave]').forEach(p => {
    const [y, a, seg, n] = p.dataset.wave.split(' ').map(Number);
    p.setAttribute('d', `M0 ${y} q${seg / 2} ${-a} ${seg} 0` + ` t${seg} 0`.repeat(n - 1) + ' V480 H0Z');
  });

  /* ---------- booking steps ---------- */
  let cur = 0, auto = true, bar;
  function setStep(i, user) {
    cur = i; if (user) auto = false;
    $$('.step').forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    const s = STEPS[i];
    $('#pv-n').textContent = i + 1;
    $('#pv-dots').innerHTML = STEPS.map((_, k) => `<span style="background:${k <= i ? 'var(--primary)' : 'var(--border)'}"></span>`).join('');
    $('#pv-title').textContent = s.title;
    $('#pv-rows').innerHTML = s.rows.map(([l, n, dot, sel]) => `<div class="pv-row${sel ? ' is-sel' : ''}"><i style="background:${dot}"></i><b>${l}</b><span>${n}</span></div>`).join('');
    if (!motion) return;
    gsap.from('#pv-rows .pv-row', { x: 24, opacity: 0, duration: .45, stagger: .07, ease: 'power3.out' });
    bar && bar.kill();
    gsap.set('.step .bar', { scaleX: 0 });
    if (auto) bar = gsap.fromTo($$('.step .bar')[i], { scaleX: 0 }, { scaleX: 1, duration: 4.5, ease: 'none', onComplete: () => setStep((cur + 1) % STEPS.length) });
  }
  $$('.step').forEach(b => b.addEventListener('click', () => setStep(+b.dataset.i, true)));
  setStep(0);

  /* ---------- video placeholder: set data-src on .video__frame to go live ---------- */
  const frame = $('.video__frame'), vid = $('.video__el'), play = $('.play');
  if (frame.dataset.src) {
    play.setAttribute('aria-disabled', 'false');
    play.setAttribute('aria-label', 'Play video');
    $('.video__cap b').textContent = 'Watch the film';
    play.addEventListener('click', () => {
      vid.src = frame.dataset.src;
      if (frame.dataset.poster) vid.poster = frame.dataset.poster;
      vid.hidden = false; $('.video__ph').hidden = true; vid.play();
    });
  }

  if (!motion) return;

  /* ====================== MOTION ====================== */
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

  // rising bubbles: each loops independently
  function bubbles(els, { dist = 120, dur = [2, 4], dx = 0, delay = [0, 3] } = {}) {
    els.forEach(b => {
      const d = rand(...dur);
      gsap.timeline({ repeat: -1, delay: rand(...delay) })
        .fromTo(b, { y: 0, x: 0, scale: .5 }, { y: -dist, x: dx * rand(.5, 1.5), scale: 1, duration: d, ease: 'none' })
        .fromTo(b, { opacity: 0 }, { opacity: .9, duration: d * .2, ease: 'none' }, 0)
        .to(b, { opacity: 0, duration: d * .25, ease: 'none' }, d * .75);
    });
  }

  /* --- background bubbles drifting at different parallax speeds --- */
  const bgfx = $('.bgfx');
  for (let i = 0; i < (innerWidth < 720 ? 7 : 12); i++) {
    const b = document.createElement('i'), s = rand(18, 70);
    b.style.cssText = `--c:var(${BRAND[i % BRAND.length]});width:${s}px;height:${s}px;left:${rand(0, 96)}%;top:${rand(0, 100)}%`;
    bgfx.appendChild(b);
    gsap.to(b, { y: () => -ScrollTrigger.maxScroll(window) * rand(.05, .3), ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
    gsap.to(b, { x: rand(-24, 24), duration: rand(3, 6), yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });

  /* --- hero intro --- */
  const hero = $('.hero');
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hdr', { yPercent: -100, duration: .7 })
    .from('.blob', { scale: 0, duration: 1.1, ease: 'elastic.out(1,.6)', stagger: .1 }, .1)
    .add(rise(h1), .25)
    .from('.hero__sub, .hero__cta', { opacity: 0, y: 16, duration: .7, stagger: .1 }, .9)
    .from('.glass-line', { strokeDashoffset: 1, duration: 1.4, ease: 'power2.inOut' }, .3)
    .from('.glass-fill', { opacity: 0, duration: .8 }, .8)
    .from('.liquid', { y: 210, duration: 1.6, ease: 'power2.out' }, 1)
    .from('.tl', { y: 90, duration: 1.1, stagger: .12 }, 1.2)
    .from('.atom, .hex', { scale: 0, duration: .9, ease: 'back.out(2)', stagger: .15 }, 1.1)
    .from('.scene .pop', { scale: .6, opacity: 0, duration: .7, ease: 'back.out(1.7)', stagger: .12 }, 1.4);

  /* --- hero idle loops --- */
  gsap.to('.wave-f', { x: -130, duration: 3.2, ease: 'none', repeat: -1 });
  gsap.fromTo('.wave-b', { x: -130 }, { x: 0, duration: 4.4, ease: 'none', repeat: -1 });
  bubbles($$('.inb'), { dist: 130, dur: [2, 3.6] });
  bubbles($$('.vap'), { dist: 150, dur: [2.5, 4.5], dx: 22, delay: [1.6, 5] });
  gsap.to('.hex', { rotation: 360, duration: 40, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  $$('.orb').forEach((e, i) => gsap.to(e, { rotation: 360, duration: 2.6 + i * 1.3, repeat: -1, ease: 'none', transformOrigin: '50% 50%' }));
  $$('.tl').forEach((t, i) => gsap.to(t, { attr: { y: '+=6' }, duration: 2 + i * .4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  $$('.chip .pop').forEach((c, i) => gsap.to(c, { y: -8, duration: 2.2 + i * .5, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

  // tap the flask: shake, change colour, burst of foam
  const COLORS = ['#96d7d2', '#ffc832', '#eb3c96', '#a5cd50', '#2dbecd'];
  let ci = 0;
  function react(burst) {
    ci = (ci + 1) % COLORS.length;
    gsap.to('.wave-f', { fill: COLORS[ci], duration: .8 });
    gsap.to('.wave-b', { fill: COLORS[(ci + 2) % COLORS.length], duration: 1.2 });
    if (!burst) return;
    gsap.fromTo('.flask-w', { rotation: -4 }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1,.25)', transformOrigin: '50% 100%' });
    $$('.foam').forEach((f, i) => gsap.fromTo(f,
      { x: 0, y: 0, opacity: 1, scale: .5 },
      { x: rand(-70, 70), y: rand(-200, -110), opacity: 0, scale: rand(1, 1.8), duration: rand(.9, 1.5), ease: 'power2.out', delay: i * .03 }));
  }
  $('#flask').addEventListener('click', () => react(true));
  (function loop() { gsap.delayedCall(3.8, () => { react(false); loop(); }); })();

  /* --- hero parallax (scroll + pointer) --- */
  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__copy', { yPercent: 14, ease: 'none', scrollTrigger: st });
  gsap.to('.scene', { yPercent: -10, ease: 'none', scrollTrigger: st });
  $$('.blob').forEach(b => gsap.to(b, { y: () => hero.offsetHeight * +b.dataset.speed, ease: 'none', scrollTrigger: st }));
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const layers = $$('[data-depth]', hero).map(el => ({ d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: .8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: .8, ease: 'power3' }) }));
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      layers.forEach(l => { l.x(nx * l.d); l.y(ny * l.d); });
    });
  }

  /* --- counters: tick up when the strip arrives --- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, o = { v: 0 };
    el.textContent = 0;
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', snap: { v: 1 }, onUpdate: () => { el.textContent = o.v; }, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  /* --- programs: cards "pour" in like liquid filling a vessel --- */
  const CARD = 'inset(%s 0% 0% 0% round 28px)';
  gsap.fromTo('.prog', { clipPath: CARD.replace('%s', '100%') }, { clipPath: CARD.replace('%s', '0%'), duration: 1.1, ease: 'power3.out', stagger: .16, clearProps: 'clipPath', scrollTrigger: { trigger: '.progs', start: 'top 82%', once: true } });
  gsap.from('.prog__body > *', { y: 18, opacity: 0, duration: .6, stagger: .05, delay: .3, ease: 'power2.out', scrollTrigger: { trigger: '.progs', start: 'top 82%', once: true } });
  gsap.to('.cube3d', { rotationY: 360, rotationX: 360, duration: 16, repeat: -1, ease: 'none' });
  gsap.to('.core', { scale: 1.35, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.bk-wave', { x: -40, duration: 1.8, ease: 'none', repeat: -1 });
  bubbles($$('.bk-b'), { dist: 70, dur: [1.4, 2.6] });
  gsap.to('.mini-truck', { x: 14, y: -4, duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  $$('.shape').forEach((s, i) => gsap.to(s, { scale: 1.12, duration: 3 + i, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

  /* --- periodic strip slides sideways as you scroll --- */
  $$('.mq-row').forEach((row, i) => gsap.fromTo(row, { xPercent: i ? -22 : 0 }, { xPercent: i ? 0 : -22, ease: 'none', scrollTrigger: { trigger: '.mq', start: 'top bottom', end: 'bottom top', scrub: .6 } }));

  /* --- video: the frame grows into place, glassware drifts --- */
  gsap.fromTo(frame, { scale: .8, borderRadius: 72 }, { scale: 1, borderRadius: 32, ease: 'none', scrollTrigger: { trigger: '.video__frame', start: 'top 92%', end: 'top 35%', scrub: true } });
  $$('.vfloat').forEach(v => gsap.to(v, { y: +v.dataset.speed, rotation: +v.dataset.speed / 4, ease: 'none', scrollTrigger: { trigger: '.video', start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.fromTo('.play-ring', { scale: 1, opacity: .8 }, { scale: 1.9, opacity: 0, duration: 1.8, repeat: -1, ease: 'power1.out' });
  bubbles($$('.vb'), { dist: frame.offsetHeight * .95 || 300, dur: [3, 6], delay: [0, 5] });

  /* --- booking: pause the auto-advance while off-screen --- */
  const howST = ScrollTrigger.create({ trigger: '#how', start: 'top 85%', end: 'bottom 15%', onToggle: s => bar && bar.paused(!s.isActive) });
  if (!howST.isActive) bar && bar.pause();
  gsap.from('.hb', { scale: 0, duration: 1, ease: 'elastic.out(1,.6)', stagger: .15, scrollTrigger: { trigger: '.how__r', start: 'top 80%', once: true } });

  /* --- TOAD truck drives in as you scroll; wheels and road follow the scroll --- */
  const drive = { trigger: '.truck-stage', start: 'top 88%', end: 'bottom 62%', scrub: .5 };
  gsap.fromTo('.truck', { x: -430 }, { x: 0, ease: 'none', scrollTrigger: drive });
  gsap.to('.wheel', { rotation: 900, transformOrigin: '50% 50%', ease: 'none', scrollTrigger: drive });
  gsap.fromTo('.road-dash', { strokeDashoffset: 0 }, { strokeDashoffset: 128, ease: 'none', scrollTrigger: drive });
  bubbles($$('.puff'), { dist: 60, dur: [1.2, 2.2], dx: -40 });
  gsap.from('.trio > div', { y: 24, opacity: 0, duration: .6, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.trio', start: 'top 88%', once: true } });

  /* --- FAQ rows slide in --- */
  gsap.from('.faq__item', { x: 40, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.faq__list', start: 'top 85%', once: true } });
})();
