// ======================================================
//  SAKARTVELO - Navigation, animations, filters
// ======================================================

// --- Page Navigation ---
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('pg-' + name);
  if (pg) { pg.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  document.querySelectorAll('[data-page]').forEach(l =>
    l.classList.toggle('active', l.dataset.page === name));
  if (name === 'booking') { Booking.refreshSlots(); Booking.refreshTables(); }
  if (pg && location.hash.slice(1) !== name) history.replaceState(null, '', name === 'home' ? location.pathname : '#' + name);
  setTimeout(revealCheck, 100);
}

// --- Custom Cursor (FIXED: use left/top, keep CSS transform for centering) ---
function initCursor() {
  const dot  = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  if (!dot || window.innerWidth < 1024) return;
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const run = () => {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(run);
  };
  run();
  document.querySelectorAll('a,button,.menu-card,.wine-card,.tbl').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('big'));
    el.addEventListener('mouseleave', () => ring.classList.remove('big'));
  });
}

// --- Particles ---
function initParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts;
  function resize(){ W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }
  function make(){ pts = Array.from({length:55}, () => ({x:Math.random()*W, y:Math.random()*H, r:Math.random()*2+.5, vx:(Math.random()-.5)*.4, vy:-Math.random()*.6-.2, a:Math.random()})); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fillStyle = 'rgba(196,160,80,' + p.a + ')'; ctx.fill();
      p.x += p.vx; p.y += p.vy; p.a -= .003;
      if (p.a <= 0 || p.y < 0) { p.x = Math.random()*W; p.y = H+5; p.a = Math.random(); p.vy = -Math.random()*.6-.2; }
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', () => { resize(); make(); });
  resize(); make(); draw();
}

// --- Counters ---
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target._done) {
        e.target._done = true;
        const to = parseInt(e.target.dataset.counter);
        let s = null;
        const step = ts => {
          if (!s) s = ts;
          const p = Math.min((ts-s)/1800, 1), ease = 1 - Math.pow(1-p, 3);
          e.target.textContent = Math.round(to * ease).toLocaleString('ru') + (e.target.dataset.suffix || '');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    });
  }, {threshold:.5});
  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
}

// --- Scroll Reveal ---
function revealCheck() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, {threshold:.1});
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
}

// --- Preloader ---
function initPreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 700); }, 2000);
}

// --- Navbar scroll ---
function initNav() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 50));
}

// --- Mobile menu ---
function initMobile() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('navMenu');
  if (!burger) return;
  burger.addEventListener('click', () => { menu.classList.toggle('open'); burger.classList.toggle('x'); });
  menu.querySelectorAll('[data-page]').forEach(l => l.addEventListener('click', () => { menu.classList.remove('open'); burger.classList.remove('x'); }));
}

// --- Gallery lightbox ---
function initGallery() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.querySelectorAll('.gi').forEach(item => {
    item.addEventListener('click', () => {
      const im = item.querySelector('img');
      lb.querySelector('.lb-inner').style.backgroundImage = im ? 'url("' + im.src + '")' : getComputedStyle(item).backgroundImage;
      lb.classList.add('open');
    });
  });
  lb.addEventListener('click', e => { if (!e.target.closest('.lb-inner')) lb.classList.remove('open'); });
}

// --- Menu filter ---
function initMenuFilter() {
  document.querySelectorAll('.mcat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mcat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.menu-card').forEach(c => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'flex' : 'none';
      });
    });
  });
}

// --- Wine filter ---
function initWineFilter() {
  document.querySelectorAll('.wcat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wcat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.type;
      document.querySelectorAll('.wine-card').forEach(c => {
        c.style.display = (t === 'all' || c.dataset.type === t) ? 'block' : 'none';
      });
    });
  });
}

// --- Modals ---
function initModals() {
  document.querySelectorAll('.modal-backdrop,.modal-close').forEach(el => {
    el.addEventListener('click', function(e) {
      if (e.target === this || this.classList.contains('modal-close'))
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal,.val-modal').forEach(m => m.classList.remove('open'));
  });
}

// --- Phone country selector ---
const COUNTRIES = [
  { flag: '🇷🇺', name: 'Россия',         dial: '+7' },
  { flag: '🇺🇦', name: 'Украина',        dial: '+380' },
  { flag: '🇧🇾', name: 'Беларусь',       dial: '+375' },
  { flag: '🇬🇪', name: 'Грузия',         dial: '+995' },
  { flag: '🇦🇲', name: 'Армения',        dial: '+374' },
  { flag: '🇦🇿', name: 'Азербайджан',     dial: '+994' },
  { flag: '🇰🇿', name: 'Казахстан',      dial: '+7' },
  { flag: '🇺🇿', name: 'Узбекистан',    dial: '+998' },
  { flag: '🇹🇷', name: 'Турция',         dial: '+90' },
  { flag: '🇩🇪', name: 'Германия',        dial: '+49' },
  { flag: '🇬🇧', name: 'Великобритания',  dial: '+44' },
  { flag: '🇺🇸', name: 'США',            dial: '+1' },
  { flag: '🇫🇷', name: 'Франция',         dial: '+33' },
  { flag: '🇮🇹', name: 'Италия',         dial: '+39' },
  { flag: '🇪🇸', name: 'Испания',        dial: '+34' },
  { flag: '🇵🇱', name: 'Польша',          dial: '+48' },
  { flag: '🇨🇿', name: 'Чехия',          dial: '+420' },
  { flag: '🇦🇹', name: 'Австрия',         dial: '+43' },
  { flag: '🇨🇭', name: 'Швейцария',      dial: '+41' },
  { flag: '🇳🇱', name: 'Нидерланды',     dial: '+31' },
  { flag: '🇧🇪', name: 'Бельгия',         dial: '+32' },
  { flag: '🇸🇪', name: 'Швеция',         dial: '+46' },
  { flag: '🇳🇴', name: 'Норвегия',         dial: '+47' },
  { flag: '🇨🇳', name: 'Китай',          dial: '+86' },
  { flag: '🇯🇵', name: 'Япония',          dial: '+81' },
  { flag: '🇰🇷', name: 'Корея',          dial: '+82' },
  { flag: '🇮🇳', name: 'Индия',          dial: '+91' },
  { flag: '🇮🇱', name: 'Израиль',         dial: '+972' },
  { flag: '🇦🇪', name: 'ОАЕ',            dial: '+971' },
];

function initPhoneSelector() {
  const btn      = document.getElementById('phoneCodeBtn');
  const dropdown = document.getElementById('phoneDropdown');
  const list     = document.getElementById('pdList');
  const search   = document.getElementById('pdSearch');
  const flagEl   = document.getElementById('pcFlag');
  const codeEl   = document.getElementById('pcCode');
  const phoneInp = document.getElementById('bPhone');
  if (!btn || !dropdown) return;

  let selected = COUNTRIES[0];

  function renderList(filter) {
    const q = (filter || '').toLowerCase();
    const items = q ? COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q)) : COUNTRIES;
    list.innerHTML = items.map((c,i) => {
      const isActive = c.dial === selected.dial && c.name === selected.name;
      return '<div class="pd-item' + (isActive?' active':'') + '" data-i="' + COUNTRIES.indexOf(c) + '">' +
        '<span class="pd-flag">' + c.flag + '</span>' +
        '<span class="pd-name">' + c.name + '</span>' +
        '<span class="pd-dial">' + c.dial + '</span></div>';
    }).join('');
    list.querySelectorAll('.pd-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.i);
        selected = COUNTRIES[idx];
        flagEl.textContent = selected.flag;
        codeEl.textContent = selected.dial;
        closeDropdown();
      });
    });
  }

  function openDropdown() {
    dropdown.classList.add('open');
    search.value = '';
    renderList('');
    setTimeout(() => search.focus(), 50);
  }
  function closeDropdown() { dropdown.classList.remove('open'); }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });
  search.addEventListener('input', () => renderList(search.value));
  search.addEventListener('keydown', e => e.stopPropagation());
  document.addEventListener('click', e => {
    if (!btn.closest('.phone-wrap').contains(e.target)) closeDropdown();
  });

  // Phone input: digits only
  if (phoneInp) {
    phoneInp.addEventListener('input', () => {
      const clean = phoneInp.value.replace(/[^0-9]/g, '');
      if (phoneInp.value !== clean) phoneInp.value = clean;
    });
    phoneInp.addEventListener('keydown', e => {
      const allow = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
      if (e.ctrlKey || e.metaKey) return;
      if (!allow.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault();
    });
    phoneInp.setAttribute('inputmode', 'numeric');
    phoneInp.setAttribute('pattern', '[0-9]*');
    phoneInp.placeholder = '999 000 00 00';
  }

  renderList('');
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initMobile();
  initCursor();
  initParticles();
  initCounters();
  revealCheck();
  initGallery();
  initMenuFilter();
  initWineFilter();
  initModals();
  initPhoneSelector();

  document.querySelectorAll('[data-page]').forEach(el =>
    el.addEventListener('click', () => showPage(el.dataset.page)));

  const PAGES = ['home','menu','wine','booking'];
  const fromHash = () => PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  showPage(fromHash());
  window.addEventListener('hashchange', () => showPage(fromHash()));
});
