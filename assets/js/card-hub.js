/* DDCardHub 卡中台共享数据层 v2
 * 供应商：WasabiCard（CAAS 发卡即服务，报价单《CAAS_Pricing - 欧洲采买》）
 * 三层费率：供应商成本 cost → 平台基础卖价 base → 客户单独卖价 ovr（未设置则跟随基础）
 * 后台 admin/card-pricing.html（报价与定价）、admin/card-recon.html（对账）写入/读取
 * 客户端 cards.html / store.js 只读取：当前主体虚拟卡开通状态（不展示费率）*/
window.DDCardHub = (function () {
    var KEY = 'dd-cardhub-v2', VER = 4;
    function cp(o) { return JSON.parse(JSON.stringify(o)); }

    /* ---------- 供应商 ---------- */
    var SUPPLIER = {
        id: 'wasabi', name: 'WasabiCard', svc: 'CAAS 发卡即服务（Card as a Service）', ccy: 'USD',
        quote: 'CAAS_Pricing - 欧洲采买.pdf', ver: 'v2026.11', eff: '2026-11-01', contact: 'Wasabi 商务对接 · 欧洲采买线',
        project: [
            { label: '项目开通费 Project Set-up', v: '$0' }, { label: '合规准入 Compliance Admission', v: '$0' },
            { label: 'API 对接费（一次性）', v: '免收 Waived' }, { label: '测试环境 Testing Environment', v: '$0' },
            { label: '技术支持 Technical Support', v: '$0' }, { label: '专属客户经理', v: '$0' },
            { label: 'API 月维护费', v: '$0 / 月' }, { label: '活跃卡管理费', v: '$0 / 张' }, { label: '寄送费（按批）', v: '$0' }
        ],
        branding: [
            { label: 'PVC 卡', v: '$15 / 张 · MOQ 100' }, { label: '嵌入式金属卡', v: '$60 起 · MOQ 500' },
            { label: '半金属卡', v: '$100 起 · MOQ 500' }, { label: '陶瓷卡', v: '$500 起 · MOQ 500' },
            { label: '虚拟卡品牌定制', v: '$25,000 · 需月交易 ≥ $3M，不足收 $3,000/月' },
            { label: '实体卡品牌定制', v: '$15,000 · MOQ 3,000 张' }, { label: '虚拟 + 实体合并定制', v: '$25,000（需同时满足两项条件）' }
        ]
    };
    /* 账户服务供应商：XGD Europe（卢森堡 IBAN 伞账户），报价单《XGD_Europe_Commercial_Quotation》2026-11-16 修订 */
    var XGD = {
        id: 'xgd', name: 'XGD Europe', svc: '卢森堡 LU IBAN 账户服务（伞账户）', ccy: 'EUR', quote: 'XGD_Europe_Commercial_Quotation.pdf', ver: 'Rev. 2026-11-16', eff: '2026-11-16',
        setup: { label: '渠道合作一次性接入费 Channel Partnership Setup', v: 10000, paid: '2026-11-18' },
        planA: { name: 'Plan A · 全功能 LU IBAN', monthly: 15, extraIban: 5, open: [{ from: 1, to: 10, fee: 0 }, { from: 11, to: 30, fee: 150 }, { from: 31, to: 80, fee: 100 }, { from: 81, to: 0, fee: 50 }], scope: 'SEPA 收/付 · SWIFT 收/付 · SEPA 直接借记 · 中国结算（视通道）' },
        planB: { name: 'Plan B · 平台收款专用 LU IBAN', monthly: [{ from: 1, to: 10, fee: 15 }, { from: 11, to: 50, fee: 10 }, { from: 51, to: 0, fee: 5 }], scope: '仅限电商平台入账 + 指定中国结算出款；无 SEPA 出款 / SWIFT / 直接借记' },
        tx: [
            { rail: 'EUR / SEPA', inn: '0.25%', out: 'EUR 0.50 / 笔' }, { rail: 'SWIFT（仅 Plan A）', inn: '0.25%', out: 'EUR 20 / 笔' },
            { rail: 'GBP / Faster Payments（未上线）', inn: '0.25%', out: 'GBP 0.50 / 笔' }, { rail: '人民币结算回国', inn: '—', out: '0.10%（每笔最低 EUR 10，可合并出款）' },
            { rail: '支付宝 / 微信支付收单', inn: '0.90%', out: '—' }
        ],
        note: '代理行 / 中间行费用、换汇费、税费另计；报价为非约束性，以签署协议为准。'
    };
    /* XGD 账户服务计费项（成本数值化，unit: pct=按金额% / fix=按笔/户固定 EUR）
     * base 为月用量字段；成本与 d.xgd 报价单双向同步（报价单保存时回写） */
    var XGD_ITEMS = [
        { k: 'openFee', label: '开户费（一次性）', unit: 'fix', per: '户', base: 'newAccts', baseLabel: '本月新开户', tier: 'planA' },
        { k: 'monthlyA', label: 'Plan A 月费', unit: 'fix', per: '户/月', base: 'acctsA', baseLabel: 'Plan A 账户' },
        { k: 'extraIban', label: '额外 IBAN', unit: 'fix', per: '个/月', base: 'extraIbans', baseLabel: '额外 IBAN' },
        { k: 'monthlyB', label: 'Plan B 月费', unit: 'fix', per: '户/月', base: 'acctsB', baseLabel: 'Plan B 账户', tier: 'planB' },
        { k: 'sepaIn', label: 'SEPA 收款', unit: 'pct', base: 'sepaInVol', baseLabel: 'SEPA 收款额' },
        { k: 'sepaOut', label: 'SEPA 付款', unit: 'fix', per: '笔', base: 'sepaOutN', baseLabel: 'SEPA 付款笔数' },
        { k: 'swiftIn', label: 'SWIFT 收款', unit: 'pct', base: 'swiftInVol', baseLabel: 'SWIFT 收款额', note: '仅 Plan A' },
        { k: 'swiftOut', label: 'SWIFT 付款', unit: 'fix', per: '笔', base: 'swiftOutN', baseLabel: 'SWIFT 付款笔数', note: '仅 Plan A' },
        { k: 'cnyOut', label: '人民币结算回国', unit: 'pct', base: 'cnyVol', baseLabel: '人民币结算额', note: '成本每笔最低 EUR 10' },
        { k: 'walletIn', label: '支付宝/微信收单', unit: 'pct', base: 'walletVol', baseLabel: '收单金额' }
    ];
    /* XGD 平台基础卖价（EUR） */
    var XGD_SELL = { openFee: 250, monthlyA: 29, extraIban: 9, monthlyB: 25, sepaIn: 0.45, sepaOut: 1.2, swiftIn: 0.45, swiftOut: 35, cnyOut: 0.35, walletIn: 1.6 };
    /* 报价单（文本）→ 计费项成本（数值） */
    function xgdSyncCost(x, items, accts) {
        /* 开户费按累计账户数取当前阶梯 */
        var n = accts || 0, tier = x.planA.open.filter(function (t) { return n >= t.from && (!t.to || n <= t.to); })[0];
        items.forEach(function (it) {
            if (it.k === 'openFee') it.cost = tier ? tier.fee : 0;
            else if (it.k === 'monthlyA') it.cost = x.planA.monthly;
            else if (it.k === 'extraIban') it.cost = x.planA.extraIban;
            else if (it.k === 'monthlyB') it.cost = x.planB.monthly[0].fee;
            else if (it.k === 'sepaIn') it.cost = parseFloat(x.tx[0].inn) || 0;
            else if (it.k === 'sepaOut') it.cost = parseFloat(String(x.tx[0].out).replace(/[^0-9.]/g, '')) || 0;
            else if (it.k === 'swiftIn') it.cost = parseFloat(x.tx[1].inn) || 0;
            else if (it.k === 'swiftOut') it.cost = parseFloat(String(x.tx[1].out).replace(/[^0-9.]/g, '')) || 0;
            else if (it.k === 'cnyOut') it.cost = parseFloat(x.tx[3].out) || 0;
            else if (it.k === 'walletIn') it.cost = parseFloat(x.tx[4].inn) || 0;
        });
        return items;
    }

    var PRODUCTS = [
        { id: 'vsg', name: '新加坡虚拟卡', en: 'Virtual Card - Singapore', scheme: 'Visa', ccy: 'USD', kind: 'virtual', wallet: '支持 Apple Pay / Google Pay', note: '通用消费卡；汇率按 Visa 牌价直通', on: true },
        { id: 'vus', name: '美国媒体投放虚拟卡', en: 'Virtual Card - US & Media-buying', scheme: 'Mastercard', ccy: 'USD', kind: 'virtual', wallet: '不支持移动钱包', note: '主要用于美国境内 Meta / Google / AMS 广告投放，不适合美国境外交易', on: true },
        { id: 'psg', name: '新加坡实体卡', en: 'Physical Card - Singapore', scheme: 'Visa', ccy: 'USD', kind: 'physical', wallet: '支持 Apple Pay / Google Pay · 可白标', note: '白标卡面设计审批 2–3 个月；卡体按 PVC $15/张计', on: true }
    ];

    /* ---------- 计费项（报价单逐条） ----------
     * unit: pct = 按金额百分比；fix = 按次/张固定 USD
     * dir: fee = 向客户收费；rebate = 供应商返现给平台，平台再返给客户（卖价=返给客户的比例，越低平台利润越高）
     * base: 计费基数（用量字段） */
    var ITEMS = [
        { k: 'topupUsd', grp: '充值', label: '充值费 · USD', en: 'Recharging Fee (USD)', unit: 'pct', base: 'topupUsd', baseLabel: 'USD 充值额', dir: 'fee' },
        { k: 'topupUsdt', grp: '充值', label: '充值费 · USDT', en: 'Recharging Fee (USDT)', unit: 'pct', base: 'topupUsdt', baseLabel: 'USDT 充值额', dir: 'fee' },
        { k: 'issue', grp: '发卡', label: '开卡费', en: 'Card Issuing Fee', unit: 'fix', base: 'newCards', baseLabel: '新开卡', per: '张', dir: 'fee' },
        { k: 'cardMgmt', grp: '发卡', label: '活跃卡管理费', en: 'Active Card Management', unit: 'fix', base: 'activeCards', baseLabel: '活跃卡', per: '张·月', dir: 'fee' },
        { k: 'applePay', grp: '交易', label: 'Apple Pay 费', en: 'Apple Pay Fee', unit: 'pct', base: 'apVol', baseLabel: 'Apple Pay 交易额', dir: 'fee' },
        { k: 'googlePay', grp: '交易', label: 'Google Pay 费', en: 'Google Pay Fee', unit: 'pct', base: 'gpVol', baseLabel: 'Google Pay 交易额', dir: 'fee' },
        { k: 'xborder', grp: '交易', label: '跨境交易费', en: 'Cross-border', unit: 'pct', base: 'xbVol', baseLabel: '跨境交易额', dir: 'fee' },
        { k: 'fx', grp: '交易', label: '外汇加点', en: 'FX Rate (pass-through)', unit: 'pct', base: 'fxVol', baseLabel: '外币交易额', dir: 'fee' },
        { k: 'authSmall', grp: '交易', label: '小额授权费（< $1）', en: 'Authorization < 1 USD', unit: 'fix', base: 'authSmallN', baseLabel: '小额授权', per: '笔', dir: 'fee' },
        { k: 'authDom', grp: '交易', label: '授权费 · 美国境内', en: 'Authorization · US Domestic', unit: 'fix', base: 'authDomN', baseLabel: '境内授权', per: '笔', dir: 'fee' },
        { k: 'authOut', grp: '交易', label: '授权费 · 美国境外', en: 'Authorization · Outside US', unit: 'fix', base: 'authOutN', baseLabel: '境外授权', per: '笔', dir: 'fee' },
        { k: 'refund', grp: '异常', label: '退款费', en: 'Refund Fee', unit: 'pct', base: 'refundVol', baseLabel: '退款额', dir: 'fee' },
        { k: 'dispute', grp: '异常', label: '争议处理费', en: 'Dispute Fee', unit: 'fix', base: 'disputeN', baseLabel: '争议', per: '件', dir: 'fee' },
        { k: 'decline', grp: '异常', label: '拒绝交易费', en: 'Decline Fee', unit: 'fix', base: 'declineN', baseLabel: '拒绝', per: '笔', dir: 'fee' },
        { k: 'reversal', grp: '异常', label: '冲正费', en: 'Reversal Fee', unit: 'fix', base: 'reversalN', baseLabel: '冲正', per: '笔', dir: 'fee' },
        { k: 'cashback', grp: '返现', label: '交易返现', en: 'Cashback (monthly volume)', unit: 'pct', base: 'spend', baseLabel: '月交易额', dir: 'rebate' }
    ];
    /* 供应商成本：null = 该卡种不适用；cashback 为分档（按平台该卡种当月总交易额） */
    var COST = {
        vsg: { topupUsd: 0.1, topupUsdt: 0.2, issue: 1, cardMgmt: 0, applePay: 0.1, googlePay: 0, xborder: 0, fx: 0, authSmall: 0.1, authDom: null, authOut: null, refund: 2, dispute: 45, decline: 0.5, reversal: 1, cashback: 1.6,
            tiers: [{ from: 0, rate: 1.6 }] },
        vus: { topupUsd: 0.1, topupUsdt: 0.2, issue: 1, cardMgmt: 0, applePay: null, googlePay: null, xborder: 0.5, fx: 0, authSmall: null, authDom: 0.11, authOut: 0.5, refund: 2, dispute: 45, decline: 0.5, reversal: 1, cashback: 1.9,
            tiers: [{ from: 0, rate: 1.9 }, { from: 5e6, rate: 2.0 }] },
        psg: { topupUsd: 0.1, topupUsdt: 0.2, issue: 15, cardMgmt: 0, applePay: 0.1, googlePay: 0, xborder: 0, fx: 0, authSmall: 0.1, authDom: null, authOut: null, refund: 2, dispute: 45, decline: 0.5, reversal: 1, cashback: 1.0,
            tiers: [{ from: 0, rate: 1.0 }, { from: 1e6, rate: 1.2 }, { from: 3e6, rate: 1.5 }, { from: 5e6, rate: 1.6 }] }
    };
    var COST_NOTE = {
        vsg: { fx: 'Visa 牌价直通，供应商不加点', xborder: '无跨境费', authSmall: '≥ $1 免授权费' },
        vus: { xborder: '美国境内 0；境外 0.5%', fx: '境内 0；境外按 Mastercard 牌价直通', cashback: '$0–5M 1.9%；> $5M 2%' },
        psg: { issue: '报价单未列开卡费，按 PVC 卡体 $15/张计', fx: 'Visa 牌价直通', cashback: '< $1M 1%；$1–3M 1.2%；$3–5M 1.5%；> $5M 1.6%' }
    };
    /* 平台基础卖价 */
    var BASE = {
        vsg: { topupUsd: 0.5, topupUsdt: 0.8, issue: 3, cardMgmt: 0.5, applePay: 0.3, googlePay: 0.2, xborder: 0.8, fx: 1.0, authSmall: 0.2, refund: 2.5, dispute: 60, decline: 0.8, reversal: 1.5, cashback: 1.0 },
        vus: { topupUsd: 0.5, topupUsdt: 0.8, issue: 3, cardMgmt: 0.5, xborder: 1.2, fx: 1.0, authDom: 0.2, authOut: 0.8, refund: 2.5, dispute: 60, decline: 0.8, reversal: 1.5, cashback: 1.2 },
        psg: { topupUsd: 0.5, topupUsdt: 0.8, issue: 25, cardMgmt: 1, applePay: 0.3, googlePay: 0.2, xborder: 0.8, fx: 1.0, authSmall: 0.2, refund: 2.5, dispute: 60, decline: 0.8, reversal: 1.5, cashback: 0.6 }
    };
    /* 客户（id 与 Web 端主体 DDEnt id 一致的可联动） */
    var CUSTOMERS = [
        { id: 'flash', name: 'Flash Commerce S.r.l.', country: '意大利', mgr: '王敏', status: 'on', products: ['vsg', 'vus'], maxCards: 100, since: '2026-09-12', ovr: { vus: { dispute: 50 } }, scale: { vsg: 180e3, vus: 1.2e6 },
            xgd: { plan: 'A', iban: 'LU28 0019 4006 4475 0001', st: 'active', at: '2026-09-02', seq: 1 }, wsb: { id: 'WUA-100231', st: 'active', at: '2026-09-12' }, defPool: 'POOL-01', linked: true },
        { id: 'fast', name: 'Fast Discount S.r.l.', country: '意大利', mgr: '王敏', status: 'on', products: ['vsg'], maxCards: 50, since: '2026-10-03', ovr: { vsg: { decline: 0.6, issue: 3.5 } }, scale: { vsg: 65e3 },
            xgd: { plan: 'A', iban: 'LU51 0019 4006 4475 0002', st: 'active', at: '2026-09-05', seq: 2 }, wsb: { id: 'WUA-100247', st: 'active', at: '2026-10-03' }, cardBal: 18240.5 },
        { id: 'goden', name: 'Goden S.r.l.', country: '意大利', mgr: '王敏', status: 'none', products: [], maxCards: 50, since: '', ovr: {}, scale: {},
            xgd: { plan: 'B', iban: 'LU74 0019 4006 4475 0003', st: 'active', at: '2026-09-09', seq: 3 }, wsb: { st: 'none' } },
        { id: 'mila', name: 'Mila Fashion GmbH', country: '德国', mgr: '陈思远', status: 'on', products: ['vsg', 'psg'], maxCards: 300, since: '2026-06-20', ovr: { vsg: { topupUsd: 0.3, issue: 2, cashback: 1.2 }, psg: { issue: 20 } }, scale: { vsg: 420e3, psg: 260e3 },
            xgd: { plan: 'A', iban: 'LU97 0019 4006 4475 0004', st: 'active', at: '2026-06-11', seq: 4 }, wsb: { id: 'WUA-100118', st: 'active', at: '2026-06-20' }, cardBal: 96310 },
        { id: 'lumen', name: 'Lumen Digital Ltd', country: '英国', mgr: '陈思远', status: 'off', mode: 'freeze', reason: '风控复核：近 30 天拒付率 1.8%，超过 1% 阈值', offAt: '2026-11-08', products: ['vus'], maxCards: 100, since: '2026-08-08', ovr: {}, scale: { vus: 900e3 },
            xgd: { plan: 'A', iban: 'LU23 0019 4006 4475 0005', st: 'active', at: '2026-08-01', seq: 5 }, wsb: { id: 'WUA-100195', st: 'frozen', at: '2026-08-08' }, cardBal: 3120 },
        { id: 'lys', name: 'Maison Lys SAS', country: '法国', mgr: '李娜', status: 'pending', applied: '2026-11-21', applyNote: '广告投放（Meta / Google）；预计月消费 $150,000；20 张卡', products: [], maxCards: 50, since: '', ovr: {}, scale: {},
            xgd: { plan: 'A', st: 'pending', at: '' }, wsb: { st: 'none' } },
        { id: 'dragon', name: 'Dragon Gate Trading Ltd', country: '中国香港', mgr: '李娜', status: 'on', products: ['vsg', 'vus', 'psg'], maxCards: 200, since: '2026-07-15', ovr: { vus: { xborder: 1.0, cashback: 1.4 } }, scale: { vsg: 310e3, vus: 2.6e6, psg: 1.1e6 },
            xgd: { plan: 'B', iban: 'LU46 0019 4006 4475 0006', st: 'active', at: '2026-07-02', seq: 6 }, wsb: { id: 'WUA-100162', st: 'active', at: '2026-07-15' }, cardBal: 412880.2 }
    ];
    var MONTHS = [
        { id: '2026-09', label: '2026 年 9 月', f: 0.88, closed: true },
        { id: '2026-10', label: '2026 年 10 月', f: 1.0, closed: true },
        { id: '2026-11', label: '2026 年 11 月', f: 0.94, closed: false, note: '截至 11-25，未结账' }
    ];

    function seed() {
        var d = { v: VER, supplier: cp(SUPPLIER), xgd: cp(XGD), xgdItems: xgdSyncCost(cp(XGD), cp(XGD_ITEMS)), xgdSell: cp(XGD_SELL), products: cp(PRODUCTS), cost: cp(COST), base: cp(BASE), customers: cp(CUSTOMERS), recon: {}, supBill: {}, log: [] };
        /* 已结账月份：锁定出账快照 + 供应商账单 */
        d.customers.forEach(function (c) {
            if (!c.products.length) return;
            d.recon['2026-09|' + c.id] = { st: 'paid', at: '2026-10-05' };
            if (c.id !== 'fast') d.recon['2026-10|' + c.id] = { st: c.id === 'lumen' || c.id === 'dragon' ? 'billed' : 'paid', at: '2026-11-05' }; /* fast 10 月未出账（演示出账流程） */
        });
        ['2026-09', '2026-10'].forEach(function (m) {
            d.customers.forEach(function (c) { var r = d.recon[m + '|' + c.id]; if (r) r.snap = billCust(d, c.id, m); });
            var sp = supplierSplit(d, m), r2 = function (x) { return Math.round(x * 100) / 100; };
            /* 10 月供应商账单手续费比我方测算多 0.62%（演示对账差异） */
            d.supBill[m] = { no: 'WSB-' + m.replace('-', '') + '-0' + (m === '2026-09' ? '17' : '42'), fee: r2(sp.fee * (m === '2026-10' ? 1.0062 : 1)), rebate: r2(sp.rebate), st: m === '2026-09' ? 'paid' : 'pending', at: m === '2026-09' ? '2026-10-06' : '2026-11-04' };
        });
        seedFund(d);
        d.log = [
            { t: '2026-11-26 04:52', act: '自动归集', target: 'Flash Commerce S.r.l.', detail: '15,000 USDT 已从客户专属钱包归集至平台大钱包', who: '系统' },
            { t: '2026-11-26 02:10', act: '发起 Wasabi 充值', target: 'WTB-20261126-01', detail: '2 笔 105,000 USDT 划转至 Wasabi 专属充值钱包', who: '卡中台运营' },
            { t: '2026-11-18 11:00', act: '签约账户服务商', target: 'XGD Europe', detail: '支付渠道接入费 EUR 10,000；Plan A / Plan B 报价生效', who: '小涵' },
            { t: '2026-11-08 16:20', act: '下线虚拟卡', target: 'Lumen Digital Ltd', detail: '冻结全部卡：风控复核，近 30 天拒付率 1.8%', who: '陈思远' },
            { t: '2026-11-03 10:05', act: '导入供应商报价', target: 'WasabiCard v2026.11', detail: '依据《CAAS_Pricing - 欧洲采买》更新 3 个卡种成本', who: '卡中台运营' },
            { t: '2026-10-21 14:32', act: '客户单独定价', target: 'Dragon Gate Trading Ltd', detail: '美国媒体投放虚拟卡：跨境交易费 1.20% → 1.00%，返现 1.20% → 1.40%', who: '李娜' }
        ];
        return d;
    }
    function load() {
        try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v === VER && d.customers && d.cost && d.base && d.fund && d.xgdItems && d.xgdSell) return d; } catch (e) {}
        var s = seed(); save(s); return s;
    }
    function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
    function now() { var d = new Date(); function p(n) { return String(n).padStart(2, '0'); } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
    function log(d, act, target, detail, who) { d.log.unshift({ t: now(), act: act, target: target, detail: detail || '', who: who || '卡中台运营' }); d.log = d.log.slice(0, 300); }
    function custOf(d, id) { return d.customers.filter(function (c) { return c.id === id; })[0] || null; }
    function item(k) { return ITEMS.filter(function (i) { return i.k === k; })[0]; }
    function applies(d, p, k) { return d.cost[p] && d.cost[p][k] != null; }

    /* ---------- 费率解析 ---------- */
    function sell(d, custId, p, k) {
        var c = custId ? custOf(d, custId) : null;
        if (c && c.ovr && c.ovr[p] && c.ovr[p][k] != null) return { v: +c.ovr[p][k], own: true };
        return { v: +((d.base[p] || {})[k] || 0), own: false };
    }
    /* 当月平台该卡种总交易额 → 供应商返现档位 */
    function platformSpend(d, p, m) { var s = 0; d.customers.forEach(function (c) { if (c.products.indexOf(p) > -1) s += usage(d, c.id, m, p).spend; }); return s; }
    function tierRate(d, p, m) {
        var t = (d.cost[p] && d.cost[p].tiers) || [{ from: 0, rate: d.cost[p].cashback }], vol = platformSpend(d, p, m), r = t[0].rate;
        t.forEach(function (x) { if (vol >= x.from) r = x.rate; });
        return r;
    }
    function costOf(d, p, k, m) { if (k === 'cashback' && m) return tierRate(d, p, m); return d.cost[p][k]; }

    /* ---------- 用量（演示：按客户规模确定性生成） ---------- */
    function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
    var MCACHE = {};
    function usage(d, custId, m, p) {
        var key = custId + m + p, c = custOf(d, custId), mo = MONTHS.filter(function (x) { return x.id === m; })[0];
        var z = { spend: 0, topupUsd: 0, topupUsdt: 0, newCards: 0, activeCards: 0, apVol: 0, gpVol: 0, xbVol: 0, fxVol: 0, authSmallN: 0, authDomN: 0, authOutN: 0, refundVol: 0, disputeN: 0, declineN: 0, reversalN: 0, txN: 0 };
        if (!c || !mo || !c.scale || !c.scale[p]) return z;
        if (MCACHE[key]) return MCACHE[key];
        var j = 0.9 + hash(key) * 0.2, S = Math.round(c.scale[p] * mo.f * j);
        if (c.id === 'lumen' && m === '2026-11') S = Math.round(S * 0.24); /* 11-08 已冻结 */
        var virt = p !== 'psg', us = p === 'vus', r = function (x) { return Math.round(x); };
        z.spend = S; z.txN = r(S / (us ? 85 : 62));
        z.topupUsd = r(S * (0.66 + hash(key + 'u') * 0.1)); z.topupUsdt = r(S * 0.38);
        z.activeCards = r(Math.max(3, c.scale[p] / (us ? 45000 : (virt ? 9000 : 16000))));
        z.newCards = Math.max(1, r(z.activeCards * (0.08 + hash(key + 'n') * 0.1)));
        z.apVol = us ? 0 : r(S * (virt ? 0.08 : 0.22)); z.gpVol = us ? 0 : r(S * (virt ? 0.04 : 0.09));
        z.xbVol = us ? r(S * 0.06) : r(S * 0.18); z.fxVol = us ? z.xbVol : r(S * 0.27);
        z.authSmallN = us ? 0 : r(z.txN * 0.03); z.authDomN = us ? r(z.txN * 0.94) : 0; z.authOutN = us ? r(z.txN * 0.06) : 0;
        z.refundVol = r(S * 0.011); z.disputeN = r(S / (us ? 160000 : 90000)); z.declineN = r(z.txN * 0.035); z.reversalN = r(z.txN * 0.004);
        MCACHE[key] = z; return z;
    }
    /* ---------- 计费 ---------- */
    function billLines(d, custId, m, p) {
        var u = usage(d, custId, m, p);
        return ITEMS.filter(function (it) { return applies(d, p, it.k); }).map(function (it) {
            var qty = u[it.base] || 0, cr = costOf(d, p, it.k, m), sr = sell(d, custId, p, it.k), cost, rev;
            if (it.unit === 'pct') { cost = qty * cr / 100; rev = qty * sr.v / 100; } else { cost = qty * cr; rev = qty * sr.v; }
            if (it.dir === 'rebate') { cost = -cost; rev = -rev; }
            return { k: it.k, label: it.label, unit: it.unit, per: it.per, dir: it.dir, qty: qty, cr: cr, sr: sr.v, own: sr.own, cost: cost, rev: rev, profit: rev - cost };
        });
    }
    function sumLines(lines) { var t = { cost: 0, rev: 0, profit: 0 }; lines.forEach(function (l) { t.cost += l.cost; t.rev += l.rev; t.profit += l.profit; }); return t; }
    function billCust(d, custId, m) {
        var c = custOf(d, custId), out = { m: m, products: {}, spend: 0, cost: 0, rev: 0, profit: 0, cards: 0, txN: 0, fee: 0, rebateIn: 0, rebateOut: 0 };
        if (!c) return out;
        c.products.forEach(function (p) {
            var lines = billLines(d, custId, m, p), t = sumLines(lines), u = usage(d, custId, m, p);
            out.products[p] = { lines: lines, cost: t.cost, rev: t.rev, profit: t.profit, spend: u.spend, cards: u.activeCards, txN: u.txN };
            out.spend += u.spend; out.cost += t.cost; out.rev += t.rev; out.profit += t.profit; out.cards += u.activeCards; out.txN += u.txN;
            lines.forEach(function (l) { if (l.dir === 'rebate') { out.rebateIn += -l.cost; out.rebateOut += -l.rev; } else out.fee += l.rev; });
        });
        return out;
    }
    /* 已出账月份使用快照，未结账月份实时按当前费率计算 */
    function monthBill(d, custId, m) { var r = d.recon[m + '|' + custId]; return (r && r.snap) ? r.snap : billCust(d, custId, m); }
    /* 供应商口径：手续费应付 fee / 返现应收 rebate */
    function supplierSplit(d, m) {
        var o = { fee: 0, rebate: 0 };
        d.customers.forEach(function (c) {
            var r = d.recon[m + '|' + c.id], b = (r && r.snap) ? r.snap : billCust(d, c.id, m);
            Object.keys(b.products).forEach(function (p) { b.products[p].lines.forEach(function (l) { if (l.dir === 'rebate') o.rebate += -l.cost; else o.fee += l.cost; }); });
        });
        return o;
    }
    function supplierCost(d, m) { var s = 0; d.customers.forEach(function (c) { var r = d.recon[m + '|' + c.id]; s += ((r && r.snap) ? r.snap : billCust(d, c.id, m)).cost; }); return s; }
    /* 卖价低于成本（返现项：返客户比例高于供应商返现） */
    function belowCost(d, custId, p, k, m) { if (!applies(d, p, k)) return false; var it = item(k), cr = costOf(d, p, k, m), sv = sell(d, custId, p, k).v; return it.dir === 'rebate' ? sv > cr : sv < cr; }

    /* ======================================================================
     * USDT 充卡资金链路（WasabiCard U 充卡）
     * ① 客户向「客户专属充值钱包」转入 USDT（TRC-20）→ 链上确认 + KYT 筛查
     * ② 到账后自动归集至「叮当支付 USDT 归集大钱包」
     * ③ 大钱包批量划转至「WasabiCard 分配给 Dingdang 的专属充值钱包」= 为 Dingdang 卡台充值
     * ④ Wasabi 确认到账（扣其 USDT 充值费 0.2%）→ Dingdang 卡台余额增加
     * ⑤ 卡中台将「入金 − 我方 USDT 充值费」分配到客户 Wasabi 伞账户 → 客户卡资金池可刷余额增加
     * 状态：confirming 链上确认中 → arrived 已到账待归集 → swept 已归集 → sent 已转 Wasabi → received Wasabi 已到账 → loaded 已入卡池
     *       held 风控拦截（KYT 高风险 / 客户卡功能冻结）→ 放行回到 arrived，或 refunded 原路退回
     * ====================================================================== */
    var FST = {
        confirming: ['链上确认中', 'bg-gray-100 text-gray-500', 0], arrived: ['已到账 · 待归集', 'bg-blue-50 text-accent2', 1],
        swept: ['已归集 · 待转 Wasabi', 'bg-purple-50 text-purple-600', 2], sent: ['已转 Wasabi · 待确认', 'bg-orange-50 text-orange-500', 3],
        received: ['Wasabi 已到账 · 待入池', 'bg-yellow-50 text-dark', 4], loaded: ['已入卡资金池', 'bg-green-50 text-green-600', 5],
        held: ['风控拦截', 'bg-red-50 text-red-500', -1], refunded: ['已原路退回', 'bg-gray-100 text-gray-400', -2]
    };
    var B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    function prng(seed) { var h = 2166136261; for (var j = 0; j < seed.length; j++) { h ^= seed.charCodeAt(j); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; }; }
    function addr(seed) { var r = prng(seed), s = 'T'; for (var i = 0; i < 33; i++) s += B58[Math.floor(r() * 58)]; return s; }
    function txh(seed) { var r = prng('tx' + seed), s = ''; for (var i = 0; i < 64; i++) s += '0123456789abcdef'[Math.floor(r() * 16)]; return s; }
    function r2(x) { return Math.round(x * 100) / 100; }
    function seedFund(d) {
        var f = d.fund = {
            chain: 'TRON · TRC-20', minDep: 10, conf: 19,
            master: { name: '叮当支付 USDT 归集大钱包', addr: addr('dingdang-master'), bal: 0, trx: 1860.4, custody: '多签冷热分离 · 2/3 签名' },
            wsb: { name: 'WasabiCard · Dingdang 专属充值钱包', addr: addr('wasabi-dingdang'), note: 'Wasabi 为 Dingdang 卡台分配的唯一入金地址，仅接受 TRC-20 USDT' },
            plat: { bal: 0, fee: 0, unalloc: 0 }, /* Dingdang 卡台余额（Wasabi 侧，USD）= 客户卡余额 + 待分配 unalloc + 我方 USDT 充值费差价留存 fee */
            auto: { confirm: true, sweep: true, sweepMin: 100, transferAt: 50000, trxReserve: 300, kytHold: 70 },
            wallets: [], deps: [], sweeps: [], batches: []
        };
        d.customers.forEach(function (c) { if (c.wsb && c.wsb.st !== 'none') f.wallets.push({ cust: c.id, addr: addr('dep-' + c.id), created: c.wsb.at, st: c.wsb.st === 'frozen' ? 'frozen' : 'active' }); });
        var D = [
            ['flash', 50000, '2026-11-03 10:12', 'loaded', 'TLa2…9fQk', 12], ['mila', 80000, '2026-11-05 15:40', 'loaded', 'TPx7…2mVb', 8], ['dragon', 250000, '2026-11-08 09:05', 'loaded', 'TQe1…7cHs', 5],
            ['fast', 20000, '2026-11-12 11:22', 'loaded', 'TFd4…8nKw', 15], ['dragon', 180000, '2026-11-19 14:30', 'loaded', 'TQe1…7cHs', 6], ['mila', 30000, '2026-11-24 16:18', 'received', 'TPx7…2mVb', 9],
            ['dragon', 90000, '2026-11-25 20:44', 'sent', 'TQe1…7cHs', 4], ['flash', 15000, '2026-11-26 04:41', 'swept', 'TLa2…9fQk', 11], ['mila', 6500, '2026-11-26 04:46', 'arrived', 'TPx7…2mVb', 10],
            ['fast', 12000, '2026-11-26 03:58', 'held', 'TMix…0zZq', 86], ['lumen', 4000, '2026-11-25 22:10', 'held', 'TLu9…3aPe', 18], ['flash', 3200, '2026-11-26 04:55', 'confirming', 'TLa2…9fQk', 12]
        ];
        D.forEach(function (x, i) {
            var id = 'DEP-' + x[2].slice(0, 10).replace(/-/g, '') + '-' + String(i + 1).padStart(3, '0'), w = walletOf(d, x[0]);
            var dep = { id: id, cust: x[0], amt: x[1], at: x[2], st: x[3], from: x[4], to: w ? w.addr : '', hash: txh(id), conf: x[3] === 'confirming' ? 7 : f.conf, kyt: x[5] };
            if (x[3] === 'held') dep.hold = x[0] === 'lumen' ? '客户虚拟卡功能已冻结（风控复核拒付率），入金暂挂待处理' : 'KYT 高风险：来源地址 2 跳内关联混币服务（风险分 86）';
            f.deps.push(dep);
        });
        /* 历史批次：已入池 + Wasabi 已到账 + 已发送 */
        function mk(ids, st, at, no) {
            var amt = 0; ids.forEach(function (i) { amt += f.deps[i].amt; });
            var sw = { id: 'SWP-' + no, deps: ids.map(function (i) { return f.deps[i].id; }), amt: amt, at: at, hash: txh('sw' + no), gas: 13.4 * ids.length };
            f.sweeps.push(sw);
            if (st) {
                var b = { id: 'WTB-' + no, deps: sw.deps.slice(), amt: amt, at: at, hash: txh('wtb' + no), st: st, wsbFee: r2(amt * d.cost.vsg.topupUsdt / 100) };
                if (st !== 'sent') b.ackAt = at; f.batches.push(b);
            }
            ids.forEach(function (i) { f.deps[i].sweep = sw.id; if (st) f.deps[i].batch = 'WTB-' + no; });
        }
        mk([0, 1], 'received', '2026-11-05 18:00', '20261105-01'); mk([2], 'received', '2026-11-08 12:00', '20261108-01'); mk([3], 'received', '2026-11-12 14:00', '20261112-01');
        mk([4], 'received', '2026-11-19 17:00', '20261119-01'); mk([5], 'received', '2026-11-24 19:00', '20261124-01'); mk([6], 'sent', '2026-11-26 02:10', '20261126-01'); mk([7], null, '2026-11-26 04:52', '20261126-02');
        /* 资金余额：大钱包 = 已归集未划转；卡台 = Wasabi 已确认金额 − Wasabi 费；客户卡余额来自种子 cardBal */
        f.deps.forEach(function (x) {
            if (x.st === 'swept') f.master.bal += x.amt;
            if (x.st === 'received') f.plat.unalloc += x.amt * (1 - d.cost.vsg.topupUsdt / 100);
            if (x.st === 'loaded') { var s = sell(d, x.cust, prodOf(d, x.cust), 'topupUsdt').v; x.fee = r2(x.amt * s / 100); x.net = r2(x.amt - x.fee); x.loadAt = x.at.slice(0, 10); x.pool = x.cust === 'flash' ? '广告投放共享池' : ''; f.plat.fee += x.fee - x.amt * d.cost.vsg.topupUsdt / 100; }
        });
        f.master.bal += 42150.8; /* 大钱包历史留存 / 备付 */
        f.plat.fee = r2(f.plat.fee); f.master.bal = r2(f.master.bal); f.plat.unalloc = r2(f.plat.unalloc);
        /* 卡台余额恒等式：Wasabi 侧 Dingdang 卡台余额 = 客户卡余额合计 + 待分配 + 平台 USDT 充值费留存 */
        f.plat.bal = r2(sumCust(d) + f.plat.unalloc + f.plat.fee);
    }
    function prodOf(d, cid) { var c = custOf(d, cid); return c && c.products.length ? c.products[0] : 'vsg'; }
    function walletOf(d, cid) { return ((d.fund && d.fund.wallets) || []).filter(function (w) { return w.cust === cid; })[0] || null; }
    function dep(d, id) { return d.fund.deps.filter(function (x) { return x.id === id; })[0]; }
    function fundSum(d) {
        var f = d.fund, o = { pendSweep: 0, pendSweepN: 0, master: f.master.bal, inTransit: 0, plat: f.plat.bal, unalloc: f.plat.unalloc, feeKeep: f.plat.fee, toLoad: 0, toLoadN: 0, held: 0, heldN: 0, todayIn: 0, monthIn: 0, loadedM: 0, custBal: 0, confirming: 0 };
        var td = now().slice(0, 10);
        f.deps.forEach(function (x) {
            if (x.st === 'arrived') { o.pendSweep += x.amt; o.pendSweepN++; }
            if (x.st === 'confirming') o.confirming += x.amt;
            if (x.st === 'sent') o.inTransit += x.amt;
            if (x.st === 'received') { o.toLoad += x.amt; o.toLoadN++; }
            if (x.st === 'held') { o.held += x.amt; o.heldN++; }
            if (x.st !== 'refunded' && x.at.slice(0, 10) === td) o.todayIn += x.amt;
            if (x.st !== 'refunded' && x.at.slice(0, 7) === td.slice(0, 7)) o.monthIn += x.amt;
            if (x.st === 'loaded' && x.at.slice(0, 7) === td.slice(0, 7)) o.loadedM += x.net || 0;
        });
        d.customers.forEach(function (c) { o.custBal += +c.cardBal || 0; });
        return o;
    }
    /* 把已分配金额同步到客户 Web 端资金池（同浏览器 localStorage 演示联动） */
    var POOL_KEY = 'dd-card-pools-v1', PRATE = { EUR: 1, USD: 0.92, GBP: 1.17, CNY: 0.13 };
    function creditPool(poolId, usd, note) {
        try {
            var l = JSON.parse(localStorage.getItem(POOL_KEY)); if (!Array.isArray(l)) return null;
            var p = l.filter(function (x) { return x.id === poolId; })[0]; if (!p) return null;
            var v = r2(usd * PRATE.USD / (PRATE[p.cur] || 1)); p.bal = r2(p.bal + v); localStorage.setItem(POOL_KEY, JSON.stringify(l));
            var all = JSON.parse(localStorage.getItem(POOL_KEY + '-log') || '{}'); all[poolId] = all[poolId] || [];
            all[poolId].unshift({ t: now(), type: 'USDT 充值入池', amt: v, note: note }); localStorage.setItem(POOL_KEY + '-log', JSON.stringify(all));
            return { pool: p.name, cur: p.cur, v: v };
        } catch (e) { return null; }
    }
    /* ---- 链路动作（均返回 {ok,msg}） ---- */
    function kytLevel(s) { return s >= 70 ? ['高风险', 'text-red-500'] : (s >= 40 ? ['中风险', 'text-orange-500'] : ['低风险', 'text-green-600']); }
    function fConfirm(d, id) {
        var x = dep(d, id); if (!x || x.st !== 'confirming') return { ok: false, msg: '该笔入金不在确认中' };
        x.conf = d.fund.conf; var c = custOf(d, x.cust);
        if (x.kyt >= d.fund.auto.kytHold) { x.st = 'held'; x.hold = 'KYT 风险分 ' + x.kyt + ' ≥ 拦截阈值 ' + d.fund.auto.kytHold; }
        else if (c && c.status === 'off' && c.mode === 'freeze') { x.st = 'held'; x.hold = '客户虚拟卡功能已冻结，入金暂挂待处理'; }
        else x.st = 'arrived';
        log(d, x.st === 'held' ? '入金风控拦截' : '入金到账', c ? c.name : x.cust, x.id + ' · ' + fmtU(x.amt) + (x.hold ? ' · ' + x.hold : ''), '系统');
        return { ok: true, msg: x.st === 'held' ? '已到账但被风控拦截：' + x.hold : '已到账 ' + fmtU(x.amt) };
    }
    function fSweep(d, ids) {
        var f = d.fund, list = (ids || f.deps.filter(function (x) { return x.st === 'arrived'; }).map(function (x) { return x.id; })).map(function (i) { return dep(d, i); }).filter(function (x) { return x && x.st === 'arrived'; });
        if (!list.length) return { ok: false, msg: '没有待归集的入金' };
        var gas = 13.4 * list.length; if (f.master.trx - gas < f.auto.trxReserve) return { ok: false, msg: '大钱包 TRX 能量不足（需保留 ' + f.auto.trxReserve + ' TRX），请先补充' };
        var amt = 0, sid = 'SWP-' + now().slice(0, 10).replace(/-/g, '') + '-' + String(f.sweeps.length + 1).padStart(2, '0');
        list.forEach(function (x) { amt += x.amt; x.st = 'swept'; x.sweep = sid; });
        f.sweeps.unshift({ id: sid, deps: list.map(function (x) { return x.id; }), amt: amt, at: now(), hash: txh(sid), gas: gas });
        f.master.bal = r2(f.master.bal + amt); f.master.trx = r2(f.master.trx - gas);
        log(d, '归集至大钱包', sid, list.length + ' 笔 · ' + fmtU(amt) + ' · 消耗 ' + gas.toFixed(1) + ' TRX');
        return { ok: true, msg: '已归集 ' + list.length + ' 笔，共 ' + fmtU(amt), id: sid };
    }
    function fTransfer(d, ids) {
        var f = d.fund, list = (ids || f.deps.filter(function (x) { return x.st === 'swept'; }).map(function (x) { return x.id; })).map(function (i) { return dep(d, i); }).filter(function (x) { return x && x.st === 'swept'; });
        if (!list.length) return { ok: false, msg: '没有已归集待划转的入金' };
        var amt = 0; list.forEach(function (x) { amt += x.amt; });
        if (amt > f.master.bal + 1e-6) return { ok: false, msg: '大钱包余额不足' };
        var bid = 'WTB-' + now().slice(0, 10).replace(/-/g, '') + '-' + String(f.batches.length + 1).padStart(2, '0');
        list.forEach(function (x) { x.st = 'sent'; x.batch = bid; });
        f.batches.unshift({ id: bid, deps: list.map(function (x) { return x.id; }), amt: amt, at: now(), hash: txh(bid), st: 'sent', wsbFee: r2(amt * d.cost.vsg.topupUsdt / 100) });
        f.master.bal = r2(f.master.bal - amt);
        log(d, '发起 Wasabi 充值', bid, list.length + ' 笔 · ' + fmtU(amt) + ' 划转至 Wasabi 专属充值钱包');
        return { ok: true, msg: '已向 WasabiCard 专属钱包划转 ' + fmtU(amt), id: bid };
    }
    function fAck(d, bid) {
        var f = d.fund, b = f.batches.filter(function (x) { return x.id === bid; })[0]; if (!b || b.st !== 'sent') return { ok: false, msg: '批次状态不可确认' };
        b.st = 'received'; b.ackAt = now(); f.plat.bal = r2(f.plat.bal + b.amt - b.wsbFee); f.plat.unalloc = r2(f.plat.unalloc + b.amt - b.wsbFee);
        b.deps.forEach(function (i) { var x = dep(d, i); if (x && x.st === 'sent') x.st = 'received'; });
        log(d, 'Wasabi 确认到账', bid, fmtU(b.amt) + '，Wasabi 扣 USDT 充值费 ' + money(b.wsbFee) + '，Dingdang 卡台余额 +' + money(b.amt - b.wsbFee));
        return { ok: true, msg: 'Wasabi 已确认到账，卡台余额 +' + money(b.amt - b.wsbFee) };
    }
    function fLoad(d, id) {
        var f = d.fund, x = dep(d, id); if (!x || x.st !== 'received') return { ok: false, msg: '该笔尚未在 Wasabi 到账' };
        var c = custOf(d, x.cust), s = sell(d, x.cust, prodOf(d, x.cust), 'topupUsdt').v;
        x.fee = r2(x.amt * s / 100); x.net = r2(x.amt - x.fee); x.st = 'loaded'; x.loadAt = now();
        c.cardBal = r2((+c.cardBal || 0) + x.net); var wc = x.amt * d.cost.vsg.topupUsdt / 100; f.plat.fee = r2(f.plat.fee + x.fee - wc); f.plat.unalloc = r2(f.plat.unalloc - (x.amt - wc));
        var pr = c.defPool ? creditPool(c.defPool, x.net, x.id + ' · ' + fmtU(x.amt) + ' 扣充值费 ' + money(x.fee)) : null;
        if (pr) x.pool = pr.pool;
        log(d, '分配入卡资金池', c.name, x.id + ' · 到账 ' + money(x.net) + '（充值费 ' + s.toFixed(2) + '% = ' + money(x.fee) + '）' + (pr ? ' → Web 端资金池「' + pr.pool + '」' : ''));
        return { ok: true, msg: '已为「' + c.name + '」入池 ' + money(x.net) + (pr ? '，Web 端「' + pr.pool + '」余额已更新' : '') };
    }
    function sumCust(d) { var s = 0; d.customers.forEach(function (c) { s += +c.cardBal || 0; }); return s; }
    function fRelease(d, id, how, note) {
        var x = dep(d, id); if (!x || x.st !== 'held') return { ok: false, msg: '该笔不在拦截状态' };
        x.st = how === 'refund' ? 'refunded' : 'arrived'; x.review = { how: how, note: note, at: now() };
        log(d, how === 'refund' ? '入金原路退回' : '入金放行', (custOf(d, x.cust) || {}).name || x.cust, x.id + ' · ' + fmtU(x.amt) + ' · ' + note);
        return { ok: true, msg: how === 'refund' ? '已发起原路退回' : '已放行，进入待归集' };
    }
    /* 客户端：模拟一笔转入 */
    function simDeposit(entId, amt) {
        var d = load(), w = walletOf(d, entId); if (!w) return { ok: false, msg: '尚未生成专属充值地址' };
        if (!(amt >= d.fund.minDep)) return { ok: false, msg: '单笔最低 ' + d.fund.minDep + ' USDT' };
        var id = 'DEP-' + now().slice(0, 10).replace(/-/g, '') + '-' + String(d.fund.deps.length + 1).padStart(3, '0');
        d.fund.deps.unshift({ id: id, cust: entId, amt: amt, at: now(), st: 'confirming', from: 'TCli…' + id.slice(-3) + 'x', to: w.addr, hash: txh(id), conf: 3, kyt: 8 + Math.round(hash(id) * 20) });
        log(d, '客户入金', (custOf(d, entId) || {}).name || entId, id + ' · ' + fmtU(amt) + ' 链上确认中', '客户 Web 端');
        if (d.fund.auto.confirm) fConfirm(d, id);
        if (d.fund.auto.sweep && dep(d, id).st === 'arrived' && amt >= d.fund.auto.sweepMin) fSweep(d, [id]);
        save(d); return { ok: true, id: id, st: dep(d, id).st };
    }
    function genWallet(d, cid) {
        var w = walletOf(d, cid); if (w) return w;
        w = { cust: cid, addr: addr('dep-' + cid + '-' + Date.now()), created: now().slice(0, 10), st: 'active' }; d.fund.wallets.push(w); return w;
    }
    function fmtU(v) { return (+v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT'; }

    /* ---------- XGD 账户服务：用量 / 成本 / 卖价（三层模型同卡费） ---------- */
    function xgAccounts(d) { return d.customers.filter(function (c) { return c.xgd && c.xgd.st === 'active'; }).length; }
    function xgUsage(d, custId) {
        var c = custOf(d, custId); if (!c) return null;
        var scale = (c.scale && (c.scale.vsg || 0) + (c.scale.vus || 0) + (c.scale.psg || 0)) || 80000;
        var h = 0; for (var i = 0; i < c.id.length; i++) h = (h * 31 + c.id.charCodeAt(i)) % 997;
        var act = c.xgd && c.xgd.st === 'active';
        var cm = now().slice(0, 7);
        return {
            newAccts: act && (c.xgd.at || '').slice(0, 7) === cm ? 1 : 0,
            acctsA: act && c.xgd.plan === 'A' ? 1 : 0,
            acctsB: act && c.xgd.plan === 'B' ? 1 : 0,
            extraIbans: act ? h % 3 : 0,
            sepaInVol: Math.round(scale * 0.5), sepaOutN: 15 + h % 60,
            swiftInVol: Math.round(scale * 0.12), swiftOutN: h % 7,
            cnyVol: Math.round(scale * 0.3), walletVol: Math.round(scale * 0.18)
        };
    }
    function xgCost(d, k) {
        var it = d.xgdItems.filter(function (x) { return x.k === k; })[0];
        if (!it) return 0;
        if (it.k === 'openFee') { /* 按累计账户数取阶梯 */
            var n = xgAccounts(d) + 1, t = d.xgd.planA.open.filter(function (x) { return n >= x.from && (!x.to || n <= x.to); })[0];
            return t ? t.fee : 0;
        }
        if (it.k === 'monthlyB') {
            var nb = d.customers.filter(function (c) { return c.xgd && c.xgd.st === 'active' && c.xgd.plan === 'B'; }).length + 1;
            var tb = d.xgd.planB.monthly.filter(function (x) { return nb >= x.from && (!x.to || nb <= x.to); })[0];
            return tb ? tb.fee : d.xgdItems.filter(function (x) { return x.k === 'monthlyB'; })[0].cost;
        }
        return it.cost;
    }
    function xgSell(d, custId, k) {
        var c = custId ? custOf(d, custId) : null;
        if (c && c.xgdOvr && c.xgdOvr[k] != null) return { v: +c.xgdOvr[k], own: true };
        return { v: +d.xgdSell[k], own: false };
    }
    /* 报价单表单保存后回写计费项成本 */
    function xgApplyQuote(d) { d.xgdItems = xgdSyncCost(d.xgd, d.xgdItems, xgAccounts(d) + 1); }

    /* ---------- 客户端接口（只读开通状态，不暴露费率） ---------- */
    function forEnt(entId) {
        var d = load(), c = custOf(d, entId);
        var iss = { name: SUPPLIER.name, scheme: 'Visa / Mastercard', region: '新加坡 / 美国' };
        if (!c) return { status: 'none', maxCards: 50, issuer: iss, price: { topupPct: d.base.vsg.topupUsd } };
        var p0 = c.products[0] || 'vsg', w = walletOf(d, c.id);
        return { status: c.status, mode: c.mode, reason: c.reason, maxCards: c.maxCards, applied: c.applied, products: c.products.slice(), issuer: iss, price: { topupPct: sell(d, c.id, p0, 'topupUsd').v, usdtPct: sell(d, c.id, p0, 'topupUsdt').v },
            xgd: c.xgd || null, wsb: c.wsb || null, defPool: c.defPool || '', wallet: w ? { addr: w.addr, st: w.st, chain: d.fund.chain, min: d.fund.minDep } : null,
            deps: d.fund.deps.filter(function (x) { return x.cust === c.id; }).slice(0, 20).map(function (x) { return { id: x.id, amt: x.amt, at: x.at, st: x.st, label: FST[x.st][0], net: x.net, hash: x.hash, pool: x.pool }; }) };
    }
    function apply(entId, entName, note) {
        var d = load(), c = custOf(d, entId);
        if (!c) { c = { id: entId, name: entName, country: '—', mgr: '待分配', status: 'none', products: [], maxCards: 50, since: '', ovr: {}, scale: {}, xgd: { st: 'none' }, wsb: { st: 'none' } }; d.customers.push(c); }
        c.status = 'pending'; c.applied = now().slice(0, 10); c.applyNote = note || '';
        log(d, '客户申请开通', c.name, note || '', '客户 Web 端');
        save(d);
    }
    function customer(id) { return custOf(load(), id); }
    function fmtRate(it, v) { if (v == null || v === '') return '—'; v = +v; return it.unit === 'pct' ? v.toFixed(2) + '%' : '$' + v.toFixed(2); }
    function money(v) { var n = +v || 0; return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    return {
        KEY: KEY, ITEMS: ITEMS, MONTHS: MONTHS, COST_NOTE: COST_NOTE, FST: FST,
        fund: { sum: fundSum, confirm: fConfirm, sweep: fSweep, transfer: fTransfer, ack: fAck, load: fLoad, release: fRelease, wallet: walletOf, genWallet: genWallet, dep: dep, kyt: kytLevel, prodOf: prodOf, creditPool: creditPool },
        simDeposit: simDeposit, fmtU: fmtU, addr: addr, txh: txh,
        load: load, save: save, log: log, reset: function () { MCACHE = {}; save(seed()); },
        cust: custOf, item: item, applies: applies, sell: sell, costOf: costOf, tierRate: tierRate, platformSpend: platformSpend,
        usage: usage, billLines: billLines, billCust: billCust, monthBill: monthBill, supplierCost: supplierCost, supplierSplit: supplierSplit, belowCost: belowCost,
        forEnt: forEnt, apply: apply, customer: customer, fmtRate: fmtRate, money: money,
        XGD_ITEMS: XGD_ITEMS, xgAccounts: xgAccounts, xgUsage: xgUsage, xgCost: xgCost, xgSell: xgSell, xgApplyQuote: xgApplyQuote
    };
})();
