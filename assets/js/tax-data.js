/* 共享税务数据（Web 税务申报页 + App 端共用，演示版纯前端）
 * DDTaxData.ledSeed()  税务局账户台账种子（含真实缴款/预缴/留抵记录）
 * DDTaxData.deadlines  各国 VAT 申报截止日
 * DDTaxData.names      国家名称
 */
(function () {
  if (window.DDTaxData) return;
  function ledSeed() {
    var d = {};
    function S(entries) { return entries; }
    d.IT = S([
        { date: '2026-01-05', item: '上年留抵结转（IVA credito）', in: 8600, out: 0 },
        { date: '2026-04-16', item: '2026 Q1 VAT 缴款（F24）', in: 0, out: 41250 },
        { date: '2026-06-20', item: 'IRES/IRAP 第一期预缴（Acconto）', in: 42000, out: 0 },
        { date: '2026-07-16', item: '2026 Q2 VAT 缴款（F24）', in: 0, out: 39800 },
        { date: '2026-09-30', item: '进口 VAT 退税到账', in: 5120, out: 0 }
    ]);
    d.DE = S([
        { date: '2026-01-10', item: '上年留抵结转（Vorsteuerüberhang）', in: 3200, out: 0 },
        { date: '2026-04-10', item: '2026-03 UStVA 缴款（Lastschrift）', in: 0, out: 11800 },
        { date: '2026-06-10', item: 'KSt 季度预缴（Vorauszahlung）', in: 9600, out: 0 },
        { date: '2026-10-10', item: '2026-09 UStVA 缴款（Lastschrift）', in: 0, out: 12400 }
    ]);
    d.FR = S([
        { date: '2026-01-15', item: '上年留抵结转（crédit de TVA）', in: 8420, out: 0 },
        { date: '2026-04-17', item: '2026-03 CA3 缴款', in: 0, out: 15600 },
        { date: '2026-06-15', item: 'IS 预缴（Acompte IS）', in: 18500, out: 0 },
        { date: '2026-10-19', item: '2026-09 CA3 缴款', in: 0, out: 14900 }
    ]);
    d.UK = S([
        { date: '2026-01-07', item: 'VAT 留抵结转（HMRC 账户）', in: 2150, out: 0 },
        { date: '2026-05-07', item: '2026 Q1 VAT Return 缴款（Direct Debit）', in: 0, out: 9420 },
        { date: '2026-07-01', item: 'Corporation Tax 预缴', in: 11000, out: 0 },
        { date: '2026-08-07', item: '2026 Q2 VAT Return 缴款（Direct Debit）', in: 0, out: 9880 }
    ]);
    d.AT = S([
        { date: '2026-02-15', item: '上年留抵结转（Vorsteuerguthaben）', in: 1980, out: 0 },
        { date: '2026-05-15', item: '2026-04 UStVA 缴款', in: 0, out: 6240 },
        { date: '2026-06-30', item: 'KSt 季度预缴', in: 7200, out: 0 },
        { date: '2026-08-15', item: '2026-07 UStVA 缴款', in: 0, out: 6580 }
    ]);
    d.IE = S([
        { date: '2026-01-23', item: '上年留抵结转（VAT credit）', in: 2640, out: 0 },
        { date: '2026-03-23', item: '2026-01/02 VAT 3 缴款（ROS）', in: 0, out: 7320 },
        { date: '2026-07-23', item: '2026-05/06 VAT 3 缴款（ROS）', in: 0, out: 7650 },
        { date: '2026-09-01', item: 'CT1 预缴（Preliminary Tax）', in: 9800, out: 0 }
    ]);
    return d;
}
  var deadlines = [
    { code: 'DE', d: '2026-11-10' }, { code: 'AT', d: '2026-11-15' }, { code: 'IT', d: '2026-11-16' },
    { code: 'FR', d: '2026-11-17' }, { code: 'IE', d: '2026-11-23' }, { code: 'UK', d: '2026-12-07' }
  ];
  var names = { IT: '意大利', DE: '德国', FR: '法国', UK: '英国', AT: '奥地利', IE: '爱尔兰' };
  window.DDTaxData = { ledSeed: ledSeed, deadlines: deadlines, names: names };
  /* 兼容：税务申报页仍可用 window.tfLedSeed */
  if (!window.tfLedSeed) window.tfLedSeed = ledSeed;
})();
