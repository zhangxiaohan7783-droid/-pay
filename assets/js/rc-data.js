/* 叮当支付后台 · 风控与合规共享数据层（演示版，纯前端）
 * 六角色严格权限隔离，操作全程留痕（dd-rc-audit 只增不删）
 * 用法：RC.role() / RC.can('menu:kyc','act:freeze') / RC.merchants() / RC.log(action,target,detail)
 */
(function () {
  'use strict';

  /* ================= 角色与权限 ================= */
  var ROLE_KEY = 'dd-rc-role';
  var ROLES = {
    officer:    { name: '风控专员', color: '#00B7EC', icon: 'solar:shield-warning-bold', desc: '告警处理、案件调查、EDD 材料审核、筛查复核' },
    reviewer:   { name: '合规审核员', color: '#8b5cf6', icon: 'solar:clipboard-check-bold', desc: 'KYC 档案审核、EDD 结论初审、名单误报标记' },
    supervisor: { name: '风控主管', color: '#FFD008', icon: 'solar:user-speak-bold', desc: '管控审批、工单分配、规则配置、团队复核' },
    head:       { name: '合规负责人', color: '#f43f5e', icon: 'solar:verified-check-bold', desc: 'STR 上报签发、极高风险处置终审、监管对接' },
    auditor:    { name: '审计岗', color: '#64748b', icon: 'solar:eye-bold', desc: '只读权限：全部数据与审计日志查阅导出' },
    admin:      { name: '超级管理员', color: '#382b1b', icon: 'solar:crown-bold', desc: '全部权限 + 合规配置中心' }
  };
  /* 菜单权限：key 为页面文件名 */
  var MENU_ACL = {
    'risk.html':            ['officer', 'reviewer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-kyc.html':        ['officer', 'reviewer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-score.html':      ['supervisor', 'head', 'auditor', 'admin'],
    'risk-edd.html':        ['officer', 'reviewer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-alerts.html':     ['officer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-screening.html':  ['officer', 'reviewer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-ledger.html':     ['officer', 'reviewer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-controls.html':   ['officer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-str.html':        ['supervisor', 'head', 'auditor', 'admin'],
    'risk-audit.html':      ['supervisor', 'head', 'auditor', 'admin'],
    'risk-config.html':     ['head', 'admin'],
    'risk-review.html':     ['officer', 'reviewer', 'supervisor', 'head', 'admin'],
    'risk-cases.html':      ['officer', 'supervisor', 'head', 'auditor', 'admin'],
    'risk-learn.html':      ['officer', 'reviewer', 'supervisor', 'head', 'auditor', 'admin']
  };
  /* 动作权限 */
  var ACT_ACL = {
    kyc_edit:      ['reviewer', 'supervisor', 'head', 'admin'],
    score_config:  ['supervisor', 'head', 'admin'],
    edd_review:    ['officer', 'reviewer', 'supervisor', 'admin'],
    edd_approve:   ['reviewer', 'supervisor', 'head', 'admin'],
    alert_handle:  ['officer', 'supervisor', 'admin'],
    alert_assign:  ['supervisor', 'admin'],
    screen_mark:   ['officer', 'reviewer', 'supervisor', 'admin'],
    list_manage:   ['head', 'admin'],
    control_apply: ['officer', 'supervisor', 'head'],
    control_approve: ['supervisor', 'head'],
    control_lift:  ['supervisor', 'head'],
    str_draft:     ['officer', 'supervisor', 'head', 'admin'],
    str_submit:    ['head', 'admin'],
    audit_export:  ['supervisor', 'head', 'auditor', 'admin'],
    config_edit:   ['head', 'admin']
  };

  /* 权限矩阵覆盖配置（角色权限配置中心可视化修改，存 dd-rc-acl-override） */
  var OVR_KEY = 'dd-rc-acl-override-v1';
  function overrides() { try { return JSON.parse(localStorage.getItem(OVR_KEY) || '{}'); } catch (e) { return {}; } }
  function saveOverrides(o) { try { localStorage.setItem(OVR_KEY, JSON.stringify(o)); } catch (e) {} }
  function actRoles(act) { var o = overrides(); return o['act:' + act] || ACT_ACL[act] || []; }
  function menuRoles(page) { var o = overrides(); return o['menu:' + page] || MENU_ACL[page] || []; }
  function setActRoles(act, roles) { var o = overrides(); o['act:' + act] = roles; saveOverrides(o); }
  function setMenuRoles(page, roles) { var o = overrides(); o['menu:' + page] = roles; saveOverrides(o); }
  function resetOverrides() { try { localStorage.removeItem(OVR_KEY); } catch (e) {} }

  function role() { var r = localStorage.getItem(ROLE_KEY); return ROLES[r] ? r : 'supervisor'; }
  function setRole(r) { if (ROLES[r]) { localStorage.setItem(ROLE_KEY, r); log('切换角色', '系统', '当前角色 → ' + ROLES[r].name); location.reload(); } }
  /* 超管仅系统配置维护，禁止日常业务操作（PRD §3） */
  var ADMIN_FORBID = ['kyc_edit', 'edd_review', 'edd_approve', 'alert_handle', 'alert_assign', 'screen_mark', 'control_apply', 'control_approve', 'control_lift', 'str_draft', 'str_submit'];
  function can(act) { var r = role(); if (r === 'admin' && ADMIN_FORBID.indexOf(act) > -1) return false; return actRoles(act).indexOf(r) > -1; }
  function canMenu(page) { return menuRoles(page).indexOf(role()) > -1; }
  function readonly() { return role() === 'auditor'; }

  /* ================= 通用工具：真实日期 / 防重号 / 到期判断 ================= */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function nowTs() { var d = new Date(); return today() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function nowShort() { return nowTs().slice(5); }
  function addDays(dateStr, n) { var d = new Date(dateStr + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daysTo(dateStr) { if (!dateStr) return 9999; return Math.round((new Date(dateStr + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000); }
  function dueState(dateStr, days) {
    var n = daysTo(dateStr);
    if (n < 0) return { cls: 'bg-red-50 text-red-500', label: '已逾期 ' + (-n) + ' 天', state: 'overdue' };
    if (n <= (days || 7)) return { cls: 'bg-orange-50 text-orange-600', label: '临期（' + n + ' 天后）', state: 'soon' };
    return { cls: 'bg-green-50 text-green-600', label: '正常', state: 'ok' };
  }
  /* 统一员工名单（后台平台侧；客户端团队成员与平台员工互不相干） */
  var STAFF = {
    managers: ['王梓楠', '胡飞燕', 'Lisa Chen', 'Marco Rossi'],
    reviewers: ['张明', '刘欣', 'Eva 温茜', 'Dave'],
    obSupervisors: ['李主管', 'vivian'],
    officer: 'Maria Rossi',
    supervisor: '陈晓',
    head: '李强'
  };

  /* ================= 审计日志（只增不删） ================= */
  var AUDIT_KEY = 'dd-rc-audit-v1';
  var AUDIT_SEED = [
    { ts: '2026-11-12 10:42', user: '系统', role: '自动规则', act: '告警生成', target: 'M-1002 Fast Discount S.r.l.', detail: '命中规则 R-04 快进快出：3 笔入账后 2 小时内全额转出' },
    { ts: '2026-11-12 09:15', user: 'system-batch', role: '定时任务', act: '批量筛查', target: '全量商户 1,284 户', detail: 'OFAC/EU/UN 名单日批量筛查完成，新增命中 1 条' },
    { ts: '2026-11-11 17:30', user: '陈晓', role: '风控主管', act: '管控审批', target: 'M-1005 Nordic Luxury GmbH', detail: '批准「禁止出金」，理由：EDD 材料逾期未补' },
    { ts: '2026-11-11 15:02', user: 'Maria Rossi', role: '风控专员', act: '告警处理', target: 'ALT-2091', detail: '调查完成，结论：误报（客户提供有效贸易合同）' },
    { ts: '2026-11-10 11:20', user: '李强', role: '合规负责人', act: 'STR 签发', target: 'STR-2026-007', detail: '可疑交易报告已签发并提交监管（意大利 UIF）' }
  ];
  function audit() {
    try { var d = JSON.parse(localStorage.getItem(AUDIT_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return AUDIT_SEED.slice();
  }
  function log(act, target, detail) {
    var l = audit();
    var who = { officer: '风控专员', reviewer: '合规审核员', supervisor: '风控主管', head: '合规负责人', auditor: '审计岗', admin: '超级管理员' }[role()];
    l.unshift({ ts: nowTs(), user: '演示账号', role: who, act: act, target: target, detail: detail });
    try { localStorage.setItem(AUDIT_KEY, JSON.stringify(l)); } catch (e) {}
  }

  /* ================= 防重号 ID 生成 ================= */
  function readRaw(key) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? null : v; } catch (e) { return null; } }
  function nextId(kind) {
    var src = {
      ALT: ['ALT-', alerts(), 4], CTL: ['CTL-', controls(), 3], STR: ['STR-2026-', strs(), 3],
      EDD: ['EDD-', edd(), 4], CS: ['CS-', cases(), 5], MER: ['M-', merchants(), 4],
      P: ['P-', readRaw('dd-ob-personal-v1') || [], 4], B: ['B-', readRaw('dd-ob-business-v1') || [], 4]
    }[kind];
    if (!src) { return kind + '-' + Date.now(); }
    var max = 0;
    src[1].forEach(function (x) { var m = String(x.id || '').match(/(\d+)$/); if (m) max = Math.max(max, +m[1]); });
    var n = String(max + 1);
    while (n.length < src[2]) n = '0' + n;
    return src[0] + n;
  }

  /* ================= 商户风险档案 ================= */
  var MER_KEY = 'dd-rc-merchants-v1';
  var LEVELS = { low: { label: '低风险', cls: 'bg-green-50 text-green-600' }, mid: { label: '中风险', cls: 'bg-yellow-50 text-yellow-600' }, high: { label: '高风险', cls: 'bg-orange-50 text-orange-600' }, critical: { label: '极高风险', cls: 'bg-red-50 text-red-500' } };
  var MER_SEED = [
    { id: 'M-1001', name: 'Flash Commerce S.r.l.', country: '意大利', reg: 'MI-2598741', vat: 'IT09876543210', industry: '电商零售', level: 'low', score: 22, kyc: '已通过', reviewDue: '2027-05-12', onboard: '2026-05-12', control: '无', tags: ['SEPA 常用', '正常交易模式'], entId: 'flash',
      mf: { country: 0, industry: 0.2, scale: 0.4, pep: 0, bo: 0.4, pattern: 0.2 },
      bo: [{ name: '小涵总', share: '65%', id: 'IT-护照·隐去', layer: 1 }, { name: 'Holding Alpha Ltd（香港）', share: '35%', layer: 1, children: [{ name: '陈某', share: '100%', layer: 2 }] }],
      docs: ['公司章程', 'VAT 证书', '注册地址证明', 'BO 声明'], upstream: '深圳 3C 供应商 ×12', downstream: '欧盟终端消费者' },
    { id: 'M-1002', name: 'Fast Discount S.r.l.', country: '意大利', reg: 'MI-2611345', vat: 'IT11223344556', industry: '折扣电商', level: 'high', score: 71, kyc: '已通过', reviewDue: '2026-12-01', onboard: '2026-06-01', control: '加强监控', tags: ['快进快出', '夜间交易占比高'], entId: 'fast',
      mf: { country: 0, industry: 0.3, scale: 0.6, pep: 0, bo: 0.1, pattern: 1 },
      bo: [{ name: '小涵总', share: '80%', id: 'IT-护照·隐去', layer: 1 }, { name: '李某', share: '20%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '注册地址证明'], upstream: '土耳其服装供应商 ×5', downstream: '意大利/法国消费者' },
    { id: 'M-1003', name: 'Goden S.r.l.', country: '意大利', reg: 'MI-2633720', vat: 'IT66778899001', industry: '奢侈品贸易', level: 'mid', score: 48, kyc: '已通过', reviewDue: '2027-02-18', onboard: '2026-08-18', control: '无', tags: ['高客单价'], entId: 'goden',
      mf: { country: 0, industry: 0.7, scale: 0.6, pep: 0, bo: 0, pattern: 0.4 },
      bo: [{ name: '小涵总', share: '100%', id: 'IT-护照·隐去', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '品牌授权书'], upstream: '意大利品牌方 ×8', downstream: '中国跨境电商' },
    { id: 'M-1004', name: 'Baltic Trade SIA', country: '拉脱维亚', reg: 'LV-40103998877', vat: 'LV40103998877', industry: '大宗商品贸易', level: 'critical', score: 88, kyc: 'EDD 进行中', reviewDue: '2026-11-20', onboard: '2026-10-30', control: '禁止出金', tags: ['高风险注册地', 'BO 信息不透明', 'PEP 关联待核实'],
      mf: { country: 1, industry: 0.8, scale: 0.5, pep: 0.6, bo: 1, pattern: 0.7 },
      bo: [{ name: 'Oleg V.', share: '51%', id: '待核实', layer: 1 }, { name: 'ShellCo Cyprus Ltd', share: '49%', layer: 1, children: [{ name: '未知', share: '—', layer: 2 }] }],
      docs: ['公司章程'], upstream: '未提供', downstream: '未提供' },
    { id: 'M-1005', name: 'Nordic Luxury GmbH', country: '德国', reg: 'HRB-88213', vat: 'DE314159265', industry: '奢侈品零售', level: 'high', score: 76, kyc: '已通过', reviewDue: '2026-11-25', onboard: '2026-04-02', control: '禁止出金', tags: ['EDD 逾期未补'],
      mf: { country: 0, industry: 0.7, scale: 0.6, pep: 0, bo: 0, pattern: 0.3 },
      bo: [{ name: 'Anna K.', share: '100%', id: 'DE-护照·隐去', layer: 1 }],
      docs: ['公司章程', 'VAT 证书'], upstream: '瑞士手表经销商 ×3', downstream: '欧洲高净值客户' },
    { id: 'M-1006', name: 'Iberia Textiles SL', country: '西班牙', reg: 'B-87654321', vat: 'ESB87654321', industry: '纺织品贸易', level: 'mid', score: 45, kyc: '已通过', reviewDue: '2027-01-15', onboard: '2026-07-15', control: '无', tags: ['季节性波动'],
      mf: { country: 0, industry: 0.4, scale: 0.4, pep: 0, bo: 0, pattern: 0.4 },
      bo: [{ name: 'Carlos M.', share: '60%', layer: 1 }, { name: 'Lucia F.', share: '40%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '仓储合同'], upstream: '葡萄牙纺织厂 ×6', downstream: '欧洲批发商' },
    { id: 'M-1007', name: 'Alpine Foods GmbH', country: '奥地利', reg: 'FN-556677a', vat: 'ATU77889900', industry: '食品进出口', level: 'low', score: 18, kyc: '已通过', reviewDue: '2027-08-09', onboard: '2026-02-09', control: '无', tags: ['长期稳定'],
      mf: { country: 0, industry: 0.1, scale: 0.2, pep: 0, bo: 0, pattern: 0.1 },
      bo: [{ name: 'Franz H.', share: '100%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '食品经营许可'], upstream: '奥地利农场合作社', downstream: '中欧商超' },
    { id: 'M-1008', name: 'Emerald Retail Ltd', country: '爱尔兰', reg: 'IE-667788', vat: 'IE9988776X', industry: '电商零售', level: 'mid', score: 52, kyc: '复审待办', reviewDue: '2026-11-18', onboard: '2025-11-20', control: '仅入金', tags: ['年度复审到期'],
      mf: { country: 0, industry: 0.2, scale: 0.3, pep: 0, bo: 0, pattern: 0.3 },
      bo: [{ name: 'Sean O.', share: '100%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书'], upstream: '英国供应商 ×4', downstream: '爱尔兰消费者' }
  ];
  function merchants() {
    try { var d = JSON.parse(localStorage.getItem(MER_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return MER_SEED.slice();
  }
  function saveMerchants(l) { try { localStorage.setItem(MER_KEY, JSON.stringify(l)); } catch (e) {} }
  function merchant(id) { return merchants().filter(function (m) { return m.id === id; })[0]; }

  /* ================= 告警中心 ================= */
  var ALT_KEY = 'dd-rc-alerts-v1';
  var ALT_STATUS = { new: { label: '新告警', cls: 'bg-red-50 text-red-500' }, investigating: { label: '调查中', cls: 'bg-blue-50 text-blue-600' }, pending_approval: { label: '待审批', cls: 'bg-yellow-50 text-yellow-600' }, concluded: { label: '已结论', cls: 'bg-green-50 text-green-600' } };
  var ALT_SEED = [
    { id: 'ALT-2098', ts: '2026-11-26 09:02', mer: 'M-1001 Flash Commerce S.r.l.', rule: 'R-19 USDT 入金 KYT 高风险', level: 'high', amt: '12,000 USDT', status: 'new', assignee: '', auto: true, src: 'kyt', srcId: 'KYT-DEP-20261126-010', detail: '卡中台 USDT 归集链路：入金 KYT 风险分 86，来源地址 2 跳内关联混币服务，已自动暂挂待人工处置。', txs: [], caseRef: '' },
    { id: 'ALT-2096', ts: '2026-11-25 21:14', mer: 'Lumen Digital Ltd（卡平台客户）', rule: 'R-16 虚拟卡拒付率异常', level: 'high', amt: '月拒付率 1.31%', status: 'new', assignee: '', auto: true, src: 'cardhub', srcId: 'KYT-DEP-20261125-011', detail: 'WasabiCard 卡台客户 Lumen Digital 月拒付率 1.31%，超阈值 0.9%，其虚拟卡功能已自动冻结、一笔 USDT 入金暂挂。', txs: [], caseRef: '' },
    { id: 'ALT-2095', ts: '2026-11-13 08:20', mer: 'M-1004 Baltic Trade SIA', rule: 'R-02 高风险地域交易', level: 'critical', amt: '€86,000 收款', status: 'new', assignee: '', auto: true, detail: '交易对手注册地为高风险司法辖区（离岸金融中心），且与商户申报业务不符。', txs: ['TX-87601', 'TX-87602'] },
    { id: 'ALT-2094', ts: '2026-11-12 22:41', mer: 'M-1002 Fast Discount S.r.l.', rule: 'R-04 快进快出', level: 'high', amt: '€42,800 转出', status: 'investigating', assignee: 'Maria Rossi', auto: true, detail: '3 笔收单入账后 2 小时内 98% 转出至同一新收款方。', txs: ['TX-87611', 'TX-87612', 'TX-87613'], caseId: 'CS-88210' },
    { id: 'ALT-2093', ts: '2026-11-12 18:05', mer: 'M-1005 Nordic Luxury GmbH', rule: 'R-01 大额交易', level: 'high', amt: '€120,000 付款', status: 'pending_approval', assignee: 'Maria Rossi', auto: true, detail: '单笔付款超过商户近 90 天日均交易额 20 倍。', txs: ['TX-87621'] },
    { id: 'ALT-2091', ts: '2026-11-11 14:32', mer: 'M-1003 Goden S.r.l.', rule: 'R-07 拆分交易', level: 'mid', amt: '9 × €9,500', status: 'concluded', assignee: 'Maria Rossi', auto: true, detail: '同日 9 笔 €9,500 付款疑似规避大额审查阈值，客户提供采购合同佐证，结论：误报。', txs: ['TX-87631~87639'] },
    { id: 'ALT-2088', ts: '2026-11-10 09:12', mer: 'M-1008 Emerald Retail Ltd', rule: 'R-11 商户信息变更', level: 'mid', amt: '—', status: 'concluded', assignee: '陈晓', auto: true, detail: '注册地址变更至共享办公地址，已电话核实并更新档案。', txs: [] }
  ];
  function alerts() {
    try { var d = JSON.parse(localStorage.getItem(ALT_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return ALT_SEED.slice();
  }
  function saveAlerts(l) { try { localStorage.setItem(ALT_KEY, JSON.stringify(l)); } catch (e) {} }

  /* ================= EDD 工单 ================= */
  var EDD_KEY = 'dd-rc-edd-v1';
  var EDD_SEED = [
    { id: 'EDD-3012', mer: 'M-1004 Baltic Trade SIA', trigger: '入网评分 88（极高）', status: '材料收集中', created: '2026-10-30', due: '2026-11-20', assignee: 'Maria Rossi',
      items: [{ n: '资金来源说明', ok: false }, { n: '贸易背景与合同', ok: false }, { n: '上游供应商清单及发票', ok: true }, { n: '物流/报关单据', ok: false }, { n: 'BO 穿透至自然人证明', ok: false }],
      qa: [{ q: '公司主要经营什么商品？', a: '琥珀原石与工艺品' }, { q: '资金来源？', a: '股东注资 + 经营回款' }, { q: '为何选择塞浦路斯持股公司？', a: '未回复' }] },
    { id: 'EDD-3010', mer: 'M-1005 Nordic Luxury GmbH', trigger: '年交易额超阈值 + 高客单价', status: '审核中', created: '2026-10-12', due: '2026-11-15', assignee: '陈晓',
      items: [{ n: '资金来源说明', ok: true }, { n: '贸易背景与合同', ok: true }, { n: '品牌授权证明', ok: true }, { n: '近 6 个月银行流水', ok: false }, { n: 'EDD 问卷（完整版）', ok: true }],
      qa: [{ q: '资金来源？', a: '历年经营利润留存' }, { q: '主要客户群体？', a: '欧洲高净值个人客户' }] }
  ];
  function edd() {
    try { var d = JSON.parse(localStorage.getItem(EDD_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return EDD_SEED.slice();
  }
  function saveEdd(l) { try { localStorage.setItem(EDD_KEY, JSON.stringify(l)); } catch (e) {} }

  /* ================= 名单筛查 ================= */
  var SCR_KEY = 'dd-rc-screening-v1';
  var SCR_SEED = {
    records: [
      { id: 'SCR-5520', ts: '2026-11-13 06:00', type: '定时批量', scope: '全量商户 1,284 户', hits: 1, status: '完成' },
      { id: 'SCR-5519', ts: '2026-11-12 15:44', type: '实时', scope: 'M-1004 BO · Oleg V.', hits: 1, status: '待复核' },
      { id: 'SCR-5518', ts: '2026-11-12 06:00', type: '定时批量', scope: '全量交易对手 8,932 个', hits: 0, status: '完成' },
      { id: 'SCR-5515', ts: '2026-11-11 10:20', type: '实时', scope: '新商户入网 · Alpine Foods GmbH', hits: 0, status: '完成' }
    ],
    hits: [
      { id: 'HIT-881', scr: 'SCR-5519', target: 'Oleg V.（M-1004 BO）', list: 'PEP 名单', match: '87%', status: '待复核', detail: '姓名与拉脱维亚前市政官员相似度 87%，需核实身份证明文件' },
      { id: 'HIT-877', scr: 'SCR-5520', target: '交易对手 · Dmitri K.', list: 'EU 制裁名单', match: '92%', status: '待复核', detail: '与 EU  consolidated list 条目高度匹配，建议暂停相关交易' },
      { id: 'HIT-870', scr: 'SCR-5499', target: 'M-1006 · Carlos M.', list: '负面新闻', match: '64%', status: '误报', detail: '同名西班牙商人负面新闻，经核实非同一人（证件号不符）' }
    ],
    lists: [
      { name: 'OFAC SDN', src: '美国财政部', updated: '2026-11-12', entries: 12480, on: true },
      { name: 'UN Security Council', src: '联合国安理会', updated: '2026-11-10', entries: 1024, on: true },
      { name: 'EU Consolidated', src: '欧盟委员会', updated: '2026-11-11', entries: 4877, on: true },
      { name: 'UK HMT (OFSI)', src: '英国财政部', updated: '2026-11-12', entries: 3210, on: true },
      { name: '链上地址黑名单（USDT 钱包筛查）', src: 'OFAC Crypto + 自建暗网/混币库', updated: '2026-11-13', entries: 5682, on: true },
      { name: 'PEP 数据库', src: '商用数据源', updated: '2026-11-08', entries: 1842300, on: true },
      { name: '自定义风险名单', src: '平台自建', updated: '2026-11-09', entries: 47, on: true }
    ]
  };
  function screening() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(SCR_KEY)); } catch (e) {}
    if (d && d.records) {
      var changed = false;
      SCR_SEED.lists.forEach(function (s) { if (!d.lists.filter(function (x) { return x.name === s.name; }).length) { d.lists.push(s); changed = true; } });
      if (changed) saveScreening(d);
      return d;
    }
    return JSON.parse(JSON.stringify(SCR_SEED));
  }
  function saveScreening(d) { try { localStorage.setItem(SCR_KEY, JSON.stringify(d)); } catch (e) {} }

  /* ================= 账户管控（申请 → 主管审批 → 负责人批准 → 生效 → 解除） ================= */
  var CTL_KEY = 'dd-rc-controls-v1';
  var CTL_TYPES = { deposit_only: '仅入金', no_withdraw: '禁止出金', suspend: '暂停账户', freeze: '冻结资金', none: '无管控' };
  var CTL_STATUS = {
    pending_sv: { label: '待主管审批', cls: 'bg-yellow-50 text-yellow-600' },
    pending_head: { label: '待负责人批准', cls: 'bg-purple-50 text-purple-600' },
    active: { label: '生效中', cls: 'bg-red-50 text-red-500' },
    lifted: { label: '已解除', cls: 'bg-gray-100 text-gray-500' },
    rejected: { label: '已驳回', cls: 'bg-gray-100 text-gray-400' }
  };
  var CTL_SEED = [
    { id: 'CTL-705', mer: 'M-1002 Fast Discount S.r.l.', type: 'no_withdraw', reason: 'R-04 快进快出告警（ALT-2094）调查期间申请出金管控', by: 'Maria Rossi（风控专员）', ts: '2026-11-24 10:12', status: 'pending_sv', approve: 'Maria Rossi 申请 → 待风控主管审批', src: 'ALT-2094', prev: '加强监控' },
    { id: 'CTL-701', mer: 'M-1004 Baltic Trade SIA', type: 'no_withdraw', reason: 'EDD 材料未完成，BO 穿透存在不透明层', by: '陈晓（风控主管）', ts: '2026-11-05 14:20', status: 'active', approve: '陈晓 → 李强（合规负责人）已批准', prev: '加强监控' },
    { id: 'CTL-702', mer: 'M-1005 Nordic Luxury GmbH', type: 'no_withdraw', reason: 'EDD 补充材料逾期未提交', by: '陈晓（风控主管）', ts: '2026-11-11 17:30', status: 'active', approve: '陈晓 → 李强 已批准', prev: '无' },
    { id: 'CTL-699', mer: 'M-1008 Emerald Retail Ltd', type: 'deposit_only', reason: '年度复审到期，暂停出金以外的操作', by: 'Maria Rossi（风控专员）', ts: '2026-11-08 09:40', status: 'active', approve: '陈晓 审批 → 李强 已批准', prev: '无' },
    { id: 'CTL-688', mer: 'M-1003 Goden S.r.l.', type: 'deposit_only', reason: '拆分交易告警调查期间临时管控', by: 'Maria Rossi', ts: '2026-11-10 10:05', status: 'lifted', approve: '陈晓 审批 → 李强 批准；2026-11-11 误报结论后由陈晓解除', prev: '无', liftNote: 'ALT-2091 结论误报，解除并恢复商户状态' }
  ];
  function controls() {
    try { var d = JSON.parse(localStorage.getItem(CTL_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return CTL_SEED.slice();
  }
  function saveControls(l) { try { localStorage.setItem(CTL_KEY, JSON.stringify(l)); } catch (e) {} }
  function ctlStatus(c) { return CTL_STATUS[c.status] || { label: c.status, cls: 'bg-gray-100 text-gray-500' }; }
  /* 解除后恢复：商户状态 = 其余生效管控中最强的一个，否则恢复为管控前状态 */
  var CTL_RANK = { freeze: 4, suspend: 3, no_withdraw: 2, deposit_only: 1 };
  function restoreMerchant(merId, excludeId, prev) {
    var best = null;
    controls().forEach(function (c) {
      if (c.id === excludeId || c.status !== 'active') return;
      if (c.mer.indexOf(merId) === 0 && (!best || (CTL_RANK[c.type] || 0) > (CTL_RANK[best] || 0))) best = c.type;
    });
    var ms = merchants();
    ms.forEach(function (m) { if (m.id === merId) m.control = best ? CTL_TYPES[best] : (prev || '无'); });
    saveMerchants(ms);
  }
  function applyControl(merId, type, reason, src) {
    var m = merchant(merId); if (!m) return null;
    var rn = ROLES[role()].name;
    var st = role() === 'supervisor' ? 'pending_head' : 'pending_sv';
    var rec = { id: nextId('CTL'), mer: merId + ' ' + m.name, type: type, reason: reason, by: rn + '（' + ROLES[role()].name + '）', ts: nowTs(), status: st,
      approve: rn + (st === 'pending_head' ? '（主管）发起 → 待合规负责人批准' : ' 申请 → 待风控主管审批'), src: src || '', prev: m.control };
    var l = controls(); l.unshift(rec); saveControls(l);
    log('新建管控申请', rec.mer, CTL_TYPES[type] + '：' + reason + '（' + ctlStatus(rec).label + '）');
    return rec;
  }
  function approveControl(id, pass, note) {
    var l = controls(), rec = l.filter(function (x) { return x.id === id; })[0];
    if (!rec) return null;
    var rn = ROLES[role()].name;
    if (!pass) {
      rec.status = 'rejected'; rec.approve += '；' + rn + ' 驳回' + (note ? '：' + note : '');
      saveControls(l); log('管控审批驳回', id, note || ''); return rec;
    }
    if (rec.status === 'pending_sv') {
      rec.status = 'pending_head'; rec.approve += '；' + rn + '（主管）审批通过 → 待合规负责人批准';
      saveControls(l); log('管控主管审批通过', id, '');
    } else if (rec.status === 'pending_head') {
      rec.status = 'active'; rec.approve += '；' + rn + '（负责人）批准生效';
      var merId = rec.mer.split(' ')[0];
      var ms = merchants(); ms.forEach(function (m) { if (m.id === merId) m.control = CTL_TYPES[rec.type]; }); saveMerchants(ms);
      saveControls(l); log('管控批准生效', id, CTL_TYPES[rec.type] + ' 已对商户生效');
    }
    return rec;
  }
  function liftControl(id, note) {
    var l = controls(), rec = l.filter(function (x) { return x.id === id; })[0];
    if (!rec) return null;
    var rn = ROLES[role()].name;
    rec.status = 'lifted'; rec.liftNote = note; rec.approve += '；' + rn + ' 解除：' + note;
    saveControls(l);
    var merId = rec.mer.split(' ')[0];
    restoreMerchant(merId, id, rec.prev);
    log('解除管控', id, note + '（商户状态已恢复）');
    return rec;
  }

  /* ================= 案件管理（告警 → 案件 → STR/管控） ================= */
  var CASE_KEY = 'dd-rc-cases-v1';
  var CASE_STATUS = {
    open: { label: '待认领', cls: 'bg-red-50 text-red-500' },
    handling: { label: '处理中', cls: 'bg-blue-50 text-blue-600' },
    pending_close: { label: '待关闭', cls: 'bg-yellow-50 text-yellow-600' },
    escalated: { label: '已升级合规负责人', cls: 'bg-purple-50 text-purple-600' },
    closed: { label: '已关闭', cls: 'bg-green-50 text-green-600' }
  };
  var CASE_SEED = [
    { id: 'CS-88210', kind: '交易风险', mer: 'M-1002 Fast Discount S.r.l.', title: '快进快出疑似过账', level: 'high', status: 'handling', owner: 'Maria Rossi', ts: '2026-11-12 22:50', sla: '2026-11-27', alerts: ['ALT-2094'], txs: ['TX-87611', 'TX-87612', 'TX-87613'], strId: '', ctlId: 'CTL-705', notes: [{ ts: '2026-11-13 09:10', by: 'Maria Rossi', text: '已认领，调取 3 笔交易流水与收款方信息；已申请出金管控待审批' }] },
    { id: 'CS-88207', kind: '名单命中', mer: 'M-1004 Baltic Trade SIA', title: 'BO 疑似 PEP 命中（HIT-881）', level: 'critical', status: 'handling', owner: 'Maria Rossi', ts: '2026-11-12 16:00', sla: '2026-11-26', alerts: [], txs: [], strId: '', ctlId: '', notes: [{ ts: '2026-11-12 16:00', by: 'Maria Rossi', text: '要求客户补充 Oleg V. 身份证明与履职情况说明' }] },
    { id: 'CS-88205', kind: 'USDT KYT', mer: 'M-1001 Flash Commerce S.r.l.', title: 'USDT 入金来源地址关联混币服务', level: 'high', status: 'open', owner: '', ts: '2026-11-26 09:02', sla: '2026-11-30', alerts: ['ALT-2098'], txs: [], strId: '', ctlId: '', notes: [] },
    { id: 'CS-88199', kind: '交易风险', mer: 'M-1005 Nordic Luxury GmbH', title: '大额付款超日均 20 倍', level: 'high', status: 'pending_close', owner: 'Maria Rossi', ts: '2026-11-12 18:30', sla: '2026-11-25', alerts: ['ALT-2093'], txs: ['TX-87621'], strId: '', ctlId: '', notes: [{ ts: '2026-11-13 11:00', by: 'Maria Rossi', text: '客户提供采购合同与发票，交易背景属实，建议放行并提交关闭' }] },
    { id: 'CS-88190', kind: '交易风险', mer: 'M-1003 Goden S.r.l.', title: '拆分交易调查', level: 'mid', status: 'closed', owner: 'Maria Rossi', ts: '2026-11-11 15:00', sla: '2026-11-20', alerts: ['ALT-2091'], txs: ['TX-87631~87639'], strId: '', ctlId: 'CTL-688', notes: [{ ts: '2026-11-11 17:20', by: 'Maria Rossi', text: '结论误报，临时管控已解除，案件关闭归档' }] }
  ];
  function cases() {
    try { var d = JSON.parse(localStorage.getItem(CASE_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return CASE_SEED.slice();
  }
  function saveCases(l) { try { localStorage.setItem(CASE_KEY, JSON.stringify(l)); } catch (e) {} }
  /* 告警建案：回写 alert.caseId，案件状态待认领 */
  function caseFromAlert(alertId) {
    var as = alerts(), a = as.filter(function (x) { return x.id === alertId; })[0];
    if (!a) return null;
    if (a.caseId) return cases().filter(function (x) { return x.id === a.caseId; })[0] || null;
    var mid = (a.mer.match(/^M-\d+/) || [''])[0];
    var c = { id: nextId('CS'), kind: a.src === 'kyt' ? 'USDT KYT' : (a.src === 'cardhub' ? '卡平台' : '交易风险'), mer: a.mer, title: a.rule + ' · ' + (mid ? merchant(mid) && merchant(mid).name || a.mer : a.mer),
      level: a.level, status: 'open', owner: '', ts: nowTs(), sla: addDays(today(), 4), alerts: [a.id], txs: a.txs || [], strId: '', ctlId: '', notes: [{ ts: nowTs(), by: ROLES[role()].name, text: '由告警 ' + a.id + ' 立案调查' }] };
    var l = cases(); l.unshift(c); saveCases(l);
    a.caseId = c.id; if (a.status === 'new') { a.status = 'investigating'; }
    saveAlerts(as);
    log('告警建案', a.id, '→ 案件 ' + c.id);
    return c;
  }
  /* 案件生成 STR 草稿（回写 strId） */
  function strFromCase(caseId, title, summary) {
    var l = cases(), c = l.filter(function (x) { return x.id === caseId; })[0];
    if (!c) return null;
    var s = { id: nextId('STR'), mer: c.mer, title: title || c.title, status: '草稿', created: today(), by: ROLES[role()].name, authority: 'UIF（意大利金融情报局）', summary: summary || (c.title + '；关联告警 ' + c.alerts.join('、') + '，案件 ' + c.id), caseId: c.id };
    var ls = strs(); ls.unshift(s); saveStrs(ls);
    c.strId = s.id; saveCases(l);
    log('案件生成 STR 草稿', c.id, '→ ' + s.id);
    return s;
  }

  /* ================= STR 上报 ================= */
  var STR_KEY = 'dd-rc-str-v1';
  var STR_SEED = [
    { id: 'STR-2026-009', mer: 'M-1004 Baltic Trade SIA', title: '疑似离岸架构资金归集', status: '草稿', created: '2026-11-12', by: '陈晓', authority: 'UIF（意大利金融情报局）', summary: '商户 BO 结构含塞浦路斯空壳层，资金来源说明与交易规模严重不符。' },
    { id: 'STR-2026-007', mer: '外部交易对手 Dmitri K.', title: 'EU 制裁名单高度匹配交易', status: '已上报', created: '2026-11-08', by: '李强', authority: 'UIF', summary: '交易对手与 EU consolidated list 匹配度 92%，已暂停交易并上报。', submitted: '2026-11-10 11:20' },
    { id: 'STR-2026-005', mer: 'M-1002 Fast Discount S.r.l.', title: '快进快出疑似过账', status: '已归档', created: '2026-09-20', by: '李强', authority: 'UIF', summary: '调查后认定为季节性备货付款，留档观察。', submitted: '2026-09-22' }
  ];
  function strs() {
    try { var d = JSON.parse(localStorage.getItem(STR_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return STR_SEED.slice();
  }
  function saveStrs(l) { try { localStorage.setItem(STR_KEY, JSON.stringify(l)); } catch (e) {} }

  /* ================= 风险规则库（15 条） ================= */
  var RULE_KEY = 'dd-rc-rules-v1';
  var RULE_SEED = [
    { code: 'R-01', name: '大额交易', cond: '单笔金额 > 商户近 90 天日均交易额 × 20 或 > €50,000', act: '告警', level: 'high', on: true, auto: true },
    { code: 'R-02', name: '高风险地域交易', cond: '交易对手注册地 ∈ 高风险国家/地区库（FATF 灰名单+自定义）', act: '告警', level: 'critical', on: true, auto: true },
    { code: 'R-03', name: '新收款方大额首笔', cond: '首次交易收款方且金额 > €10,000', act: '告警+2FA', level: 'mid', on: true, auto: true },
    { code: 'R-04', name: '快进快出', cond: '入账后 24h 内转出比例 > 90%，连续 ≥ 3 笔', act: '告警', level: 'high', on: true, auto: true },
    { code: 'R-05', name: '商户类别异常（MCC 偏离）', cond: '卡消费 MCC 与商户申报行业偏离', act: '告警', level: 'mid', on: true, auto: true },
    { code: 'R-06', name: '关联方交易', cond: '收付双方存在相同 BO / 相同注册地址 / 相同设备', act: '告警', level: 'high', on: true, auto: true },
    { code: 'R-07', name: '拆分交易（Structuring）', cond: '同日 ≥ 3 笔金额在审查阈值 90%-99% 区间', act: '告警', level: 'mid', on: true, auto: true },
    { code: 'R-08', name: '收款账户涉欺诈名单', cond: '收款 IBAN/账号命中反欺诈共享名单', act: '拦截+告警', level: 'critical', on: true, auto: true },
    { code: 'R-09', name: '夜间高频交易', cond: '当地时间 00:00-05:00 交易量占比 > 40%', act: '告警', level: 'mid', on: true, auto: true },
    { code: 'R-10', name: 'PEP / 制裁命中', cond: '商户、BO、交易对手筛查命中制裁/PEP 名单', act: '拦截+告警', level: 'critical', on: true, auto: true },
    { code: 'R-11', name: '商户信息变更', cond: '注册地址 / 法人 / BO / 经营范围发生变更', act: '复核', level: 'mid', on: true, auto: true },
    { code: 'R-12', name: '交易行为偏离画像', cond: '月度交易模式与历史画像偏离度 > 60%（币种/地域/对手方）', act: '告警', level: 'mid', on: true, auto: true },
    { code: 'R-13', name: 'EDD 逾期未补', cond: 'EDD 工单超期 5 个工作日未提交材料', act: '告警+建议管控', level: 'high', on: true, auto: true },
    { code: 'R-14', name: '复审到期', cond: '商户风险复审到期日前 7 天提醒', act: '复核', level: 'low', on: true, auto: true },
    { code: 'R-15', name: '退款率异常', cond: '收单商户月退款率 > 8% 或环比上升 3 倍', act: '告警', level: 'mid', on: false, auto: true },
    { code: 'R-16', name: '虚拟卡拒付率异常', cond: '卡平台客户月拒付率 > 阈值（默认 0.9%）', act: '告警+冻结卡功能', level: 'high', on: true, auto: true },
    { code: 'R-17', name: '卡授权拒绝率异常', cond: '1 小时内授权拒绝率 > 阈值（默认 15%）且 ≥ 5 笔', act: '告警', level: 'mid', on: true, auto: true },
    { code: 'R-18', name: 'BIN 攻击（测卡）', cond: '同一 BIN 段 10 分钟内 ≥ 阈值（默认 10 笔）小额试探授权', act: '拦截+告警', level: 'critical', on: true, auto: true },
    { code: 'R-19', name: 'USDT 入金 KYT 高风险', cond: 'KYT 风险分 ≥ 阈值（默认 70）或来源关联混币/暗网', act: '拦截+告警', level: 'high', on: true, auto: true },
    { code: 'R-20', name: '钱包地址命中名单', cond: 'USDT 充提地址命中链上地址黑名单（制裁/暗网/混币）', act: '拦截+告警', level: 'critical', on: true, auto: true },
    { code: 'R-21', name: '卡片异地消费', cond: '卡消费商户所在地与卡片常用地区不一致', act: '复核', level: 'low', on: true, auto: true }
  ];
  function rules() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(RULE_KEY)); } catch (e) {}
    if (Array.isArray(d) && d.length) {
      var changed = false;
      RULE_SEED.forEach(function (s) { if (!d.filter(function (x) { return x.code === s.code; }).length) { d.push(s); changed = true; } });
      if (changed) saveRules(d);
      return d;
    }
    return RULE_SEED.slice();
  }
  function saveRules(l) { try { localStorage.setItem(RULE_KEY, JSON.stringify(l)); } catch (e) {} }

  /* ================= 评分配置 ================= */
  var SCORE_KEY = 'dd-rc-score-v1';
  var SCORE_SEED = {
    factors: [
      { key: 'country', name: '注册地风险', weight: 20, desc: '按国家风险等级库：低风险 0 / 中风险 10 / 高风险 20' },
      { key: 'industry', name: '行业风险', weight: 15, desc: '奢侈品/大宗商品/虚拟资产为高敏行业' },
      { key: 'scale', name: '交易规模', weight: 15, desc: '预计年交易额与行业基线偏离程度' },
      { key: 'pep', name: 'PEP / 制裁命中', weight: 20, desc: '命中即 +20，制裁命中直接极高' },
      { key: 'bo', name: 'BO 结构透明度', weight: 15, desc: '持股层级 > 2 层或含离岸壳公司加分' },
      { key: 'pattern', name: '资金模式', weight: 15, desc: '快进快出、拆分、夜间交易等行为画像' }
    ],
    thresholds: [
      { level: 'low', label: '低风险', range: '0–30', action: '简化尽调（SDD），年度复审' },
      { level: 'mid', label: '中风险', range: '31–55', action: '标准尽调（CDD），半年复审' },
      { level: 'high', label: '高风险', range: '56–75', action: '强制 EDD，季度复审' },
      { level: 'critical', label: '极高风险', range: '76–100', action: '强制 EDD + 禁止出金直至结论，月度复审' }
    ]
  };
  function scoreCfg() {
    try { var d = JSON.parse(localStorage.getItem(SCORE_KEY)); if (d && d.factors) return d; } catch (e) {}
    return JSON.parse(JSON.stringify(SCORE_SEED));
  }
  function saveScoreCfg(d) { try { localStorage.setItem(SCORE_KEY, JSON.stringify(d)); } catch (e) {} }

  /* ================= 合规配置 ================= */
  var CFG_KEY = 'dd-rc-config-v1';
  var CFG_SEED = {
    reviewCycle: { low: 12, mid: 6, high: 3, critical: 1 },
    countryRisk: [
      { c: '意大利/德国/法国/西班牙/奥地利/爱尔兰等欧盟国', lv: '低' },
      { c: '拉脱维亚/塞浦路斯/马耳他', lv: '中高' },
      { c: 'FATF 灰名单辖区', lv: '高' },
      { c: 'FATF 黑名单辖区', lv: '极高（禁止入网）' }
    ],
    industryRisk: [['电商零售', '低'], ['食品进出口', '低'], ['纺织品贸易', '中'], ['奢侈品贸易', '高'], ['大宗商品', '高'], ['虚拟资产相关', '极高']],
    thresholds: { bigAmount: 50000, fastInOutRatio: 90, fastInOutHours: 24, splitMin: 3, nightRatio: 40, refundRate: 8, chargebackRate: 0.9, authDeclineRate: 15, binAttackMin: 10, kytHold: 70 },
    switches: { autoAlert: true, autoIntercept: true, dailyBatch: true, reviewReminder: true }
  };
  function config() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(CFG_KEY)); } catch (e) {}
    if (d && d.reviewCycle) {
      var changed = false;
      Object.keys(CFG_SEED.thresholds).forEach(function (k) { if (d.thresholds[k] === undefined) { d.thresholds[k] = CFG_SEED.thresholds[k]; changed = true; } });
      Object.keys(CFG_SEED.switches).forEach(function (k) { if (d.switches[k] === undefined) { d.switches[k] = CFG_SEED.switches[k]; changed = true; } });
      if (changed) saveConfig(d);
      return d;
    }
    return JSON.parse(JSON.stringify(CFG_SEED));
  }
  function saveConfig(d) { try { localStorage.setItem(CFG_KEY, JSON.stringify(d)); } catch (e) {} }

  /* ================= 评分计算（权重真正参与计算） ================= */
  function scoreOf(m) {
    var cfg = scoreCfg();
    var base = 0;
    cfg.factors.forEach(function (f) { base += ((m.mf && m.mf[f.key]) || 0) * f.weight; });
    /* 动态事件加成：生效管控 +15；EDD 逾期 +15；未结告警按级加分（封顶 +25） */
    var adj = 0;
    if (m.control && m.control !== '无') adj += 15;
    edd().forEach(function (e) {
      if (e.mer.indexOf(m.id) === 0 && e.status !== '已完成' && daysTo(e.due) < 0) adj += 15;
    });
    var altAdj = 0;
    alerts().forEach(function (a) {
      if (a.mer.indexOf(m.id) !== 0) return;
      if (a.status !== 'new' && a.status !== 'investigating' && a.status !== 'pending_approval') return;
      altAdj += a.level === 'critical' ? 12 : a.level === 'high' ? 8 : 4;
    });
    adj += Math.min(altAdj, 25);
    return Math.max(0, Math.min(100, Math.round(base + adj)));
  }
  function levelOf(score) {
    var ths = scoreCfg().thresholds;
    for (var i = ths.length - 1; i >= 0; i--) {
      var lo = parseInt(String(ths[i].range).split(/[–-]/)[0], 10);
      if (score >= lo) return ths[i].level;
    }
    return 'low';
  }

  /* ================= 客户端数据桥接（admin 读取客户端 localStorage） ================= */
  var ENT_MER = { flash: 'M-1001', fast: 'M-1002', goden: 'M-1003' };
  function clientRiskTx() { return readRaw('dd-risk-tx-v1') || []; }
  function saveClientRiskTx(l) { try { localStorage.setItem('dd-risk-tx-v1', JSON.stringify(l)); } catch (e) {} }
  var client = {
    ENT_MER: ENT_MER,
    entities: function () { return readRaw('dd-entities-v1') || []; },
    riskTx: clientRiskTx,
    subs: function () { return readRaw('dd-subaccounts') || []; },
    pools: function () { return readRaw('dd-card-pools-v1') || []; },
    cards: function () { return readRaw('dd-cards') || []; },
    cardhub: function () { return readRaw('dd-cardhub-v2'); },
    kybSubs: function () { return readRaw('dd-kyb-submissions-v1') || []; },
    /* 后台处理客户端「平台审核中」交易：放行 / 拒绝（回写客户端） */
    txAct: function (id, action, note) {
      var l = clientRiskTx(), t = l.filter(function (x) { return x.id === id; })[0];
      if (!t) return null;
      var rn = ROLES[role()].name;
      if (action === 'release') {
        t.status = 'released';
        t.timeline.push({ t: nowShort(), s: note || ('平台人工审核通过（' + rn + '），交易已放行') });
      } else if (action === 'reject') {
        t.status = 'rejected';
        t.timeline.push({ t: nowShort(), s: note || ('平台审核未通过（' + rn + '），交易已拒绝，资金原路退回') });
      } else if (action === 'docs') {
        t.status = 'pending_docs';
        t.timeline.push({ t: nowShort(), s: note || ('平台要求补充材料（' + rn + '），已通知客户') });
      }
      saveClientRiskTx(l);
      log('交易审核·' + (action === 'release' ? '放行' : action === 'reject' ? '拒绝' : '要求补件'), id, note || t.type + ' ' + t.cp);
      return t;
    }
  };

  /* ================= 自动扫描：客户端交易 + USDT KYT → 告警 =================
   * 读取合规配置：switches.autoAlert 总开关；规则 on/off 生效；阈值参与判定 */
  function scan() {
    var cfg = config(), sw = cfg.switches || {};
    if (sw.autoAlert === false) return 0;
    var rmap = {}; rules().forEach(function (r) { rmap[r.code] = r; });
    var haveTx = {};
    alerts().forEach(function (a) { (a.txs || []).forEach(function (t) { haveTx[t] = 1; }); if (a.srcId) haveTx[a.srcId] = 1; });
    var added = [], la = alerts();
    /* 1) 客户端被风控的交易（待补材料/待确认/审核中）→ 告警 */
    clientRiskTx().forEach(function (t) {
      if (['released', 'rejected'].indexOf(t.status) > -1) return;
      if (haveTx[t.id]) return;
      var code = (t.rules && t.rules[0] || '').slice(0, 4);
      var rule = rmap[code];
      if (!rule || rule.on === false) return;
      var mid = ENT_MER[t.ent || 'flash'] || 'M-1001';
      var m = merchant(mid);
      var rec = { id: nextId('ALT'), ts: nowTs(), mer: mid + ' ' + (m ? m.name : t.ent || '客户端主体'), rule: code + ' ' + rule.name,
        level: rule.level, amt: (t.amt < 0 ? '−' : '+') + ' ' + (t.ccy || '€') + ' ' + Math.abs(t.amt).toLocaleString('en-US'), status: 'new', assignee: '', auto: true,
        src: 'client', srcId: t.id, detail: t.note || t.type + ' · ' + t.cp, txs: [t.id] };
      la.unshift(rec); added.push(rec.id);
    });
    /* 2) 卡中台 USDT 归集：KYT 暂挂的入金 → R-19 告警 */
    var ch = client.cardhub();
    if (ch && ch.fund && ch.fund.deps) {
      ch.fund.deps.forEach(function (d) {
        if (d.st !== 'held') return;
        var key = 'KYT-' + d.id;
        if (haveTx[key]) return;
        var rec = { id: nextId('ALT'), ts: nowTs(), mer: '卡中台 · ' + d.cust + ' 专属钱包', rule: 'R-19 USDT 入金 KYT 高风险',
          level: 'high', amt: Number(d.amt).toLocaleString('en-US') + ' USDT', status: 'new', assignee: '', auto: true,
          src: 'kyt', srcId: key, detail: d.hold || ('KYT 风险分 ' + d.kyt + '，入金已暂挂'), txs: [] };
        la.unshift(rec); added.push(rec.id);
      });
    }
    if (added.length) { saveAlerts(la); log('自动扫描', '客户端交易与 USDT 归集', '新增告警 ' + added.length + ' 条：' + added.join('、')); }
    return added.length;
  }

  /* ================= 角色切换器（页头挂载） ================= */
  function renderSwitcher(el) {
    if (!el) return;
    var cur = role();
    el.innerHTML = '<div class="relative"><button class="flex items-center gap-2 px-3 py-1.5 rounded-8 border border-gray-200 bg-white hover:border-gray-300 text-sm font-bold" id="rc-role-btn" type="button">' +
      '<iconify-icon icon="' + ROLES[cur].icon + '" style="color:' + ROLES[cur].color + '"></iconify-icon><span>' + ROLES[cur].name + '</span>' +
      '<iconify-icon class="text-xs text-gray-400" icon="solar:alt-arrow-down-linear"></iconify-icon></button>' +
      '<div class="absolute right-0 mt-2 w-80 bg-white rounded-8 shadow-xl border border-gray-100 p-2 z-50 hidden" id="rc-role-menu"></div></div>';
    var menu = el.querySelector('#rc-role-menu');
    Object.keys(ROLES).forEach(function (k) {
      var r = ROLES[k];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'w-full text-left p-3 rounded-8 hover:bg-gray-50' + (k === cur ? ' bg-gray-50' : '');
      b.innerHTML = '<div class="flex items-center gap-2"><iconify-icon icon="' + r.icon + '" style="color:' + r.color + '"></iconify-icon><b class="text-sm">' + r.name + '</b>' + (k === cur ? '<span class="ml-auto text-[10px] font-bold text-green-600">当前</span>' : '') + '</div><p class="text-xs text-gray-400 mt-1">' + r.desc + '</p>';
      b.addEventListener('click', function () { setRole(k); });
      menu.appendChild(b);
    });
    el.querySelector('#rc-role-btn').addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('hidden'); });
    document.addEventListener('click', function () { menu.classList.add('hidden'); });
  }

  /* ================= 数据版本迁移（结构升级后重置演示数据，审计留痕保留） ================= */
  var DATA_VER = 2;
  try {
    if (localStorage.getItem('dd-rc-dataver') !== String(DATA_VER)) {
      ['dd-rc-merchants-v1', 'dd-rc-alerts-v1', 'dd-rc-edd-v1', 'dd-rc-screening-v1', 'dd-rc-controls-v1', 'dd-rc-str-v1', 'dd-rc-rules-v1', 'dd-rc-score-v1', 'dd-rc-config-v1', 'dd-rc-cases-v1', 'dd-ob-personal-v1', 'dd-ob-business-v1'].forEach(function (k) { localStorage.removeItem(k); });
      localStorage.setItem('dd-rc-dataver', String(DATA_VER));
    }
  } catch (e) {}

  /* 页头角色切换器自动挂载（带 #rc-role-slot 的页面无需手动调用） */
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var el = document.getElementById('rc-role-slot');
      if (el && !el.hasChildNodes()) renderSwitcher(el);
      var sr = document.getElementById('rc-side-role');
      if (sr) sr.textContent = ROLES[role()].name;
    });
  }

  window.RC = {
    ROLES: ROLES, role: role, setRole: setRole, can: can, canMenu: canMenu, readonly: readonly,
    MENU_ACL: MENU_ACL, ACT_ACL: ACT_ACL, actRoles: actRoles, menuRoles: menuRoles, setActRoles: setActRoles, setMenuRoles: setMenuRoles, resetOverrides: resetOverrides,
    audit: audit, log: log,
    today: today, nowTs: nowTs, nowShort: nowShort, addDays: addDays, daysTo: daysTo, dueState: dueState, nextId: nextId, STAFF: STAFF,
    merchants: merchants, saveMerchants: saveMerchants, merchant: merchant, LEVELS: LEVELS,
    alerts: alerts, saveAlerts: saveAlerts, ALT_STATUS: ALT_STATUS,
    edd: edd, saveEdd: saveEdd,
    screening: screening, saveScreening: saveScreening,
    controls: controls, saveControls: saveControls, CTL_TYPES: CTL_TYPES, CTL_STATUS: CTL_STATUS, ctlStatus: ctlStatus,
    applyControl: applyControl, approveControl: approveControl, liftControl: liftControl,
    cases: cases, saveCases: saveCases, CASE_STATUS: CASE_STATUS, caseFromAlert: caseFromAlert, strFromCase: strFromCase,
    strs: strs, saveStrs: saveStrs,
    rules: rules, saveRules: saveRules,
    scoreCfg: scoreCfg, saveScoreCfg: saveScoreCfg, scoreOf: scoreOf, levelOf: levelOf,
    config: config, saveConfig: saveConfig,
    client: client, scan: scan,
    renderSwitcher: renderSwitcher
  };
})();
