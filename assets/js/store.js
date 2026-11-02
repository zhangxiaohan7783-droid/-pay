/* 客户端共享数据与组件：子账户 / 团队成员 / 虚拟卡
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
    { no: '5312 **** **** 9905', type: 'online', sub: 'SA-0003', limit: 10000, frozen: true, brand: 'Mastercard', owner: '' }
  ];
  window.DDCards = {
    load: function () { return read(CARD_KEY, CARD_SEED); },
    save: function (l) { write(CARD_KEY, l); },
    bySub: function (subId) { return this.load().filter(function (c) { return c.sub === subId; }); },
    /* 开卡弹窗：fixedSub 传入子账户 id 则锁定绑定该子账户；onDone() 开卡成功后回调 */
    openModal: function (fixedSub, onDone) {
      var list = this.load();
      if (list.length >= 100) { DDUI.toast('虚拟卡数量已达上限（100 张）', 'error'); return; }
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
          + '<div class="ddui-field"><label class="ddui-label">绑定子账户</label><select class="ddui-input" id="nc-sub"' + (fixedSub ? ' disabled' : '') + '>' + opts + '</select>'
          + '<p style="font-size:12px;color:#9ca3af;margin-top:4px">卡片只能消费该子账户的余额</p></div>'
          + '<div class="ddui-field"><label class="ddui-label">关联人员</label><select class="ddui-input" id="nc-owner">' + owners + '</select>'
          + '<p style="font-size:12px;color:#9ca3af;margin-top:4px">关联后该成员可在团队权限内使用此卡</p></div>'
          + '<div class="ddui-field"><label class="ddui-label">月限额 (EUR)</label><input class="ddui-input" id="nc-limit" type="number" min="1" value="5000"/>'
          + '<p class="ddui-err" id="nc-err" style="display:none">请输入大于 0 的限额</p></div>',
        actions: [{ text: '取消' }, {
          text: '确认开通', type: 'primary', onClick: function (close, body) {
            var limit = parseFloat(body.querySelector('#nc-limit').value);
            body.querySelector('#nc-err').style.display = limit > 0 ? 'none' : 'block';
            if (!(limit > 0)) return;
            var tp = body.querySelector('input[name="nc-type"]:checked').value;
            var sid = fixedSub || body.querySelector('#nc-sub').value;
            var list2 = self.load();
            list2.unshift({
              no: (tp === 'offline' ? '4890' : '5312') + ' **** **** ' + ('000' + Math.floor(Math.random() * 9999)).slice(-4),
              type: tp, sub: sid, limit: limit, frozen: false,
              brand: tp === 'offline' ? 'Visa' : 'Mastercard',
              owner: body.querySelector('#nc-owner').value
            });
            self.save(list2); close();
            DDUI.toast('虚拟卡已开通', 'success');
            if (onDone) onDone();
          }
        }]
      });
    }
  };
})();
