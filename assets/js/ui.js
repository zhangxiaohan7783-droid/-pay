/* 叮当支付 共享交互组件库 DDUI
 * 提供: 模态框 / Toast / 确认框 / 全局搜索 / 通知面板
 * 所有页面引入后自动获得顶栏搜索与通知能力 */
(function () {
  'use strict';

  var PRIMARY = '#FFD008', DARK = '#382b1b';

  /* ---------------- 基础样式 ---------------- */
  var css = `
  .ddui-mask{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:900;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .18s}
  .ddui-mask.ddui-show{opacity:1}
  .ddui-box{background:#fff;border-radius:12px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.18);transform:scale(.96) translateY(8px);transition:transform .18s;font-family:'Inter','PingFang SC',-apple-system,sans-serif;color:${DARK}}
  .ddui-mask.ddui-show .ddui-box{transform:scale(1) translateY(0)}
  .ddui-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #f3f4f6}
  .ddui-title{font-size:16px;font-weight:700}
  .ddui-close{background:none;border:0;cursor:pointer;color:#9ca3af;font-size:20px;line-height:1;padding:2px}
  .ddui-close:hover{color:${DARK}}
  .ddui-body{padding:20px 22px;font-size:14px;color:#4b5563}
  .ddui-foot{display:flex;gap:12px;padding:16px 22px;border-top:1px solid #f3f4f6}
  .ddui-btn{flex:1;padding:11px 16px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:0;transition:opacity .15s}
  .ddui-btn:hover{opacity:.88}
  .ddui-btn-primary{background:${PRIMARY};color:${DARK}}
  .ddui-btn-ghost{background:#fff;color:#4b5563;border:1px solid #e5e7eb}
  .ddui-btn-danger{background:#ef4444;color:#fff}
  .ddui-field{margin-bottom:14px}
  .ddui-label{display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:6px}
  .ddui-input,.ddui-select,.ddui-textarea{width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;box-sizing:border-box;color:${DARK}}
  .ddui-input:focus,.ddui-select:focus,.ddui-textarea:focus{border-color:${PRIMARY}}
  .ddui-err{font-size:12px;color:#ef4444;margin-top:4px}
  .ddui-toast-wrap{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;flex-direction:column;gap:8px;align-items:center}
  .ddui-toast{background:${DARK};color:#fff;font-size:13px;padding:10px 20px;border-radius:24px;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transform:translateY(-8px);transition:all .25s;display:flex;align-items:center;gap:8px;max-width:80vw}
  .ddui-toast.ddui-show{opacity:1;transform:translateY(0)}
  .ddui-kv{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
  .ddui-kv:last-child{border-bottom:0}
  .ddui-kv b{color:${DARK};font-weight:600;text-align:right;word-break:break-all;max-width:62%}
  .ddui-panel{position:fixed;top:64px;right:24px;width:340px;background:#fff;border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.16);z-index:950;overflow:hidden;opacity:0;transform:translateY(-6px);transition:all .18s;pointer-events:none;font-family:'Inter','PingFang SC',-apple-system,sans-serif}
  .ddui-panel.ddui-show{opacity:1;transform:translateY(0);pointer-events:auto}
  .ddui-search-row{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:8px;cursor:pointer}
  .ddui-search-row:hover{background:#f9fafb}
  .ddui-notif-row{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid #f3f4f6;cursor:pointer}
  .ddui-notif-row:hover{background:#f9fafb}
  .ddui-badge-dot{width:8px;height:8px;border-radius:50%;background:${PRIMARY};flex:none;margin-top:6px}
  `;
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------------- Toast ---------------- */
  var toastWrap;
  function toast(msg, type) {
    if (!toastWrap) { toastWrap = h('<div class="ddui-toast-wrap"></div>'); document.body.appendChild(toastWrap); }
    var icon = type === 'success' ? 'solar:check-circle-bold' : type === 'error' ? 'solar:danger-circle-bold' : 'solar:info-circle-bold';
    var t = h('<div class="ddui-toast"><iconify-icon icon="' + icon + '"></iconify-icon><span></span></div>');
    t.querySelector('span').textContent = msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('ddui-show'); });
    setTimeout(function () { t.classList.remove('ddui-show'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }

  /* ---------------- 模态框 ---------------- */
  // DDUI.modal({ title, body(HTML string|Node), actions:[{text,type,onClick(close),keep}], width, onOpen })
  function modal(opt) {
    var mask = h('<div class="ddui-mask"><div class="ddui-box" role="dialog">' +
      '<div class="ddui-head"><div class="ddui-title"></div><button class="ddui-close" aria-label="关闭">✕</button></div>' +
      '<div class="ddui-body"></div>' +
      (opt.actions && opt.actions.length ? '<div class="ddui-foot"></div>' : '') +
      '</div></div>');
    var box = mask.querySelector('.ddui-box');
    if (opt.width) box.style.maxWidth = opt.width;
    mask.querySelector('.ddui-title').textContent = opt.title || '';
    var bodyEl = mask.querySelector('.ddui-body');
    if (typeof opt.body === 'string') bodyEl.innerHTML = opt.body; else if (opt.body) bodyEl.appendChild(opt.body);
    function close() { mask.classList.remove('ddui-show'); setTimeout(function () { mask.remove(); }, 200); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    mask.querySelector('.ddui-close').addEventListener('click', close);
    if (opt.actions) {
      var foot = mask.querySelector('.ddui-foot');
      opt.actions.forEach(function (a) {
        var b = h('<button class="ddui-btn ddui-btn-' + (a.type || 'ghost') + '"></button>');
        b.textContent = a.text;
        b.addEventListener('click', function () { if (a.onClick) a.onClick(close, bodyEl); else close(); });
        foot.appendChild(b);
      });
    }
    document.body.appendChild(mask);
    requestAnimationFrame(function () { mask.classList.add('ddui-show'); });
    if (opt.onOpen) opt.onOpen(bodyEl, close);
    return { close: close, body: bodyEl, el: mask };
  }

  function confirmDlg(title, text, onOk, okText) {
    return modal({
      title: title,
      body: '<p style="font-size:14px;color:#4b5563;line-height:1.7"></p>',
      actions: [
        { text: '取消' },
        { text: okText || '确定', type: 'primary', onClick: function (close) { close(); if (onOk) onOk(); } }
      ],
      onOpen: function (body) { body.querySelector('p').textContent = text; }
    });
  }

  /* ---------------- 全局搜索 ---------------- */
  var SEARCH_ITEMS = [
    ['控制面板', 'dashboard.html', 'solar:widget-bold'], ['我的钱包', 'wallet.html', 'solar:wallet-bold'],
    ['我的账户', 'receivables.html', 'solar:card-bold'], ['转账', 'transfer.html', 'solar:transfer-horizontal-bold'],
    ['全球即时付款', 'payall.html', 'solar:plain-bold'], ['速汇中国', 'remittance.html', 'solar:earth-bold'],
    ['法币交易记录', 'transactions.html', 'solar:bill-list-bold'],
    ['收款人', 'recipients.html', 'solar:users-group-two-rounded-bold'], ['数字资产兑换', 'exchange.html', 'solar:refresh-circle-bold'],
    ['USDT 钱包', 'usdt-wallet.html', 'solar:wallet-money-bold'], ['加密钱包', 'crypto-wallet.html', 'solar:card-bold-duotone'],
    ['线上收单', 'acquiring.html', 'solar:card-2-bold'], ['线上加密币收单', 'crypto-acquiring.html', 'solar:bitcoin-circle-bold'],
    ['线下收单', 'offline-acquiring.html', 'solar:qr-code-bold'], ['收款链接', 'pay-link.html', 'solar:link-bold'],
    ['营收发票', 'invoices.html', 'solar:bill-bold'], ['成本发票', 'cost-invoices.html', 'solar:bill-check-bold'],
    ['物流', 'logistics.html', 'solar:delivery-bold'], ['VAT 管理', 'vat.html', 'solar:calculator-bold'], ['年报管理', 'annual.html', 'solar:notebook-bold'], ['即时聊天', 'messages.html', 'solar:chat-round-dots-bold'],
    ['结算记录', 'settlements.html', 'solar:hand-money-bold'], ['数据分析', 'analytics.html', 'solar:graph-up-bold'],
    ['客户管理', 'customers.html', 'solar:users-group-rounded-bold'], ['门店列表', 'stores.html', 'solar:shop-bold'],
    ['网店列表', 'shops.html', 'solar:shop-2-bold'],
    ['团队协作', 'team.html', 'solar:user-speak-bold'], ['账户设置', 'settings.html', 'solar:settings-bold'],
    ['API 开发', 'api.html', 'solar:code-bold'], ['KYC 认证', 'kyc.html', 'solar:shield-check-bold'],
    ['KYB 认证', 'kyb.html', 'solar:buildings-2-bold'], ['合规中心', 'compliance.html', 'solar:shield-bold'],
    ['帮助中心', 'help.html', 'solar:question-square-bold'], ['操作日志', 'logs.html', 'solar:history-bold']
  ];
  function openSearch() {
    var m = modal({
      title: '全局搜索', width: '520px',
      body: '<input class="ddui-input" id="ddui-search-input" placeholder="搜索功能页面，如：转账 / 发票 / KYC"/><div id="ddui-search-list" style="margin-top:12px"></div>',
      onOpen: function (body, close) {
        var input = body.querySelector('#ddui-search-input'), list = body.querySelector('#ddui-search-list');
        function render(kw) {
          var items = SEARCH_ITEMS.filter(function (x) { return !kw || x[0].toLowerCase().indexOf(kw.toLowerCase()) > -1; });
          list.innerHTML = items.length ? '' : '<p style="text-align:center;color:#9ca3af;font-size:13px;padding:16px">没有找到相关功能</p>';
          items.slice(0, 8).forEach(function (x) {
            var row = h('<div class="ddui-search-row"><iconify-icon style="font-size:18px;color:#9ca3af" icon="' + x[2] + '"></iconify-icon><span style="font-size:14px;font-weight:600;color:' + DARK + '"></span><span style="margin-left:auto;font-size:11px;color:#9ca3af">进入 →</span></div>');
            row.querySelector('span').textContent = x[0];
            row.addEventListener('click', function () { location.href = x[1]; });
            list.appendChild(row);
          });
        }
        render('');
        input.addEventListener('input', function () { render(input.value.trim()); });
        setTimeout(function () { input.focus(); }, 60);
      }
    });
  }

  /* ---------------- 通知面板 ---------------- */
  var NOTIFS = [
    ['solar:card-transfer-bold', '一笔收款已到账', '线下收单 · 微信支付 ¥326.00，已计入今日营收。', '10 分钟前', 'transactions.html'],
    ['solar:shield-warning-bold', '风控提醒', '检测到 1 次异地登录拦截，如非本人操作请立即修改密码。', '2 小时前', 'logs.html'],
    ['solar:hand-money-bold', '结算完成', '结算单 STL-20260805-01 已打款，¥48,133.54。', '今天 09:30', 'settlements.html'],
    ['solar:document-text-bold', '发票已开具', '发票 INV-202608-0042 已开出，可在营收发票中下载。', '昨天 18:02', 'invoices.html']
  ];
  var notifPanel = null;
  function toggleNotif() {
    if (notifPanel) { closeNotif(); return; }
    notifPanel = h('<div class="ddui-panel"><div style="padding:14px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px;color:' + DARK + '">通知中心</b><a style="font-size:12px;color:#0ea5e9;cursor:pointer" id="ddui-notif-clear">全部已读</a></div><div style="max-height:360px;overflow-y:auto" id="ddui-notif-list"></div></div>');
    var list = notifPanel.querySelector('#ddui-notif-list');
    NOTIFS.forEach(function (n) {
      var row = h('<div class="ddui-notif-row"><div class="ddui-badge-dot"></div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:13px;color:' + DARK + '"></b><span style="font-size:11px;color:#9ca3af;flex:none"></span></div><p style="font-size:12px;color:#6b7280;margin-top:2px;line-height:1.5"></p></div></div>');
      var tds = row.querySelectorAll('b, span, p');
      tds[0].textContent = n[1]; tds[1].textContent = n[3]; tds[2].textContent = n[2];
      row.addEventListener('click', function () { location.href = n[4]; });
      list.appendChild(row);
    });
    notifPanel.querySelector('#ddui-notif-clear').addEventListener('click', function () {
      list.innerHTML = '<p style="text-align:center;color:#9ca3af;font-size:13px;padding:24px">全部通知已读</p>';
      document.querySelectorAll('.bg-red-500.rounded-full').forEach(function (d) { d.style.display = 'none'; });
    });
    document.body.appendChild(notifPanel);
    requestAnimationFrame(function () { notifPanel.classList.add('ddui-show'); });
    setTimeout(function () { document.addEventListener('click', onDocClick); }, 10);
  }
  function onDocClick(e) { if (notifPanel && !notifPanel.contains(e.target)) closeNotif(); }
  function closeNotif() {
    if (!notifPanel) return;
    var p = notifPanel; notifPanel = null;
    p.classList.remove('ddui-show');
    setTimeout(function () { p.remove(); }, 200);
    document.removeEventListener('click', onDocClick);
  }

  /* ---------------- 自动绑定顶栏搜索/通知 ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('button').forEach(function (b) {
      var ic = b.querySelector('iconify-icon');
      if (!ic || b.dataset.dduiBound) return;
      var icon = ic.getAttribute('icon') || '';
      if (/solar:magnifer/.test(icon) && !b.getAttribute('onclick')) {
        b.dataset.dduiBound = '1';
        b.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
      }
      if (/solar:bell/.test(icon) && !b.getAttribute('onclick')) {
        b.dataset.dduiBound = '1';
        b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggleNotif(); });
      }
    });
  });

  /* =====================================================================
   * 设计系统 v2：自动加载 apple.css + 状态组件 + 反馈 + 过渡
   * ===================================================================== */
  (function loadCss() {
    var me = document.currentScript || document.querySelector('script[src*="assets/js/ui.js"]');
    var base = me ? me.getAttribute('src').replace(/js\/ui\.js.*$/, '') : 'assets/';
    if (!document.querySelector('link[data-dd-apple]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = base + 'css/apple.css'; l.setAttribute('data-dd-apple', '1');
      document.head.appendChild(l);
    }
    if (!document.querySelector('link[data-dd-polish]')) {
      var p = document.createElement('link');
      p.rel = 'stylesheet'; p.href = base + 'css/polish.css'; p.setAttribute('data-dd-polish', '1');
      document.head.appendChild(p);
    }
    /* 通用列表增强（搜索/分页/查看全部/行详情），页面无 <main> 时自动跳过 */
    if (!document.querySelector('script[data-dd-tk]')) {
      var s = document.createElement('script');
      s.src = base + 'js/table-kit.js'; s.defer = true; s.setAttribute('data-dd-tk', '1');
      document.head.appendChild(s);
    }
  })();

  var SVG = {
    empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h4l2 3h6l2-3h4"/><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    wifi: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/><path d="M3 3l18 18"/></svg>'
  };

  // DDUI.state(el, 'empty'|'loading'|'error'|'ok'|'search', {title, text, action, onAction})
  function state(el, type, o) {
    o = o || {};
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    var D = {
      empty: ['暂无数据', '这里还没有任何记录'],
      search: ['没有匹配结果', '换个关键词或调整筛选条件试试'],
      error: ['加载失败', '网络开小差了，请稍后重试'],
      ok: ['操作成功', ''],
      loading: ['加载中…', '']
    }[type] || ['', ''];
    var title = o.title || D[0], text = o.text != null ? o.text : D[1];
    var icon = type === 'loading' ? '<div class="dd-spinner"></div>' :
      '<div class="dd-state-ic ' + (type === 'error' ? 'err' : type === 'ok' ? 'ok' : '') + '">' + (SVG[type] || SVG.empty) + '</div>';
    var act = o.action || (type === 'error' ? '重新加载' : '');
    var html = '<div class="dd-state" data-dd-state="' + type + '">' + icon + '<h4>' + esc(title) + '</h4>' +
      (text ? '<p>' + esc(text) + '</p>' : '') +
      (act ? '<button class="dd-state-btn' + (type === 'error' ? ' ghost' : '') + '">' + esc(act) + '</button>' : '') + '</div>';
    if (el.tagName === 'TBODY') {
      var cols = (el.closest('table').querySelector('thead tr') || { children: [1] }).children.length;
      el.innerHTML = '<tr data-dd-empty><td colspan="' + cols + '">' + html + '</td></tr>';
    } else el.innerHTML = html;
    var b = el.querySelector('.dd-state-btn');
    if (b) b.addEventListener('click', function () { if (o.onAction) o.onAction(); else if (type === 'error') location.reload(); });
    return el;
  }

  // DDUI.skeleton(el, rows)
  function skeleton(el, rows) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    var r = '';
    for (var i = 0; i < (rows || 4); i++) r += '<div class="dd-skel-row"><div class="dd-skel" style="width:40px;height:40px;border-radius:12px;flex:none"></div><div style="flex:1"><div class="dd-skel" style="height:12px;width:' + (40 + (i * 17) % 40) + '%;margin-bottom:8px"></div><div class="dd-skel" style="height:10px;width:24%"></div></div><div class="dd-skel" style="height:14px;width:72px"></div></div>';
    if (el.tagName === 'TBODY') {
      var cols = (el.closest('table').querySelector('thead tr') || { children: [1] }).children.length;
      el.innerHTML = '<tr data-dd-empty><td colspan="' + cols + '">' + r + '</td></tr>';
    } else el.innerHTML = r;
  }

  // DDUI.busy(btn, ms|Promise, doneText) —— 按钮加载态
  function busy(btn, job, doneMsg) {
    if (!btn || btn.getAttribute('aria-busy') === 'true') return Promise.resolve();
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
    var p = typeof job === 'number' || job == null ? new Promise(function (r) { setTimeout(r, job || 900); }) : job;
    progress(true);
    return Promise.resolve(p).then(function (v) {
      if (doneMsg) toast(doneMsg, 'success'); return v;
    }, function (e) { toast((e && e.message) || '操作失败，请重试', 'error'); throw e; })
      .finally(function () { btn.removeAttribute('aria-busy'); btn.disabled = false; progress(false); });
  }

  // DDUI.validate(container) —— 校验 [required] / [data-rule]，返回 bool
  function validate(root) {
    if (typeof root === 'string') root = document.querySelector(root);
    var ok = true, first = null;
    (root || document).querySelectorAll('[required],[data-rule]').forEach(function (f) {
      var v = (f.value || '').trim(), rule = f.getAttribute('data-rule'), msg = '';
      if (f.hasAttribute('required') && !v) msg = f.getAttribute('data-msg') || '此项为必填';
      else if (v && rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = '邮箱格式不正确';
      else if (v && rule === 'phone' && !/^\+?\d[\d\s-]{6,}$/.test(v)) msg = '手机号格式不正确';
      else if (v && rule === 'iban' && !/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v.replace(/\s/g, '').toUpperCase())) msg = 'IBAN 格式不正确';
      else if (v && rule === 'amount' && !(parseFloat(v) > 0)) msg = '请输入大于 0 的金额';
      else if (v && rule && rule.indexOf('min:') === 0 && v.length < +rule.slice(4)) msg = '至少 ' + rule.slice(4) + ' 位';
      var tip = f.parentNode.querySelector(':scope > .dd-field-err');
      if (msg) {
        ok = false; first = first || f;
        f.classList.remove('dd-invalid'); void f.offsetWidth; f.classList.add('dd-invalid');
        if (!tip) { tip = document.createElement('div'); tip.className = 'dd-field-err'; f.insertAdjacentElement('afterend', tip); }
        tip.textContent = msg;
      } else { f.classList.remove('dd-invalid'); if (tip) tip.remove(); }
    });
    if (first) first.focus();
    return ok;
  }
  document.addEventListener('input', function (e) {
    var f = e.target;
    if (f.classList && f.classList.contains('dd-invalid')) {
      f.classList.remove('dd-invalid');
      var t = f.parentNode.querySelector(':scope > .dd-field-err'); if (t) t.remove();
    }
  });

  // 顶部进度条
  var bar, barT;
  function progress(on) {
    if (!bar) { bar = document.createElement('div'); bar.id = 'dd-progress'; document.body.appendChild(bar); }
    clearTimeout(barT);
    if (on) { bar.style.opacity = '1'; bar.style.width = '0'; requestAnimationFrame(function () { bar.style.width = '72%'; }); }
    else { bar.style.width = '100%'; barT = setTimeout(function () { bar.style.opacity = '0'; bar.style.width = '0'; }, 300); }
  }

  // 空表格自动显示空状态（含筛选后清空）
  function watchTables() {
    document.querySelectorAll('table tbody').forEach(function (tb) {
      if (tb.dataset.ddWatch) return; tb.dataset.ddWatch = '1';
      var check = function () {
        var rows = Array.prototype.filter.call(tb.children, function (r) { return !r.hasAttribute('data-dd-empty') && r.style.display !== 'none' && !r.classList.contains('hidden'); });
        var holder = tb.querySelector(':scope > tr[data-dd-empty]');
        if (!rows.length && !holder) {
          var anyHidden = tb.children.length > 0;
          var tr = document.createElement('tr'); tr.setAttribute('data-dd-empty', '');
          var cols = (tb.closest('table').querySelector('thead tr') || { children: [1] }).children.length;
          tr.innerHTML = '<td colspan="' + cols + '"></td>';
          tb.appendChild(tr);
          state(tr.firstChild, anyHidden ? 'search' : 'empty');
        } else if (rows.length && holder && !holder.querySelector('.dd-skel')) holder.remove();
      };
      check();
      new MutationObserver(function () { clearTimeout(tb._ddT); tb._ddT = setTimeout(check, 30); })
        .observe(tb, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class'] });
      Array.prototype.forEach.call(tb.children, function (r) {
        new MutationObserver(function () { clearTimeout(tb._ddT); tb._ddT = setTimeout(check, 30); }).observe(r, { attributes: true, attributeFilter: ['style', 'class'] });
      });
    });
  }

  // 页面跳转过渡 + 进度条
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#' || /^(javascript|mailto|tel):/i.test(href) || /^https?:/i.test(href)) return;
    if (!/\.html(\?|#|$)/.test(href)) return;
    e.preventDefault();
    progress(true); document.body.classList.add('dd-leaving');
    setTimeout(function () { location.href = href; }, 140);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { document.body.classList.remove('dd-leaving'); progress(false); } });

  // 离线提示
  function offlineBanner(show) {
    var b = document.getElementById('dd-offline');
    if (!b) { b = h('<div id="dd-offline">' + SVG.wifi + '<span>网络已断开，部分功能暂不可用</span></div>'); document.body.appendChild(b); }
    b.classList.toggle('show', show);
  }
  window.addEventListener('offline', function () { offlineBanner(true); });
  window.addEventListener('online', function () { offlineBanner(false); toast('网络已恢复', 'success'); });

  // Toast 类型着色
  var _toast = toast;
  toast = function (msg, type) {
    _toast(msg, type);
    var all = document.querySelectorAll('.ddui-toast'), t = all[all.length - 1];
    if (t) t.classList.add(type === 'success' ? 'ok' : type === 'error' ? 'err' : 'info');
  };

  document.addEventListener('DOMContentLoaded', function () {
    watchTables();
    if (!navigator.onLine) offlineBanner(true);
    // 官网移动端汉堡菜单
    document.querySelectorAll('.dd-site-nav .dd-burger').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = document.getElementById(b.getAttribute('aria-controls'));
        if (!m) return;
        var open = m.classList.toggle('open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  });

  window.DDUI = {
    modal: modal, toast: function (m, t) { return toast(m, t); }, confirm: confirmDlg, openSearch: openSearch, toggleNotif: toggleNotif, esc: esc,
    state: state, skeleton: skeleton, busy: busy, validate: validate, progress: progress, watchTables: watchTables
  };
})();
