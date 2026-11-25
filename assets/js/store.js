/* 客户端共享数据与组件：子账户 / 团队成员 / 虚拟卡 / 共享资金池
 * 供 sub-accounts.html、cards.html、internal-transfer.html 使用 */
(function () {
  var CUR = { EUR: '€', USD: '$', GBP: '£', CNY: '¥' };
  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }
  function read(k, seed) { try { return JSON.parse(localStorage.getItem(k)) || seed.slice(); } catch (e) { return seed.slice(); } }
  function write(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  /* ---- 子账户 ---- */
  var SUB_KEY = 'dd-subaccounts';
  var SUB_SEED = [
    { id: 'SA-0001', name: '欧洲电商事业部', cur: 'EUR', bal: 12480.50, ts: '2026-09-12', owner: 'U-02' },
    { id: 'SA-0002', name: '游戏收单结算户', cur: 'USD', bal: 8210.00, ts: '2026-09-28', owner: 'U-03' },
    { id: 'SA-0003', name: '广告投放专用户', cur: 'EUR', bal: 3150.75, ts: '2026-10-09', owner: '' }
  ];
  window.DDSubs = {
    load: function () { return read(SUB_KEY, SUB_SEED); },
    save: function (l) { write(SUB_KEY, l); },
    fmt: fmt, CUR: CUR
  };

  /* ---- 团队成员 ---- */
  var TEAM_KEY = 'dd-team';
  var TEAM_SEED = [
    { id: 'U-01', name: '小涵总', role: '管理员' },
    { id: 'U-02', name: '陈晓', role: '财务' },
    { id: 'U-03', name: 'Maria Rossi', role: '运营' },
    { id: 'U-04', name: '李强', role: '开发' }
  ];
  window.DDTeam = {
    load: function () { return read(TEAM_KEY, TEAM_SEED); },
    name: function (id) {
      var m = this.load().filter(function (x) { return x.id === id; })[0];
      return m ? m.name : '';
    }
  };

  /* ---- 虚拟卡 ---- */
  var CARD_KEY = 'dd-cards';
  var CARD_SEED = [
    { no: '5312 **** **** 8842', type: 'online', sub: 'SA-0001', limit: 5000, frozen: false, brand: 'Mastercard', owner: 'U-02' },
    { no: '4890 **** **** 3317', type: 'offline', sub: 'SA-0002', limit: 2000, frozen: false, brand: 'Visa', owner: 'U-03' },
    { no: '5312 **** **** 9905', type: 'online', sub: 'SA-0003', limit: 10000, frozen: true, brand: 'Mastercard', owner: '' },
    { no: '5312 **** **** 6021', type: 'online', sub: 'SA-0003', limit: 3000, frozen: false, brand: 'Mastercard', owner: 'U-04', pool: 'POOL-01' },
    { no: '5312 **** **** 7468', type: 'online', sub: 'SA-0001', limit: 4000, frozen: false, brand: 'Mastercard', owner: 'U-01', pool: 'POOL-01' }
  ];
  /* ---- 共享资金池：多张卡共用一个池余额；池由子账户充值 / 转回 ---- */
  var POOL_KEY = 'dd-card-pools-v1';
  var RATE = { EUR: 1, USD: 0.92, GBP: 1.17, CNY: 0.13 };
  var POOL_SEED = [
    { id: 'POOL-01', name: '广告投放共享池', cur: 'EUR', bal: 18450.00, sub: 'SA-0003', monthLimit: 30000, spentM: 11280.60, alert: 3000, auto: { on: true, below: 3000, amount: 5000 }, frozen: false, ts: '2026-10-09', note: 'Google / Meta / TikTok 投放卡共用' },
    { id: 'POOL-02', name: '欧洲电商采购池', cur: 'EUR', bal: 6200.00, sub: 'SA-0001', monthLimit: 15000, spentM: 4281.80, alert: 2000, auto: { on: false, below: 1000, amount: 3000 }, frozen: false, ts: '2026-10-21', note: '1688 / Amazon 采购与物流' },
    { id: 'POOL-03', name: '门店备用金池', cur: 'USD', bal: 1800.00, sub: 'SA-0002', monthLimit: 5000, spentM: 1520.00, alert: 500, auto: { on: false, below: 500, amount: 1000 }, frozen: false, ts: '2026-11-02', note: '线下差旅与门店零星支出' }
  ];
  var POOL_INIT = { '8842': 'POOL-02', '9905': 'POOL-01', '3317': 'POOL-03' };
  function poolsRaw() { try { return JSON.parse(localStorage.getItem(POOL_KEY)); } catch (e) { return null; } }
  window.DDPools = {
    KEY: POOL_KEY, RATE: RATE,
    load: function () {
      var l = poolsRaw();
      if (!Array.isArray(l)) {
        /* 首次：写入种子并把已有卡按尾号挂到对应资金池 */
        l = JSON.parse(JSON.stringify(POOL_SEED)); write(POOL_KEY, l);
        var cards = read(CARD_KEY, CARD_SEED), ch = false;
        cards.forEach(function (c) { if (c.pool === undefined) { c.pool = POOL_INIT[c.no.slice(-4)] || ''; ch = true; } });
        if (ch) write(CARD_KEY, cards);
      }
      return l;
    },
    save: function (l) { write(POOL_KEY, l); },
    get: function (id) { return this.load().filter(function (p) { return p.id === id; })[0] || null; },
    cards: function (id) { return DDCards.load().filter(function (c) { return c.pool === id; }); },
    log: function (id) { try { return (JSON.parse(localStorage.getItem(POOL_KEY + '-log') || '{}')[id]) || []; } catch (e) { return []; } },
    addLog: function (id, row) {
      var all = {}; try { all = JSON.parse(localStorage.getItem(POOL_KEY + '-log') || '{}'); } catch (e) {}
      all[id] = all[id] || []; all[id].unshift(row); all[id] = all[id].slice(0, 100);
      localStorage.setItem(POOL_KEY + '-log', JSON.stringify(all));
    },
    toEur: function (v, cur) { return v * (RATE[cur] || 1); },
    fromEur: function (v, cur) { return v / (RATE[cur] || 1); },
    total: function () { var s = 0, self = this; this.load().forEach(function (p) { s += self.toEur(p.bal, p.cur); }); return s; }
  };

  window.DDCards = {
    load: function () { if (!poolsRaw()) DDPools.load(); return read(CARD_KEY, CARD_SEED); },
    save: function (l) { write(CARD_KEY, l); },
    bySub: function (subId) { return this.load().filter(function (c) { return c.sub === subId; }); },
    /* 资金来源：资金池优先，否则绑定子账户 */
    source: function (c) {
      var p = c.pool ? DDPools.get(c.pool) : null;
      if (p) return { kind: 'pool', id: p.id, name: p.name, cur: p.cur, bal: p.bal, frozen: p.frozen, obj: p };
      var s = DDSubs.load().filter(function (a) { return a.id === c.sub; })[0];
      return s ? { kind: 'sub', id: s.id, name: s.name, cur: s.cur, bal: s.bal, frozen: false, obj: s } : { kind: 'none', id: '', name: '未绑定', cur: 'EUR', bal: 0, frozen: false };
    },
    /* 可用额度（EUR）= min（卡月限额，资金来源余额，资金池月度剩余额度）；卡或池冻结为 0 */
    avail: function (c) {
      var src = this.source(c);
      if (c.frozen || src.frozen) return 0;
      var bal = DDPools.toEur(src.bal, src.cur), v = Math.min(c.limit, bal);
      if (src.kind === 'pool') v = Math.min(v, DDPools.toEur(Math.max(0, src.obj.monthLimit - src.obj.spentM), src.cur));
      return Math.max(0, v);
    },
    /* 开卡弹窗：fixedSub 传入子账户 id 则锁定绑定该子账户；onDone() 开卡成功后回调 */
    openModal: function (fixedSub, onDone) {
      var list = this.load();
      var hub = (window.DDCardHub && window.DDEnt) ? DDCardHub.forEnt(DDEnt.current().id) : null;
      if (hub && hub.status !== 'on') { DDUI.toast(hub.status === 'off' ? '虚拟卡功能已被平台暂停，暂不能开卡' : '当前主体尚未开通虚拟卡功能，请先申请开通', 'error'); return; }
      var maxN = hub ? hub.maxCards : 100;
      if (list.length >= maxN) { DDUI.toast('虚拟卡数量已达上限（' + maxN + ' 张）', 'error'); return; }
      var pools = DDPools.load();
      var subs = DDSubs.load();
      if (!subs.length) { DDUI.toast('请先开立子账户，再开通虚拟卡', 'error'); return; }
      var opts = subs.map(function (a) {
        return '<option value="' + a.id + '"' + (fixedSub === a.id ? ' selected' : '') + '>' +
          a.name + '（' + a.id + ' · 余额 ' + (CUR[a.cur] || '') + fmt(a.bal) + '）</option>';
      }).join('');
      var owners = '<option value="">暂不关联</option>' + DDTeam.load().map(function (m) {
        return '<option value="' + m.id + '">' + m.name + '（' + m.role + '）</option>';
      }).join('');
      var self = this;
      DDUI.modal({
        title: '开通虚拟卡',
        body: '<div class="ddui-field"><label class="ddui-label">卡类型</label>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
          + '<label style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;cursor:pointer"><img src="assets/img/card-yellow.png" style="width:100%;border-radius:6px;margin-bottom:8px"/><input type="radio" name="nc-type" value="online" checked/> <b>线上付款卡</b><p style="font-size:12px;color:#9ca3af;margin-top:4px">仅限线上消费</p></label>'
          + '<label style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;cursor:pointer"><img src="assets/img/card-black.png" style="width:100%;border-radius:6px;margin-bottom:8px"/><input type="radio" name="nc-type" value="offline"/> <b>线下消费卡</b><p style="font-size:12px;color:#9ca3af;margin-top:4px">可绑 Apple Pay / Google Pay</p></label></div></div>'
          + '<div class="ddui-field"><label class="ddui-label">资金来源</label>'
          + '<div style="display:flex;gap:16px;margin-bottom:8px;font-size:13px"><label style="cursor:pointer"><input type="radio" name="nc-src" value="pool"' + (pools.length && !fixedSub ? ' checked' : '') + (pools.length ? '' : ' disabled') + '/> 共享资金池（推荐）</label><label style="cursor:pointer"><input type="radio" name="nc-src" value="sub"' + (pools.length && !fixedSub ? '' : ' checked') + '/> 子账户直扣</label></div>'
          + '<select class="ddui-input" id="nc-pool"' + (pools.length && !fixedSub ? '' : ' style="display:none"') + '>' + pools.map(function (p) { return '<option value="' + p.id + '">' + p.name + '（' + (CUR[p.cur] || '') + fmt(p.bal) + ' · 已绑 ' + list.filter(function (c) { return c.pool === p.id; }).length + ' 张卡）</option>'; }).join('') + '</select>'
          + '<select class="ddui-input" id="nc-sub"' + (fixedSub ? ' disabled' : '') + (pools.length && !fixedSub ? ' style="display:none"' : '') + '>' + opts + '</select>'
          + '<p style="font-size:12px;color:#9ca3af;margin-top:4px" id="nc-src-tip">' + (pools.length && !fixedSub ? '多张卡共用池内余额，池余额不足时所有卡同时受限' : '卡片只能消费该子账户的余额') + '</p></div>'
          + '<div class="ddui-field"><label class="ddui-label">关联人员</label><select class="ddui-input" id="nc-owner">' + owners + '</select>'
          + '<p style="font-size:12px;color:#9ca3af;margin-top:4px">关联后该成员可在团队权限内使用此卡</p></div>'
          + '<div class="ddui-field"><label class="ddui-label">月限额 (EUR)</label><input class="ddui-input" id="nc-limit" type="number" min="1" value="5000"/>'
          + '<p class="ddui-err" id="nc-err" style="display:none">请输入大于 0 的限额</p></div>'
          + '<p style="font-size:12px;color:#6b7280;background:#f9fafb;border-radius:8px;padding:8px 10px">开卡及用卡费用按您与叮当支付约定的费率计收，明细见每月账单。</p>',
        actions: [{ text: '取消' }, {
          text: '确认开通', type: 'primary', onClick: function (close, body) {
            var limit = parseFloat(body.querySelector('#nc-limit').value);
            body.querySelector('#nc-err').style.display = limit > 0 ? 'none' : 'block';
            if (!(limit > 0)) return;
            var tp = body.querySelector('input[name="nc-type"]:checked').value;
            var srcEl = body.querySelector('input[name="nc-src"]:checked');
            var pid = srcEl && srcEl.value === 'pool' ? body.querySelector('#nc-pool').value : '';
            var pl = pid ? DDPools.get(pid) : null;
            var sid = fixedSub || (pl ? pl.sub : body.querySelector('#nc-sub').value);
            var list2 = self.load();
            list2.unshift({
              no: (tp === 'offline' ? '4890' : '5312') + ' **** **** ' + ('000' + Math.floor(Math.random() * 9999)).slice(-4),
              type: tp, sub: sid, limit: limit, frozen: false,
              brand: tp === 'offline' ? 'Visa' : 'Mastercard',
              owner: body.querySelector('#nc-owner').value, pool: pid
            });
            self.save(list2); close();
            DDUI.toast(pl ? '虚拟卡已开通，并加入「' + pl.name + '」' : '虚拟卡已开通', 'success');
            if (onDone) onDone();
          }
        }]
      });
      document.querySelectorAll('input[name="nc-src"]').forEach(function (r) {
        r.onchange = function () {
          var pool = r.value === 'pool' && r.checked;
          document.getElementById('nc-pool').style.display = pool ? '' : 'none';
          document.getElementById('nc-sub').style.display = pool ? 'none' : '';
          document.getElementById('nc-src-tip').textContent = pool ? '多张卡共用池内余额，池余额不足时所有卡同时受限' : '卡片只能消费该子账户的余额';
        };
      });
    }
  };
})();
