/* DDCardHub 卡中台共享数据层 v2
 * 供应商：WasabiCard（CAAS 发卡即服务，报价单《CAAS_Pricing - 欧洲采买》）
 * 三层费率：供应商成本 cost → 平台基础卖价 base → 客户单独卖价 ovr（未设置则跟随基础）
 * 后台 admin/card-pricing.html（报价与定价）、admin/card-recon.html（对账）写入/读取
 * 客户端 cards.html / store.js 只读取：当前主体虚拟卡开通状态（不展示费率）*/
window.DDCardHub = (function () {
    var KEY = 'dd-cardhub-v2';
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
        { id: 'flash', name: 'Flash Commerce S.r.l.', country: '意大利', mgr: '王敏', status: 'on', products: ['vsg', 'vus'], maxCards: 100, since: '2026-09-12', ovr: { vus: { dispute: 50 } }, scale: { vsg: 180e3, vus: 1.2e6 } },
        { id: 'fast', name: 'Fast Discount S.r.l.', country: '意大利', mgr: '王敏', status: 'on', products: ['vsg'], maxCards: 50, since: '2026-10-03', ovr: { vsg: { decline: 0.6, issue: 3.5 } }, scale: { vsg: 65e3 } },
        { id: 'goden', name: 'Goden S.r.l.', country: '意大利', mgr: '王敏', status: 'none', products: [], maxCards: 50, since: '', ovr: {}, scale: {} },
        { id: 'mila', name: 'Mila Fashion GmbH', country: '德国', mgr: '陈思远', status: 'on', products: ['vsg', 'psg'], maxCards: 300, since: '2026-06-20', ovr: { vsg: { topupUsd: 0.3, issue: 2, cashback: 1.2 }, psg: { issue: 20 } }, scale: { vsg: 420e3, psg: 260e3 } },
        { id: 'lumen', name: 'Lumen Digital Ltd', country: '英国', mgr: '陈思远', status: 'off', mode: 'freeze', reason: '风控复核：近 30 天拒付率 1.8%，超过 1% 阈值', offAt: '2026-11-08', products: ['vus'], maxCards: 100, since: '2026-08-08', ovr: {}, scale: { vus: 900e3 } },
        { id: 'lys', name: 'Maison Lys SAS', country: '法国', mgr: '李娜', status: 'pending', applied: '2026-11-21', applyNote: '广告投放（Meta / Google）；预计月消费 $150,000；20 张卡', products: [], maxCards: 50, since: '', ovr: {}, scale: {} },
        { id: 'dragon', name: 'Dragon Gate Trading Ltd', country: '中国香港', mgr: '李娜', status: 'on', products: ['vsg', 'vus', 'psg'], maxCards: 200, since: '2026-07-15', ovr: { vus: { xborder: 1.0, cashback: 1.4 } }, scale: { vsg: 310e3, vus: 2.6e6, psg: 1.1e6 } }
    ];
    var MONTHS = [
        { id: '2026-09', label: '2026 年 9 月', f: 0.88, closed: true },
        { id: '2026-10', label: '2026 年 10 月', f: 1.0, closed: true },
        { id: '2026-11', label: '2026 年 11 月', f: 0.94, closed: false, note: '截至 11-25，未结账' }
    ];

    function seed() {
        var d = { supplier: cp(SUPPLIER), products: cp(PRODUCTS), cost: cp(COST), base: cp(BASE), customers: cp(CUSTOMERS), recon: {}, supBill: {}, log: [] };
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
        d.log = [
            { t: '2026-11-08 16:20', act: '下线虚拟卡', target: 'Lumen Digital Ltd', detail: '冻结全部卡：风控复核，近 30 天拒付率 1.8%', who: '陈思远' },
            { t: '2026-11-03 10:05', act: '导入供应商报价', target: 'WasabiCard v2026.11', detail: '依据《CAAS_Pricing - 欧洲采买》更新 3 个卡种成本', who: '卡中台运营' },
            { t: '2026-10-21 14:32', act: '客户单独定价', target: 'Dragon Gate Trading Ltd', detail: '美国媒体投放虚拟卡：跨境交易费 1.20% → 1.00%，返现 1.20% → 1.40%', who: '李娜' }
        ];
        return d;
    }
    function load() {
        try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.customers && d.cost && d.base) return d; } catch (e) {}
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

    /* ---------- 客户端接口（只读开通状态，不暴露费率） ---------- */
    function forEnt(entId) {
        var d = load(), c = custOf(d, entId);
        var iss = { name: SUPPLIER.name, scheme: 'Visa / Mastercard', region: '新加坡 / 美国' };
        if (!c) return { status: 'none', maxCards: 50, issuer: iss, price: { topupPct: d.base.vsg.topupUsd } };
        var p0 = c.products[0] || 'vsg';
        return { status: c.status, mode: c.mode, reason: c.reason, maxCards: c.maxCards, applied: c.applied, products: c.products.slice(), issuer: iss, price: { topupPct: sell(d, c.id, p0, 'topupUsd').v } };
    }
    function apply(entId, entName, note) {
        var d = load(), c = custOf(d, entId);
        if (!c) { c = { id: entId, name: entName, country: '—', mgr: '待分配', status: 'none', products: [], maxCards: 50, since: '', ovr: {}, scale: {} }; d.customers.push(c); }
        c.status = 'pending'; c.applied = now().slice(0, 10); c.applyNote = note || '';
        log(d, '客户申请开通', c.name, note || '', '客户 Web 端');
        save(d);
    }
    function customer(id) { return custOf(load(), id); }
    function fmtRate(it, v) { if (v == null || v === '') return '—'; v = +v; return it.unit === 'pct' ? v.toFixed(2) + '%' : '$' + v.toFixed(2); }
    function money(v) { var n = +v || 0; return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    return {
        KEY: KEY, ITEMS: ITEMS, MONTHS: MONTHS, COST_NOTE: COST_NOTE,
        load: load, save: save, log: log, reset: function () { MCACHE = {}; save(seed()); },
        cust: custOf, item: item, applies: applies, sell: sell, costOf: costOf, tierRate: tierRate, platformSpend: platformSpend,
        usage: usage, billLines: billLines, billCust: billCust, monthBill: monthBill, supplierCost: supplierCost, supplierSplit: supplierSplit, belowCost: belowCost,
        forEnt: forEnt, apply: apply, customer: customer, fmtRate: fmtRate, money: money
    };
})();
