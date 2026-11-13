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
    'risk-controls.html':   ['supervisor', 'head', 'auditor', 'admin'],
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
    control_apply: ['supervisor', 'head', 'admin'],
    control_lift:  ['supervisor', 'head', 'admin'],
    str_draft:     ['officer', 'supervisor', 'head', 'admin'],
    str_submit:    ['head', 'admin'],
    audit_export:  ['supervisor', 'head', 'auditor', 'admin'],
    config_edit:   ['head', 'admin']
  };

  function role() { var r = localStorage.getItem(ROLE_KEY); return ROLES[r] ? r : 'admin'; }
  function setRole(r) { if (ROLES[r]) { localStorage.setItem(ROLE_KEY, r); log('切换角色', '系统', '当前角色 → ' + ROLES[r].name); location.reload(); } }
  function can(act) { return (ACT_ACL[act] || []).indexOf(role()) > -1; }
  function canMenu(page) { return (MENU_ACL[page] || []).indexOf(role()) > -1; }
  function readonly() { return role() === 'auditor'; }

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
    l.unshift({ ts: new Date().toISOString().slice(0, 16).replace('T', ' '), user: '演示账号', role: who, act: act, target: target, detail: detail });
    try { localStorage.setItem(AUDIT_KEY, JSON.stringify(l)); } catch (e) {}
  }

  /* ================= 商户风险档案 ================= */
  var MER_KEY = 'dd-rc-merchants-v1';
  var LEVELS = { low: { label: '低风险', cls: 'bg-green-50 text-green-600' }, mid: { label: '中风险', cls: 'bg-yellow-50 text-yellow-600' }, high: { label: '高风险', cls: 'bg-orange-50 text-orange-600' }, critical: { label: '极高风险', cls: 'bg-red-50 text-red-500' } };
  var MER_SEED = [
    { id: 'M-1001', name: 'Flash Commerce S.r.l.', country: '意大利', reg: 'MI-2598741', vat: 'IT09876543210', industry: '电商零售', level: 'low', score: 22, kyc: '已通过', reviewDue: '2027-05-12', onboard: '2026-05-12', control: '无', tags: ['SEPA 常用', '正常交易模式'],
      bo: [{ name: '小涵总', share: '65%', id: 'IT-护照·隐去', layer: 1 }, { name: 'Holding Alpha Ltd（香港）', share: '35%', layer: 1, children: [{ name: '陈某', share: '100%', layer: 2 }] }],
      docs: ['公司章程', 'VAT 证书', '注册地址证明', 'BO 声明'], upstream: '深圳 3C 供应商 ×12', downstream: '欧盟终端消费者' },
    { id: 'M-1002', name: 'Fast Discount S.r.l.', country: '意大利', reg: 'MI-2611345', vat: 'IT11223344556', industry: '折扣电商', level: 'high', score: 71, kyc: '已通过', reviewDue: '2026-12-01', onboard: '2026-06-01', control: '加强监控', tags: ['快进快出', '夜间交易占比高'],
      bo: [{ name: '小涵总', share: '80%', id: 'IT-护照·隐去', layer: 1 }, { name: '李某', share: '20%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '注册地址证明'], upstream: '土耳其服装供应商 ×5', downstream: '意大利/法国消费者' },
    { id: 'M-1003', name: 'Goden S.r.l.', country: '意大利', reg: 'MI-2633720', vat: 'IT66778899001', industry: '奢侈品贸易', level: 'mid', score: 48, kyc: '已通过', reviewDue: '2027-02-18', onboard: '2026-08-18', control: '无', tags: ['高客单价'],
      bo: [{ name: '小涵总', share: '100%', id: 'IT-护照·隐去', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '品牌授权书'], upstream: '意大利品牌方 ×8', downstream: '中国跨境电商' },
    { id: 'M-1004', name: 'Baltic Trade SIA', country: '拉脱维亚', reg: 'LV-40103998877', vat: 'LV40103998877', industry: '大宗商品贸易', level: 'critical', score: 88, kyc: 'EDD 进行中', reviewDue: '2026-11-20', onboard: '2026-10-30', control: '禁止出金', tags: ['高风险注册地', 'BO 信息不透明', 'PEP 关联待核实'],
      bo: [{ name: 'Oleg V.', share: '51%', id: '待核实', layer: 1 }, { name: 'ShellCo Cyprus Ltd', share: '49%', layer: 1, children: [{ name: '未知', share: '—', layer: 2 }] }],
      docs: ['公司章程'], upstream: '未提供', downstream: '未提供' },
    { id: 'M-1005', name: 'Nordic Luxury GmbH', country: '德国', reg: 'HRB-88213', vat: 'DE314159265', industry: '奢侈品零售', level: 'high', score: 76, kyc: '已通过', reviewDue: '2026-11-25', onboard: '2026-04-02', control: '禁止出金', tags: ['EDD 逾期未补'],
      bo: [{ name: 'Anna K.', share: '100%', id: 'DE-护照·隐去', layer: 1 }],
      docs: ['公司章程', 'VAT 证书'], upstream: '瑞士手表经销商 ×3', downstream: '欧洲高净值客户' },
    { id: 'M-1006', name: 'Iberia Textiles SL', country: '西班牙', reg: 'B-87654321', vat: 'ESB87654321', industry: '纺织品贸易', level: 'mid', score: 45, kyc: '已通过', reviewDue: '2027-01-15', onboard: '2026-07-15', control: '无', tags: ['季节性波动'],
      bo: [{ name: 'Carlos M.', share: '60%', layer: 1 }, { name: 'Lucia F.', share: '40%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '仓储合同'], upstream: '葡萄牙纺织厂 ×6', downstream: '欧洲批发商' },
    { id: 'M-1007', name: 'Alpine Foods GmbH', country: '奥地利', reg: 'FN-556677a', vat: 'ATU77889900', industry: '食品进出口', level: 'low', score: 18, kyc: '已通过', reviewDue: '2027-08-09', onboard: '2026-02-09', control: '无', tags: ['长期稳定'],
      bo: [{ name: 'Franz H.', share: '100%', layer: 1 }],
      docs: ['公司章程', 'VAT 证书', '食品经营许可'], upstream: '奥地利农场合作社', downstream: '中欧商超' },
    { id: 'M-1008', name: 'Emerald Retail Ltd', country: '爱尔兰', reg: 'IE-667788', vat: 'IE9988776X', industry: '电商零售', level: 'mid', score: 52, kyc: '复审待办', reviewDue: '2026-11-18', onboard: '2025-11-20', control: '仅入金', tags: ['年度复审到期'],
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
    { id: 'ALT-2095', ts: '2026-11-13 08:20', mer: 'M-1004 Baltic Trade SIA', rule: 'R-02 高风险地域交易', level: 'critical', amt: '€86,000 收款', status: 'new', assignee: '', auto: true, detail: '交易对手注册地为高风险司法辖区（离岸金融中心），且与商户申报业务不符。', txs: ['TX-88231', 'TX-88240'] },
    { id: 'ALT-2094', ts: '2026-11-12 22:41', mer: 'M-1002 Fast Discount S.r.l.', rule: 'R-04 快进快出', level: 'high', amt: '€42,800 转出', status: 'investigating', assignee: 'Maria Rossi', auto: true, detail: '3 笔收单入账后 2 小时内 98% 转出至同一新收款方。', txs: ['TX-88190', 'TX-88191', 'TX-88195'] },
    { id: 'ALT-2093', ts: '2026-11-12 18:05', mer: 'M-1005 Nordic Luxury GmbH', rule: 'R-01 大额交易', level: 'high', amt: '€120,000 付款', status: 'pending_approval', assignee: 'Maria Rossi', auto: true, detail: '单笔付款超过商户近 90 天日均交易额 20 倍。', txs: ['TX-88250'] },
    { id: 'ALT-2091', ts: '2026-11-11 14:32', mer: 'M-1003 Goden S.r.l.', rule: 'R-07 拆分交易', level: 'mid', amt: '9 × €9,500', status: 'concluded', assignee: 'Maria Rossi', auto: true, detail: '同日 9 笔 €9,500 付款疑似规避大额审查阈值，客户提供采购合同佐证，结论：误报。', txs: ['TX-88101~88109'] },
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
      { name: 'PEP 数据库', src: '商用数据源', updated: '2026-11-08', entries: 1842300, on: true },
      { name: '自定义风险名单', src: '平台自建', updated: '2026-11-09', entries: 47, on: true }
    ]
  };
  function screening() {
    try { var d = JSON.parse(localStorage.getItem(SCR_KEY)); if (d && d.records) return d; } catch (e) {}
    return JSON.parse(JSON.stringify(SCR_SEED));
  }
  function saveScreening(d) { try { localStorage.setItem(SCR_KEY, JSON.stringify(d)); } catch (e) {} }

  /* ================= 账户管控 ================= */
  var CTL_KEY = 'dd-rc-controls-v1';
  var CTL_TYPES = { deposit_only: '仅入金', no_withdraw: '禁止出金', suspend: '暂停账户', freeze: '冻结资金', none: '无管控' };
  var CTL_SEED = [
    { id: 'CTL-701', mer: 'M-1004 Baltic Trade SIA', type: 'no_withdraw', reason: 'EDD 材料未完成，BO 穿透存在不透明层', by: '陈晓（风控主管）', ts: '2026-11-05 14:20', status: '生效中', approve: '陈晓 → 李强（合规负责人）已批准' },
    { id: 'CTL-702', mer: 'M-1005 Nordic Luxury GmbH', type: 'no_withdraw', reason: 'EDD 补充材料逾期未提交', by: '陈晓（风控主管）', ts: '2026-11-11 17:30', status: '生效中', approve: '陈晓 → 李强 已批准' },
    { id: 'CTL-699', mer: 'M-1008 Emerald Retail Ltd', type: 'deposit_only', reason: '年度复审到期，暂停出金以外的操作', by: 'Maria Rossi（风控专员）', ts: '2026-11-08 09:40', status: '生效中', approve: '陈晓 已批准' },
    { id: 'CTL-688', mer: 'M-1003 Goden S.r.l.', type: 'deposit_only', reason: '拆分交易告警调查期间临时管控', by: 'Maria Rossi', ts: '2026-11-10 10:05', status: '已解除', approve: '陈晓 已批准；2026-11-11 误报结论后解除' }
  ];
  function controls() {
    try { var d = JSON.parse(localStorage.getItem(CTL_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
    return CTL_SEED.slice();
  }
  function saveControls(l) { try { localStorage.setItem(CTL_KEY, JSON.stringify(l)); } catch (e) {} }

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
    { code: 'R-15', name: '退款率异常', cond: '收单商户月退款率 > 8% 或环比上升 3 倍', act: '告警', level: 'mid', on: false, auto: true }
  ];
  function rules() {
    try { var d = JSON.parse(localStorage.getItem(RULE_KEY)); if (Array.isArray(d) && d.length) return d; } catch (e) {}
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
    thresholds: { bigAmount: 50000, fastInOutRatio: 90, fastInOutHours: 24, splitMin: 3, nightRatio: 40, refundRate: 8 },
    switches: { autoAlert: true, autoIntercept: true, dailyBatch: true, reviewReminder: true }
  };
  function config() {
    try { var d = JSON.parse(localStorage.getItem(CFG_KEY)); if (d && d.reviewCycle) return d; } catch (e) {}
    return JSON.parse(JSON.stringify(CFG_SEED));
  }
  function saveConfig(d) { try { localStorage.setItem(CFG_KEY, JSON.stringify(d)); } catch (e) {} }

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

  window.RC = {
    ROLES: ROLES, role: role, setRole: setRole, can: can, canMenu: canMenu, readonly: readonly,
    audit: audit, log: log,
    merchants: merchants, saveMerchants: saveMerchants, merchant: merchant, LEVELS: LEVELS,
    alerts: alerts, saveAlerts: saveAlerts, ALT_STATUS: ALT_STATUS,
    edd: edd, saveEdd: saveEdd,
    screening: screening, saveScreening: saveScreening,
    controls: controls, saveControls: saveControls, CTL_TYPES: CTL_TYPES,
    strs: strs, saveStrs: saveStrs,
    rules: rules, saveRules: saveRules,
    scoreCfg: scoreCfg, saveScoreCfg: saveScoreCfg,
    config: config, saveConfig: saveConfig,
    renderSwitcher: renderSwitcher
  };
})();
