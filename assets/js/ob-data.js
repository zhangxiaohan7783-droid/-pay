/* 叮当支付后台 · 开户管理共享数据层（演示版，纯前端）
 * 个人/商业两套开户单 + 审核动作 + 与风控合规模块联动（RC）
 * 所有审核动作写 RC 审计日志（dd-rc-audit-v1），拒户入黑名单库。
 */
(function () {
  'use strict';

  var STATUS_FLOW = {
    personal: ['草稿', '待初审', '待补材料', 'EDD复核中', '审核通过', '已拒绝', '复审中'],
    business: ['草稿', '待初审', '待补材料', 'EDD强化尽调中', '审核通过', '已拒绝', '复审中']
  };
  var ST_CLS = {
    '草稿': 'bg-gray-100 text-gray-500', '待初审': 'bg-blue-50 text-blue-600', '待补材料': 'bg-yellow-50 text-yellow-600',
    'EDD复核中': 'bg-orange-50 text-orange-600', 'EDD强化尽调中': 'bg-orange-50 text-orange-600',
    '审核通过': 'bg-green-50 text-green-600', '已拒绝': 'bg-red-50 text-red-500', '复审中': 'bg-purple-50 text-purple-600'
  };

  /* ---------- 个人开户单 ---------- */
  var P_KEY = 'dd-ob-personal-v1';
  var P_SEED = [
    { id: 'P-2601', name: 'Giulia Conti', country: '意大利', ts: '2026-11-13 09:20', status: '待初审', level: 'low', hit: '无', manager: '陈晓', accountOpened: false, docs: ['护照', '地址证明'], purpose: '留学生活费汇款', score: 18 },
    { id: 'P-2602', name: 'Marco Rossi', country: '意大利', ts: '2026-11-13 08:44', status: '待初审', level: 'mid', hit: '疑似', manager: '陈晓', accountOpened: false, docs: ['护照'], purpose: '跨境自由职业收款', score: 41 },
    { id: 'P-2598', name: 'Pierre Dubois', country: '法国', ts: '2026-11-12 16:02', status: '待补材料', level: 'mid', hit: '无', manager: 'Maria Rossi', accountOpened: false, docs: ['身份证'], purpose: '家庭汇款', score: 38, note: '缺地址证明' },
    { id: 'P-2595', name: 'Anna Schmidt', country: '德国', ts: '2026-11-12 11:30', status: 'EDD复核中', level: 'high', hit: '疑似', manager: 'Maria Rossi', accountOpened: false, docs: ['护照', '地址证明', '资金来源说明'], purpose: '艺术品交易收款', score: 68 },
    { id: 'P-2590', name: 'Luca Bianchi', country: '意大利', ts: '2026-11-10 15:12', status: '审核通过', level: 'low', hit: '无', manager: '陈晓', accountOpened: true, docs: ['护照', '地址证明'], purpose: '个人换汇', score: 12, account: 'IT60 X054 2811 1010 0000 0987 654' },
    { id: 'P-2588', name: 'Sofia Rossi', country: '意大利', ts: '2026-11-09 10:05', status: '已拒绝', level: 'critical', hit: '命中', manager: '李强', accountOpened: false, docs: ['护照'], purpose: '不详', score: 91, rejectReason: '制裁名单命中（拒绝·不可申诉）' },
    { id: 'P-2580', name: 'Elena Ferri', country: '西班牙', ts: '2026-11-05 14:40', status: '复审中', level: 'low', hit: '无', manager: 'Maria Rossi', accountOpened: true, docs: ['护照', '地址证明'], purpose: '电商副业收款', score: 25, account: 'ES91 2100 0418 4502 0005 1332' }
  ];

  /* ---------- 商业开户单 ---------- */
  var B_KEY = 'dd-ob-business-v1';
  var B_SEED = [
    { id: 'B-3101', company: 'Baltic Trade SIA', country: '拉脱维亚', industry: '大宗商品贸易', ts: '2026-11-13 10:15', status: 'EDD强化尽调中', level: 'critical', hitEnt: '无', hitDir: '无', hitBo: '疑似', manager: '陈晓', accountOpened: false, eddId: 'EDD-3012', scale: '年 €8M', upstream: '未提供', downstream: '未提供',
      directors: ['Oleg V.'], bo: [{ name: 'Oleg V.', share: '51%', pep: '疑似', hit: '待核实' }, { name: 'ShellCo Cyprus Ltd', share: '49%', pep: '否', hit: '无', children: [{ name: '未知', share: '—' }] }], score: 88 },
    { id: 'B-3100', company: 'Milano Fashion Hub S.r.l.', country: '意大利', industry: '跨境电商', ts: '2026-11-12 17:30', status: '待初审', level: 'mid', hitEnt: '无', hitDir: '无', hitBo: '无', manager: 'Maria Rossi', accountOpened: false, scale: '年 €2.4M', upstream: '广州服装供应链 ×6', downstream: '欧盟消费者',
      directors: ['小涵总', 'Chiara L.'], bo: [{ name: '小涵总', share: '70%', pep: '否', hit: '无' }, { name: 'Chiara L.', share: '30%', pep: '否', hit: '无' }], score: 45 },
    { id: 'B-3098', company: 'Nordic Luxury GmbH', country: '德国', industry: '奢侈品零售', ts: '2026-11-11 14:00', status: '待补材料', level: 'high', hitEnt: '无', hitDir: '无', hitBo: '无', manager: 'Maria Rossi', accountOpened: false, scale: '年 €5M', upstream: '瑞士手表经销商', downstream: '高净值客户', note: '缺近 6 个月银行流水',
      directors: ['Anna K.'], bo: [{ name: 'Anna K.', share: '100%', pep: '否', hit: '无' }], score: 76 },
    { id: 'B-3095', company: 'Iberia Textiles SL', country: '西班牙', industry: '纺织品贸易', ts: '2026-11-08 09:25', status: '审核通过', level: 'mid', hitEnt: '无', hitDir: '无', hitBo: '无', manager: '陈晓', accountOpened: true, scale: '年 €1.8M', upstream: '葡萄牙纺织厂', downstream: '欧洲批发商', account: 'ES91 1465 0100 7220 3087 6543',
      directors: ['Carlos M.', 'Lucia F.'], bo: [{ name: 'Carlos M.', share: '60%', pep: '否', hit: '无' }, { name: 'Lucia F.', share: '40%', pep: '否', hit: '无' }], score: 45 },
    { id: 'B-3090', company: 'Danube Import Kft', country: '匈牙利', industry: '食品进出口', ts: '2026-11-06 11:50', status: '已拒绝', level: 'high', hitEnt: '无', hitDir: '疑似', hitBo: '无', manager: '李强', accountOpened: false, scale: '年 €3M', upstream: '未提供', downstream: '未提供', rejectReason: '董事负面名单疑似命中且拒绝配合核实',
      directors: ['Viktor H.'], bo: [{ name: 'Viktor H.', share: '100%', pep: '待核实', hit: '疑似' }], score: 72 }
  ];

  /* ---------- 驳回话术模板 ---------- */
  var TPL_KEY = 'dd-ob-templates-v1';
  var TPL_SEED = [
    { id: 'T-01', name: '证件不清晰', scene: '证件材料', text: '您提交的证件照片无法清晰辨认，请重新拍摄原件正面上传。', on: true },
    { id: 'T-02', name: '地址证明失效', scene: '地址证明', text: '地址证明需为 3 个月内签发的水电煤账单或银行对账单，请补充。', on: true },
    { id: 'T-03', name: '资金用途不明', scene: '资金用途', text: '请补充说明账户资金用途与预计交易规模。', on: true },
    { id: 'T-04', name: 'BO 信息不完整', scene: '商业开户', text: '请补充全部持股 25% 以上受益所有人的证件与地址证明。', on: true },
    { id: 'T-05', name: '名单命中（拒户）', scene: '拒绝开户', text: '很遗憾，基于合规要求我们无法为您提供开户服务。', on: true }
  ];

  /* ---------- 黑名单（拒户库） ---------- */
  var BL_KEY = 'dd-ob-blacklist-v1';
  var BL_SEED = [
    { name: 'Sofia Rossi', type: '个人', reason: '制裁名单命中', ts: '2026-11-09', by: '李强' },
    { name: 'Danube Import Kft', type: '企业', reason: '董事负面名单疑似+拒绝配合', ts: '2026-11-06', by: '李强' }
  ];

  /* ---------- 开户配置 ---------- */
  var CFG_KEY = 'dd-ob-config-v1';
  var CFG_SEED = { autoScreen: true, autoScore: true, autoEdd: true, reviewReminder: true };

  function read(key, seed) { try { var d = JSON.parse(localStorage.getItem(key)); if (d && (Array.isArray(d) ? d.length : true)) return d; } catch (e) {} return JSON.parse(JSON.stringify(seed)); }
  function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  function personal() { return read(P_KEY, P_SEED); }
  function business() { return read(B_KEY, B_SEED); }
  function templates() { return read(TPL_KEY, TPL_SEED); }
  function blacklist() { return read(BL_KEY, BL_SEED); }
  function cfg() { return read(CFG_KEY, CFG_SEED); }

  function find(id) {
    var p = personal().filter(function (x) { return x.id === id; })[0];
    if (p) return { kind: 'personal', data: p };
    var b = business().filter(function (x) { return x.id === id; })[0];
    if (b) return { kind: 'business', data: b };
    return null;
  }

  function update(id, patch) {
    var l, k;
    if (id.charAt(0) === 'P') { l = personal(); k = P_KEY; } else { l = business(); k = B_KEY; }
    l.forEach(function (x) { if (x.id === id) Object.assign(x, patch); });
    write(k, l);
  }

  /* 审核动作（全部留痕 + 联动） */
  function act(id, action, extra) {
    extra = extra || {};
    var f = find(id); if (!f) return null;
    var target = id + ' ' + (f.data.name || f.data.company);
    var isB = f.kind === 'business';
    var eddStatus = isB ? 'EDD强化尽调中' : 'EDD复核中';
    if (action === 'approve') {
      var acct = f.data.account || ('IT60 X054 2811 1010 0000 ' + String(Math.floor(Math.random() * 900000 + 100000)));
      update(id, { status: '审核通过', accountOpened: true, account: acct });
      if (window.RC) RC.log('开户通过', target, '账户已开立 ' + acct + '；档案同步风险台账');
      /* 联动 L1：同步风控台账 */
      if (window.RC && isB) {
        var ms = RC.merchants();
        if (!ms.filter(function (m) { return m.name === f.data.company; }).length) {
          ms.push({ id: 'M-1' + String(100 + ms.length), name: f.data.company, country: f.data.country, reg: '—', vat: '—', industry: f.data.industry, level: f.data.level, score: f.data.score, kyc: '已通过', reviewDue: '2027-11-14', onboard: new Date().toISOString().slice(0, 10), control: '无', tags: ['开户同步'], bo: f.data.bo.map(function (b) { return { name: b.name, share: b.share, layer: 1 }; }), docs: ['注册文件'], upstream: f.data.upstream, downstream: f.data.downstream });
          RC.saveMerchants(ms);
        }
      }
    } else if (action === 'return') {
      update(id, { status: '待补材料', note: extra.note || '' });
      if (window.RC) RC.log('退回补材料', target, extra.note || '');
    } else if (action === 'reject') {
      update(id, { status: '已拒绝', rejectReason: extra.reason || '' });
      var bl = blacklist();
      bl.unshift({ name: f.data.name || f.data.company, type: isB ? '企业' : '个人', reason: extra.reason || '', ts: new Date().toISOString().slice(0, 10), by: '演示账号' });
      write(BL_KEY, bl);
      if (window.RC) RC.log('拒绝开户', target, extra.reason || '' + '；已入黑名单库');
    } else if (action === 'edd') {
      update(id, { status: eddStatus });
      if (window.RC) {
        var l = RC.edd();
        var nid = 'EDD-' + (3013 + l.length);
        l.unshift({ id: nid, mer: target, trigger: extra.reason || '开户风险评分触发', status: '材料收集中', created: new Date().toISOString().slice(0, 10), due: '2026-11-30', assignee: '待分配', items: [{ n: '资金来源说明', ok: false }, { n: '贸易背景与合同', ok: false }, { n: '上下游合作证明', ok: false }, { n: 'EDD 问卷', ok: false }], qa: [] });
        RC.saveEdd(l);
        RC.log('发起 EDD', target, '工单 ' + nid + '：' + (extra.reason || ''));
        if (!isB) update(id, { eddId: nid }); else update(id, { eddId: nid });
        return nid;
      }
    } else if (action === 'review') {
      update(id, { status: '复审中' });
      if (window.RC) RC.log('标记复审', target, '');
    } else if (action === 'escalate') {
      if (window.RC) RC.log('移交风控复核', target, extra.note || '');
    }
    return true;
  }

  window.OB = {
    STATUS_FLOW: STATUS_FLOW, ST_CLS: ST_CLS,
    personal: personal, business: business, templates: templates, blacklist: blacklist, cfg: cfg,
    find: find, update: update, act: act,
    saveTemplates: function (l) { write(TPL_KEY, l); },
    saveBlacklist: function (l) { write(BL_KEY, l); },
    saveCfg: function (c) { write(CFG_KEY, c); },
    savePersonal: function (l) { write(P_KEY, l); },
    saveBusiness: function (l) { write(B_KEY, l); }
  };
})();
