/* 叮当支付 App · iOS 风 H5 SPA（hash 路由 + 空/加载/错误态） */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var toast = function (m, t) { window.DDUI && DDUI.toast(m, t); };

  /* ---------- 图标（内联 SVG，线性风格） ---------- */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/><path d="M6 6V5a2 2 0 0 1 2-2h9"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4-7-7-4z"/>',
    store: '<path d="M4 9h16l-1.5-5h-13z"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
    down: '<path d="M12 4v13M6 11l6 6 6-6M5 21h14"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    back: '<path d="m15 5-7 7 7 7"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
    doc: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.2 2.2 3.5 5"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 6 7.5M11 5c-.8 4-3.4 7-7 8.5"/><path d="m13 21 4-10 4 10M14.5 17.5h5"/>',
    face: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 9v1.5M15 9v1.5M12 9v4h-1M9.5 16a4 4 0 0 0 5 0"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 18v3h-3"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
    bill: '<path d="M6 2h12a1 1 0 0 1 1 1v19l-3-2-3 2-3-2-3 2V3a1 1 0 0 1 1-1z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    calc: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6"/><path d="M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M9 19h.01M12 19h.01M15 19h.01"/>'
  };
  function ic(n, cls) { return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (P[n] || '') + '</svg>'; }
  var CHEV = '<svg class="chev" viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m1.5 1.5 5 5-5 5"/></svg>';

  /* ---------- 模拟数据 ---------- */
  var S0 = {
    authed: false, hide: false, bio: true, push: true, n2fa: true,
    accounts: [
      { cur: 'EUR', name: '欧元账户', bal: 48260.35, c: '#003399', iban: 'MT84 MALT 0110 0001 2345 MTLC AST0 01S' },
      { cur: 'USD', name: '美元账户', bal: 23105.80, c: '#3C3B6E', iban: 'GB29 NWBK 6016 1331 9268 19' },
      { cur: 'GBP', name: '英镑账户', bal: 8920.00, c: '#C8102E', iban: 'GB33 BUKB 2020 1555 5555 55' },
      { cur: 'USDT', name: 'USDT 钱包', bal: 15000.00, c: '#26A17B', iban: 'TRC20 · TQ7x…9fKp' }
    ],
    recipients: [
      { id: 'r1', name: '深圳市优品贸易有限公司', bank: '招商银行 · 尾号 8821', cur: 'CNY', c: '#FF9500' },
      { id: 'r2', name: 'Global Parts GmbH', bank: 'Deutsche Bank · DE89…3000', cur: 'EUR', c: '#007AFF' },
      { id: 'r3', name: '李明', bank: '微信 · wx_liming88', cur: 'CNY', c: '#34C759' }
    ],
    tx: [
      { id: 't1', t: '付款给 Global Parts GmbH', k: 'out', amt: -3200, cur: 'EUR', d: '今天 10:24', st: 'ok', ch: 'SEPA Instant' },
      { id: 't2', t: 'Shopify 店铺结算', k: 'in', amt: 12450.6, cur: 'USD', d: '今天 08:02', st: 'ok', ch: '独立站收单' },
      { id: 't3', t: '速汇中国 · 深圳优品', k: 'out', amt: -5000, cur: 'EUR', d: '昨天 16:40', st: 'wait', ch: '速汇中国' },
      { id: 't4', t: 'EUR → USD 兑换', k: 'fx', amt: -2000, cur: 'EUR', d: '昨天 11:15', st: 'ok', ch: '兑换' },
      { id: 't5', t: '微信收单结算', k: 'in', amt: 6820.4, cur: 'EUR', d: '10月6日', st: 'ok', ch: '微信收单' },
      { id: 't6', t: '付款给 李明', k: 'out', amt: -800, cur: 'EUR', d: '10月5日', st: 'fail', ch: '速汇中国' },
      { id: 't7', t: 'Steam 游戏收单结算', k: 'in', amt: 3390, cur: 'USD', d: '10月4日', st: 'ok', ch: '游戏收单' }
    ],
    notes: [
      { t: '收款到账', d: 'Shopify 店铺结算 USD 12,450.60 已入账', time: '08:02', unread: true },
      { t: '付款处理中', d: '速汇中国 EUR 5,000.00 预计 30 分钟内到账', time: '昨天', unread: true },
      { t: '安全提醒', d: '您的账户在新设备 iPhone 15 Pro 上登录', time: '10月6日', unread: false }
    ]
  };
  var S = S0; try { var _st = JSON.parse(localStorage.getItem('dd-app') || 'null'); if (_st) for (var _k in _st) S[_k] = _st[_k]; } catch (e) { }
  function save() { localStorage.setItem('dd-app', JSON.stringify(S)); }
  var SYM = { EUR: '€', USD: '$', GBP: '£', CNY: '¥', USDT: '₮' };
  var RATE = { EUR: 1, USD: 1.09, GBP: .86, CNY: 7.82, USDT: 1.09 };
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }); }
  function money(n, cur) { return (n < 0 ? '−' : '') + (SYM[cur] || '') + fmt(Math.abs(n)); }
  function mask(s) { return S.hide ? '••••••' : s; }
  function total() { return S.accounts.reduce(function (a, x) { return a + x.bal / RATE[x.cur]; }, 0); }
  function stPill(st) { return st === 'ok' ? '<span class="pill ok">已完成</span>' : st === 'wait' ? '<span class="pill wait">处理中</span>' : '<span class="pill fail">失败</span>'; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- 路由 ---------- */
  var TABS = [['home', '首页', 'home'], ['accounts', '账户', 'wallet'], ['pay', '付款', 'send'], ['acquire', '收单', 'store'], ['me', '我的', 'user']];
  var view = $('#view'), tabbar = $('#tabbar'), hist = [];
  tabbar.innerHTML = TABS.map(function (t) { return '<a href="#/' + t[0] + '" data-tab="' + t[0] + '"><span class="tb-ic">' + ic(t[2]) + '</span>' + t[1] + '</a>'; }).join('');

  var R = {};
  function go(path) { location.hash = '#/' + path; }
  function render() {
    var path = (location.hash.replace(/^#\/?/, '') || (S.authed ? 'home' : 'welcome'));
    if (!S.authed && path !== 'welcome') path = 'welcome';
    var parts = path.split('/'), name = parts[0], arg = parts[1];
    var fn = R[name] || R.notfound;
    var isTab = TABS.some(function (t) { return t[0] === name; });
    var dir = 'fwd';
    if (hist.length > 1 && hist[hist.length - 2] === path) { hist.pop(); dir = 'back'; } else hist.push(path);
    tabbar.classList.toggle('hide', !isTab);
    view.classList.toggle('sub', !isTab);
    tabbar.querySelectorAll('a').forEach(function (a) { a.classList.toggle('on', a.dataset.tab === name); });
    var out = fn(arg);
    view.innerHTML = '<div class="pg ' + (isTab ? 'tab' : dir === 'back' ? 'back' : '') + '">' + (out.html || out) + '</div>';
    view.scrollTop = 0;
    if (out.mount) out.mount(view);
  }
  window.addEventListener('hashchange', render);
  function nav(title, act) { return '<div class="navbar"><button class="back" data-back>' + ic('back') + '返回</button><div class="ttl">' + title + '</div><div class="act">' + (act || '') + '</div></div>'; }
  view.addEventListener('click', function (e) {
    var b = e.target.closest('[data-back]');
    if (b) { e.preventDefault(); history.length > 1 ? history.back() : go('home'); return; }
    var g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); }
  });

  /* ---------- 底部 Sheet ---------- */
  function sheet(o) {
    var root = $('#sheet-root');
    root.innerHTML = '<div class="sheet-mask"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + (o.title ? '<h3>' + o.title + '</h3>' : '') + '<div class="sh-body">' + (o.body || '') + '</div>' + (o.actions ? '<div class="sh-act">' + o.actions + '</div>' : '') + '</div>';
    var m = $('.sheet-mask', root), s = $('.sheet', root);
    requestAnimationFrame(function () { m.classList.add('show'); s.classList.add('show'); });
    function close() { m.classList.remove('show'); s.classList.remove('show'); setTimeout(function () { root.innerHTML = ''; }, 320); }
    m.onclick = close;
    s.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    if (o.mount) o.mount(s, close);
    return close;
  }

  /* ---------- 状态（空/加载/错误） ---------- */
  function skel(n) { var r = ''; for (var i = 0; i < n; i++) r += '<div class="dd-skel-row"><div class="dd-skel" style="width:40px;height:40px;border-radius:50%;flex:none"></div><div style="flex:1"><div class="dd-skel" style="height:12px;width:60%;margin-bottom:8px"></div><div class="dd-skel" style="height:10px;width:35%"></div></div><div class="dd-skel" style="height:12px;width:56px"></div></div>'; return '<div class="skel-list">' + r + '</div>'; }
  function stateBox(el, type, o) { DDUI.state(el, type, o); }

  /* 动态文本片段英文化（模拟数据 / 拼接字符串，i18n 词典无法整句匹配） */
  var EN = localStorage.getItem('dd-lang') === 'en';
  var FR = [['付款给 ', 'Payment to '], ['速汇中国 · ', 'China Express · '], ['速汇中国', 'China Express'], ['深圳优品', 'Shenzhen Youpin'], ['李明', 'Li Ming'],
    ['Shopify 店铺结算', 'Shopify store settlement'], ['Steam 游戏收单结算', 'Steam gaming settlement'], ['微信收单结算', 'WeChat Pay settlement'], [' 兑换', ' exchange'], ['兑换', 'Exchange'],
    ['独立站收单', 'Online store'], ['微信收单', 'WeChat Pay'], ['游戏收单', 'Gaming'], ['微信 · ', 'WeChat · '], ['今天 ', 'Today '], ['昨天 ', 'Yesterday '], ['昨天', 'Yesterday'], ['刚刚', 'Just now'],
    ['今日 ', 'Today '], [' 账户', ' account'], ['账户', ' Account'], ['已入账', 'credited'], ['预计 30 分钟内到账', 'expected within 30 min']];
  function L(s) {
    if (!EN || s == null) return s;
    s = String(s);
    FR.forEach(function (p) { s = s.split(p[0]).join(p[1]); });
    return s.replace(/(\d+)月(\d+)日/g, function (_, m, d) { return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] + ' ' + d; });
  }

  function txRow(t) {
    var col = t.k === 'in' ? '#34C759' : t.k === 'fx' ? '#AF52DE' : '#007AFF';
    var n = t.k === 'in' ? 'down' : t.k === 'fx' ? 'swap' : 'send';
    return '<button class="row" data-go="tx/' + t.id + '"><span class="av" style="background:' + col + '1a;color:' + col + '">' + ic(n) + '</span><span class="rt"><b>' + esc(L(t.t)) + '</b><small>' + L(t.d) + ' · ' + L(t.ch) + '</small></span><span class="rv ' + (t.amt > 0 ? 'pos' : 'neg') + '">' + (t.amt > 0 ? '+' : '') + mask(money(t.amt, t.cur)) + (t.st !== 'ok' ? '<br/>' + stPill(t.st) : '') + '</span></button>';
  }

  /* ================= 页面 ================= */
  R.welcome = function () {
    return { html: '<div class="splash"><div class="art"><img src="../assets/img/logo-v.png" alt="Dingdang Pay" style="width:132px;height:auto;margin-bottom:18px"/><h1>全球资金，<br/>一个 App 搞定</h1><p>多币种全球账户、40+ 国家即时付款、游戏/独立站/微信/支付宝全场景收单。</p></div>' +
      '<div class="acts"><button class="btn pri" id="w-login">登录</button><button class="btn tint" id="w-reg">注册新账户</button></div>' +
      '<p class="legal">继续即表示同意 <a href="../terms.html">服务条款</a> 与 <a href="../privacy.html">隐私协议</a></p></div>',
      mount: function () {
        $('#w-reg').onclick = function () { location.href = '../register.html?demo=1'; };
        $('#w-login').onclick = function () {
          sheet({ title: '登录叮当支付', body: '<form id="lf" novalidate><div class="field"><label><span>邮箱</span><input id="l-em" type="email" required data-rule="email" placeholder="example@email.com" value="demo@dingdangpay.com" autocomplete="username"/></label><label><span>密码</span><input id="l-pw" type="password" required data-rule="min:6" data-msg="请输入密码" placeholder="至少 6 位" value="123456" autocomplete="current-password"/></label></div><p class="foot-note">演示账号已预填，直接登录即可。</p></form>',
            actions: '<button class="btn pri" id="l-go">登录</button><button class="btn tint" id="l-face">' + ic('face') + '使用面容 ID</button>',
            mount: function (s, close) {
              function ok(btn) { DDUI.busy(btn, 900, '登录成功').then(function () { S.authed = true; save(); close(); hist = []; go('home'); }); }
              $('#l-go', s).onclick = function () { if (DDUI.validate($('#lf', s))) ok(this); };
              $('#l-face', s).onclick = function () { ok(this); };
            } });
        };
      } };
  };

  R.home = function () {
    var unread = S.notes.filter(function (n) { return n.unread; }).length;
    return { html: '<div class="large-ttl"><h1>首页</h1><span style="display:flex;gap:10px"><button class="icon-btn" aria-label="扫一扫" id="h-scan">' + ic('scan') + '</button><button class="icon-btn" aria-label="通知" data-go="notifications">' + ic('bell') + (unread ? '<i class="dot"></i>' : '') + '</button></span></div>' +
      '<div class="hero"><small>总资产估值 (EUR) <button class="eye" id="h-eye" aria-label="显示/隐藏余额">' + ic(S.hide ? 'eyeoff' : 'eye') + '</button></small><div class="bal">' + (S.hide ? '••••••' : '<em>€</em>' + fmt(total())) + '</div><div class="chg">' + L('今日 ') + '+€1,284.20 · +1.4%</div>' +
      '<div class="quick"><button data-go="send"><span class="qi">' + ic('send') + '</span>付款</button><button data-go="receive"><span class="qi">' + ic('down') + '</span>收款</button><button data-go="exchange"><span class="qi">' + ic('swap') + '</span>换汇</button><button data-go="paylink"><span class="qi">' + ic('link') + '</span>收款链接</button></div></div>' +
      '<div class="sec-h" style="padding:0 20px 8px"><h3>我的账户</h3><a href="#/accounts">全部</a></div>' +
      '<div class="accs" style="margin-bottom:22px">' + S.accounts.map(function (a, i) { return '<button class="card acc" data-go="account/' + i + '" style="text-align:left"><div class="flag" style="background:' + a.c + '">' + a.cur.slice(0, 3) + '</div><small>' + a.name + '</small><b>' + mask((SYM[a.cur] || '') + fmt(a.bal)) + '</b></button>'; }).join('') + '<button class="card acc add" id="h-add">' + ic('plus') + '新增币种</button></div>' +
      riskBanner() +
      '<div class="promo"><span class="pi">' + ic('globe') + '</span><span style="flex:1"><b>速汇中国 · 微信到账</b><small>欧元直达微信/银行卡，最快 5 分钟</small></span><button class="pill" style="background:#FFD008;color:#382b1b" data-go="send">去付款</button></div>' +
      '<div class="sec" style="margin-bottom:22px"><div class="sec-h"><h3>财税待办</h3><a href="#/tax">全部</a></div>' + taxTodoCard() + '</div>' +
      '<div class="sec"><div class="sec-h"><h3>最近交易</h3><a href="#/tx">查看全部</a></div><div id="h-tx">' + skel(3) + '</div></div>',
      mount: function () {
        $('#h-eye').onclick = function () { S.hide = !S.hide; save(); render(); };
        $('#h-scan').onclick = function () { toast('请在手机上使用相机扫码', 'info'); };
        $('#h-add').onclick = addCurrency;
        wait(500).then(function () { var el = $('#h-tx'); if (el) el.innerHTML = '<div class="list" style="margin:0">' + S.tx.slice(0, 4).map(txRow).join('') + '</div>'; });
      } };
  };

  function addCurrency() {
    var have = S.accounts.map(function (a) { return a.cur; });
    var opts = [['CHF', '瑞士法郎', '#D52B1E'], ['HKD', '港币', '#DE2910'], ['SGD', '新加坡元', '#EF3340'], ['JPY', '日元', '#BC002D']].filter(function (o) { return have.indexOf(o[0]) < 0; });
    if (!opts.length) { toast('已开通全部可用币种', 'info'); return; }
    sheet({ title: '新增币种账户', body: '<div class="list">' + opts.map(function (o) { return '<button class="row" data-cur="' + o[0] + '"><span class="flag av" style="background:' + o[2] + ';color:#fff;width:32px;height:32px;font-size:10px">' + o[0] + '</span><span class="rt"><b>' + o[1] + ' ' + o[0] + '</b><small>免费开通 · 即时生效</small></span>' + CHEV + '</button>'; }).join('') + '</div>',
      mount: function (s, close) {
        s.querySelectorAll('[data-cur]').forEach(function (b) { b.onclick = function () {
          var o = opts.filter(function (x) { return x[0] === b.dataset.cur; })[0];
          RATE[o[0]] = RATE[o[0]] || 1; S.accounts.push({ cur: o[0], name: o[1] + '账户', bal: 0, c: o[2], iban: '开通中…' }); save(); close(); toast(o[1] + '账户已开通', 'success'); render();
        }; });
      } });
  }

  R.accounts = function () {
    return { html: '<div class="large-ttl"><h1>账户</h1><button class="icon-btn" aria-label="新增币种" id="a-add">' + ic('plus') + '</button></div>' +
      '<div class="cap">资产 ' + S.accounts.length + ' 个</div><div class="list" style="margin-bottom:22px">' + S.accounts.map(function (a, i) {
        return '<button class="row" data-go="account/' + i + '"><span class="av" style="background:' + a.c + ';color:#fff;font-size:11px">' + a.cur.slice(0, 3) + '</span><span class="rt"><b>' + a.name + '</b><small>' + esc(a.iban) + '</small></span><span class="rv neg">' + mask((SYM[a.cur] || '') + fmt(a.bal)) + '</span>' + CHEV + '</button>';
      }).join('') + '</div>' +
      '<div class="cap">管理</div><div class="list">' +
      '<button class="row" data-go="cards"><span class="ri" style="background:#5856D6">' + ic('card') + '</span><span class="rt"><b>银行卡</b></span>' + CHEV + '</button>' +
      '<button class="row" data-go="tx"><span class="ri" style="background:#FF9500">' + ic('doc') + '</span><span class="rt"><b>交易记录</b></span>' + CHEV + '</button>' +
      '<button class="row" data-go="exchange"><span class="ri" style="background:#AF52DE">' + ic('swap') + '</span><span class="rt"><b>货币兑换</b></span>' + CHEV + '</button>' +
      '<button class="row" data-go="tax"><span class="ri" style="background:#00B7EC">' + ic('doc') + '</span><span class="rt"><b>税务申报</b></span>' + CHEV + '</button>' +
      '<button class="row" data-go="invoices"><span class="ri" style="background:#FF8106">' + ic('bill') + '</span><span class="rt"><b>营收发票</b></span>' + CHEV + '</button></div>',
      mount: function () { $('#a-add').onclick = addCurrency; } };
  };

  R.account = function (i) {
    var a = S.accounts[+i]; if (!a) return R.notfound();
    var list = S.tx.filter(function (t) { return t.cur === a.cur; });
    return { html: nav(a.name) + '<div class="amount-box" style="padding-top:8px"><span class="cur">' + a.cur + '</span><div style="font-size:44px;font-weight:800;margin-top:12px;letter-spacing:-.02em">' + mask((SYM[a.cur] || '') + fmt(a.bal)) + '</div><div class="hint">可用余额</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px"><button class="btn pri" data-go="send">' + ic('send') + '付款</button><button class="btn tint" data-go="receive">' + ic('down') + '收款</button></div>' +
      '<div class="card iban-card"><div class="k">账户名</div><div class="v">Flash Commerce srl</div><div class="k">' + (a.cur === 'USDT' ? '钱包地址' : 'IBAN') + '</div><div class="v"><span>' + esc(a.iban) + '</span><button class="copy" data-copy="' + esc(a.iban) + '">复制</button></div><div class="k">BIC / SWIFT</div><div class="v" style="margin-bottom:0"><span>DDPYMTM2XXX</span><button class="copy" data-copy="DDPYMTM2XXX">复制</button></div></div>' +
      '<div class="sec"><div class="sec-h"><h3>交易</h3></div><div id="ac-tx"></div></div>',
      mount: function (v) {
        bindCopy(v);
        var el = $('#ac-tx');
        if (!list.length) stateBox(el, 'empty', { title: '暂无交易', text: '该账户还没有任何交易记录', action: '去收款', onAction: function () { go('receive'); } });
        else el.innerHTML = '<div class="list" style="margin:0">' + list.map(txRow).join('') + '</div>';
      } };
  };
  function bindCopy(v) { v.querySelectorAll('[data-copy]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); try { navigator.clipboard.writeText(b.dataset.copy); } catch (x) { } b.textContent = '已复制'; toast('已复制到剪贴板', 'success'); setTimeout(function () { b.textContent = '复制'; }, 1500); }; }); }

  /* 交易记录：筛选 + 搜索 + 骨架 + 空/搜索空 */
  R.tx = function () {
    return { html: nav('交易记录') + '<div class="seg-wrap"><div class="dd-seg" id="tx-seg"><button class="on" data-k="all">全部</button><button data-k="in">收入</button><button data-k="out">支出</button><button data-k="fx">兑换</button></div></div>' +
      '<div style="padding:0 16px 14px"><label style="display:flex;align-items:center;gap:8px;background:rgba(118,118,128,.12);border-radius:10px;padding:0 10px;height:38px;color:#8e8e93">' + ic('search') + '<input id="tx-q" placeholder="搜索交易" style="flex:1;border:0;background:transparent;outline:0;font-size:16px;box-shadow:none;padding:0"/></label></div>' +
      '<div id="tx-list">' + skel(5) + '</div>',
      mount: function () {
        var k = 'all', q = '';
        function draw() {
          var el = $('#tx-list'); if (!el) return;
          var list = S.tx.filter(function (t) { return (k === 'all' || t.k === k) && (!q || (t.t + t.ch).toLowerCase().indexOf(q) >= 0); });
          if (!list.length) stateBox(el, q ? 'search' : 'empty', q ? {} : { title: '暂无记录', text: '该分类下还没有交易' });
          else el.innerHTML = '<div class="list">' + list.map(txRow).join('') + '</div>';
        }
        $('#tx-seg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); k = b.dataset.k; draw(); });
        $('#tx-q').addEventListener('input', function () { q = this.value.trim().toLowerCase(); draw(); });
        wait(600).then(draw);
      } };
  };

  R['tx-detail'] = null;
  R.tx = (function (list) { return function (id) { return id ? txDetail(id) : list(); }; })(R.tx);
  function txDetail(id) {
    var t = S.tx.filter(function (x) { return x.id === id; })[0]; if (!t) return R.notfound();
    var rows = [['交易状态', stPill(t.st)], ['交易渠道', L(t.ch)], ['交易时间', L(t.d)], ['交易单号', 'DD' + id.toUpperCase() + '20261008' + '0042'], ['手续费', t.k === 'in' ? '€0.00' : '€1.50'], ['付款账户', L(t.cur + ' 账户')]];
    return { html: nav('交易详情') + '<div class="amount-box"><div style="font-size:15px;color:var(--dd-ink-2)">' + esc(L(t.t)) + '</div><div style="font-size:44px;font-weight:800;margin-top:8px;letter-spacing:-.02em;color:' + (t.amt > 0 ? 'var(--dd-green)' : 'var(--dd-ink)') + '">' + (t.amt > 0 ? '+' : '') + money(t.amt, t.cur) + '</div></div>' +
      (t.st === 'fail' ? '<div class="card" style="margin:16px;padding:14px 16px;background:rgba(255,59,48,.06);box-shadow:none;color:var(--dd-red);font-size:14px">收款人微信账户未实名，资金已原路退回。请核对收款信息后重试。</div>' : t.st === 'wait' ? '<div class="card" style="margin:16px;padding:14px 16px;background:rgba(255,149,0,.08);box-shadow:none;color:#c93400;font-size:14px">资金正在清算中，预计 30 分钟内到账。</div>' : '<div style="height:16px"></div>') +
      '<div class="list plain" style="margin-bottom:22px">' + rows.map(function (r) { return '<div class="row"><span class="rt"><b style="color:var(--dd-ink-2);font-weight:400">' + r[0] + '</b></span><span class="rv" style="color:var(--dd-ink)">' + r[1] + '</span></div>'; }).join('') + '</div>' +
      '<div style="padding:0 16px;display:grid;gap:10px">' + (t.st === 'fail' ? '<button class="btn pri" data-go="send">重新付款</button>' : '<button class="btn tint" id="td-pdf">下载电子回单</button>') + '<button class="btn tint" data-go="help">对此交易有疑问</button></div>',
      mount: function () { var b = $('#td-pdf'); if (b) b.onclick = function () { DDUI.busy(b, 900, '回单已保存到文件'); }; } };
  }

  /* 付款中心 */
  R.pay = function () {
    return { html: '<div class="large-ttl"><h1>付款</h1></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 22px">' +
      '<button class="card" style="padding:18px;text-align:left" data-go="send"><span class="ri" style="width:40px;height:40px;border-radius:12px;background:#FFD008;color:#382b1b;display:flex;align-items:center;justify-content:center;margin-bottom:14px">' + ic('globe') + '</span><b style="font-size:16px;display:block">全球即时付款</b><small style="color:var(--dd-ink-2);font-size:12px">40+ 国家 · 7×24</small></button>' +
      '<button class="card" style="padding:18px;text-align:left" data-go="send/cn"><span class="ri" style="width:40px;height:40px;border-radius:12px;background:#34C759;color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:14px">' + ic('send') + '</span><b style="font-size:16px;display:block">速汇中国</b><small style="color:var(--dd-ink-2);font-size:12px">微信 / 银行卡到账</small></button></div>' +
      '<div class="sec-h" style="padding:0 20px 8px"><h3>常用收款人</h3><a href="#/recipients">管理</a></div>' +
      '<div class="list" style="margin-bottom:22px">' + S.recipients.slice(0, 3).map(function (r) { return '<button class="row" data-go="send/r/' + r.id + '"><span class="av" style="background:' + r.c + '1f;color:' + r.c + '">' + esc(r.name.slice(0, 1)) + '</span><span class="rt"><b>' + esc(r.name) + '</b><small>' + esc(r.bank) + '</small></span>' + CHEV + '</button>'; }).join('') +
      '<button class="row" data-go="recipient-new"><span class="av" style="background:rgba(0,122,255,.1);color:var(--dd-blue)">' + ic('plus') + '</span><span class="rt"><b style="color:var(--dd-blue)">添加收款人</b></span></button></div>' +
      '<div class="cap">费率</div><div class="list plain"><div class="row"><span class="rt"><b>SEPA Instant</b></span><span class="rv">€0.50 / 笔</span></div><div class="row"><span class="rt"><b>速汇中国</b></span><span class="rv">0.3%，最低 €2</span></div><div class="row"><span class="rt"><b>SWIFT 国际电汇</b></span><span class="rv">€8 / 笔</span></div></div>' };
  };

  /* 付款流程：金额 → 收款人 → 确认 Sheet → PIN → 结果 */
  var draft = {};
  R.send = function (arg) {
    var h = location.hash.split('/');
    if (h[2] === 'r') draft.rid = h[3];
    if (arg === 'cn') draft.cn = true;
    var acc = S.accounts[0];
    var r = S.recipients.filter(function (x) { return x.id === draft.rid; })[0];
    return { html: nav(draft.cn ? '速汇中国' : '全球即时付款') +
      '<div class="amount-box"><span class="cur">从 ' + acc.cur + ' 账户 · 可用 ' + mask(SYM[acc.cur] + fmt(acc.bal)) + '</span><input id="s-amt" inputmode="decimal" placeholder="0" aria-label="付款金额" value="' + (draft.amt || '') + '"/><div class="hint" id="s-hint">' + (draft.cn ? '1 EUR ≈ 7.8200 CNY · 预计 5 分钟到账' : '手续费 €0.50 · 预计即时到账') + '</div></div>' +
      '<div style="display:flex;gap:8px;justify-content:center;padding:4px 16px 22px">' + [100, 500, 1000, 5000].map(function (v) { return '<button class="pill" style="background:#fff;box-shadow:var(--dd-sh-1);padding:7px 14px;font-size:13px" data-q="' + v + '">€' + fmt(v, 0) + '</button>'; }).join('') + '</div>' +
      '<div class="cap">收款人</div><div class="list" style="margin-bottom:8px">' + (r ? '<button class="row" id="s-pick"><span class="av" style="background:' + r.c + '1f;color:' + r.c + '">' + esc(r.name.slice(0, 1)) + '</span><span class="rt"><b>' + esc(r.name) + '</b><small>' + esc(r.bank) + '</small></span><span class="rv" style="color:var(--dd-blue);font-size:15px">更换</span></button>' : '<button class="row" id="s-pick"><span class="av" style="background:rgba(0,122,255,.1);color:var(--dd-blue)">' + ic('users') + '</span><span class="rt"><b style="color:var(--dd-blue)">选择收款人</b></span>' + CHEV + '</button>') + '</div>' +
      '<div class="field" style="margin-top:14px"><label><span>附言</span><input id="s-memo" maxlength="40" placeholder="选填，最多 40 字" value="' + esc(draft.memo || '') + '"/></label></div>' +
      '<div style="padding:24px 16px 0"><button class="btn pri" id="s-next" disabled>下一步</button></div>',
      mount: function () {
        var inp = $('#s-amt'), btn = $('#s-next'), hint = $('#s-hint'), base = hint.textContent;
        function check() {
          var v = parseFloat(inp.value.replace(/,/g, '')) || 0; draft.amt = inp.value;
          var err = v > acc.bal ? '余额不足' : v > 0 && v < 1 ? '单笔最低 €1' : '';
          hint.textContent = err || (v && draft.cn ? '收款人将收到 ¥' + fmt(v * RATE.CNY) + ' · ' + base.split(' · ')[1] : base);
          hint.classList.toggle('err', !!err);
          btn.disabled = !(v >= 1 && !err && r);
        }
        inp.addEventListener('input', function () { this.value = this.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').replace(/(\.\d{2}).+/, '$1'); check(); });
        document.querySelectorAll('[data-q]').forEach(function (b) { b.onclick = function () { inp.value = b.dataset.q; check(); }; });
        $('#s-memo').oninput = function () { draft.memo = this.value; };
        $('#s-pick').onclick = function () {
          sheet({ title: '选择收款人', body: '<div class="list">' + S.recipients.map(function (x) { return '<button class="row" data-rid="' + x.id + '"><span class="av" style="background:' + x.c + '1f;color:' + x.c + '">' + esc(x.name.slice(0, 1)) + '</span><span class="rt"><b>' + esc(x.name) + '</b><small>' + esc(x.bank) + '</small></span>' + (x.id === draft.rid ? ic('check') : '') + '</button>'; }).join('') + '</div>',
            actions: '<button class="btn tint" id="pk-new">' + ic('plus') + '添加收款人</button>',
            mount: function (s, close) {
              s.querySelectorAll('[data-rid]').forEach(function (b) { b.onclick = function () { draft.rid = b.dataset.rid; close(); setTimeout(render, 300); }; });
              $('#pk-new', s).onclick = function () { close(); go('recipient-new'); };
            } });
        };
        btn.onclick = function () {
          var v = parseFloat(inp.value);
          var fee = draft.cn ? Math.max(2, v * .003) : .5;
          sheet({ title: '确认付款', body: '<div style="text-align:center;margin-bottom:16px"><div style="font-size:40px;font-weight:800;letter-spacing:-.02em">€' + fmt(v) + '</div></div><div class="list plain">' +
            [['收款人', esc(r.name)], ['到账方式', esc(r.bank)], ['手续费', '€' + fmt(fee)], ['合计扣款', '<b>€' + fmt(v + fee) + '</b>'], ['预计到账', draft.cn ? '5 分钟内' : '即时']].map(function (x) { return '<div class="row"><span class="rt"><b style="font-weight:400;color:var(--dd-ink-2)">' + x[0] + '</b></span><span class="rv" style="color:var(--dd-ink)">' + x[1] + '</span></div>'; }).join('') + '</div>',
            actions: '<button class="btn pri" id="cf-ok">确认付款</button><button class="btn tint" data-close>取消</button>',
            mount: function (s, close) { $('#cf-ok', s).onclick = function () { close(); setTimeout(function () { pin(function () { doPay(v, fee, r); }); }, 320); }; } });
        };
        check();
        if (!r) setTimeout(function () { inp.focus(); }, 350);
      } };
  };

  function pin(onOk) {
    sheet({ title: '输入支付密码', body: '<div class="pin" id="pin"><i></i><i></i><i></i><i></i><i></i><i></i></div><p class="foot-note" style="text-align:center;margin:-12px 0 16px">演示密码：123456</p><div class="keypad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') + '<button class="fn" data-k="face">面容 ID</button><button data-k="0">0</button><button class="fn" data-k="del">删除</button></div>',
      mount: function (s, close) {
        var v = '';
        function paint() { s.querySelectorAll('#pin i').forEach(function (d, i) { d.classList.toggle('f', i < v.length); }); }
        s.querySelector('.keypad').addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          var k = b.dataset.k;
          if (k === 'del') v = v.slice(0, -1);
          else if (k === 'face') { close(); setTimeout(onOk, 300); return; }
          else if (v.length < 6) v += k;
          paint();
          if (v.length === 6) {
            if (v === '123456') { setTimeout(function () { close(); setTimeout(onOk, 300); }, 150); }
            else { var p = $('#pin', s); p.classList.remove('err'); void p.offsetWidth; p.classList.add('err'); toast('支付密码错误，还可尝试 4 次', 'error'); setTimeout(function () { v = ''; paint(); p.classList.remove('err'); }, 500); }
          }
        });
      } });
  }

  function doPay(v, fee, r) {
    view.innerHTML = '<div class="pg">' + nav('付款') + '<div class="dd-state"><div class="dd-spinner" style="width:36px;height:36px;margin-bottom:18px"></div><h4>正在提交付款</h4><p>请勿关闭页面</p></div></div>';
    tabbar.classList.add('hide');
    wait(1400).then(function () {
      if (!navigator.onLine) { view.innerHTML = '<div class="pg">' + nav('付款') + '<div id="pe"></div></div>'; stateBox($('#pe'), 'error', { title: '网络异常', text: '付款未提交，资金未扣除。请检查网络后重试。', action: '重试', onAction: function () { doPay(v, fee, r); } }); return; }
      S.accounts[0].bal -= v + fee;
      var id = 't' + Date.now();
      S.tx.unshift({ id: id, t: (draft.cn ? '速汇中国 · ' : '付款给 ') + r.name, k: 'out', amt: -v, cur: 'EUR', d: '刚刚', st: draft.cn ? 'wait' : 'ok', ch: draft.cn ? '速汇中国' : 'SEPA Instant' });
      save(); draft = {};
      view.innerHTML = '<div class="pg"><div class="result"><div class="ok-ring"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg></div><h2>付款已提交</h2><div class="amt">€' + fmt(v) + '</div><p>' + esc(r.name) + '<br/>手续费 €' + fmt(fee) + '</p></div><div style="padding:24px 16px;display:grid;gap:10px"><button class="btn pri" data-go="home">完成</button><button class="btn tint" data-go="tx/' + id + '">查看详情</button></div></div>';
    });
  }

  R.recipients = function () {
    return { html: nav('收款人', '<a href="#/recipient-new">添加</a>') + '<div id="rc"></div>',
      mount: function () {
        var el = $('#rc');
        if (!S.recipients.length) { stateBox(el, 'empty', { title: '还没有收款人', text: '添加收款人后可一键快速付款', action: '添加收款人', onAction: function () { go('recipient-new'); } }); return; }
        el.innerHTML = '<div class="list">' + S.recipients.map(function (r) { return '<div class="row"><span class="av" style="background:' + r.c + '1f;color:' + r.c + '">' + esc(r.name.slice(0, 1)) + '</span><span class="rt"><b>' + esc(r.name) + '</b><small>' + esc(r.bank) + ' · ' + r.cur + '</small></span><button class="pill fail" data-del="' + r.id + '">删除</button></div>'; }).join('') + '</div>';
        el.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () {
          DDUI.confirm('删除收款人', '删除后不可恢复，确定删除吗？', function () { S.recipients = S.recipients.filter(function (r) { return r.id !== b.dataset.del; }); save(); toast('已删除', 'success'); render(); }, '删除');
        }; });
      } };
  };

  R['recipient-new'] = function () {
    return { html: nav('添加收款人') + '<div class="seg-wrap"><div class="dd-seg" id="rn-seg"><button class="on" data-t="bank">银行账户</button><button data-t="wx">微信</button><button data-t="ali">支付宝</button></div></div>' +
      '<form id="rn" novalidate><div class="field"><label><span>收款人</span><input id="rn-name" required data-msg="请填写收款人姓名" placeholder="姓名或企业全称"/></label><label id="rn-l2"><span>IBAN</span><input id="rn-acc" required data-rule="iban" data-msg="请填写收款账号" placeholder="DE89 3704 0044 0532 0130 00"/></label><label><span>币种</span><select id="rn-cur"><option>EUR</option><option>CNY</option><option>USD</option><option>GBP</option></select></label></div>' +
      '<p class="foot-note">账户信息仅用于付款，受银行级加密保护。</p><div style="padding:24px 16px 0"><button class="btn pri" type="submit">保存</button></div></form>',
      mount: function () {
        var acc = $('#rn-acc'), lab = $('#rn-l2 span'), t = 'bank';
        $('#rn-seg').addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); t = b.dataset.t;
          if (t === 'bank') { lab.textContent = 'IBAN'; acc.placeholder = 'DE89 3704 0044 0532 0130 00'; acc.setAttribute('data-rule', 'iban'); }
          else { lab.textContent = t === 'wx' ? '微信号' : '支付宝'; acc.placeholder = t === 'wx' ? 'wxid / 手机号' : '手机号 / 邮箱'; acc.removeAttribute('data-rule'); $('#rn-cur').value = 'CNY'; }
        });
        $('#rn').onsubmit = function (e) {
          e.preventDefault(); if (!DDUI.validate(this)) return;
          var btn = this.querySelector('[type=submit]');
          DDUI.busy(btn, 700, '收款人已添加').then(function () {
            var id = 'r' + Date.now();
            S.recipients.unshift({ id: id, name: $('#rn-name').value.trim(), bank: (t === 'bank' ? 'IBAN · ' : t === 'wx' ? '微信 · ' : '支付宝 · ') + acc.value.trim().slice(-8), cur: $('#rn-cur').value, c: t === 'wx' ? '#34C759' : t === 'ali' ? '#1677FF' : '#007AFF' });
            save(); draft.rid = id; history.back();
          });
        };
      } };
  };

  R.receive = function () {
    var a = S.accounts[0];
    var qr = ''; for (var y = 0; y < 21; y++) for (var x = 0; x < 21; x++) { var f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); var on = f ? ((x % 6 === 0 || y % 6 === 0 || (x % 14 > 1 && x % 14 < 5 && y % 14 > 1 && y % 14 < 5)) && !(x % 14 === 1 || y % 14 === 1) || (x % 14 > 1 && x % 14 < 5 && y % 14 > 1 && y % 14 < 5)) : ((x * 7 + y * 13 + x * y) % 5 < 2); if (on) qr += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; }
    return { html: nav('收款') + '<div class="card" style="margin:8px 16px 22px;padding:28px;text-align:center"><svg viewBox="0 0 21 21" width="180" height="180" fill="#1d1d1f" shape-rendering="crispEdges" aria-label="收款二维码">' + qr + '</svg><p style="margin-top:14px;font-weight:600">扫码向我付款</p><p style="font-size:13px;color:var(--dd-ink-2)">支持叮当支付 App · 微信 · 支付宝</p></div>' +
      '<div class="card iban-card"><div class="k">账户名</div><div class="v">Flash Commerce srl</div><div class="k">IBAN (' + a.cur + ')</div><div class="v"><span>' + esc(a.iban) + '</span><button class="copy" data-copy="' + esc(a.iban) + '">复制</button></div><div class="k">BIC</div><div class="v" style="margin-bottom:0"><span>DDPYMTM2XXX</span><button class="copy" data-copy="DDPYMTM2XXX">复制</button></div></div>' +
      '<div style="padding:0 16px;display:grid;gap:10px"><button class="btn pri" id="rv-share">分享收款信息</button><button class="btn tint" data-go="paylink">创建收款链接</button></div>',
      mount: function (v) { bindCopy(v); $('#rv-share').onclick = function () { if (navigator.share) navigator.share({ title: '叮当支付收款信息', text: a.iban }).catch(function () { }); else toast('收款信息已复制，可粘贴分享', 'success'); }; } };
  };

  R.exchange = function () {
    return { html: nav('货币兑换') + '<div class="list plain" style="margin-top:8px"><label class="row"><span class="rt"><b>卖出</b><small>可用 €' + fmt(S.accounts[0].bal) + '</small></span><input id="fx-a" inputmode="decimal" placeholder="0.00" style="width:140px;text-align:right;border:0;outline:0;font-size:22px;font-weight:700;background:transparent;box-shadow:none;padding:0"/><span style="font-weight:600;margin-left:6px">EUR</span></label>' +
      '<label class="row"><span class="rt"><b>买入</b><small id="fx-r">1 EUR = ' + RATE.USD.toFixed(4) + ' USD</small></span><span id="fx-b" style="font-size:22px;font-weight:700">0.00</span><select id="fx-c" style="margin-left:6px;border:0;background:transparent;font-weight:600;box-shadow:none;padding:0"><option>USD</option><option>GBP</option><option>CNY</option><option>USDT</option></select></label></div>' +
      '<p class="foot-note">汇率实时更新，锁定 30 秒 · 0 手续费</p><div style="padding:24px 16px 0"><button class="btn pri" id="fx-go" disabled>立即兑换</button></div>',
      mount: function () {
        var a = $('#fx-a'), c = $('#fx-c'), b = $('#fx-go');
        function calc() { var v = parseFloat(a.value) || 0; $('#fx-b').textContent = fmt(v * RATE[c.value]); $('#fx-r').textContent = '1 EUR = ' + RATE[c.value].toFixed(4) + ' ' + c.value; b.disabled = !(v > 0 && v <= S.accounts[0].bal); }
        a.oninput = function () { this.value = this.value.replace(/[^\d.]/g, ''); calc(); }; c.onchange = calc;
        b.onclick = function () {
          var v = parseFloat(a.value);
          DDUI.busy(b, 900, '兑换成功').then(function () {
            S.accounts[0].bal -= v;
            var t = S.accounts.filter(function (x) { return x.cur === c.value; })[0]; if (t) t.bal += v * RATE[c.value];
            S.tx.unshift({ id: 't' + Date.now(), t: 'EUR → ' + c.value + ' 兑换', k: 'fx', amt: -v, cur: 'EUR', d: '刚刚', st: 'ok', ch: '兑换' }); save(); a.value = ''; calc();
          });
        };
      } };
  };

  R.paylink = function () {
    return { html: nav('收款链接') + '<form id="pl" novalidate><div class="field" style="margin-top:8px"><label><span>商品名称</span><input id="pl-n" required data-msg="请填写商品名称" placeholder="例如：定制T恤"/></label><label><span>金额</span><input id="pl-a" required data-rule="amount" inputmode="decimal" placeholder="0.00"/></label><label><span>币种</span><select id="pl-c"><option>EUR</option><option>USD</option><option>GBP</option></select></label></div>' +
      '<div class="cap" style="margin-top:22px">支付方式</div><div class="list plain">' + [['银行卡', 1], ['微信支付', 1], ['支付宝', 1], ['Apple Pay', 0]].map(function (x) { return '<label class="row"><span class="rt"><b>' + x[0] + '</b></span><input type="checkbox" class="dd-switch"' + (x[1] ? ' checked' : '') + '/></label>'; }).join('') + '</div>' +
      '<div style="padding:24px 16px 0"><button class="btn pri" type="submit">生成链接</button></div></form><div id="pl-out"></div>',
      mount: function () {
        $('#pl').onsubmit = function (e) {
          e.preventDefault(); if (!DDUI.validate(this)) return;
          var btn = this.querySelector('[type=submit]');
          DDUI.busy(btn, 800, '收款链接已生成').then(function () {
            var url = 'https://pay.dingdangpay.com/l/' + Math.random().toString(36).slice(2, 8);
            $('#pl-out').innerHTML = '<div class="card iban-card" style="margin-top:22px"><div class="k">' + esc($('#pl-n').value) + ' · ' + $('#pl-c').value + ' ' + fmt(+$('#pl-a').value) + '</div><div class="v" style="margin-bottom:0"><span style="font-size:13px">' + url + '</span><button class="copy" data-copy="' + url + '">复制</button></div></div>';
            bindCopy($('#pl-out'));
          });
        };
      } };
  };

  /* 收单：KPI + 柱状 + 渠道 + 订单（首次加载演示错误态 → 重试成功） */
  var acqFailedOnce = false;
  R.acquire = function () {
    var vals = [42, 58, 51, 74, 66, 88, 96];
    return { html: '<div class="large-ttl"><h1>收单</h1><button class="icon-btn" aria-label="收款链接" data-go="paylink">' + ic('link') + '</button></div>' +
      '<div class="kpis"><div class="card kpi"><small>今日收款</small><b>€18,240</b><em>↑ 12.4%</em></div><div class="card kpi"><small>订单数</small><b>326</b><em>↑ 8.1%</em></div><div class="card kpi"><small>成功率</small><b>98.6%</b><em>↑ 0.4%</em></div><div class="card kpi"><small>待结算</small><b>€6,402</b><em style="color:var(--dd-ink-2)">T+1</em></div></div>' +
      '<div class="sec"><div class="sec-h"><h3>近 7 日</h3></div><div class="card"><div class="bars">' + vals.map(function (v, i) { return '<div style="height:4%" data-h="' + v + '" class="' + (i === 6 ? 'on' : '') + '"></div>'; }).join('') + '</div><div class="bars-x">' + ['周四', '周五', '周六', '周日', '周一', '周二', '今天'].map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div></div></div>' +
      '<div class="sec-h" style="padding:0 20px 8px"><h3>收单渠道</h3></div><div class="chan">' + [['游戏收单', '€6,820', '#5856D6', 'G'], ['独立站', '€7,140', '#007AFF', 'S'], ['微信支付', '€2,960', '#07C160', '微'], ['支付宝', '€1,320', '#1677FF', '支']].map(function (c) { return '<div class="card"><span class="ci" style="background:' + c[2] + '">' + c[3] + '</span><span><b>' + c[0] + '</b><small>' + c[1] + '</small></span></div>'; }).join('') + '</div>' +
      '<div class="sec"><div class="sec-h"><h3>最新订单</h3></div><div id="acq-list">' + skel(3) + '</div></div>',
      mount: function () {
        requestAnimationFrame(function () { document.querySelectorAll('.bars div').forEach(function (d) { d.style.height = d.dataset.h + '%'; }); });
        function load() {
          var el = $('#acq-list'); if (!el) return;
          el.innerHTML = skel(3);
          wait(700).then(function () {
            el = $('#acq-list'); if (!el) return;
            if (!acqFailedOnce) { acqFailedOnce = true; stateBox(el, 'error', { title: '加载失败', text: '订单服务响应超时，请稍后重试', action: '重新加载', onAction: load }); return; }
            el.innerHTML = '<div class="list" style="margin:0">' + [['#ORD-20261008-0326', 'Steam · 游戏点卡', '€49.99', 'ok'], ['#ORD-20261008-0325', '独立站 · 定制T恤', '€128.00', 'ok'], ['#ORD-20261008-0324', '微信 · 门店消费', '€36.50', 'wait']].map(function (o) { return '<div class="row"><span class="rt"><b>' + o[1] + '</b><small class="font-mono">' + o[0] + '</small></span><span class="rv neg">' + o[2] + '<br/>' + stPill(o[3]) + '</span></div>'; }).join('') + '</div>';
          });
        }
        load();
      } };
  };

  R.notifications = function () {
    return { html: nav('通知', '<button id="nt-all">全部已读</button>') + '<div id="nt"></div>',
      mount: function () {
        function draw() {
          var el = $('#nt');
          if (!S.notes.length) { stateBox(el, 'empty', { title: '暂无通知', text: '交易与安全提醒会显示在这里' }); return; }
          el.innerHTML = '<div class="list">' + S.notes.map(function (n, i) { return '<div class="row"><span class="ri" style="background:' + (n.t === '安全提醒' ? '#FF3B30' : '#FFD008') + ';color:' + (n.t === '安全提醒' ? '#fff' : '#382b1b') + '">' + ic(n.t === '安全提醒' ? 'shield' : 'bell') + '</span><span class="rt"><b>' + (n.unread ? '<i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--dd-blue);margin-right:6px;vertical-align:2px"></i>' : '') + n.t + '</b><small style="white-space:normal">' + esc(n.d) + '</small></span><span class="rv" style="font-size:12px;align-self:flex-start">' + n.time + '</span></div>'; }).join('') + '</div><div style="padding:22px 16px"><button class="btn danger" id="nt-clr">清空通知</button></div>';
          $('#nt-clr').onclick = function () { DDUI.confirm('清空通知', '确定清空全部通知吗？', function () { S.notes = []; save(); draw(); toast('已清空', 'success'); }, '清空'); };
        }
        $('#nt-all').onclick = function () { S.notes.forEach(function (n) { n.unread = false; }); save(); draw(); toast('已全部标为已读', 'success'); };
        draw();
      } };
  };

  R.me = function () {
    function row(go, col, icon, t, v) { return '<button class="row" data-go="' + go + '"><span class="ri" style="background:' + col + '">' + ic(icon) + '</span><span class="rt"><b>' + t + '</b></span>' + (v ? '<span class="rv" style="font-size:15px">' + v + '</span>' : '') + CHEV + '</button>'; }
    return { html: '<div class="large-ttl"><h1>我的</h1></div><div class="card me"><span class="av">F</span><span style="flex:1"><b>Flash Commerce srl</b><small>demo@dingdangpay.com</small><br/><span class="pill ok" style="margin-top:6px">' + ic('shield').replace('class="i ', 'style="width:12px;height:12px" class="i ') + 'KYB 已认证</span></span></div>' +
      '<div class="list" style="margin-bottom:22px">' + row('recipients', '#007AFF', 'users', '收款人') + row('cards', '#5856D6', 'card', '虚拟卡') + row('tx', '#FF9500', 'doc', '交易记录') + row('tax', '#00B7EC', 'calc', '税务申报') + row('invoices', '#FF8106', 'bill', '营收发票') + row('risk', '#FF3B30', 'shield', '风控中心') + '</div>' +
      '<div class="list" style="margin-bottom:22px">' + row('security', '#34C759', 'shield', '安全中心') + row('settings', '#8E8E93', 'gear', '通用设置') + row('help', '#FF2D55', 'help', '帮助与客服') + '</div>' +
      '<div class="list"><button class="row" id="me-out"><span class="ri" style="background:#FF3B30">' + ic('logout') + '</span><span class="rt"><b style="color:var(--dd-red)">退出登录</b></span></button></div><p class="foot-note" style="text-align:center;margin-top:18px">叮当支付 v3.2.0 · MFSA & FCA 持牌</p>',
      mount: function () { $('#me-out').onclick = function () { DDUI.confirm('退出登录', '退出后需重新验证身份才能使用。', function () { S.authed = false; save(); hist = []; go('welcome'); }, '退出'); }; } };
  };

  R.security = function () {
    return { html: nav('安全中心') + '<div class="cap" style="margin-top:8px">登录与支付</div><div class="list plain">' +
      '<label class="row"><span class="rt"><b>面容 ID 登录与支付</b></span><input type="checkbox" class="dd-switch" data-k="bio"' + (S.bio ? ' checked' : '') + '/></label>' +
      '<label class="row"><span class="rt"><b>两步验证 (2FA)</b><small>登录新设备时需动态验证码</small></span><input type="checkbox" class="dd-switch" data-k="n2fa"' + (S.n2fa ? ' checked' : '') + '/></label>' +
      '<button class="row" id="sc-pin"><span class="rt"><b>修改支付密码</b></span>' + CHEV + '</button></div>' +
      '<div class="cap" style="margin-top:22px">登录设备</div><div class="list plain"><div class="row"><span class="rt"><b>iPhone 15 Pro（本机）</b><small>米兰 · 当前在线</small></span></div><div class="row"><span class="rt"><b>Chrome · Windows</b><small>米兰 · 2 小时前</small></span><button class="pill fail" id="sc-kick">下线</button></div></div>',
      mount: function (v) {
        v.querySelectorAll('.dd-switch').forEach(function (s) { s.onchange = function () { S[s.dataset.k] = s.checked; save(); toast(s.checked ? '已开启' : '已关闭', 'success'); }; });
        $('#sc-pin').onclick = function () { pin(function () { toast('身份验证通过，请设置新密码', 'success'); }); };
        $('#sc-kick').onclick = function () { var b = this; DDUI.confirm('下线设备', '该设备将立即退出登录。', function () { b.closest('.row').remove(); toast('设备已下线', 'success'); }, '下线'); };
      } };
  };

  R.settings = function () {
    var en = localStorage.getItem('dd-lang') === 'en';
    return { html: nav('通用设置') + '<div class="list plain" style="margin-top:8px"><label class="row"><span class="rt"><b>推送通知</b></span><input type="checkbox" class="dd-switch" data-k="push"' + (S.push ? ' checked' : '') + '/></label><label class="row"><span class="rt"><b>隐藏首页余额</b></span><input type="checkbox" class="dd-switch" data-k="hide"' + (S.hide ? ' checked' : '') + '/></label></div>' +
      '<div class="cap" style="margin-top:22px">语言</div><div class="list plain"><button class="row" data-l="zh"><span class="rt"><b>简体中文</b></span>' + (!en ? ic('check') : '') + '</button><button class="row" data-l="en"><span class="rt"><b>English</b></span>' + (en ? ic('check') : '') + '</button></div>' +
      '<div class="cap" style="margin-top:22px">其他</div><div class="list plain"><a class="row" href="../terms.html"><span class="rt"><b>服务条款</b></span>' + CHEV + '</a><a class="row" href="../privacy.html"><span class="rt"><b>隐私协议</b></span>' + CHEV + '</a><button class="row" id="st-cache"><span class="rt"><b>清除缓存</b></span><span class="rv">2.4 MB</span></button></div>',
      mount: function (v) {
        v.querySelectorAll('.dd-switch').forEach(function (s) { s.onchange = function () { S[s.dataset.k] = s.checked; save(); }; });
        v.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { localStorage.setItem('dd-lang', b.dataset.l); location.reload(); }; });
        $('#st-cache').onclick = function () { var b = this; DDUI.busy(b, 700, '缓存已清除').then(function () { b.querySelector('.rv').textContent = '0 KB'; }); };
      } };
  };

  /* 虚拟卡：与 Web 端共享 DDCards / DDSubs 数据 */
  function cardAvail(c, subs) {
    var R2 = { EUR: 1, GBP: 1.17, USD: 0.92, USDT: 0.92 };
    var sub = subs.filter(function (x) { return x.id === c.sub; })[0];
    var bal = sub ? sub.bal * (R2[sub.cur] || 1) : 0;
    return c.frozen ? 0 : Math.min(c.limit, bal);
  }
  R.cards = function () {
    return { html: nav('虚拟卡', '<button id="cd-add">开卡</button>') + '<div id="cd"></div>',
      mount: function () {
        function draw() {
          var el = $('#cd'); if (!el) return;
          var cards = window.DDCards ? DDCards.load() : [];
          var subs = window.DDSubs ? DDSubs.load() : [];
          if (!cards.length) { stateBox(el, 'empty', { title: '还没有虚拟卡', text: '开通虚拟卡后可用于线上消费与广告投放', action: '立即开卡', onAction: function () { toast('请在 Web 客户端提交开卡申请', 'info'); } }); return; }
          var total = cards.reduce(function (a, c) { return a + cardAvail(c, subs); }, 0);
          el.innerHTML = '<div class="card" style="margin:8px 16px 14px;padding:18px"><small style="color:var(--dd-ink-2)">卡可用余额合计（EUR）</small><div style="font-size:30px;font-weight:800;letter-spacing:-.02em;margin-top:4px">' + mask('€' + fmt(total)) + '</div><small style="color:var(--dd-ink-2)">' + cards.length + ' 张卡 · ' + cards.filter(function (c) { return c.frozen; }).length + ' 张冻结</small></div>' +
            '<div class="list">' + cards.map(function (c) {
              var sub = subs.filter(function (x) { return x.id === c.sub; })[0];
              return '<div class="row"><span class="ri" style="background:' + (c.frozen ? '#8E8E93' : '#5856D6') + '">' + ic('card') + '</span><span class="rt"><b>·· ' + String(c.no || '').slice(-4) + (c.frozen ? ' <span class="pill fail" style="margin-left:6px">已冻结</span>' : '') + '</b><small>' + esc(sub ? sub.name : c.sub) + ' · 月限额 €' + fmt(c.limit, 0) + ' · 可用 €' + fmt(cardAvail(c, subs)) + '</small></span><button class="pill ' + (c.frozen ? '' : 'fail') + '" data-frz="' + esc(c.no) + '">' + (c.frozen ? '解冻' : '冻结') + '</button></div>';
            }).join('') + '</div>';
          el.querySelectorAll('[data-frz]').forEach(function (b) {
            b.onclick = function () {
              var c = DDCards.load().filter(function (x) { return x.no === b.dataset.frz; })[0];
              if (!c) return;
              DDUI.confirm(c.frozen ? '解冻卡片' : '冻结卡片', c.frozen ? '解冻后卡片立即可用于消费。' : '冻结期间卡片无法消费，可随时解冻。', function () {
                var l = DDCards.load(); l.forEach(function (x) { if (x.no === c.no) x.frozen = !x.frozen; });
                DDCards.save(l); toast(c.frozen ? '卡片已解冻' : '卡片已冻结', 'success'); draw();
              }, c.frozen ? '解冻' : '冻结');
            };
          });
        }
        $('#cd-add').onclick = function () { toast('请在 Web 客户端提交开卡申请', 'info'); };
        draw();
      } };
  };

  R.help = function () {
    return { html: nav('帮助与客服') + '<div class="list plain" style="margin-top:8px">' + ['付款多久到账？', '如何开通新的币种账户？', '速汇中国支持哪些收款方式？', '收单结算周期是多久？'].map(function (q) { return '<button class="row" data-q><span class="rt"><b>' + q + '</b></span>' + CHEV + '</button>'; }).join('') + '</div>' +
      '<div style="padding:24px 16px 0;display:grid;gap:10px"><button class="btn pri" id="hp-chat">在线客服 · 7×24</button><a class="btn tint" href="mailto:support@dingdangpay.com">发送邮件</a></div>',
      mount: function (v) {
        v.querySelectorAll('[data-q]').forEach(function (b) { b.onclick = function () { sheet({ title: b.textContent, body: '<p style="padding:0 20px;font-size:15px;line-height:1.7;color:var(--dd-ink-2)">SEPA Instant 与速汇中国通常 5 分钟内到账；SWIFT 国际电汇 1–3 个工作日。如超时未到账，可在交易详情中发起查询。</p>', actions: '<button class="btn tint" data-close>知道了</button>' }); }; });
        $('#hp-chat').onclick = function () { DDUI.busy(this, 900).then(function () { toast('客服 Lucia 已接入，请描述您的问题', 'success'); }); };
      } };
  };

  /* ================= 财税 / 开票 / 风控（对齐 Web 端，共享 localStorage） ================= */
  function taxLed() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem('dd-tax-ledger-v2') || 'null'); } catch (e) {}
    if (!d && window.DDTaxData) { d = DDTaxData.ledSeed(); try { localStorage.setItem('dd-tax-ledger-v2', JSON.stringify(d)); } catch (e) {} }
    return d || {};
  }
  function taxOv() { try { return JSON.parse(localStorage.getItem('dd-tax-overview-v1') || '{}'); } catch (e) { return {}; } }
  function ledBal(entries) { return (entries || []).reduce(function (a, x) { return a + (x['in'] || 0) - (x.out || 0); }, 0); }
  function taxSummary() {
    var ov = taxOv(), due = 0, back = 0;
    Object.keys(ov).forEach(function (k) {
      var v = ov[k] || {};
      if ((v.vatNet || 0) > 0) due += v.vatNet; else back += -(v.vatNet || 0);
      if ((v.citDue || 0) > 0) due += v.citDue;
    });
    return { due: due, back: back };
  }
  function riskBanner() {
    var todo = 0;
    try { if (window.DDRiskTx) todo = DDRiskTx.stats().todo; } catch (e) {}
    if (!todo) return '';
    return '<button class="card" data-go="risk" style="margin:0 16px 14px;padding:14px 16px;display:flex;align-items:center;gap:12px;text-align:left;background:rgba(255,59,48,.06);box-shadow:none">' +
      '<span class="ri" style="background:#FF3B30;flex:none">' + ic('shield') + '</span>' +
      '<span style="flex:1"><b style="font-size:14px">' + todo + ' 笔交易被风控拦截</b><small style="display:block;color:var(--dd-ink-2);font-size:12px">需您确认或补充材料，点击查看</small></span>' + CHEV + '</button>';
  }
  function taxTodoCard() {
    var DL = (window.DDTaxData && DDTaxData.deadlines) || [];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var soon = DL.map(function (x) { return { n: DDTaxData.names[x.code], d: x.d, days: Math.round((new Date(x.d + 'T00:00:00') - today) / 86400000) }; })
      .filter(function (x) { return x.days >= 0; }).sort(function (a, b) { return a.days - b.days; })[0];
    var sm = taxSummary();
    return '<button class="card" data-go="tax" style="margin:0 16px;padding:14px 16px;display:flex;align-items:center;gap:12px;text-align:left">' +
      '<span class="ri" style="background:#00B7EC;flex:none">' + ic('calc') + '</span>' +
      '<span style="flex:1"><b style="font-size:14px">' + (soon ? soon.n + ' VAT ' + soon.days + ' 天后截止' : '本期申报已完成') + '</b><small style="display:block;color:var(--dd-ink-2);font-size:12px">应缴 €' + fmt(sm.due, 0) + ' · 应退 €' + fmt(sm.back, 0) + '</small></span>' + CHEV + '</button>';
  }

  /* 税务申报：税务局账户余额 + 申报截止 + 应缴/应退 */
  R.tax = function (arg) {
    var led = taxLed(), ov = taxOv(), sm = taxSummary();
    var names = (window.DDTaxData && DDTaxData.names) || {};
    var DL = (window.DDTaxData && DDTaxData.deadlines) || [];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (arg) {
      /* 国家详情：台账 */
      var entries = led[arg] || [];
      return { html: nav((names[arg] || arg) + ' · 税务局账户') +
        '<div class="amount-box" style="padding-top:8px"><span class="cur">账户余额（预缴 + 留抵 − 缴款）</span><div style="font-size:40px;font-weight:800;margin-top:10px;letter-spacing:-.02em;color:' + (ledBal(entries) >= 0 ? 'var(--dd-green)' : 'var(--dd-red)') + '">' + (ledBal(entries) >= 0 ? '' : '−') + '€' + fmt(Math.abs(ledBal(entries))) + '</div></div>' +
        '<div class="cap">台账明细</div><div class="list plain" style="margin-bottom:22px">' +
        (entries.length ? entries.map(function (x) {
          return '<div class="row"><span class="rt"><b style="font-weight:500">' + esc(x.item) + '</b><small>' + x.date + '</small></span><span class="rv ' + ((x['in'] || 0) > 0 ? 'pos' : 'neg') + '">' + ((x['in'] || 0) > 0 ? '+' : '−') + '€' + fmt(x['in'] || x.out) + '</span></div>';
        }).join('') : '<div style="padding:24px;text-align:center;color:var(--dd-ink-2);font-size:14px">暂无台账记录</div>') + '</div>',
        mount: function () {} };
    }
    return { html: nav('税务申报') +
      '<div class="kpis" style="grid-template-columns:1fr 1fr"><div class="card kpi"><small>本期应缴</small><b style="color:' + (sm.due > 0 ? 'var(--dd-red)' : 'var(--dd-ink)') + '">€' + fmt(sm.due, 0) + '</b><em style="color:var(--dd-ink-2)">VAT + 企业所得税</em></div><div class="card kpi"><small>本期应退</small><b style="color:var(--dd-green)">€' + fmt(sm.back, 0) + '</b><em style="color:var(--dd-ink-2)">留抵 / 多缴</em></div></div>' +
      '<div class="cap">申报截止</div><div class="list plain" style="margin-bottom:22px">' + DL.map(function (x) {
        var days = Math.round((new Date(x.d + 'T00:00:00') - today) / 86400000);
        return '<div class="row"><span class="rt"><b style="font-weight:500">' + (names[x.code] || x.code) + ' VAT</b><small>' + x.d + '</small></span><span class="rv">' + (days < 0 ? '<span class="pill ok">已过期</span>' : days <= 7 ? '<span class="pill fail">' + days + ' 天后</span>' : '<span class="pill wait">' + days + ' 天后</span>') + '</span></div>';
      }).join('') + '</div>' +
      '<div class="cap">税务局账户余额</div><div class="list" style="margin-bottom:22px">' + Object.keys(names).map(function (k) {
        var b = ledBal(led[k]);
        var o = ov[k] || {};
        var sub = (o.vatNet ? 'VAT ' + (o.vatNet > 0 ? '应缴 €' + fmt(o.vatNet, 0) : '应退 €' + fmt(-o.vatNet, 0)) : '本期 VAT 未测算');
        return '<button class="row" data-go="tax/' + k + '"><span class="av" style="background:#00B7EC1f;color:#00B7EC;font-size:11px">' + k + '</span><span class="rt"><b>' + names[k] + '</b><small>' + sub + '</small></span><span class="rv ' + (b >= 0 ? 'pos' : 'neg') + '">' + (b >= 0 ? '' : '−') + '€' + fmt(Math.abs(b), 0) + '</span>' + CHEV + '</button>';
      }).join('') + '</div>' +
      '<p class="foot-note" style="text-align:center">完整申报表填写与导出请使用 Web 客户端</p>' };
  };

  /* 营收发票：与 Web 端共享 INV_TX 口径 + dd-inv-state-v1 */
  var APP_INV_TX = [
    { id: 'TXN-20261110-001', source: '线上收单 - TechShop EU', amount: 2680.00, date: '2026-11-10', type: '收单收入' },
    { id: 'TXN-20261110-002', source: '线下收单 - 米兰旗舰店 POS', amount: 945.50, date: '2026-11-10', type: '收单收入' },
    { id: 'TXN-20261109-001', source: '收款链接 - FashionHub', amount: 4200.00, date: '2026-11-09', type: '收单收入' },
    { id: 'TXN-20261108-001', source: '加密收单 - USDT 收款', amount: 3180.00, date: '2026-11-08', type: '加密收入' },
    { id: 'TXN-20261107-002', source: 'PayAll 汇款手续费', amount: 620.00, date: '2026-11-07', type: '服务费' },
    { id: 'TXN-20261106-001', source: '线上收单 - GameVault Ltd', amount: 7850.00, date: '2026-11-06', type: '收单收入' },
    { id: 'TXN-20261105-003', source: 'USDT 兑换手续费', amount: 385.00, date: '2026-11-05', type: '服务费' }
  ];
  function invSt() { try { return JSON.parse(localStorage.getItem('dd-inv-state-v1') || '{"billed":{},"linked":{}}'); } catch (e) { return { billed: {}, linked: {} }; } }
  R.invoices = function () {
    return { html: nav('营收发票') +
      '<div style="padding:0 16px 14px"><label style="display:flex;align-items:center;gap:8px;background:rgba(118,118,128,.12);border-radius:10px;padding:0 10px;height:38px;color:#8e8e93">' + ic('search') + '<input id="iv-q" placeholder="搜索流水号 / 来源" style="flex:1;border:0;background:transparent;outline:0;font-size:16px;box-shadow:none;padding:0"/></label></div>' +
      '<div id="iv-list"></div>',
      mount: function () {
        var q = '';
        function draw() {
          var el = $('#iv-list'); if (!el) return;
          var st = invSt();
          var list = APP_INV_TX.filter(function (t) { return !q || (t.id + t.source).toLowerCase().indexOf(q) >= 0; });
          var pending = APP_INV_TX.filter(function (t) { return !st.billed[t.id]; }).length;
          if (!list.length) { stateBox(el, 'search', {}); return; }
          el.innerHTML = '<div class="cap">共 ' + list.length + ' 笔入账流水 · ' + pending + ' 笔待开票</div><div class="list">' + list.map(function (t) {
            var no = st.billed[t.id];
            return '<div class="row"><span class="rt"><b>' + esc(t.source) + '</b><small class="font-mono">' + t.id + ' · ' + t.date + '</small></span><span class="rv neg">€' + fmt(t.amount) + '<br/>' + (no ? '<span class="pill ok">' + no + '</span>' : '<button class="pill" style="background:#FFD008;color:#382b1b" data-bill="' + t.id + '">开票</button>') + '</span></div>';
          }).join('') + '</div>';
          el.querySelectorAll('[data-bill]').forEach(function (b) {
            b.onclick = function () {
              var t = APP_INV_TX.filter(function (x) { return x.id === b.dataset.bill; })[0];
              DDUI.confirm('开具发票', '为「' + t.source + '」€' + fmt(t.amount) + ' 开具营收发票？', function () {
                var s2 = invSt();
                s2.billed[t.id] = 'INV-2026-' + String(Math.floor(Math.random() * 900) + 100);
                try { localStorage.setItem('dd-inv-state-v1', JSON.stringify(s2)); } catch (e) {}
                toast('发票已开具', 'success'); draw();
              }, '开票');
            };
          });
        }
        $('#iv-q').addEventListener('input', function () { q = this.value.trim().toLowerCase(); draw(); });
        draw();
      } };
  };

  /* 风控中心：与 Web 端共享 DDRiskTx */
  R.risk = function (arg) {
    if (!window.DDRiskTx) return { html: nav('风控中心') + '<div id="rk"></div>', mount: function () { stateBox($('#rk'), 'error', { title: '模块未加载', text: '请刷新重试' }); } };
    if (arg) {
      var t = DDRiskTx.find(arg);
      if (!t) return R.notfound();
      var sm = DDRiskTx.STATUS[t.status], lm = DDRiskTx.levelMeta(t.level);
      var docs = DDRiskTx.docs()[t.id] || [];
      var rows = [['交易类型', t.type], ['交易时间', t.ts], ['金额', DDRiskTx.fmt(t)], ['风险等级', lm.label + ' · ' + t.score + ' 分'], ['命中规则', t.rules.join('、')], ['设备 / IP', t.device + ' · ' + t.ip]];
      return { html: nav('风控详情') +
        '<div class="card" style="margin:12px 16px;padding:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:16px">' + esc(t.cp) + '</b><span class="pill ' + (t.status === 'released' ? 'ok' : t.status === 'rejected' ? 'fail' : 'wait') + '">' + sm.label + '</span></div><p style="font-size:13px;color:var(--dd-ink-2);line-height:1.6">' + esc(t.note || '系统风控规则命中，请按提示操作。') + '</p></div>' +
        '<div class="list plain" style="margin-bottom:14px">' + rows.map(function (r) { return '<div class="row"><span class="rt"><b style="font-weight:400;color:var(--dd-ink-2)">' + r[0] + '</b></span><span class="rv" style="color:var(--dd-ink);text-align:right;max-width:60%">' + r[1] + '</span></div>'; }).join('') + '</div>' +
        (t.need && t.need.length ? '<div class="cap">需补充材料</div><div class="list plain" style="margin-bottom:14px">' + t.need.map(function (n) { return '<div class="row"><span class="rt"><b style="font-weight:500">' + n + '</b></span></div>'; }).join('') + '</div>' : '') +
        (docs.length ? '<div class="cap">已上传材料</div><div class="list plain" style="margin-bottom:14px">' + docs.map(function (d) { return '<div class="row"><span class="rt"><b style="font-weight:500">' + esc(d.name) + '</b><small>' + d.ts + '</small></span></div>'; }).join('') + '</div>' : '') +
        '<div style="padding:8px 16px;display:grid;gap:10px">' +
        (t.status === 'pending_confirm' ? '<button class="btn pri" id="rk-ok">是本人操作，放行</button><button class="btn danger" id="rk-no">非本人操作，取消交易</button>' : '') +
        (t.status === 'pending_docs' ? '<button class="btn pri" id="rk-doc">上传材料并提交审核</button>' : '') +
        '<div class="cap" style="margin:8px 0 0">处理进度</div></div>' +
        '<div class="list plain">' + t.timeline.map(function (x) { return '<div class="row"><span class="rt"><b style="font-weight:500">' + x.s + '</b><small>' + x.t + '</small></span></div>'; }).join('') + '</div>',
        mount: function () {
          var ok = $('#rk-ok'), no = $('#rk-no'), dc = $('#rk-doc');
          if (ok) ok.onclick = function () { DDUI.confirm('确认放行', '确认该交易为本人操作？放行后立即执行。', function () { DDRiskTx.act(t.id, 'release'); toast('交易已放行', 'success'); render(); }, '放行'); };
          if (no) no.onclick = function () { DDUI.confirm('取消交易', '资金将原路退回，且该收款方 7 天内无法再次收款。', function () { DDRiskTx.act(t.id, 'reject'); toast('已取消，资金原路退回', 'success'); render(); }, '取消交易'); };
          if (dc) dc.onclick = function () { DDRiskTx.addDoc(t.id, 'APP上传-材料.pdf'); DDRiskTx.act(t.id, 'docs'); toast('材料已提交，转人工审核', 'success'); render(); };
        } };
    }
    var st = DDRiskTx.stats();
    return { html: nav('风控中心') +
      '<div class="kpis" style="grid-template-columns:1fr 1fr 1fr"><div class="card kpi"><small>待处理</small><b style="color:var(--dd-red)">' + st.todo + '</b></div><div class="card kpi"><small>审核中</small><b>' + st.reviewing + '</b></div><div class="card kpi"><small>全部</small><b>' + st.total + '</b></div></div>' +
      '<div class="cap">被拦截的交易</div><div id="rk-list"></div>',
      mount: function () {
        var el = $('#rk-list');
        var list = DDRiskTx.load();
        el.innerHTML = '<div class="list">' + list.map(function (t) {
          var sm = DDRiskTx.STATUS[t.status];
          return '<button class="row" data-go="risk/' + t.id + '"><span class="ri" style="background:' + (t.level === 'high' ? '#FF3B30' : t.level === 'mid' ? '#FF9500' : '#8E8E93') + '">' + ic('shield') + '</span><span class="rt"><b>' + esc(t.cp) + '</b><small>' + t.type + ' · ' + t.ts.slice(5) + '</small></span><span class="rv neg">' + DDRiskTx.fmt(t) + '<br/><span class="pill ' + (t.status === 'released' ? 'ok' : t.status === 'rejected' ? 'fail' : 'wait') + '">' + sm.label + '</span></span></button>';
        }).join('') + '</div>';
      } };
  };

  R.notfound = function () {
    return { html: nav('页面不存在') + '<div id="nf"></div>', mount: function () { stateBox($('#nf'), 'error', { title: '页面不存在', text: '该功能可能已下线或链接有误', action: '返回首页', onAction: function () { go('home'); } }); } };
  };

  /* 时钟 */
  function tick() { var d = new Date(); $('#clock').textContent = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2); }
  tick(); setInterval(tick, 30000);
  render();
})();
