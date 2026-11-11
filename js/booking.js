// ======================================================
//  SAKARTVELO — Бронирование + EmailJS
// ======================================================
const Booking = {
  date: null, time: null, table: null,
  takenSlots: {},

  showAlert(msg, icon) {
    const m = document.getElementById('valModal');
    const p = document.getElementById('valMsg');
    const ic = document.getElementById('valIcon');
    const ok = document.getElementById('valOk');
    if (!m) { alert(msg); return; }
    if (ic) ic.textContent = icon || '⚠️';
    if (p) p.textContent = msg;
    m.classList.add('open');
    const close = () => m.classList.remove('open');
    if (ok) { ok.onclick = close; }
    m.onclick = e => { if (e.target === m) close(); };
  },

  init() {
    this.loadEmailJS();
    this.initDate();
    this.initSlots();
    this.initTables();
    this.initForm();
    this.initCounter();
  },

  loadEmailJS() {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => {
      if (CONFIG.EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY')
        emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
    };
    document.head.appendChild(s);
  },

  localDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  },

  initDate() {
    const inp = document.getElementById('bDate');
    if (!inp) return;
    const today = new Date();
    const max   = new Date(); max.setMonth(max.getMonth() + 3);
    inp.min = this.localDate(today);
    inp.max = this.localDate(max);
    inp.addEventListener('change', () => {
      this.date = inp.value;
      this.refreshSlots();
      this.refreshTables();
    });
  },

  ALL_SLOTS: ['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'],

  initSlots() {
    const wrap = document.getElementById('timeSlots');
    if (!wrap) return;
    wrap.innerHTML = this.ALL_SLOTS.map(t =>
      '<button class="slot" type="button" data-t="' + t + '">' + t + '</button>'
    ).join('');
    wrap.querySelectorAll('.slot').forEach(btn =>
      btn.addEventListener('click', () => {
        if (btn.classList.contains('taken')) return;
        wrap.querySelectorAll('.slot').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.time = btn.dataset.t;
        this.refreshTables();
      })
    );
  },

  refreshSlots() {
    const wrap = document.getElementById('timeSlots');
    if (!wrap || !this.date) return;
    const occ = (this.takenSlots[this.date] || {});
    const now = new Date();
    const todayStr = this.localDate(now);
    wrap.querySelectorAll('.slot').forEach(btn => {
      const t = btn.dataset.t;
      const past = this.date === todayStr && parseInt(t) <= now.getHours();
      const full = (occ[t] || []).length >= 12;
      btn.classList.toggle('taken', past || full);
      btn.classList.toggle('limited', !past && !full && (occ[t]||[]).length >= 8);
      if ((past||full) && this.time === t) this.time = null;
    });
  },

  ZONES: [
    { label: 'У окна',  ids: [1,2,3,4] },
    { label: 'Центр',   ids: [5,6,7,8] },
    { label: 'У бара',  ids: [9,10,11,12] }
  ],

  initTables() {
    const wrap = document.getElementById('tableMap');
    if (!wrap) return;
    wrap.innerHTML = this.ZONES.map(z =>
      '<div class="zone"><p class="zone-label">' + z.label + '</p><div class="zone-tables">' +
      z.ids.map(id =>
        '<button class="tbl" type="button" data-id="' + id + '"><span class="tbl-icon"></span><span class="tbl-num">' + id + '</span></button>'
      ).join('') + '</div></div>'
    ).join('');
    wrap.querySelectorAll('.tbl').forEach(btn =>
      btn.addEventListener('click', () => {
        if (btn.classList.contains('taken')) return;
        wrap.querySelectorAll('.tbl').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.table = parseInt(btn.dataset.id);
        document.getElementById('tableInfo').textContent = 'Выбран стол № ' + this.table;
      })
    );
  },

  refreshTables() {
    if (!this.date || !this.time) return;
    const taken = ((this.takenSlots[this.date] || {})[this.time]) || [];
    document.querySelectorAll('.tbl').forEach(btn => {
      const id = parseInt(btn.dataset.id);
      btn.classList.toggle('taken', taken.includes(id));
      if (taken.includes(id) && this.table === id) {
        this.table = null;
        document.getElementById('tableInfo').textContent = '';
      }
    });
  },

  initCounter() {
    const inp   = document.getElementById('bGuests');
    const minus = document.getElementById('gMinus');
    const plus  = document.getElementById('gPlus');
    if (!inp) return;
    minus.addEventListener('click', () => { if(inp.value>1) inp.value=+inp.value-1; });
    plus.addEventListener('click',  () => { if(inp.value<20) inp.value=+inp.value+1; });
  },

  initForm() {
    const form = document.getElementById('bookForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!this.validate()) return;
      const btn = form.querySelector('.btn-book');
      btn.disabled = true; btn.textContent = 'Отправляем...';
      try {
        await this.submit();
        this.showConfirm();
      } catch(err) {
        console.error(err);
        this.showAlert('Ошибка отправки письма. Проверьте настройки EmailJS в config.js', '📧');
      } finally {
        btn.disabled = false; btn.textContent = 'Забронировать стол →';
      }
    });
  },

  validate() {
    const fields = ['bName','bEmail','bPhone'];
    let ok = true;
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) { if(el) el.classList.add('err'); ok = false; }
      else el.classList.remove('err');
    });
    const emailEl = document.getElementById('bEmail');
    if (emailEl && !emailEl.value.includes('@')) { emailEl.classList.add('err'); ok = false; }
    if (!ok) {
      this.showAlert('Пожалуйста, заполните все обязательные поля', '📋');
      return false;
    }
    if (!this.date)  { this.showAlert('Выберите дату визита', '📅'); return false; }
    if (!this.time)  { this.showAlert('Выберите удобное время', '🕐'); return false; }
    if (!this.table) { this.showAlert('Выберите столик на карте', '🍽'); return false; }
    return true;
  },

  async submit() {
    const name   = document.getElementById('bName').value.trim();
    const email  = document.getElementById('bEmail').value.trim();
    const phone  = document.getElementById('bPhone').value.trim();
    const guests = document.getElementById('bGuests').value;
    const wishes = document.getElementById('bWishes').value.trim();
    const id     = 'SK-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const dateFmt = new Date(this.date).toLocaleDateString('ru-RU',
      {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
    const preorder = Cart.items.length
      ? Cart.summaryText() + '\nИтого: ' + Cart.total().toLocaleString('ru') + ' руб.'
      : 'Предзаказ не оформлен';
    const fullPhone = (document.getElementById('pcCode') ? document.getElementById('pcCode').textContent : '') + ' ' + phone;
    const params = {
      to_email: email, guest_name: name, guest_phone: fullPhone,
      guests, date: dateFmt, time: this.time, table: this.table,
      preorder, wishes: wishes || '—', booking_id: id,
      rest_phone: CONFIG.RESTAURANT_PHONE, rest_addr: CONFIG.RESTAURANT_ADDRESS
    };
    if (typeof emailjs !== 'undefined' && CONFIG.EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
      await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, params);
    }
    if (!this.takenSlots[this.date]) this.takenSlots[this.date] = {};
    if (!this.takenSlots[this.date][this.time]) this.takenSlots[this.date][this.time] = [];
    this.takenSlots[this.date][this.time].push(this.table);
    this.refreshTables();
    Cart.clear();
    this._lastId = id; this._lastP = params;
  },

  showConfirm() {
    const p = this._lastP;
    document.getElementById('confId').textContent     = this._lastId;
    document.getElementById('confName').textContent   = p.guest_name;
    document.getElementById('confDate').textContent   = p.date;
    document.getElementById('confTime').textContent   = p.time;
    document.getElementById('confTable').textContent  = '№ ' + p.table;
    document.getElementById('confGuests').textContent = p.guests + ' чел.';
    document.getElementById('confEmail').textContent  = p.to_email;
    document.getElementById('confModal').classList.add('open');
    document.getElementById('bookForm').reset();
    this.date = this.time = this.table = null;
    document.getElementById('tableInfo').textContent = '';
    document.getElementById('preorderBlock').style.display = 'none';
    document.querySelectorAll('.slot,.tbl').forEach(b => b.classList.remove('active'));
  }
};

document.addEventListener('DOMContentLoaded', () => Booking.init());
