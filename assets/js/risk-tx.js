/* 叮当支付客户端 · 风控交易共享数据（演示版，纯前端）
 * 被风控拦截/待审核的交易流水，供 dashboard.html 与 risk.html 共用。
 * 状态：pending_docs 待补充材料 / pending_confirm 待本人确认 / reviewing 平台审核中 / released 已放行 / rejected 已拒绝
 * 存 localStorage('dd-risk-tx-v1')；上传的材料存 localStorage('dd-risk-docs-v1')。
 * 用法：DDRiskTx.load() / DDRiskTx.stats() / DDRiskTx.act(id, 'release'|'reject'|'docs', note)
 */
(function () {
  var KEY = 'dd-risk-tx-v1';
  var DOC_KEY = 'dd-risk-docs-v1';

  var SEED = [
    { id: 'TRX-88231', ts: '2026-11-12 10:42', type: '全球即时付款', cp: 'Alipay (CNY) · 李*华', amt: -12800.00, ccy: '€',
      rules: ['R-01 大额首笔交易', 'R-02 新收款方'], level: 'high', status: 'pending_docs', score: 86,
      device: 'Windows · Chrome 130 · 北京', ip: '123.112.**.**（中国 北京）',
      need: ['采购合同或订单截图', '供应商发票', '物流 / 报关单（如有）'],
      timeline: [{ t: '11-12 10:42', s: '交易发起' }, { t: '11-12 10:42', s: '命中 R-01 / R-02，已拦截' }, { t: '11-12 10:43', s: '已通知补充交易背景材料' }],
      note: '金额超过该收款方历史平均的 20 倍，且为首次向该收款方付款。' },
    { id: 'TRX-88250', ts: '2026-11-12 09:15', type: '速汇全球 (SWIFT)', cp: 'Fast Discount srl · IT60X0542811101000000123456', amt: -45000.00, ccy: '€',
      rules: ['R-01 大额交易', 'R-06 关联方交易'], level: 'high', status: 'reviewing', score: 78,
      device: 'macOS · Safari 18 · 米兰', ip: '79.24.**.**（意大利 米兰）',
      need: [], timeline: [{ t: '11-12 09:15', s: '交易发起' }, { t: '11-12 09:16', s: '命中 R-01 / R-06，转人工审核' }, { t: '11-12 09:40', s: '风控专员已受理，预计 4 小时内完成' }],
      note: '付款方与收款方存在关联关系（同一实控人），需核实贸易背景。' },
    { id: 'TRX-88266', ts: '2026-11-11 22:08', type: '收款入账', cp: 'SIA Baltic Trade · 拉脱维亚', amt: 8900.00, ccy: '€',
      rules: ['R-03 付款方高风险地区'], level: 'mid', status: 'pending_docs', score: 62,
      device: '—', ip: '—',
      need: ['与该付款方的贸易合同', '对应发票', '发货 / 交付凭证'],
      timeline: [{ t: '11-11 22:08', s: '入账待清算' }, { t: '11-11 22:08', s: '命中 R-03，暂缓入账' }, { t: '11-11 22:10', s: '已通知补充贸易背景材料' }],
      note: '付款方注册地为高风险司法辖区，需核实资金来源。' },
    { id: 'TRX-88245', ts: '2026-11-11 18:33', type: '虚拟卡消费', cp: 'AWS EMEA SARL · 卡 8842', amt: -2340.00, ccy: '€',
      rules: ['R-05 商户类别异常'], level: 'mid', status: 'pending_confirm', score: 55,
      device: '线上商户 · 爱尔兰', ip: '—',
      need: [], timeline: [{ t: '11-11 18:33', s: '卡消费发起' }, { t: '11-11 18:33', s: '命中 R-05，待本人确认' }],
      note: '该商户 MCC 与卡片常用消费类别不符，请确认是否本人操作。' },
    { id: 'TRX-88271', ts: '2026-11-11 16:20', type: '货币兑换', cp: 'EUR → USDT', amt: -5000.00, ccy: '€',
      rules: ['R-04 频次异常（1 小时内 6 笔）'], level: 'mid', status: 'pending_confirm', score: 58,
      device: 'Android · App 2.4.1 · 北京', ip: '123.112.**.**（中国 北京）',
      need: [], timeline: [{ t: '11-11 16:20', s: '兑换发起' }, { t: '11-11 16:20', s: '命中 R-04，待本人确认' }],
      note: '短时间内多笔大额兑换，请确认是否本人操作。' },
    { id: 'TRX-88299', ts: '2026-11-12 08:05', type: '虚拟卡消费', cp: 'Google Ads · 卡 3317', amt: -1120.00, ccy: '€',
      rules: ['R-07 卡片异地消费'], level: 'low', status: 'reviewing', score: 41,
      device: '线上商户 · 美国', ip: '—',
      need: [], timeline: [{ t: '11-12 08:05', s: '卡消费发起' }, { t: '11-12 08:05', s: '命中 R-07，自动审核中' }],
      note: '商户所在地与卡片常用地区不一致。' },
    { id: 'TRX-88190', ts: '2026-11-10 15:44', type: '全球即时付款', cp: 'WeChat Pay (CNY) · 王*芳', amt: -980.00, ccy: '€',
      rules: ['R-02 新收款方'], level: 'low', status: 'released', score: 35,
      device: 'iOS · App 2.4.1 · 北京', ip: '123.112.**.**（中国 北京）',
      need: [], timeline: [{ t: '11-10 15:44', s: '交易发起' }, { t: '11-10 15:45', s: '命中 R-02' }, { t: '11-10 15:52', s: '本人确认通过，已放行' }],
      note: '' },
    { id: 'TRX-88155', ts: '2026-11-09 11:02', type: 'SEPA 转账', cp: 'Office Depot SRL · IT供应商', amt: -3400.00, ccy: '€',
      rules: ['R-08 收款账户异常'], level: 'high', status: 'rejected', score: 91,
      device: 'Windows · Chrome 130 · 北京', ip: '123.112.**.**（中国 北京）',
      need: [], timeline: [{ t: '11-09 11:02', s: '交易发起' }, { t: '11-09 11:03', s: '命中 R-08，已拦截' }, { t: '11-09 14:20', s: '人工复核：收款账户涉欺诈名单，已拒绝并退回' }],
      note: '收款 IBAN 命中反欺诈名单，资金已原路退回钱包。' }
  ];

  var STATUS = {
    pending_docs: { label: '待补充材料', cls: 'bg-orange-50 text-orange-600', next: '补充材料后可提交审核' },
    pending_confirm: { label: '待本人确认', cls: 'bg-yellow-50 text-yellow-700', next: '确认后立即放行' },
    reviewing: { label: '平台审核中', cls: 'bg-blue-50 text-blue-600', next: '预计 4 小时内完成' },
    released: { label: '已放行', cls: 'bg-green-50 text-green-600', next: '' },
    rejected: { label: '已拒绝', cls: 'bg-red-50 text-red-500', next: '' }
  };

  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.length) return d; } catch (e) {}
    return SEED.slice();
  }
  function save(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} }
  function docs() { try { return JSON.parse(localStorage.getItem(DOC_KEY) || '{}'); } catch (e) { return {}; } }
  function docsSave(d) { try { localStorage.setItem(DOC_KEY, JSON.stringify(d)); } catch (e) {} }

  function stats(l) {
    l = l || load();
    var s = { pending_docs: 0, pending_confirm: 0, reviewing: 0, released: 0, rejected: 0, total: l.length };
    l.forEach(function (t) { s[t.status] = (s[t.status] || 0) + 1; });
    s.todo = s.pending_docs + s.pending_confirm;
    return s;
  }

  function find(id) { var l = load(); return l.filter(function (t) { return t.id === id; })[0]; }

  function act(id, action, note) {
    var l = load(), t = l.filter(function (x) { return x.id === id; })[0];
    if (!t) return null;
    var now = '11-12 ' + new Date().toTimeString().slice(0, 5);
    if (action === 'release') {
      t.status = 'released';
      t.timeline.push({ t: now, s: note || '本人确认通过，交易已放行' });
    } else if (action === 'reject') {
      t.status = 'rejected';
      t.timeline.push({ t: now, s: note || '客户取消交易，资金已原路退回' });
    } else if (action === 'docs') {
      t.status = 'reviewing';
      t.timeline.push({ t: now, s: '客户已补充材料，转人工审核' });
    }
    save(l);
    return t;
  }

  function addDoc(id, name) {
    var d = docs(); d[id] = d[id] || []; d[id].push({ name: name, ts: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    docsSave(d);
    return d[id];
  }

  function fmt(t) { return (t.amt < 0 ? '− ' : '+ ') + t.ccy + ' ' + Math.abs(t.amt).toLocaleString('en-US', { minimumFractionDigits: 2 }); }
  function levelMeta(lv) {
    return lv === 'high' ? { label: '高风险', cls: 'bg-red-50 text-red-500' }
      : lv === 'mid' ? { label: '中风险', cls: 'bg-orange-50 text-orange-600' }
      : { label: '低风险', cls: 'bg-gray-100 text-gray-500' };
  }

  window.DDRiskTx = { load: load, save: save, stats: stats, act: act, find: find, addDoc: addDoc, docs: docs, STATUS: STATUS, fmt: fmt, levelMeta: levelMeta };
})();
