// ======================================================
//  SAKARTVELO — Корзина предзаказа
// ======================================================
const Cart = {
  items: [],
  _drawerOpen: false,

  add(item) {
    this._skipClose = true;
    const found = this.items.find(i => i.id === item.id);
    if (found) { found.qty++; }
    else { this.items.push({ ...item, qty: 1 }); }
    this.save();
    this.render();
    this.popBubble();
    this.toast('«' + item.name + '» добавлено в корзину');
    this.updateCartButtons();
  },

  remove(id) {
    this._skipClose = true;
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
    this.updateCartButtons();
  },

  updateQty(id, delta) {
    this._skipClose = true;  // elem gets detached before doc-click fires
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { this.items = this.items.filter(i => i.id !== id); }
    this.save();
    this.render();
    this.updateCartButtons();
  },

  clear() { this.items = []; this.save(); this.render(); this.updateCartButtons(); },
  total() { return this.items.reduce((s,i) => s + i.price * i.qty, 0); },
  count() { return this.items.reduce((s,i) => s + i.qty, 0); },

  summaryText() {
    if (!this.items.length) return 'Предзаказ не оформлен';
    return this.items.map(i => i.name + ' x' + i.qty + ' = ' + (i.price * i.qty).toLocaleString('ru') + ' руб.').join('\n');
  },

  save() {
    try { localStorage.setItem('sak_cart', JSON.stringify(this.items)); } catch(e){}
    this.updateBubble();
  },

  load() {
    try {
      const raw = localStorage.getItem('sak_cart');
      if (raw) this.items = JSON.parse(raw);
    } catch(e){ this.items = []; }
    this.updateBubble();
  },

  updateBubble() {
    const n = this.count();
    const bubble = document.getElementById('cartBubble');
    const badge  = document.getElementById('cartBadge');
    if (!bubble) return;
    if (n > 0) { bubble.style.display = 'flex'; if(badge) badge.textContent = n; }
    else { bubble.style.display = 'none'; }
  },

  popBubble() {
    const b = document.getElementById('cartBubble');
    if (!b) return;
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
  },

  // Update all "+ В корзину" buttons to show cart state
  updateCartButtons() {
    const ids = new Set(this.items.map(i => i.id));
    // onclick buttons with Cart.add
    document.querySelectorAll('[onclick*="Cart.add"]').forEach(btn => {
      const m = btn.getAttribute('onclick').match(/id:'([^']+)'/);
      if (!m) return;
      const id = m[1];
      if (ids.has(id)) {
        btn.textContent = '✓ В корзине';
        btn.style.background = 'rgba(196,160,80,.25)';
        btn.style.borderColor = 'rgba(196,160,80,.6)';
      } else {
        btn.textContent = '+ В корзину';
        btn.style.background = '';
        btn.style.borderColor = '';
      }
    });
    // feat-add buttons
    document.querySelectorAll('[onclick*="Cart.add"].feat-add').forEach(btn => {
      const m = btn.getAttribute('onclick').match(/id:'([^']+)'/);
      if (!m) return;
      const id = m[1];
      if (ids.has(id)) {
        btn.textContent = '✓ Уже в корзине';
      } else {
        btn.textContent = '+ Добавить в корзину';
      }
    });
  },

  render() {
    const wasOpen = this._drawerOpen; // сохраняем состояние дровера
    const list   = document.getElementById('cartList');
    const empty  = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const total  = document.getElementById('cartTotal');
    if (!list) return;

    if (this.items.length === 0) {
      list.innerHTML = '';
      if (empty)  empty.style.display  = 'block';
      if (footer) footer.style.display = 'none';
    } else {
      if (empty)  empty.style.display  = 'none';
      if (footer) footer.style.display = 'flex';
      if (total)  total.textContent = this.total().toLocaleString('ru') + ' руб.';

      list.innerHTML = this.items.map(item => [
        '<div class="cart-item" data-id="' + item.id + '">',
          '<div class="ci-info">',
            '<span class="ci-name">' + item.name + '</span>',
            '<span class="ci-price">' + item.price.toLocaleString('ru') + ' руб.</span>',
          '</div>',
          '<div class="ci-row">',
            '<div class="ci-qty">',
              '<button class="qty-btn" onclick="Cart.updateQty(\'' + item.id + '\',-1)">−</button>',
              '<span>' + item.qty + '</span>',
              '<button class="qty-btn" onclick="Cart.updateQty(\'' + item.id + '\',1)">+</button>',
            '</div>',
            '<span class="ci-subtotal">' + (item.price * item.qty).toLocaleString('ru') + ' руб.</span>',
            '<button class="ci-remove" onclick="Cart.remove(\'' + item.id + '\')">✕</button>',
          '</div>',
        '</div>'
      ].join('')).join('');
    }

    // Preorder block on booking page
    const pb = document.getElementById('preorderBlock');
    const pl = document.getElementById('preorderList');
    const pt = document.getElementById('preorderTotal');
    if (pb && pl) {
      if (this.items.length > 0) {
        pb.style.display = 'block';
        pl.innerHTML = this.items.map(i =>
          '<li><span>' + i.name + '</span><em>x' + i.qty + '</em><b>' + (i.price * i.qty).toLocaleString('ru') + ' руб.</b></li>'
        ).join('');
        if (pt) pt.textContent = 'Итого: ' + this.total().toLocaleString('ru') + ' руб.';
      } else {
        pb.style.display = 'none';
      }
    }
  },

  toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(Cart._toastTimer);
    Cart._toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  },

  open()  {
    this._drawerOpen = true;
    const d = document.getElementById('cartDrawer');
    if (d) d.classList.add('open');
  },
  close() {
    this._drawerOpen = false;
    const d = document.getElementById('cartDrawer');
    if (d) d.classList.remove('open');
  },

  goBooking() {
    this.close();
    if (typeof showPage === 'function') showPage('booking');
    setTimeout(() => this.render(), 100);
  },

  init() {
    this.load();
    this.render();
    this.updateCartButtons();

    const bubble = document.getElementById('cartBubble');
    const close  = document.getElementById('cartClose');
    const clear  = document.getElementById('cartClear');
    const book   = document.getElementById('cartBook');

    if (bubble) bubble.addEventListener('click', () => this.open());
    if (close)  close.addEventListener('click',  () => this.close());
    if (clear)  clear.addEventListener('click',  () => this.clear());
    if (book)   book.addEventListener('click',   () => this.goBooking());

    // Close on outside click.
    // _skipClose ставится в true перед render() в add/remove/updateQty,
    // т.к. после innerHTML-замены кнопка detached из DOM
    // и drawer.contains(e.target) вернёт false — дровер закрывался.
    document.addEventListener('click', e => {
      if (this._skipClose) { this._skipClose = false; return; }
      const drawer = document.getElementById('cartDrawer');
      const bub    = document.getElementById('cartBubble');
      if (e.target.closest('[onclick*="Cart.add"]')) return;
      if (drawer && this._drawerOpen &&
          !drawer.contains(e.target) &&
          bub && !bub.contains(e.target)) {
        this.close();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());
