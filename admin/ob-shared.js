/* 叮当支付后台 · 开户管理共享模块（对标 BilinkPay 开户管理，Equals → Sokin）
   数据存 localStorage 'dd-admin-ob-v1'，个人/商业两套申请共用一套审核流。 */
window.DDOb = (function () {
  var KEY = 'dd-admin-ob-v2';

  /* 表格取消横滑：固定布局 + 自动换行 + 紧凑留白，页面可整体缩放展示全部列 */
  (function () {
    var st = document.createElement('style');
    st.textContent = '.ob-fit{overflow:visible!important}'
      + '.ob-fit table{table-layout:fixed;width:100%}'
      + '.ob-fit td,.ob-fit th{padding:10px 6px!important;word-break:break-word;font-size:12px}'
      + '.ob-fit td .whitespace-nowrap,.ob-fit td.whitespace-nowrap,.ob-fit span.whitespace-nowrap{white-space:normal!important}';
    document.head.appendChild(st);
  })();

  var MANAGERS = ['陈晓', 'Lisa Chen', 'Marco Rossi', '王梓楠', '胡飞燕'];
  var REVIEWERS = ['张明', '刘欣', 'Eva 温茜'];
  var SUPERVISORS = ['李主管', 'vivian'];

  /* 状态定义（与 BilinkPay 一致，Equals 换 Sokin） */
  var ST_PERSONAL = ['待管理员确认价格', '待预审', '已补件 · 待预审', '待主管终审', '退回补充资料', 'Sokin 草稿已创建｜待正式提交', '开户成功', '已驳回', '开户失败'];
  var ST_BUSINESS = ['待管理员确认价格', '待预审', '已补件 · 待预审', '退回补充资料', '已提交 Sokin｜待审核', 'Sokin 要求补件｜待客户补充', '开户成功', '开户失败', '已驳回'];

  var BADGE = {
    '待管理员确认价格': 'background:#F3F4F6;color:#4B5563',
    '待预审': 'background:#FEF3C7;color:#B45309',
    '已补件 · 待预审': 'background:#DBEAFE;color:#1D4ED8',
    '待主管终审': 'background:#EDE9FE;color:#6D28D9',
    '退回补充资料': 'background:#FFEDD5;color:#C2410C',
    'Sokin 草稿已创建｜待正式提交': 'background:#CFFAFE;color:#0E7490',
    '已提交 Sokin｜待审核': 'background:#CFFAFE;color:#0E7490',
    'Sokin 要求补件｜待客户补充': 'background:#FFEDD5;color:#C2410C',
    '开户成功': 'background:#DCFCE7;color:#15803D',
    '已驳回': 'background:#FEE2E2;color:#B91C1C',
    '开户失败': 'background:#7F1D1D;color:#FECACA'
  };

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }

  /* ---------------- 种子数据 ---------------- */
  function seedApps() {
    var P = [
      ['Muhammad Asad', 'IND-20261016-U9JSS8', 'assadmughal112@gmail.com', '7490891711', '客户自主提交', '', 'United Kingdom', '', '', 'DDKYC0013', '待管理员确认价格'],
      ['Demetris Serghides', 'IND-20260929-XLEKPX', 'd@serghides.net', '97989997', '客户自主提交', 'Felina 有 WhatsApp', 'Cyprus', '', '', 'DDKYC0015', '待管理员确认价格'],
      ['DanDan Wan', 'IND-20260910-4TNOA7', 'haopengyou2580@gmail.com', '+8615219520053', '客户自主提交', '自己人，在等护照', 'United Kingdom', '', 'Dave', 'DDKYC0007', '待预审'],
      ['Frederico Freitas', 'IND-20260818-R2NBJ1', 'atchidog@gmail.com', '+351912292996', '客户自主提交', '', 'Portugal', 'Lisa Chen', 'Dave', 'DDKYC0008', '已补件 · 待预审'],
      ['Muhammad Huzaifa', 'IND-20261006-70HKLB', 'huzaifasunny4658@gmail.com', '+447490901083', '客户自主提交', '', 'United Kingdom', '', 'Eva 温茜', 'DDKYC0012', '待主管终审'],
      ['Demetris Serghides', 'IND-20260924-SH2YGZ', 'd@serghides.net', '+35797989997', '客户自主提交', '', 'Cyprus', '', 'Eva 温茜', 'DDKYC0014', '待主管终审'],
      ['Mengna Ai', 'IND-20260921-PJAHQG', '956466248@qq.com', '66567141052', '客户经理代填', '', 'Austria', '胡飞燕', 'Eva 温茜', 'DDKYC0013', '退回补充资料', 'Eva 温茜', '2026-09-22 12:32'],
      ['Yong Hua', 'IND-20260920-0CHUZX', 'huayong7788@gmail.com', '7442072321', '客户自主提交', '', 'United Kingdom', '', 'Dave', 'DDKYC0010', '退回补充资料', 'Dave', '2026-09-22 13:18'],
      ['faran akhtar', 'IND-20260910-5LBRDO', 'faranakhtar111@gmail.com', '7877199507', '客户自主提交', '', 'United Kingdom', '', 'Dave', 'DDKYC0008', '退回补充资料', 'Dave', '2026-09-15 11:12'],
      ['Alhasan qraiqea', 'IND-20260917-G1TVVE', 'hassanqreaqa@gmail.com', '7537183824', '客户自主提交', '', 'United Kingdom', '', 'Dave', 'DDKYC0009', 'Sokin 草稿已创建｜待正式提交'],
      ['zhiyun sun', 'IND-20260908-RURCIU', 'zhiyunsun4@gmail.com', '+4915229011225', '客户经理代填', '', 'Germany', '刘欣', 'Dave', 'DDKYC0011', '开户成功'],
      ['junli xiao', 'IND-20260813-A9PD3U', 'shawshaw3579@gmail.com', '15560656995', '客户自主提交', '', 'Germany', '刘欣', '', 'DDKYC0006', '开户成功'],
      ['ZINAN WANG', 'IND-20260717-82YFXM', 'zinanw77@gmail.com', '+39 3895606799', '客户自主提交', '', 'Italy', '陈晓', '', 'DDKYC0002', '开户成功'],
      ['Samuel Pal', 'IND-20261005-MIIXGJ', 'matrixsam1992@inbox.eu', '773764583', '客户自主提交', '', 'Romania', '', '', 'DDKYC0016', '已驳回'],
      ['Jerry Van', 'IND-20260922-YIKNKI', 'haopengyou2580@gmail.com', '+975321754000', '客户自主提交', '', 'United Kingdom', '', 'Eva 温茜', 'DDKYC0011', '已驳回'],
      ['Samuel Pal', 'IND-20260919-LXRTNT', 'Bitstack1992@inbox.eu', '+40773764583', '客户自主提交', '', 'Romania', '', 'Eva 温茜', 'DDKYC0012', '开户失败']
    ];
    var B = [
      ['Stuffmovers limited', 'APP-20261015-YTGIJB', 'wailoon@live.co.uk', '+44 7437855020', '客户自主提交', '', 'United Kingdom', '', '', 'DDKYB0019', '待管理员确认价格'],
      ['CLAIRMONT LONDON LIMITED', 'APP-20261013-OWRXUS', 'clairmontldn@gmail.com', '+44 07786591196', '客户自主提交', 'nn', 'United Kingdom', '', 'Dave', 'DDKYB0018', '待预审'],
      ['NOVURA LTD', 'APP-20261009-ICFNGG', 'info@novura.ltd', '+44 447882742357', '客户自主提交', '未知渠道', 'United Kingdom', '', 'Dave', 'DDKYB0016', '已补件 · 待预审'],
      ['JENSTONE GLOBAL TRADING LTD', 'APP-20260921-ZATKV8', 'stone890214@gmail.com', '+44 447434960951', '客户自主提交', '福尔摩斯', 'United Kingdom', '', 'Eva 温茜', 'DDKYB0009', '已补件 · 待预审'],
      ['TRENDZ SERVICE LTD', 'APP-20260921-T5LDOH', 'chi.h.chan@trendzserviceltd.com', '+44 447756344520', '客户自主提交', 'kenny', 'United Kingdom', '', 'Eva 温茜', 'DDKYB0010', '退回补充资料', 'Eva 温茜', '2026-09-24 10:45'],
      ['Freshdrop Fashion Ltd', 'APP-20260918-3NPGYG', 'freshdropfashionltd@hotmail.com', '+44 447707300099', '客户自主提交', 'Nicholas', 'United Kingdom', '', 'Dave', 'DDKYB0006', '退回补充资料', 'Dave', '2026-09-25 07:09'],
      ['tl store', 'APP-20260916-GHINNL', 'tlstore94300@gmail.com', '+33 33767698852', '客户自主提交', '企微 tl', 'France', '', 'Eva 温茜', 'DDKYB0020', '退回补充资料', 'Eva 温茜', '2026-09-29 09:24'],
      ['SANTONICOLA ANTONIO', 'APP-20260911-NRDCLW', 'santonicola2026@outlook.it', '+39 393444196376', '客户自主提交', 'Ivan', 'Italy', 'Lisa Chen', 'Eva 温茜', 'DDKYB0018', '退回补充资料', 'Dave', '2026-09-25 07:43'],
      ['Richerboki Ltd', 'APP-20260825-LZW1QC', 'richerbokiltd@gmail.com', '+44 447410681499', '客户自主提交', '凯赛林郑雍客户', 'United Kingdom', '陈晓', 'Eva 温茜', 'DDKYB0004', 'Sokin 要求补件｜待客户补充'],
      ['ORBISPOINT LIMITED', 'APP-20261009-NDHY2M', 'orbispoint@gmail.com', '+44 447784643289', '客户自主提交', '漱石', 'United Kingdom', '', 'Eva 温茜', 'DDKYB0017', '已提交 Sokin｜待审核'],
      ['JENNYSSSJY LTD', 'APP-20260929-EGSCBJ', 'info.jennysssjy@gmail.com', '+44 447107327710', '客户自主提交', '福尔摩斯', 'United Kingdom', '', 'Eva 温茜', 'DDKYB0015', '已提交 Sokin｜待审核'],
      ['LANDS LUO LTD', 'APP-20260925-UYJUHD', 'landsluo6688@gmail.com', '+44 447729123888', '客户自主提交', '小太阳', 'United Kingdom', '', 'Eva 温茜', 'DDKYB0012', '已提交 Sokin｜待审核'],
      ['UNICO TRADE S.R.L.', 'APP-20260914-GC9XY2', 'unicotrade02@gmail.com', '+48 48729394519', '客户自主提交', '森森', 'Italy', '', 'Dave', 'DDKYB0019', '开户成功'],
      ['STORESBRIDGE LTD', 'APP-20260918-WMKM9B', 'storesbridgeltd@hotmail.com', '+44 447546788678', '客户自主提交', 'Nicholas', 'United Kingdom', '', 'Dave', 'DDKYB0007', '开户成功'],
      ['XIAOTAIYANG LTD', 'APP-20260925-ZG32OB', 'xiaotaiyang@gmail.com', '+44 447700900123', '客户自主提交', '', 'United Kingdom', '', 'Eva 温茜', 'DDKYB0013', '开户失败'],
      ['MARVAS 2025 EOOD', 'APP-20260820-DYJXEI', 'arinvelev@marvas.online', '+49 1621852010', '客户自主提交', '斯本贸易', 'Bulgaria', 'Lisa Chen', 'Dave', 'DDKYB0016', '退回补充资料', '李主管', '2026-09-09 04:15'],
      ['GOLDEN LUXURY S.R.L.', 'APP-20260905-HY2KQW', 'goldenlux@gmail.com', '+39 3312345678', '客户经理代填', '', 'Italy', 'Marco Rossi', '张明', 'DDKYB0021', '已驳回']
    ];
    function mk(row, type) {
      return {
        id: row[1], type: type, name: row[0], email: row[2], phone: row[3],
        source: row[4], note: row[5], country: row[6], manager: row[7], reviewer: row[8],
        code: row[9], status: row[10], suppBy: row[11] || '', suppAt: row[12] || '',
        ts: row[1].slice(4, 8) + '-' + row[1].slice(8, 10) + '-' + row[1].slice(10, 12) + ' 20:19'
      };
    }
    return P.map(function (r) { return mk(r, 'personal'); }).concat(B.map(function (r) { return mk(r, 'business'); }));
  }

  function seedLogs() {
    var L = [
      ['2026-10-10 13:50', 'Samuel Pal', 'IND-20261005-MIIXGJ', 'Individual', '预审核', '预审驳回', 'Lisa Chen', '预审驳回'],
      ['2026-10-10 10:53', 'Muhammad Huzaifa', 'IND-20261006-70HKLB', 'Individual', '预审核', '预审通过', 'Eva 温茜', '预审通过'],
      ['2026-09-30 06:29', 'Demetris Serghides', 'IND-20260924-SH2YGZ', 'Individual', '预审核', '预审通过', 'Eva 温茜', '预审通过'],
      ['2026-09-29 22:55', 'Alhasan qraiqea', 'IND-20260917-G1TVVE', 'Individual', '主管终审', '主管通过', '李主管', '主管通过'],
      ['2026-09-29 22:42', 'DanDan Wan', 'IND-20260910-4TNOA7', 'Individual', '主管终审', '退回补充资料', '李主管', '1. 非英国/欧盟住民，身份证明请提供英文证件，如护照 2. 声明与签名请使用英文'],
      ['2026-09-28 09:24', 'DanDan Wan', 'IND-20260910-4TNOA7', 'Individual', '预审核', '预审通过', 'Lisa Chen', '预审通过'],
      ['2026-09-22 13:18', 'Yong Hua', 'IND-20260920-0CHUZX', 'Individual', '预审核', '退回补充资料', 'Dave', '退回补充资料'],
      ['2026-09-22 12:36', 'Alhasan qraiqea', 'IND-20260917-G1TVVE', 'Individual', '预审核', '预审通过', 'Dave', '预审通过'],
      ['2026-09-22 12:32', 'Mengna Ai', 'IND-20260921-PJAHQG', 'Individual', '预审核', '退回补充资料', 'Eva 温茜', '退回补充资料'],
      ['2026-09-15 10:57', 'faran akhtar', 'IND-20260910-5LBRDO', 'Individual', '主管终审', '退回补充资料', '李主管', '非英国国籍 需要提供英国签证/居留证文件'],
      ['2026-09-11 10:43', 'zhiyun sun', 'IND-20260908-RURCIU', 'Individual', '主管终审', '主管通过', 'vivian', '主管通过'],
      ['2026-09-08 13:31', 'zhiyun sun', 'IND-20260908-RURCIU', 'Individual', '预审核', '退回补充资料', 'Dave', 'both sides of the residence card are required'],
      ['2026-10-12 12:13', 'ORBISPOINT LIMITED', 'APP-20261009-NDHY2M', 'Business', '主管终审', '主管通过', 'Lisa Chen', '主管通过'],
      ['2026-10-12 09:44', 'ORBISPOINT LIMITED', 'APP-20261009-NDHY2M', 'Business', '预审核', '预审通过', 'Eva 温茜', '预审通过'],
      ['2026-10-10 11:46', 'NOVURA LTD', 'APP-20261009-ICFNGG', 'Business', '预审核', '退回补充资料', 'Dave', '退回补充资料'],
      ['2026-10-09 10:58', 'STORESBRIDGE LTD', 'APP-20260918-WMKM9B', 'Business', '主管终审', '主管通过', 'Lisa Chen', '主管通过'],
      ['2026-10-02 09:32', 'STORESBRIDGE LTD', 'APP-20260918-WMKM9B', 'Business', '预审核', '预审通过', 'Dave', '预审通过'],
      ['2026-09-30 16:36', 'UNICO TRADE S.R.L.', 'APP-20260914-GC9XY2', 'Business', '主管终审', '主管通过', 'vivian', '主管通过'],
      ['2026-09-30 13:52', 'L H Redchurch Limited', 'APP-20260918-OHJVGC', 'Business', '主管终审', '主管通过', 'vivian', '主管通过'],
      ['2026-09-30 13:29', 'JENNYSSSJY LTD', 'APP-20260929-EGSCBJ', 'Business', '预审核', '预审通过', 'Eva 温茜', '预审通过'],
      ['2026-09-30 11:47', 'XIAOTAIYANG LTD', 'APP-20260925-ZG32OB', 'Business', '主管终审', '主管通过', 'vivian', '主管通过'],
      ['2026-09-22 07:06', 'GOLDEN LUXURY S.R.L.', 'APP-20260905-HY2KQW', 'Business', '预审核', '预审驳回', '张明', '预审驳回']
    ];
    return L.map(function (r) {
      return { time: r[0], name: r[1], id: r[2], ctype: r[3], atype: r[4], result: r[5], by: r[6], comment: r[7] };
    });
  }

  /* 商业归档文件模板（对标 BilinkPay KYB 文件清单） */
  var DOC_CATS_B = [
    ['Certificate of Incorporation', 1, 'IN01.pdf', '292 KB'],
    ['Register of Directors', 1, 'IN01.pdf', '292 KB'],
    ['Register of Shareholders', 1, 'IN01.pdf', '292 KB'],
    ['Ownership structure chart', 1, 'STRUCTURE.jpg', '31 KB'],
    ['Authorised signatory ID / passport', 1, 'PASSPORT.jpg', '5.8 MB'],
    ['Authorised Signatory & UBOs passport', 1, 'PASSPORT.jpg', '5.8 MB'],
    ['Authorised Signatory & UBOs proof of address', 1, 'Proof of Director Address.pdf', '90 KB'],
    ['Signatory proof of address', 1, 'Proof of Director Address.pdf', '90 KB'],
    ['Business Proof of Address', 1, 'Proof of Company Registered Address.pdf', '31 KB'],
    ['Proof of Trading Address (if applicable)', 0, 'Proof of Business Address.pdf', '16 KB'],
    ['Trade Documents', 0, 'Sales Invoice.pdf', '72 KB']
  ];
  var DOC_CATS_P = [
    ['Personal identity proof', 1, 'ID_front.jpg', '194 KB'],
    ['Residential address proof', 1, 'Statement.pdf', '64 KB'],
    ['Source of funds document', 0, 'CERTIFICATE_OF_INCOME_2025.pdf', '110 KB']
  ];

  function seedDocs(app) {
    var cats = app.type === 'business' ? DOC_CATS_B : DOC_CATS_P;
    var t = app.ts + ':26';
    return [{
      zone: '原始区', title: '首次开户提交材料', time: t, batch: 0,
      items: cats.map(function (c) {
        return { cat: c[0], req: !!c[1], files: [{ name: c[2], size: c[3], time: t, ver: '首次提交' }] };
      })
    }];
  }

  function seed() {
    var apps = seedApps();
    var data = { apps: apps, logs: seedLogs(), docs: {}, sync: {} };
    apps.forEach(function (a) { data.docs[a.id] = seedDocs(a); });
    return data;
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.apps && d.apps.length) return d;
    } catch (e) {}
    var d = seed(); localStorage.setItem(KEY, JSON.stringify(d)); return d;
  }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  /* ---------------- 工具 ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function badge(st) { return '<span class="px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap" style="' + (BADGE[st] || BADGE['待预审']) + '">' + esc(st) + '</span>'; }
  function now() { var d = new Date(); function p(n) { return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function apps(type) { return load().apps.filter(function (a) { return a.type === type; }); }
  function getApp(id) { return load().apps.filter(function (a) { return a.id === id; })[0]; }
  function upApp(id, fn) { var d = load(); var a = d.apps.filter(function (x) { return x.id === id; })[0]; if (a) { fn(a, d); save(d); } }
  function addLog(l) { var d = load(); d.logs.unshift(l); save(d); }
  function counts(list) {
    var m = {}; list.forEach(function (a) { m[a.status] = (m[a.status] || 0) + 1; }); return m;
  }
  function csv(filename, rows) {
    var s = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv' }));
    a.download = filename; a.click();
  }
  function staffOptions(list, cur) {
    return '<option value="">未分配</option>' + list.map(function (m) {
      return '<option' + (cur === m ? ' selected' : '') + '>' + esc(m) + '</option>';
    }).join('');
  }

  /* ---------------- 页面：审核工作台 ---------------- */
  function renderWorkbench(type, mount) {
    var q = '', chip = 'ALL', selected = {}, expanded = {};
    var _exp = new URLSearchParams(location.search).get('expand');
    if (_exp) expanded[_exp] = true;
    var isP = type === 'personal';
    var ST = isP ? ST_PERSONAL : ST_BUSINESS;

    function stats(list) {
      if (isP) return [
        ['个人开户申请', list.length], ['待预审', list.filter(function (a) { return a.status === '待预审'; }).length],
        ['待主管终审', list.filter(function (a) { return a.status === '待主管终审'; }).length],
        ['退回补充', list.filter(function (a) { return a.status === '退回补充资料'; }).length],
        ['SK / KYC 处理中', list.filter(function (a) { return a.status.indexOf('Sokin') === 0; }).length]
      ];
      return [
        ['商业申请总数', list.length], ['待预审', list.filter(function (a) { return a.status === '待预审' || a.status === '已补件 · 待预审'; }).length],
        ['需补资料', list.filter(function (a) { return a.status === '退回补充资料'; }).length]
      ];
    }

    function nextActions(a) {
      var h = '';
      if (a.status === 'Sokin 草稿已创建｜待正式提交') h += '<button class="text-xs font-bold text-white px-3 py-1.5 rounded-lg mb-1" style="background:#0E7490" data-act="submit-sk" data-id="' + a.id + '">最终提交 Sokin</button><br/>';
      if (a.status === '退回补充资料') h += '<span class="text-xs text-orange-500 font-bold block mb-1">条件不足</span>';
      if (a.status === '已驳回') h += '<span class="text-xs text-red-500 font-bold block mb-1">驳回</span>';
      if (a.status === '待主管终审') h += '<span class="text-xs text-purple-600 font-bold block mb-1">待主管终审</span>';
      h += '<button class="text-xs font-bold text-accent2 hover:underline" data-act="rereview" data-id="' + a.id + '">重新审核</button><br/>';
      h += '<button class="text-xs font-bold text-accent2 hover:underline" data-act="detail" data-id="' + a.id + '">查看详情</button>';
      return h;
    }

    function row(a) {
      var ck = selected[a.id] ? 'checked' : '';
      return '<tr class="border-b border-gray-50 hover:bg-gray-50/60 align-top">'
        + '<td class="px-3 py-4"><input type="checkbox" class="w-4 h-4 accent-[#382b1b]" data-ck="' + a.id + '" ' + ck + '/></td>'
        + '<td class="px-3 py-4"><button class="text-left font-bold text-accent2 hover:underline" data-act="progress" data-id="' + a.id + '">' + esc(a.name) + ' <span class="text-[10px] text-gray-400">' + (expanded[a.id] ? '\u25B2' : '\u25BC') + '</span></button><p class="text-xs text-gray-400 font-mono mt-0.5">' + a.id + '</p><p class="text-xs text-gray-400 mt-0.5">' + esc(a.email) + ' / ' + esc(a.phone) + '</p><span class="inline-block mt-1 px-2 py-0.5 rounded text-[11px] ' + (a.source === '客户经理代填' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500') + '">' + a.source + '</span></td>'
        + '<td class="px-3 py-4 text-sm">' + (a.note ? '<p class="text-gray-600 text-xs mb-1">' + esc(a.note) + '</p>' : '<p class="text-gray-300 text-xs mb-1">—</p>') + '<button class="text-xs text-accent2 hover:underline" data-act="note" data-id="' + a.id + '">编辑备注</button></td>'
        + '<td class="px-3 py-4 text-sm text-gray-600">' + esc(a.country) + '</td>'
        + '<td class="px-3 py-4 text-sm">' + (a.manager ? '<span class="text-gray-700">' + esc(a.manager) + '</span>' : '<span class="text-gray-400">未分配</span>') + '<br/><button class="text-xs text-accent2 hover:underline" data-act="manager" data-id="' + a.id + '">分配客户经理</button></td>'
        + '<td class="px-3 py-4 text-sm">' + (a.reviewer ? '<span class="text-gray-700">' + esc(a.reviewer) + '</span>' : '<span class="text-gray-400">未分配</span>') + '<br/><button class="text-xs text-accent2 hover:underline" data-act="reviewer" data-id="' + a.id + '">分配预审员</button></td>'
        + '<td class="px-3 py-4 text-xs font-mono text-gray-500">' + esc(a.code) + '</td>'
        + '<td class="px-3 py-4">' + badge(a.status) + (a.suppBy ? '<p class="text-[11px] text-gray-400 mt-1">预审补件发起：' + esc(a.suppBy) + '<br/>' + esc(a.suppAt) + '</p>' : '') + '</td>'
        + '<td class="px-3 py-4 whitespace-nowrap">' + nextActions(a) + '</td>'
        + '<td class="px-3 py-4"><button class="px-4 py-2 rounded-lg text-xs font-bold text-white" style="background:#0088B3" data-act="review" data-id="' + a.id + '">审核</button></td>'
        + '</tr>' + (expanded[a.id] ? progressRow(a) : '');
    }

    function progressRow(a) {
      var d = load();
      var myLogs = d.logs.filter(function (l) { return l.id === a.id; });
      var steps = isP
        ? ['提交申请', '确认价格方案', '预审', '主管终审', 'Sokin KYC', '开户结果']
        : ['提交申请', '确认价格方案', '预审', '提交 Sokin', 'Sokin 审核', '开户结果'];
      var st = a.status, cur = 1, warn = -1, failed = -1, doneAll = false;
      if (st === '待管理员确认价格') cur = 1;
      else if (st === '待预审' || st === '已补件 · 待预审') cur = 2;
      else if (st === '退回补充资料') { cur = 2; warn = 2; }
      else if (st === '待主管终审') cur = 3;
      else if (st.indexOf('Sokin 草稿') === 0 || st.indexOf('已提交 Sokin') === 0) cur = 4;
      else if (st.indexOf('Sokin 要求补件') === 0) { cur = 4; warn = 4; }
      else if (st === '开户成功') doneAll = true;
      else if (st === '开户失败' || st === '已驳回') { cur = steps.length - 1; failed = steps.length - 1; }
      function lastTime(at) { var l = myLogs.filter(function (x) { return x.atype === at; })[0]; return l ? l.time : ''; }
      var times = [a.ts, lastTime('价格方案'), lastTime('预审核'), lastTime('主管终审'), (d.sync[a.id] || {}).syncAt || '', ''];
      var stepHtml = steps.map(function (sp, i) {
        var state = doneAll || i < cur ? 'done' : (i === cur ? (failed === i ? 'failed' : (warn === i ? 'warn' : 'cur')) : 'todo');
        var dot = state === 'done' ? '<span class="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[11px] font-bold">✓</span>'
          : state === 'cur' ? '<span class="w-6 h-6 rounded-full text-dark flex items-center justify-center text-[11px] font-extrabold" style="background:#FFD008;box-shadow:0 0 0 4px rgba(255,208,8,.3)">' + (i + 1) + '</span>'
          : state === 'warn' ? '<span class="w-6 h-6 rounded-full bg-orange-400 text-white flex items-center justify-center text-[11px] font-bold">!</span>'
          : state === 'failed' ? '<span class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[11px] font-bold">✕</span>'
          : '<span class="w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-[11px] font-bold">' + (i + 1) + '</span>';
        var line = i < steps.length - 1 ? '<span class="flex-1 h-0.5 mx-1 mt-3 ' + (doneAll || i < cur ? 'bg-green-400' : 'bg-gray-200') + '"></span>' : '';
        return '<div class="flex items-start flex-1 min-w-0"><div class="flex flex-col items-center text-center w-20 flex-none">' + dot
          + '<p class="text-xs font-bold mt-1.5 ' + (state === 'todo' ? 'text-gray-400' : 'text-dark') + '">' + sp + '</p>'
          + (times[i] ? '<p class="text-[10px] text-gray-400 mt-0.5">' + esc(times[i]) + '</p>' : '')
          + '</div>' + line + '</div>';
      }).join('');
      function mini(l, v) { return '<div class="bg-white rounded-8 border border-gray-100 p-3"><p class="text-[11px] text-gray-400">' + l + '</p><p class="text-xs font-bold text-dark mt-1 break-all">' + esc(v) + '</p></div>'; }
      var recent = myLogs.slice(0, 3);
      return '<tr class="bg-gray-50/50"><td colspan="10" class="px-6 py-5">'
        + '<div class="flex items-center gap-2 mb-4 flex-wrap"><iconify-icon class="text-accent2 text-lg" icon="solar:graph-up-bold"></iconify-icon><span class="font-bold text-dark text-sm">开户进展</span><span class="text-xs text-gray-400">当前阶段：' + esc(st) + '</span><a class="ml-auto text-xs font-bold text-accent2 hover:underline" href="ob-audit.html?id=' + encodeURIComponent(a.id) + '">查看完整审核详情 →</a></div>'
        + '<div class="flex items-start">' + stepHtml + '</div>'
        + '<div class="grid md:grid-cols-4 gap-3 mt-5">'
        + mini('价格方案', a.pricePlan || '未设定')
        + mini('客户经理', a.manager || '未分配')
        + mini('预审员', a.reviewer || '未分配')
        + mini('补件状态', a.suppBy ? ('预审补件发起：' + a.suppBy + ' ' + a.suppAt) : '无进行中补件')
        + '</div>'
        + (recent.length ? '<div class="mt-4"><p class="text-xs font-bold text-gray-500 mb-1">最近动态</p>' + recent.map(function (l) {
            return '<div class="text-xs text-gray-500 py-1.5 border-t border-gray-100"><span class="text-gray-400 font-mono">' + esc(l.time) + '</span> · <b class="text-dark">' + esc(l.atype + ' / ' + l.result) + '</b> · ' + esc(l.by) + (l.comment ? ' · ' + esc(l.comment) : '') + '</div>';
          }).join('') + '</div>' : '')
        + '</td></tr>';
    }

    function render() {
      var list = apps(type);
      var cm = counts(list);
      var view = list.filter(function (a) {
        if (chip !== 'ALL' && a.status !== chip) return false;
        if (q) { var s = (a.name + a.id + a.code + a.email).toLowerCase(); if (s.indexOf(q) === -1) return false; }
        return true;
      });
      var chipsHtml = '<button class="px-3 py-1.5 rounded-full text-xs font-bold ' + (chip === 'ALL' ? 'text-white' : 'bg-gray-100 text-gray-500') + '" style="' + (chip === 'ALL' ? 'background:#382b1b' : '') + '" data-chip="ALL">全部 ' + list.length + '</button>'
        + ST.filter(function (s) { return cm[s]; }).map(function (s) {
          var on = chip === s;
          return '<button class="px-3 py-1.5 rounded-full text-xs font-bold ' + (on ? 'text-white' : 'bg-gray-100 text-gray-500') + '" style="' + (on ? 'background:#382b1b' : '') + '" data-chip="' + esc(s) + '">' + esc(s) + ' ' + cm[s] + '</button>';
        }).join('');
      var selN = Object.keys(selected).filter(function (k) { return selected[k]; }).length;
      mount.innerHTML =
        '<div class="flex items-center justify-between flex-wrap gap-3 mb-5"><div><p class="text-xs text-gray-400 mb-1">' + (isP ? '个人开户管理' : '商业开户管理') + ' / 开户工作台</p><h2 class="text-xl font-extrabold text-dark">' + (isP ? '个人开户审核工作台' : '商户开户工作台') + '</h2></div>'
        + '<div class="flex gap-2"><button class="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-50" data-cmd="new">+ 新建开户申请</button><button class="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-50" data-cmd="export">导出</button></div></div>'
        + '<div class="bg-white rounded-8 custom-shadow p-4 mb-5"><div class="flex items-center gap-3 flex-wrap"><div class="relative flex-1 min-w-[220px]"><iconify-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" icon="solar:magnifer-linear"></iconify-icon><input class="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-8 text-sm focus:outline-none focus:border-accent2" id="ob-q" placeholder="搜索公司 / 客户名称、申请编号、客户代码或 SK 编号" value="' + esc(q) + '"/></div><span class="text-xs text-gray-400">显示 ' + view.length + ' / ' + list.length + '</span></div>'
        + '<div class="flex items-center gap-2 flex-wrap mt-3"><span class="text-xs text-gray-400">状态快捷筛选</span>' + chipsHtml + '</div></div>'
        + '<div class="grid grid-cols-2 md:grid-cols-' + (isP ? '5' : '3') + ' gap-4 mb-5">' + stats(list).map(function (s) {
          return '<div class="bg-white rounded-8 custom-shadow p-5"><p class="text-xs text-gray-400">' + s[0] + '</p><p class="text-2xl font-extrabold text-dark mt-1">' + s[1] + '</p></div>';
        }).join('') + '</div>'
        + '<div class="bg-white rounded-8 custom-shadow overflow-hidden"><div class="flex items-center justify-between px-5 py-3 border-b border-gray-50"><p class="font-bold text-dark text-sm">' + (isP ? '个人客户工作台' : '商业开户工作台') + '</p><div class="flex items-center gap-3 text-xs text-gray-400"><span>共 ' + view.length + ' 条</span><button class="font-bold text-red-400 ' + (selN ? '' : 'opacity-40 pointer-events-none') + '" data-cmd="del">删除选中 ' + selN + '</button></div></div>'
        + '<div class="ob-fit"><table class="w-full text-sm"><colgroup><col style="width:3%"/><col style="width:15%"/><col style="width:12%"/><col style="width:9%"/><col style="width:8%"/><col style="width:8%"/><col style="width:11%"/><col style="width:10%"/><col style="width:14%"/><col style="width:10%"/></colgroup><thead><tr class="text-left text-xs text-gray-400 border-b border-gray-100"><th class="px-3 py-3 w-8"></th><th class="px-3 py-3 font-semibold">' + (isP ? '申请人 / 申请号' : '商户名 / 申请号') + '</th><th class="px-3 py-3 font-semibold">备注</th><th class="px-3 py-3 font-semibold">' + (isP ? '国家/地区' : '注册地') + '</th><th class="px-3 py-3 font-semibold">负责人</th><th class="px-3 py-3 font-semibold">预审员</th><th class="px-3 py-3 font-semibold">客户代码</th><th class="px-3 py-3 font-semibold">状态</th><th class="px-3 py-3 font-semibold">下一步操作</th><th class="px-3 py-3 font-semibold">审核</th></tr></thead><tbody>'
        + (view.length ? view.map(row).join('') : '<tr><td colspan="10" class="px-5 py-14 text-center text-gray-400">无匹配结果</td></tr>')
        + '</tbody></table></div></div>';
      bind();
    }

    function bind() {
      var qEl = mount.querySelector('#ob-q');
      qEl.oninput = function () { q = qEl.value.trim().toLowerCase(); render(); };
      qEl.focus(); qEl.setSelectionRange(qEl.value.length, qEl.value.length);
      mount.querySelectorAll('[data-chip]').forEach(function (b) { b.onclick = function () { chip = b.getAttribute('data-chip'); render(); }; });
      mount.querySelectorAll('[data-ck]').forEach(function (c) { c.onchange = function () { selected[c.getAttribute('data-ck')] = c.checked; render(); }; });
      mount.querySelector('[data-cmd="export"]').onclick = function () {
        var view = apps(type);
        csv((isP ? '个人开户申请.csv' : '商业开户申请.csv'), [['名称', '申请号', '邮箱', '电话', '来源', '国家', '负责人', '预审员', '客户代码', '状态']].concat(view.map(function (a) {
          return [a.name, a.id, a.email, a.phone, a.source, a.country, a.manager, a.reviewer, a.code, a.status];
        })));
      };
      mount.querySelector('[data-cmd="del"]').onclick = function () {
        var ids = Object.keys(selected).filter(function (k) { return selected[k]; });
        if (!ids.length) return;
        DDUI.confirm({
          title: '删除选中申请', text: '将删除 ' + ids.length + ' 条开户申请及其归档资料，操作不可恢复。', okText: '确认删除', danger: true,
          onOk: function () {
            var d = load(); d.apps = d.apps.filter(function (a) { return ids.indexOf(a.id) === -1; }); save(d);
            selected = {}; render(); DDUI.toast('已删除 ' + ids.length + ' 条申请', 'success');
          }
        });
      };
      mount.querySelector('[data-cmd="new"]').onclick = newApp;
      mount.querySelectorAll('[data-act]').forEach(function (b) {
        b.onclick = function () { act(b.getAttribute('data-act'), b.getAttribute('data-id')); };
      });
    }

    function act(kind, id) {
      var a = getApp(id); if (!a) return;
      if (kind === 'manager' || kind === 'reviewer') {
        var isM = kind === 'manager';
        DDUI.modal({
          title: isM ? '分配客户经理' : '分配预审员',
          body: '<div class="ddui-field"><label class="ddui-label">' + (isM ? '客户经理' : '预审员') + '</label><select class="ddui-input" id="as-v">' + staffOptions(isM ? MANAGERS : REVIEWERS, isM ? a.manager : a.reviewer) + '</select></div>',
          actions: [{ text: '取消' }, { text: '保存', type: 'primary', onClick: function (close, body) {
            upApp(id, function (x) { if (isM) x.manager = body.querySelector('#as-v').value; else x.reviewer = body.querySelector('#as-v').value; });
            close(); render(); DDUI.toast('已更新分配', 'success');
          } }]
        });
      } else if (kind === 'note') {
        DDUI.modal({
          title: '编辑备注 - ' + a.name,
          body: '<div class="ddui-field"><label class="ddui-label">备注</label><textarea class="ddui-input" id="nt-v" rows="3">' + esc(a.note) + '</textarea></div>',
          actions: [{ text: '取消' }, { text: '保存', type: 'primary', onClick: function (close, body) {
            upApp(id, function (x) { x.note = body.querySelector('#nt-v').value.trim(); });
            close(); render(); DDUI.toast('备注已保存', 'success');
          } }]
        });
      } else if (kind === 'rereview') {
        DDUI.confirm({
          title: '退回待预审',
          text: '确定将该申请退回待预审？当前内部补件轮次将取消，旧补件上传链接将失效。已提交的回复、文件及审核历史会保留。',
          okText: '确定退回', danger: true,
          onOk: function () {
            upApp(id, function (x) { x.status = '待预审'; x.suppBy = ''; x.suppAt = ''; });
            addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: '预审核', result: '重新审核（退回待预审）', by: '当前管理员', comment: '退回待预审' });
            render(); DDUI.toast('已退回待预审', 'success');
          }
        });
      } else if (kind === 'progress') {
        expanded[id] = !expanded[id]; render();
      } else if (kind === 'review') {
        reviewModal(a);
      } else if (kind === 'detail') {
        location.href = 'ob-audit.html?id=' + encodeURIComponent(a.id);
      } else if (kind === 'submit-sk') {
        DDUI.confirm({
          title: '最终提交 Sokin',
          text: '将已核对的草稿正式提交至 Sokin 审核。提交后状态变为「已提交 Sokin｜待审核」。',
          okText: '确认提交',
          onOk: function () {
            upApp(id, function (x) { x.status = isP ? '开户成功' : '已提交 Sokin｜待审核'; });
            addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: 'SK/KYC', result: '最终提交 Sokin', by: '当前管理员', comment: '草稿正式提交至 Sokin' });
            render(); DDUI.toast('已提交至 Sokin', 'success');
          }
        });
      }
    }

    function reviewModal(a) {
      var finalStage = a.status === '待主管终审';
      var opts = finalStage ? ['主管通过', '主管驳回', '退回补充资料'] : ['预审通过', '预审驳回', '退回补充资料'];
      DDUI.modal({
        title: (finalStage ? '主管终审' : '预审') + ' - ' + a.name,
        body: '<p class="text-xs text-gray-400 mb-3 font-mono">' + a.id + ' · ' + esc(a.code) + '</p>'
          + '<div class="ddui-field"><label class="ddui-label">审核结果</label><div class="space-y-2">' + opts.map(function (o, i) {
            return '<label class="flex items-center gap-2 text-sm"><input type="radio" name="rv" value="' + o + '"' + (i === 0 ? ' checked' : '') + ' class="accent-[#382b1b]"/>' + o + '</label>';
          }).join('') + '</div></div>'
          + '<div class="ddui-field"><label class="ddui-label">审核意见</label><textarea class="ddui-input" id="rv-c" rows="3" placeholder="驳回或退回补充时请填写具体原因"></textarea></div>',
        actions: [{ text: '取消' }, { text: '提交审核', type: 'primary', onClick: function (close, body) {
          var r = body.querySelector('input[name=rv]:checked').value;
          var c = body.querySelector('#rv-c').value.trim();
          if ((r.indexOf('驳回') > -1 || r === '退回补充资料') && !c) { DDUI.toast('请填写审核意见', 'error'); return; }
          upApp(a.id, function (x) {
            if (r === '预审通过') x.status = '待主管终审';
            else if (r === '主管通过') x.status = isP ? 'Sokin 草稿已创建｜待正式提交' : '已提交 Sokin｜待审核';
            else if (r === '退回补充资料') { x.status = '退回补充资料'; x.suppBy = '当前管理员'; x.suppAt = now(); }
            else x.status = '已驳回';
          });
          addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: finalStage ? '主管终审' : '预审核', result: r, by: '当前管理员', comment: c || r });
          close(); render(); DDUI.toast('审核已提交：' + r, 'success');
        } }]
      });
    }

    function detailModal(a) {
      var docs = load().docs[a.id] || [];
      var nFiles = 0; docs.forEach(function (z) { z.items.forEach(function (it) { nFiles += it.files.length; }); });
      DDUI.modal({
        title: '申请详情 - ' + a.name, wide: true,
        body: '<div class="grid grid-cols-2 gap-3 text-sm">'
          + [['申请号', a.id], ['客户代码', a.code], ['类型', isP ? '个人开户' : '商业开户'], ['国家/地区', a.country], ['邮箱', a.email], ['电话', a.phone], ['来源', a.source], ['负责人', a.manager || '未分配'], ['预审员', a.reviewer || '未分配'], ['提交时间', a.ts]].map(function (kv) {
            return '<div class="bg-gray-50 rounded-8 p-3"><p class="text-xs text-gray-400">' + kv[0] + '</p><p class="font-medium text-dark mt-0.5 break-all">' + esc(kv[1]) + '</p></div>';
          }).join('') + '</div>'
          + '<div class="mt-3 bg-gray-50 rounded-8 p-3"><p class="text-xs text-gray-400">当前状态</p><p class="mt-1">' + badge(a.status) + '</p></div>'
          + '<div class="mt-3 bg-gray-50 rounded-8 p-3"><p class="text-xs text-gray-400">归档资料</p><p class="font-medium text-dark mt-0.5">' + docs.length + ' 个分区 · ' + nFiles + ' 个文件（详见资料归档页）</p></div>',
        actions: [{ text: '关闭' }, { text: '前往资料归档', type: 'primary', onClick: function () { location.href = isP ? 'ob-personal-archive.html' : 'ob-business-archive.html'; } }]
      });
    }

    function newApp() {
      DDUI.modal({
        title: '新建开户申请',
        body: '<p class="text-xs text-gray-400 mb-3">新建开户申请只需选择开户类型，客户资料可以全部留空。</p>'
          + '<div class="ddui-field"><label class="ddui-label">开户类型</label><div class="flex gap-4">'
          + '<label class="flex items-center gap-2 text-sm"><input type="radio" name="na-t" value="personal" checked class="accent-[#382b1b]"/>个人开户</label>'
          + '<label class="flex items-center gap-2 text-sm"><input type="radio" name="na-t" value="business" class="accent-[#382b1b]"/>企业开户</label></div></div>'
          + '<div class="ddui-field"><label class="ddui-label">负责人</label><select class="ddui-input" id="na-o"><option value="">请选择负责人</option>' + MANAGERS.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('') + '</select></div>',
        actions: [{ text: '取消' }, { text: '创建并继续填写', type: 'primary', onClick: function (close, body) {
          var t = body.querySelector('input[name=na-t]:checked').value;
          var d = load();
          var id = (t === 'personal' ? 'IND-' : 'APP-') + '20261018-' + Math.random().toString(36).slice(2, 8).toUpperCase();
          var n = d.apps.filter(function (x) { return x.type === t; }).length + 1;
          d.apps.unshift({
            id: id, type: t, name: t === 'personal' ? '新个人客户' : '新商业客户', email: '', phone: '', source: '客户经理代填',
            note: '', country: '', manager: body.querySelector('#na-o').value, reviewer: '',
            code: (t === 'personal' ? 'DDKYC' : 'DDKYB') + ('000' + n).slice(-4), status: '待预审', suppBy: '', suppAt: '', ts: now()
          });
          d.docs[id] = seedDocs(d.apps[0]); save(d);
          close();
          if (t === type) render(); else location.href = t === 'personal' ? 'ob-personal.html' : 'ob-business.html';
          DDUI.toast('开户申请已创建', 'success');
        } }]
      });
    }

    render();
  }

  /* ---------------- 页面：资料归档 ---------------- */
  function renderArchive(type, mount) {
    var isP = type === 'personal';
    var chip = 'ALL';
    function fileRow(f) {
      return '<div class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 text-sm"><iconify-icon class="text-lg text-gray-400 flex-none" icon="solar:document-text-bold"></iconify-icon>'
        + '<div class="flex-1 min-w-0"><p class="font-medium text-dark truncate">' + esc(f.name) + '</p><p class="text-xs text-gray-400">提交时间：' + esc(f.time) + ' · ' + esc(f.ver) + '</p></div>'
        + '<span class="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-bold flex-none">已上传</span>'
        + '<span class="text-xs text-gray-400 flex-none">' + esc(f.size) + '</span>'
        + '<button class="text-xs font-bold text-accent2 hover:underline flex-none" data-fview="' + esc(f.name) + '">预览</button>'
        + '<button class="text-xs font-bold text-accent2 hover:underline flex-none" data-fdl="' + esc(f.name) + '">下载</button></div>';
    }
    function card(a, docs) {
      var total = 0, uploaded = 0, missing = 0;
      docs.forEach(function (z) {
        z.items.forEach(function (it) {
          total += Math.max(it.files.length, 1);
          uploaded += it.files.length;
          if (it.req && !it.files.length) missing++;
        });
      });
      var zones = docs.map(function (z, zi) {
        return '<div class="border-t border-gray-100 px-5 py-4">'
          + '<div class="flex items-center justify-between mb-2"><p class="text-sm font-bold text-dark"><span class="text-accent2">' + esc(z.zone) + '</span> · ' + esc(z.title) + (z.batch ? ' · 批次 ' + z.batch : '') + '</p><div class="flex items-center gap-3"><span class="text-xs text-gray-400">提交时间：' + esc(z.time) + '</span>' + (z.batch ? '<button class="text-xs font-bold text-green-600 hover:underline" data-marked="' + a.id + ':' + zi + '">标记已审核</button>' : '') + '</div></div>'
          + z.items.map(function (it) {
            return '<div class="mb-2"><p class="text-xs text-gray-500 mb-1">' + esc(it.cat) + ' ' + (it.req ? '<span class="px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-bold">必传</span>' : '<span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">选传</span>') + ' · ' + it.files.length + ' 个文件</p>'
              + (it.files.length ? it.files.map(fileRow).join('') : '<p class="text-xs text-gray-300 pl-3 py-1">暂无文件</p>') + '</div>';
          }).join('') + '</div>';
      }).join('');
      return '<div class="bg-white rounded-8 custom-shadow overflow-hidden mb-5" data-arch-card>'
        + '<div class="px-5 py-4 flex items-center gap-4 flex-wrap"><div class="flex-1 min-w-[220px]"><p class="font-bold text-dark">' + esc(a.name) + '</p><p class="text-xs text-gray-400 font-mono mt-0.5">' + a.id + ' / ' + badge(a.status) + '</p></div>'
        + '<div class="flex items-center gap-5 text-center"><div><p class="text-lg font-extrabold text-dark">' + total + '</p><p class="text-[11px] text-gray-400">资料总数</p></div><div><p class="text-lg font-extrabold text-green-600">' + uploaded + '</p><p class="text-[11px] text-gray-400">已上传</p></div><div><p class="text-lg font-extrabold text-dark">0</p><p class="text-[11px] text-gray-400">已核验</p></div><div><p class="text-lg font-extrabold ' + (missing ? 'text-red-500' : 'text-dark') + '">' + missing + '</p><p class="text-[11px] text-gray-400">缺失必传</p></div></div>'
        + '<button class="bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-8 text-xs hover:bg-gray-200" data-pack="' + a.id + '">打包下载</button></div>'
        + zones + '</div>';
    }
    function render() {
      var list = apps(type);
      var d = load();
      var cm = counts(list);
      var ST = isP ? ST_PERSONAL : ST_BUSINESS;
      var view = chip === 'ALL' ? list : list.filter(function (a) { return a.status === chip; });
      var chipsHtml = '<button class="px-3 py-1.5 rounded-full text-xs font-bold ' + (chip === 'ALL' ? 'text-white' : 'bg-gray-100 text-gray-500') + '" style="' + (chip === 'ALL' ? 'background:#382b1b' : '') + '" data-chip="ALL">全部 ' + list.length + '</button>'
        + ST.filter(function (s) { return cm[s]; }).map(function (s) {
          var on = chip === s;
          return '<button class="px-3 py-1.5 rounded-full text-xs font-bold ' + (on ? 'text-white' : 'bg-gray-100 text-gray-500') + '" style="' + (on ? 'background:#382b1b' : '') + '" data-chip="' + esc(s) + '">' + esc(s) + ' ' + cm[s] + '</button>';
        }).join('');
      mount.innerHTML =
        '<div class="flex items-center justify-between flex-wrap gap-3 mb-2"><div><p class="text-xs text-gray-400 mb-1">' + (isP ? '个人开户管理' : '商业开户管理') + ' / 资料归档</p><h2 class="text-xl font-extrabold text-dark">' + (isP ? '个人开户资料归档' : '开户资料归档') + '</h2><p class="text-xs text-gray-400 mt-1">查看、预览、下载和打包' + (isP ? '个人' : '商户') + '用户提交的材料。</p></div>'
        + '<button class="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-50" data-cmd="export">导出</button></div>'
        + '<div class="flex items-center gap-2 flex-wrap my-4"><span class="text-xs text-gray-400">状态快捷筛选</span>' + chipsHtml + '</div>'
        + (view.length ? view.map(function (a) { return card(a, d.docs[a.id] || []); }).join('') : '<div class="bg-white rounded-8 custom-shadow p-14 text-center text-gray-400">无匹配结果</div>');
      mount.querySelectorAll('[data-chip]').forEach(function (b) { b.onclick = function () { chip = b.getAttribute('data-chip'); render(); }; });
      mount.querySelectorAll('[data-pack]').forEach(function (b) { b.onclick = function () { DDUI.toast('打包下载任务已创建，完成后将发送到您的工作邮箱', 'success'); }; });
      mount.querySelectorAll('[data-fview]').forEach(function (b) {
        b.onclick = function () {
          DDUI.modal({ title: '文件预览 - ' + b.getAttribute('data-fview'), body: '<div class="bg-gray-100 rounded-8 h-64 flex flex-col items-center justify-center text-gray-400"><iconify-icon class="text-4xl mb-2" icon="solar:document-text-bold"></iconify-icon><p class="text-sm">预览加载中…（演示环境文件存储于 OSS，线上环境可直接预览）</p></div>', actions: [{ text: '关闭' }] });
        };
      });
      mount.querySelectorAll('[data-fdl]').forEach(function (b) { b.onclick = function () { DDUI.toast('开始下载：' + b.getAttribute('data-fdl'), 'success'); }; });
      mount.querySelectorAll('[data-marked]').forEach(function (b) { b.onclick = function () { DDUI.toast('该批次已标记为已审核', 'success'); }; });
      mount.querySelector('[data-cmd="export"]').onclick = function () { csv((isP ? '个人' : '商业') + '归档清单.csv', [['名称', '申请号', '状态']].concat(list.map(function (a) { return [a.name, a.id, a.status]; }))); };
    }
    render();
  }

  /* ---------------- 页面：主管终审 ---------------- */
  function renderFinal(type, mount) {
    var isP = type === 'personal';
    function render() {
      var list = apps(type).filter(function (a) { return a.status === '待主管终审'; });
      mount.innerHTML =
        '<div class="flex items-center justify-between flex-wrap gap-3 mb-5"><div><p class="text-xs text-gray-400 mb-1">' + (isP ? '个人开户管理' : '商业开户管理') + ' / 主管终审</p><h2 class="text-xl font-extrabold text-dark">主管终审</h2><p class="text-xs text-gray-400 mt-1">预审核通过后的' + (isP ? '个人开户申请' : '公司') + '会进入这里单独终审。</p></div>'
        + '<button class="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-50" data-cmd="refresh">刷新</button></div>'
        + (list.length ? '<div class="bg-white rounded-8 custom-shadow overflow-hidden"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-gray-400 border-b border-gray-100"><th class="px-5 py-3 font-semibold">' + (isP ? '申请人' : '商户') + '</th><th class="px-3 py-3 font-semibold">申请号</th><th class="px-3 py-3 font-semibold">客户代码</th><th class="px-3 py-3 font-semibold">预审员</th><th class="px-3 py-3 font-semibold">提交时间</th><th class="px-3 py-3 font-semibold text-right">终审操作</th></tr></thead><tbody>'
          + list.map(function (a) {
            return '<tr class="border-b border-gray-50 hover:bg-gray-50/60"><td class="px-5 py-3.5 font-bold text-dark">' + esc(a.name) + '</td><td class="px-3 py-3.5 font-mono text-xs text-gray-500">' + a.id + '</td><td class="px-3 py-3.5 font-mono text-xs text-gray-500">' + esc(a.code) + '</td><td class="px-3 py-3.5">' + esc(a.reviewer || '—') + '</td><td class="px-3 py-3.5 text-gray-500 text-xs">' + esc(a.ts) + '</td>'
              + '<td class="px-3 py-3.5 text-right whitespace-nowrap"><button class="px-3 py-1.5 rounded-lg text-xs font-bold text-white mr-1" style="background:#15803D" data-r="主管通过" data-id="' + a.id + '">主管通过</button><button class="px-3 py-1.5 rounded-lg text-xs font-bold text-white mr-1" style="background:#B91C1C" data-r="主管驳回" data-id="' + a.id + '">主管驳回</button><button class="px-3 py-1.5 rounded-lg text-xs font-bold" style="background:#FFEDD5;color:#C2410C" data-r="退回补充资料" data-id="' + a.id + '">退回补充</button></td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="bg-white rounded-8 custom-shadow p-16 text-center"><iconify-icon class="text-4xl text-gray-300 mb-3" icon="solar:verified-check-bold"></iconify-icon><p class="text-gray-400">当前没有待终审的申请</p><p class="text-xs text-gray-300 mt-1">预审通过的申请会自动进入此列表</p></div>');
      mount.querySelector('[data-cmd="refresh"]').onclick = render;
      mount.querySelectorAll('[data-r]').forEach(function (b) {
        b.onclick = function () {
          var r = b.getAttribute('data-r'), id = b.getAttribute('data-id'), a = getApp(id);
          DDUI.modal({
            title: r + ' - ' + a.name,
            body: '<div class="ddui-field"><label class="ddui-label">审核意见</label><textarea class="ddui-input" id="fr-c" rows="3" placeholder="' + (r === '主管通过' ? '选填' : '必填：请说明原因') + '"></textarea></div>',
            actions: [{ text: '取消' }, { text: '确认' + r, type: 'primary', onClick: function (close, body) {
              var c = body.querySelector('#fr-c').value.trim();
              if (r !== '主管通过' && !c) { DDUI.toast('请填写审核意见', 'error'); return; }
              upApp(id, function (x) {
                if (r === '主管通过') x.status = isP ? 'Sokin 草稿已创建｜待正式提交' : '已提交 Sokin｜待审核';
                else if (r === '主管驳回') x.status = '已驳回';
                else { x.status = '退回补充资料'; x.suppBy = '李主管'; x.suppAt = now(); }
              });
              addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: '主管终审', result: r, by: '李主管', comment: c || r });
              close(); render(); DDUI.toast('终审完成：' + r, 'success');
            } }]
          });
        };
      });
    }
    render();
  }

  /* ---------------- 页面：审核记录 ---------------- */
  function renderLog(type, mount) {
    var isP = type === 'personal';
    var chip = 'ALL';
    var RESULTS = ['预审通过', '预审驳回', '退回补充资料', '主管通过', '主管驳回'];
    function render() {
      var logs = load().logs.filter(function (l) { return l.ctype === (isP ? 'Individual' : 'Business'); });
      var view = chip === 'ALL' ? logs : logs.filter(function (l) { return l.result === chip; });
      function n(r) { return logs.filter(function (l) { return l.result === r; }).length; }
      var chipsHtml = '<button class="px-3 py-1.5 rounded-full text-xs font-bold ' + (chip === 'ALL' ? 'text-white' : 'bg-gray-100 text-gray-500') + '" style="' + (chip === 'ALL' ? 'background:#382b1b' : '') + '" data-chip="ALL">全部 ' + logs.length + '</button>'
        + RESULTS.map(function (r) {
          var on = chip === r;
          return '<button class="px-3 py-1.5 rounded-full text-xs font-bold ' + (on ? 'text-white' : 'bg-gray-100 text-gray-500') + '" style="' + (on ? 'background:#382b1b' : '') + '" data-chip="' + r + '">' + r + ' ' + n(r) + '</button>';
        }).join('');
      mount.innerHTML =
        '<div class="flex items-center justify-between flex-wrap gap-3 mb-5"><div><p class="text-xs text-gray-400 mb-1">' + (isP ? '个人开户管理' : '商业开户管理') + ' / 审核记录</p><h2 class="text-xl font-extrabold text-dark">审核记录</h2><p class="text-xs text-gray-400 mt-1">' + (isP ? '个人开户预审、终审、重新审核和 SK/KYC 操作记录。' : '查看所有开户申请的预审核与主管终审历史记录') + '</p></div>'
        + '<button class="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-50" data-cmd="export">导出</button></div>'
        + '<div class="flex items-center gap-2 flex-wrap mb-4"><span class="text-xs text-gray-400">状态快捷筛选</span>' + chipsHtml + '</div>'
        + '<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">' + [['总审核记录', logs.length], ['预审通过', n('预审通过')], ['预审驳回', n('预审驳回')], ['退回补充', n('退回补充资料')], ['主管通过', n('主管通过')]].map(function (s) {
          return '<div class="bg-white rounded-8 custom-shadow p-5"><p class="text-xs text-gray-400">' + s[0] + '</p><p class="text-2xl font-extrabold text-dark mt-1">' + s[1] + '</p></div>';
        }).join('') + '</div>'
        + '<div class="bg-white rounded-8 custom-shadow overflow-hidden"><div class="flex items-center justify-between px-5 py-3 border-b border-gray-50"><p class="font-bold text-dark text-sm">审核记录列表</p></div>'
        + '<div class="ob-fit"><table class="w-full text-sm"><colgroup><col style="width:12%"/><col style="width:12%"/><col style="width:14%"/><col style="width:9%"/><col style="width:10%"/><col style="width:10%"/><col style="width:8%"/><col style="width:25%"/></colgroup><thead><tr class="text-left text-xs text-gray-400 border-b border-gray-100"><th class="px-5 py-3 font-semibold">时间</th><th class="px-3 py-3 font-semibold">' + (isP ? '客户/申请人' : '商户/申请人') + '</th><th class="px-3 py-3 font-semibold">申请ID</th><th class="px-3 py-3 font-semibold">客户类型</th><th class="px-3 py-3 font-semibold">审核类型</th><th class="px-3 py-3 font-semibold">审核结果</th><th class="px-3 py-3 font-semibold">审核人</th><th class="px-3 py-3 font-semibold">审核意见</th></tr></thead><tbody>'
        + (view.length ? view.map(function (l) {
          var rc = l.result.indexOf('通过') > -1 ? 'text-green-600' : (l.result.indexOf('驳回') > -1 ? 'text-red-500' : 'text-orange-500');
          return '<tr class="border-b border-gray-50 hover:bg-gray-50/60"><td class="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">' + l.time + '</td><td class="px-3 py-3 font-medium text-dark">' + esc(l.name) + '</td><td class="px-3 py-3 font-mono text-xs text-gray-500">' + l.id + '</td><td class="px-3 py-3 text-gray-500">' + l.ctype + '</td><td class="px-3 py-3 text-gray-600">' + esc(l.atype) + '</td><td class="px-3 py-3 font-bold ' + rc + '">' + esc(l.result) + '</td><td class="px-3 py-3 text-gray-600">' + esc(l.by) + '</td><td class="px-3 py-3 text-xs text-gray-500 max-w-[260px]">' + esc(l.comment) + '</td></tr>';
        }).join('') : '<tr><td colspan="8" class="px-5 py-14 text-center text-gray-400">无匹配结果</td></tr>')
        + '</tbody></table></div></div>';
      mount.querySelectorAll('[data-chip]').forEach(function (b) { b.onclick = function () { chip = b.getAttribute('data-chip'); render(); }; });
      mount.querySelector('[data-cmd="export"]').onclick = function () {
        csv((isP ? '个人' : '商业') + '审核记录.csv', [['时间', '名称', '申请ID', '客户类型', '审核类型', '审核结果', '审核人', '审核意见']].concat(view.map(function (l) {
          return [l.time, l.name, l.id, l.ctype, l.atype, l.result, l.by, l.comment];
        })));
      };
    }
    render();
  }

  /* ---------------- 页面：Sokin 记录 ---------------- */
  /* ---------------- 页面：Sokin 记录（一比一复刻 BilinkPay Equals 页，Equals → Sokin） ---------------- */
  var SK_KEY = 'dd-admin-sk-v1';

  function skSeed() {
    function p(id, uuid, code, name, o) {
      var r = {
        scope: 'personal', id: 'SK-' + id, appId: id, uuid: uuid, code: code, name: name,
        email: name.toLowerCase().replace(/[^a-z]/g, '') + '@gmail.com',
        assign: null, auto: true, autoSt: '尚未收到', autoRes: '—', manual: null, manualUpd: false, face: false,
        submitT: '', submitBy: '未分配', op: 'none', link: 'no',
        status: '已驳回', fb: null, fbMode: 'manual', lastSync: null, manualBy: null, manualRes: false, emailSent: false, rfi: false
      };
      for (var k in o) r[k] = o[k];
      return r;
    }
    var personal = [
      p('IND-20260904-3VHMZF', 'e9c5dda8-b255-4ff2-ae63-c602b5ffb474', 'UKKYC0006', 'Penghao Jia', { assign: { t: '2026-09-07 10:00:00 BST', by: 'vivian' }, face: true, submitT: '2026-09-04 10:39:04 BST', status: '已驳回', fbMode: 'api', lastSync: '2026-10-15 08:50:26 BST' }),
      p('IND-20261005-MIIXGJ', null, 'EUKYC0016', 'Samuel Pal', { auto: false, manualUpd: true, submitT: '2026-10-05 17:58:14 BST', status: '已驳回' }),
      p('IND-20260917-G1TVVE', '55596494-30ee-49c4-bdff-5c48c4dcabee', 'UKKYC0009', 'Alhasan qraiqea', { manualUpd: true, face: true, submitT: '2026-09-17 12:02:27 BST', op: 'draft', link: 'confirm-draft', status: 'Sokin 草稿已创建｜待正式提交', fbMode: 'api', lastSync: '2026-10-08 15:03:32 BST', manualRes: true }),
      p('IND-20260919-LXRTNT', 'a289cace-6997-49f6-aa01-5507a5cba09f', 'EUKYC0012', 'Samuel Pal', { assign: { t: '2026-09-23 15:00:00 BST', by: 'felina.zhang' }, autoSt: '尚未开始', face: true, submitT: '2026-09-24 04:43:00 BST', op: 'submitted', status: '开户失败', fb: '申请审核未通过 · 已同步', fbMode: 'api', lastSync: '2026-09-23 07:13:54 BST', manualRes: true }),
      p('IND-20260922-YIKNKI', null, 'UKKYC0011', 'Jerry Van', { auto: false, manualUpd: true, submitT: '2026-09-22 06:09:09 BST', status: '已驳回' }),
      p('IND-20260813-WPTT6L', null, 'EUKYC0004', 'Xiaoke Yang', { auto: false, manual: { st: '已完成', res: '未通过' }, submitT: '2026-08-13 11:47:46 BST', submitBy: '刘欣', status: '已驳回', manualBy: 'debbie', lastSync: '2026-09-15 13:49:29 BST' }),
      p('IND-20260908-RURCIU', '09fb1097-ed19-4418-9365-6ec07256a244', 'EUKYC0011', 'zhiyun sun', { autoSt: '已完成', autoRes: '通过', submitT: '2026-09-11 10:52:02 BST', submitBy: '刘欣', op: 'submitted', link: 'received', status: '开户成功', fb: '账户激活反馈 · 已同步', fbMode: 'api', lastSync: '2026-09-22 08:49:09 BST' }),
      p('IND-20260831-2HYQNB', null, 'EUKYC0010', 'Adnan akhtar', { auto: false, manualUpd: true, submitT: '2026-08-31 16:55:32 BST', status: '已驳回' }),
      p('IND-20260813-P2OY36', null, 'EUKYC0005', 'Yuancai Sha', { auto: false, manual: { st: '已完成', res: '通过' }, manualUpd: true, submitT: '2026-08-13 13:28:40 BST', submitBy: '刘欣', op: 'submitted', status: '开户成功', manualBy: 'vivian', lastSync: '2026-09-09 09:17:35 BST' }),
      p('IND-20260813-A9PD3U', null, 'EUKYC0006', 'junli xiao', { auto: false, manualUpd: true, submitT: '2026-08-13 21:07:32 BST', op: 'submitted', status: '开户成功', manualBy: 'debbie', lastSync: '2026-08-25 17:00:39 BST' }),
      p('IND-20260707-PLTJVK', null, 'EUKYC0001', 'Manoj Shrestha', { auto: false, manualUpd: true, submitT: '2026-07-07 13:54:11 BST', submitBy: 'Debbie', op: 'submitted', status: '开户成功', manualBy: 'vivian', lastSync: '2026-08-17 17:10:47 BST' }),
      p('IND-20260717-82YFXM', null, 'EUKYC0002', 'ZINAN WANG', { auto: false, manual: { st: '已完成', res: '通过' }, manualUpd: true, submitT: '2026-07-17 12:40:50 BST', submitBy: 'Debbie', op: 'submitted', status: '开户成功', manualBy: 'debbie', lastSync: '2026-08-24 10:30:12 BST' }),
      p('IND-20260720-NTOKMB', null, 'EUKYC0003', 'Debbie Chang', { auto: false, manualUpd: true, submitT: '2026-07-20 10:48:32 BST', submitBy: 'Debbie', op: 'submitted', status: '开户成功', manualBy: 'vivian', lastSync: '2026-08-17 17:10:41 BST' }),
      p('IND-20260807-YJGW4O', null, 'UKKYC0001', 'Yankang zhang', { auto: false, manualUpd: true, submitT: '2026-08-07 16:10:43 BST', submitBy: 'Debbie', op: 'submitted', status: '开户成功', manualBy: 'debbie', lastSync: '2026-08-07 16:11:54 BST' }),
      p('IND-20260813-AFNLRW', null, 'EUKYC0007', 'Zhibin Zang', { auto: false, manualUpd: true, submitT: '2026-08-13 21:14:23 BST', status: '已驳回' })
    ];
    function b(id, uuid, code, name, o) { var r = p(id, uuid, code, name, o); r.scope = 'business'; r.email = 'ops@' + name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) + '.com'; return r; }
    var B_SUB = { op: 'submitted', link: 'confirm-biz', status: '已提交 Sokin｜待审核', fb: '身份验证要求 · 已同步', fbMode: 'api', autoSt: '已完成', autoRes: '通过', manualUpd: true };
    function bs(t, by, sync, o) { var r = { submitT: t, submitBy: by || '未分配', lastSync: sync }; for (var k in B_SUB) r[k] = B_SUB[k]; for (var k2 in o) r[k2] = o[k2]; return r; }
    var business = [
      b('APP-20261011-KDRT8Q', 'c41f2a7e-9b3d-4e62-a8f1-2d7c5e9b04a6', 'UKKYB0018', 'BRIGHTLINE SOURCING LTD', { manualUpd: true, face: true, submitT: '2026-10-11 09:26:41 BST', submitBy: 'felina.zhang', op: 'draft', link: 'confirm-draft', status: 'Sokin 草稿已创建｜待正式提交', fbMode: 'api', lastSync: '2026-10-15 10:12:08 BST', manualRes: true }),
      b('APP-20260914-GC9XY2', '7ebb6ec9-f8a4-418c-856a-42b2de110620', 'EUKYB0019', 'UNICO TRADE S.R.L.', bs('2026-09-30 17:09:23 BST', null, '2026-10-15 17:51:39 BST', { manualRes: true })),
      b('APP-20260929-EGSCBJ', '62fe3c21-ef8b-4854-8cc5-a6a30bbdab99', 'UKKYB0015', 'JENNYSSSJY LTD', bs('2026-09-30 14:37:06 BST', null, '2026-10-15 17:53:11 BST', { fb: '企业补件要求 · 已同步', manualRes: true, rfiProg: true })),
      b('APP-20260825-LZW1QC', '2ce16306-5887-4fbf-a03d-ccd78a8b45c0', 'UKKYB0004', 'Richerboki Ltd', bs('2026-09-20 13:05:24 BST', 'Catherine', '2026-10-15 17:53:01 BST', { manual: { st: '进行中', res: '—' }, manualUpd: false, link: 'no', status: 'SK 要求补件｜待客户补充', fb: '企业补件要求 · 需人工核对', rfi: true })),
      b('APP-20261009-NDHY2M', '86719d7a-b6b9-4a0f-8f87-f19bae296919', 'UKKYB0017', 'ORBISPOINT LIMITED', bs('2026-10-13 08:34:49 BST', null, '2026-10-15 17:51:38 BST', { manualRes: true })),
      b('APP-20260918-WMKM9B', '00fc73ac-0ae2-4d66-a033-149a30153163', 'UKKYB0007', 'STORESBRIDGE EXPORT LTD', bs('2026-10-09 14:50:55 BST', null, '2026-10-15 17:51:27 BST', { manualRes: true })),
      b('APP-20260925-ZG32OB', '9ccff5ca-1ad0-4937-a0d1-88570ab7ce7a', 'UKKYB0013', 'XIAOTAIYANG LTD', bs('2026-09-30 11:48:39 BST', null, '2026-10-13 14:12:31 BST', { link: 'no', status: '开户失败', fb: '申请审核未通过 · 已同步', manualUpd: false, manualRes: true })),
      b('APP-20260818-WXCURW', null, 'EUKYB0013', 'VELMORA 95 EOOD', bs('2026-08-18 13:49:15 BST', 'felina.zhang', '2026-09-20 14:04:15 BST', { auto: false, autoSt: '尚未收到', autoRes: '—', manual: { st: '已完成', res: '通过' }, manualUpd: false, link: 'no', status: '开户失败', fb: null, fbMode: 'manual', manualBy: 'vivian', manualRes: true, emailSent: true })),
      b('APP-20260814-NO8EKF', null, 'EUKYB0011', 'MEQ GEARMOTORS SOCIETA’ A RESPONSABILITA’ LIMITATA SEMPLIFICATA', bs('2026-08-14 08:31:01 BST', 'sunny', null, { auto: false, autoSt: '尚未收到', autoRes: '—', fb: null, fbMode: 'manual', manualRes: true })),
      b('APP-20260818-STMPZ0', null, 'EUKYB0014', 'LAUMERAM 26 EOOD', bs('2026-09-15 14:01:36 BST', 'felina.zhang', '2026-09-15 14:01:36 BST', { auto: false, autoSt: '尚未收到', autoRes: '—', fb: null, fbMode: 'manual', manualBy: 'debbie', manualRes: true })),
      b('APP-20260918-OHJVGC', '57f040ef-d043-4125-8fcf-ca0e54dab1a3', 'UKKYB0008', 'L H Redchurch Limited', bs('2026-09-30 17:52:08 BST', null, '2026-10-09 14:42:29 BST', { manualRes: true })),
      b('APP-20260922-5NPDPT', '0e3ec33c-7df8-49bd-a336-7706d820535c', 'UKKYB0011', 'GERMANOTTO EXPORT LIMITED', bs('2026-09-30 18:28:26 BST', null, '2026-10-09 14:42:12 BST', { manualRes: true })),
      b('APP-20260925-UYJUHD', 'e29649fc-0912-4f95-a159-0b5b7eb177de', 'UKKYB0012', 'LANDS LUO LTD', bs('2026-09-30 17:56:25 BST', null, '2026-10-09 14:42:13 BST', { manualRes: true })),
      b('APP-20260929-EH1WPV', '90b79b82-70a5-4f79-b4a7-3838cd64003d', 'UKKYB0014', 'WORLDRADE ONLINE RETAIL LTD', bs('2026-09-30 13:17:22 BST', null, '2026-10-09 18:05:11 BST', { manual: { st: '已完成', res: '通过' }, manualUpd: false, link: 'no', status: '开户失败', fb: '申请审核未通过 · 已同步', manualRes: true })),
      b('APP-20260804-YLISXV', null, 'EUKYB0003', 'Shopory Trade Korlátolt Felelősségű Társaság', { submitT: '2026-08-04 11:30:03 BST', submitBy: 'felina.zhang', auto: false, manualUpd: true, status: '已驳回' }),
      b('APP-20260715-XGDMFA', null, 'UKKYB0002', 'BIFA-FINDS LTD', { submitT: '2026-07-15 16:35:08 BST', submitBy: 'felina.zhang', auto: false, manualUpd: true, status: '已驳回' }),
      b('APP-20260708-UPOEZU', null, 'UKKYB0001', 'Easy Grab Go Ltd', { submitT: '2026-07-08 13:28:51 BST', submitBy: 'Debbie', auto: false, manualUpd: true, op: 'submitted', status: '开户成功', manualBy: 'debbie', lastSync: '2026-08-26 16:34:37 BST' }),
      b('APP-20260817-IY3YVJ', null, 'EUKYB0012', 'Flash Commerce Limited', { submitT: '2026-08-17 23:36:54 BST', submitBy: 'Debbie', auto: false, manualUpd: true, op: 'submitted', status: '开户成功', manualBy: 'debbie', lastSync: '2026-08-17 23:38:15 BST' }),
      b('APP-20260804-BBSN47', null, 'EUKYB0004', 'MARKET CREATIV ONISEI S.R.L.', { submitT: '2026-08-04 12:55:40 BST', submitBy: 'felina.zhang', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-26 16:31:50 BST', manualRes: true, emailSent: true }),
      b('APP-20260811-3WLA4S', null, 'EUKYB0010', 'VISTA GROUP STROY 25 EOOD', { submitT: '2026-08-11 14:27:31 BST', submitBy: 'felina.zhang', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-26 16:31:14 BST', manualRes: true, emailSent: true }),
      b('APP-20260811-ZUSESG', null, 'EUKYB0009', 'ZORVEX 66 EOOD', { submitT: '2026-08-11 13:59:47 BST', submitBy: 'felina.zhang', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-26 16:31:08 BST', manualRes: true, emailSent: true }),
      b('APP-20260806-XXU7PB', null, 'EUKYB0007', 'Lisabonde Business GmbH', { submitT: '2026-08-06 14:37:40 BST', submitBy: 'felina.zhang', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-26 16:31:00 BST', manualRes: true, emailSent: true }),
      b('APP-20260806-NLBDJN', null, 'EUKYB0006', 'Creval GmbH', { submitT: '2026-08-06 13:38:30 BST', submitBy: 'felina.zhang', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-26 16:30:38 BST', manualRes: true, emailSent: true }),
      b('APP-20260804-24YRMY', null, 'EUKYB0005', 'FLASH COMMERCE S.R.L', { submitT: '2026-08-04 17:50:26 BST', submitBy: '王梓楠', auto: false, manualUpd: true, op: 'submitted', status: '开户成功', manualBy: 'debbie', lastSync: '2026-08-19 15:41:47 BST' }),
      b('APP-20260716-83MOZY', null, 'EUKYB0001', 'FAST DISCOUNT SRL', { submitT: '2026-07-16 16:04:25 BST', submitBy: '王梓楠', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-07 14:50:42 BST', manualRes: true, emailSent: true }),
      b('APP-20260723-FV2V59', null, 'EUKYB0002', 'GOLDEN LUXURY S.R.L.', { submitT: '2026-07-23 16:40:00 BST', submitBy: '王梓楠', auto: false, op: 'submitted', status: '开户失败', manualBy: 'debbie', lastSync: '2026-08-07 15:34:27 BST', manualRes: true, emailSent: true })
    ];
    return personal.concat(business);
  }
  function skLoad() {
    try { var d = JSON.parse(localStorage.getItem(SK_KEY)); if (d && d.length) return d; } catch (e) { }
    var d = skSeed(); localStorage.setItem(SK_KEY, JSON.stringify(d)); return d;
  }
  function skSave(d) { localStorage.setItem(SK_KEY, JSON.stringify(d)); }
  function skUp(id, fn) { var d = skLoad(); var r = d.filter(function (x) { return x.id === id; })[0]; if (r) { fn(r); skSave(d); } }
  function nowBst() { var d = new Date(); function p(n) { return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' BST'; }

  function skPill(st) {
    var m = {
      '已驳回': 'background:#F3F4F6;color:#6B7280',
      'Sokin 草稿已创建｜待正式提交': 'background:rgba(0,183,236,.12);color:#0089b3',
      '已提交 Sokin｜待审核': 'background:rgba(255,208,8,.25);color:#8a6d00',
      'SK 要求补件｜待客户补充': 'background:rgba(255,129,6,.14);color:#d16500',
      '开户失败': 'background:#FEF2F2;color:#DC2626',
      '开户成功': 'background:#F0FDF4;color:#16A34A'
    };
    return '<span class="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap" style="' + (m[st] || m['已驳回']) + '">' + esc(st) + '</span>';
  }

  function renderSokin(type, mount) {
    var isP = type === 'personal';
    var chip = 'ALL', q = '', rfiOnly = false;
    var detailOpen = {};
    var ORDER = isP
      ? ['已驳回', 'Sokin 草稿已创建｜待正式提交', '已提交 Sokin｜待审核', '开户失败', '开户成功']
      : ['Sokin 草稿已创建｜待正式提交', '已提交 Sokin｜待审核', 'SK 要求补件｜待客户补充', '开户失败', '已驳回', '开户成功'];

    function records() { return skLoad().filter(function (r) { return r.scope === type; }); }
    function view() {
      var rs = records();
      if (rfiOnly) rs = rs.filter(function (r) { return r.rfi; });
      if (chip !== 'ALL') rs = rs.filter(function (r) { return r.status === chip; });
      if (q) rs = rs.filter(function (r) { return (r.id + ' ' + r.appId + ' ' + r.name + ' ' + r.code + ' ' + (r.uuid || '')).toLowerCase().indexOf(q) !== -1; });
      return rs;
    }

    /* ---------- 单元格 ---------- */
    function cId(r) {
      return '<td class="px-4 py-4 align-top"><p class="font-bold text-sm text-accent2 leading-snug">' + esc(r.id) + '</p>'
        + (r.uuid ? '<p class="text-[11px] text-gray-400 mt-1.5 break-all">官方编号 · ' + r.uuid + '</p>' : '')
        + '<p class="text-[11px] text-gray-400 mt-1">客户代码 · <span class="font-bold text-gray-500">' + esc(r.code) + '</span></p>'
        + '<p class="text-[11px] font-mono text-gray-300 mt-1">' + esc(r.appId) + '</p></td>';
    }
    function cAssign(r) {
      return '<td class="px-3 py-4 align-top text-xs">' + (r.assign
        ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold" style="background:#F0FDF4;color:#16A34A">内部已安排</span><p class="text-gray-500 mt-1.5">' + r.assign.t + '</p><p class="text-gray-400 mt-0.5">负责人：' + esc(r.assign.by) + '</p>'
        : '<p class="text-gray-400">可选的内部工作安排</p><button class="mt-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50" data-act="arrange" data-id="' + r.id + '">安排内部时间</button>') + '</td>';
    }
    function kvMini(st, res) {
      return '<div class="grid grid-cols-2 gap-x-2 mt-1"><span class="text-gray-400">状态</span><span class="text-gray-400">结果</span><span class="font-bold text-dark">' + esc(st) + '</span><span class="font-bold ' + (res === '通过' ? 'text-green-600' : (res === '未通过' ? 'text-red-500' : 'text-gray-400')) + '">' + esc(res) + '</span></div>';
    }
    function cKyc(r) {
      var h = '<td class="px-3 py-4 align-top text-xs"><span class="px-2 py-0.5 rounded-full text-[11px] font-bold" style="background:rgba(0,183,236,.12);color:#0089b3">SK 自动同步</span>';
      if (r.auto) h += kvMini(r.autoSt, r.autoRes);
      else h += '<p class="text-gray-300 mt-1.5">未接入</p>';
      h += '<div class="mt-2 pt-2 border-t border-gray-100"><p class="text-gray-400 mb-0.5">人工</p>';
      if (r.manual) h += kvMini(r.manual.st, r.manual.res);
      else h += '<p class="text-gray-300">暂无记录</p>';
      h += '<button class="text-accent2 font-bold hover:underline mt-1" data-act="kyc-detail" data-id="' + r.id + '">' + (detailOpen[r.id] ? '收起明细 ▴' : '查看明细 ▾') + '</button>';
      if (detailOpen[r.id]) h += '<div class="mt-1.5 bg-gray-50 rounded-lg p-2 text-[11px] text-gray-500">' + (r.auto ? 'SK 自动同步已开启，状态由 Sokin 回写。' : '未接入 SK 自动同步，可人工维护。') + (r.face ? '<br/>SK 暂无扫脸会话' : '') + '</div>';
      if (r.manualUpd) h += '<div class="mt-2"><span class="text-gray-400 mr-1">手动更新</span><select class="border border-gray-200 rounded-lg text-xs px-2 py-1.5 text-gray-600" data-act-sel="' + r.id + '"><option value="">选择状态</option><option>KYC 已发送</option><option>KYC 已通过</option><option>KYC 未通过</option></select></div>';
      else if (r.face) h += '<p class="text-gray-300 mt-2">SK 暂无扫脸会话</p>';
      return h + '</div></td>';
    }
    function cSubmitInfo(r) {
      return '<td class="px-3 py-4 align-top text-xs text-gray-500"><p>' + esc(r.submitT) + '</p><p class="text-gray-400 mt-1">' + esc(r.submitBy) + '</p></td>';
    }
    function cOp(r) {
      if (r.op === 'draft') return '<td class="px-3 py-4 align-top text-xs"><button class="w-full px-3 py-2 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-50" data-act="draft" data-id="' + r.id + '">查看草稿</button>'
        + '<button class="w-full mt-2 px-3 py-2 rounded-lg font-bold text-white" style="background:#2563EB" data-act="submit" data-id="' + r.id + '">最终提交 Sokin</button>'
        + '<p class="text-gray-300 mt-1.5 leading-relaxed">将已核对的草稿正式提交至 Sokin 审核。</p></td>';
      if (r.op === 'submitted') return '<td class="px-3 py-4 align-top text-xs"><p class="font-bold text-gray-600">已提交到 Sokin</p><p class="text-gray-400 mt-1">当前状态：' + esc(r.status) + '</p><p class="font-mono text-gray-300 mt-1">' + esc(r.id) + '</p></td>';
      return '<td class="px-3 py-4 align-top text-xs"><span class="inline-flex items-center gap-1.5 text-gray-300"><iconify-icon icon="solar:forbidden-circle-bold"></iconify-icon>暂不可提交</span></td>';
    }
    function cLink(r) {
      if (r.link === 'received') return '<td class="px-3 py-4 align-top text-xs"><p class="text-green-600 font-bold">客户已收到官方链接</p></td>';
      if (r.link === 'confirm-draft') return '<td class="px-3 py-4 align-top text-xs"><button class="w-full px-3 py-2 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 whitespace-nowrap" data-act="link" data-id="' + r.id + '">确认 KYC 链接送达</button><p class="text-gray-300 mt-1.5 leading-relaxed">草稿阶段仅确认客户收件，不改变正式提交状态。</p></td>';
      if (r.link === 'confirm-biz') return '<td class="px-3 py-4 align-top text-xs"><button class="w-full px-3 py-2 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 whitespace-nowrap" data-act="link" data-id="' + r.id + '">确认 KYC 链接送达</button><p class="text-gray-300 mt-1.5 leading-relaxed">确认客户是否收到，或由叮当支付发送官方链接。</p></td>';
      return '<td class="px-3 py-4 align-top text-xs"><span class="inline-flex items-center gap-1.5 text-gray-300"><iconify-icon icon="solar:forbidden-circle-bold"></iconify-icon>当前尚不能处理 KYC 链接送达。</span></td>';
    }
    function cStatus(r) {
      var label = r.status === 'SK 要求补件｜待客户补充' ? 'SK 要求补件 · 待导入处理' : r.status;
      return '<td class="px-3 py-4 align-top">' + skPill(label)
        + (r.fb ? '<p class="text-[11px] text-gray-400 mt-1.5 leading-relaxed">SK 反馈：' + esc(r.fb) + '</p>' : '') + '</td>';
    }
    function cFb(r) {
      var h = '<td class="px-3 py-4 align-top text-xs">';
      if (r.fbMode === 'api') {
        h += '<p class="font-bold text-gray-500">API 自动更新</p><p class="text-gray-400 mt-1">最近同步：' + esc(r.lastSync || '—') + '</p><p class="text-gray-300 mt-1">自动接收反馈，定时补查状态。</p>'
          + '<button class="text-accent2 font-bold hover:underline mt-1.5" data-act="sync" data-id="' + r.id + '">立即同步</button>';
      } else {
        h += '<p class="font-bold text-gray-500">人工更新' + (r.manualBy ? ' · ' + esc(r.manualBy) : '') + '</p>'
          + (r.lastSync ? '<p class="text-gray-400 mt-1">最近同步：' + esc(r.lastSync) + '</p>' : '');
      }
      if (r.manualRes) h += '<br/><button class="text-accent2 font-bold hover:underline mt-1" data-act="manual-res" data-id="' + r.id + '">人工更新结果</button>';
      if (r.emailSent) h += '<p class="text-gray-400 mt-1">邮件已发送</p>';
      if (r.rfi) h += '<div class="mt-2 bg-orange-50 border border-orange-100 rounded-lg p-2 text-[11px] text-orange-600"><p class="font-bold">反馈处理</p><p class="mt-0.5">已收到补件反馈，本地任务尚未导入完成。</p></div>';
      if (r.rfiProg) h += '<br/><button class="text-accent2 font-bold hover:underline mt-1" data-act="rfi" data-id="' + r.id + '">查看补件进度</button>';
      return h + '</td>';
    }
    function row(r) {
      return '<tr class="border-b border-gray-100 hover:bg-gray-50/40">'
        + cId(r) + '<td class="px-3 py-4 align-top font-bold text-dark text-sm">' + esc(r.name) + '</td>'
        + cAssign(r) + cKyc(r) + cSubmitInfo(r) + cOp(r) + cLink(r) + cStatus(r) + cFb(r) + '</tr>';
    }

    /* ---------- 弹窗 ---------- */
    function draftFiles(r) {
      var files = isP ? [
        ['IMG_20260915_143050.jpg', 'PROOF_OF_IDENTITY'], ['IMG_20260915_143059.jpg', 'PROOF_OF_IDENTITY'], ['ThamesWater_utility_Jul2026-scan.pdf', 'PROOF_OF_ADDRESS']
      ] : [
        ['Certificate_of_Incorporation.pdf', 'PROOF_OF_BUSINESS'], ['Director_Register_2026.pdf', 'DIRECTOR_REGISTER'], ['UBO_Declaration-signed.pdf', 'UBO_DECLARATION']
      ];
      return files.map(function (f) {
        return '<label class="flex items-center gap-3 py-2.5 border-b border-gray-50 cursor-pointer"><input type="checkbox" class="w-4 h-4 accent-[#382b1b] sk-file"/><span class="flex-1 min-w-0"><span class="block text-sm font-medium text-dark truncate">' + f[0] + '</span><span class="block text-[11px] text-gray-400">Initial documents · Version 1 · ' + f[1] + '</span></span><span class="text-[11px] text-gray-400">Not uploaded</span></label>';
      }).join('');
    }
    function openDraft(r) {
      DDUI.modal({
        title: 'Sokin draft', wide: true,
        body: '<p class="text-xs text-gray-400 -mt-1 mb-4">Live data from Sokin. Save edits, upload files and submit as separate steps.</p>'
          + '<div class="rounded-lg p-3.5 mb-4" style="background:rgba(0,183,236,.08)"><p class="text-[11px] font-bold" style="color:#0089b3">SOKIN APPLICATION ID</p><p class="font-mono text-sm text-dark mt-1">' + (r.uuid || '待生成 · 正式提交后由 Sokin 分配') + '</p><p class="text-[11px] text-gray-400 mt-1">Retrieved at ' + nowBst() + '</p></div>'
          + '<div class="grid grid-cols-4 gap-3 mb-4">' + [['STATUS', 'DRAFT'], ['TYPE', isP ? 'INDIVIDUAL' : 'BUSINESS'], ['MARKET', r.code.indexOf('UK') === 0 ? 'UK' : 'EU'], ['DOCUMENTS', '0']].map(function (x) { return '<div class="border border-gray-100 rounded-lg p-3"><p class="text-[11px] text-gray-400">' + x[0] + '</p><p class="text-sm font-bold text-dark mt-1">' + x[1] + '</p></div>'; }).join('') + '</div>'
          + '<div class="border border-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between gap-3"><div><p class="font-bold text-dark text-sm">Review and edit draft</p><p class="text-xs text-gray-400 mt-0.5">Save changes, upload selected files, then submit separately.</p></div><button class="px-3.5 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600" onclick="DDUI.toast(\'Draft editor opened (demo)\',\'info\')">Edit draft details</button></div>'
          + '<div class="border border-gray-100 rounded-lg p-4 mb-4"><p class="font-bold text-dark text-sm mb-1">▼ Select files to upload</p><p class="text-xs text-gray-400 mb-2">Choose initial documents or reviewed supplements. Files with upload receipts cannot be selected again. This action does not formally submit the application.</p>'
          + draftFiles(r)
          + '<label class="flex items-center gap-2 mt-3 text-xs text-gray-500 cursor-pointer"><input type="checkbox" class="w-4 h-4 accent-[#382b1b]" id="sk-verify"/>I have verified the selected files for this case</label>'
          + '<div class="flex items-center gap-3 mt-3"><button class="px-4 py-2 rounded-lg text-xs font-bold text-white" style="background:#2563EB" id="sk-upload">Upload selected files</button><span class="text-xs text-gray-400" id="sk-sel-n">Selected: 0</span></div></div>'
          + '<div class="flex items-center justify-between gap-3 border-t border-gray-100 pt-4"><p class="text-xs text-gray-400">After saving details and uploading files, proceed to the separate submission confirmation.</p><button class="px-4 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap" style="background:#2563EB" id="sk-proceed">Proceed to final submission</button></div>'
          + '<details class="mt-4 border border-gray-100 rounded-lg p-3.5"><summary class="text-sm font-bold text-dark cursor-pointer">Document source check (3)</summary><p class="text-xs text-gray-400 mt-2">All files sourced from internal archive, checksum verified.</p></details>'
          + '<details class="mt-2 border border-gray-100 rounded-lg p-3.5"><summary class="text-sm font-bold text-dark cursor-pointer">Customer Information</summary><p class="text-xs text-gray-500 mt-2">' + esc(r.name) + ' · ' + esc(r.code) + ' · ' + esc(r.email) + '</p></details>'
          + '<p class="text-[11px] text-gray-300 mt-4">Source: Sokin Onboarding API</p>',
        actions: [{ text: 'Close' }]
      });
      var modal = document.querySelector('.ddui-mask');
      if (modal) {
        var box = modal.querySelector('.ddui-box'); if (box) box.style.maxWidth = '780px';
        modal.querySelectorAll('.sk-file').forEach(function (cb) {
          cb.onchange = function () {
            var n = modal.querySelectorAll('.sk-file:checked').length;
            modal.querySelector('#sk-sel-n').textContent = 'Selected: ' + n;
          };
        });
        modal.querySelector('#sk-upload').onclick = function () {
          if (!modal.querySelector('#sk-verify').checked) { DDUI.toast('Please verify the selected files first', 'error'); return; }
          var n = modal.querySelectorAll('.sk-file:checked').length;
          DDUI.toast(n ? n + ' file(s) uploaded to draft' : 'No files selected', n ? 'success' : 'info');
        };
        modal.querySelector('#sk-proceed').onclick = function () {
          (modal.querySelector('.ddui-close') || modal).click();
          openSubmit(r);
        };
      }
    }
    function openSubmit(r) {
      var m = DDUI.modal({
        title: '最终提交 Sokin',
        body: '<p class="text-xs text-gray-400 -mt-1 mb-4">正式发送至 Sokin 审核前，请再次核对当前案件。</p>'
          + '<div class="bg-gray-50 rounded-lg p-3.5 flex items-center justify-between"><div><p class="text-[11px] text-gray-400">当前案件</p><p class="font-bold text-dark mt-0.5">' + esc(r.name) + '</p></div><span class="font-mono text-xs text-gray-400">' + esc(r.appId) + '</span></div>'
          + '<div class="mt-3 rounded-lg px-3.5 py-2.5 text-xs flex items-center gap-2" style="background:#FFF9DB;color:#8a6d00">⚠️ 此操作会将已确认的草稿正式发送至 Sokin 审核。</div>',
        actions: [{ text: '取消' }, {
          text: '提交至 Sokin', type: 'primary', onClick: function (close) {
            skUp(r.id, function (x) {
              x.op = 'submitted'; x.status = '已提交 Sokin｜待审核'; x.link = 'confirm-biz';
              x.fbMode = 'api'; x.lastSync = nowBst(); x.fb = null;
              if (!x.uuid) x.uuid = uuid();
            });
            addLog({ time: now(), name: r.name, id: r.appId, ctype: isP ? 'Individual' : 'Business', atype: 'SK/KYC', result: '最终提交 Sokin', by: '当前管理员', comment: '草稿正式提交至 Sokin 审核' });
            close(); render(); DDUI.toast('已提交至 Sokin，等待审核反馈', 'success');
          }
        }]
      });
    }
    function openLink(r) {
      var picked = '';
      var m = DDUI.modal({
        title: '确认 KYC 链接送达情况',
        body: '<p class="text-xs text-gray-400 -mt-1 mb-4">' + (r.link === 'confirm-draft' ? '当前为 Sokin 草稿，可记录已收到链接；如需发送链接，请先完成正式提交。' : '确认客户是否收到，或由叮当支付发送官方链接。') + '</p>'
          + '<div class="bg-gray-50 rounded-lg p-3.5 grid grid-cols-2 gap-2 mb-4"><div><p class="text-[11px] text-gray-400">客户</p><p class="font-bold text-dark text-sm mt-0.5">' + esc(r.name) + '</p><p class="text-[11px] text-gray-400">' + esc(r.email) + '</p></div><div><p class="text-[11px] text-gray-400">申请编号</p><p class="font-mono text-xs text-gray-500 mt-0.5">' + esc(r.appId) + '</p></div></div>'
          + '<p class="text-sm font-bold text-dark mb-2">客户是否已收到 Sokin 官方 KYC 链接？</p>'
          + '<div class="grid grid-cols-2 gap-3 mb-3"><button class="px-3 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-bold text-gray-600 sk-reach" data-v="yes">是，已收到</button><button class="px-3 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-bold text-gray-600 sk-reach" data-v="no">否，现在发送</button></div>'
          + '<div class="ddui-field"><label class="ddui-label">内部备注（选填）</label><textarea class="ddui-input" id="sk-note" rows="2" placeholder="可记录客户确认结果或交接说明。"></textarea></div>',
        actions: [{ text: '取消' }, {
          text: '请选择收件状态', type: 'primary', onClick: function (close, body) {
            if (!picked) { DDUI.toast('请选择收件状态', 'error'); return; }
            var note = body.querySelector('#sk-note').value.trim();
            skUp(r.id, function (x) { if (picked === 'yes') x.link = 'received'; });
            addLog({ time: now(), name: r.name, id: r.appId, ctype: isP ? 'Individual' : 'Business', atype: 'SK/KYC', result: picked === 'yes' ? '确认客户已收到 KYC 链接' : '重新发送 KYC 链接', by: '当前管理员', comment: note || '—' });
            close(); render();
            DDUI.toast(picked === 'yes' ? '已确认客户收到 KYC 链接' : '官方 KYC 链接已发送至客户邮箱', 'success');
          }
        }]
      });
      var modal = document.querySelector('.ddui-mask');
      if (modal) modal.querySelectorAll('.sk-reach').forEach(function (b) {
        b.onclick = function () {
          picked = b.getAttribute('data-v');
          modal.querySelectorAll('.sk-reach').forEach(function (x) { x.style.borderColor = '#E5E7EB'; x.style.background = '#fff'; });
          b.style.borderColor = '#382b1b'; b.style.background = '#FFF9DB';
          var btn = modal.querySelector('.ddui-foot .ddui-btn-primary');
          if (btn) btn.textContent = picked === 'yes' ? '确认已送达' : '发送链接';
        };
      });
    }
    function openArrange(r) {
      DDUI.modal({
        title: '内部 KYC 安排',
        body: '<p class="text-xs text-gray-400 -mt-1 mb-4">仅供后台工作人员安排；不会向客户发送邮件或确认链接。</p>'
          + '<div class="bg-gray-50 rounded-lg p-3.5 grid grid-cols-2 gap-2 mb-4"><div><p class="text-[11px] text-gray-400">客户</p><p class="font-bold text-dark text-sm mt-0.5">' + esc(r.name) + '</p></div><div><p class="text-[11px] text-gray-400">申请编号</p><p class="font-mono text-xs text-gray-500 mt-0.5">' + esc(r.appId) + '</p></div></div>'
          + '<div class="ddui-field"><label class="ddui-label">安排时间</label><p class="text-xs text-gray-400 mb-1">Europe/London · 30 min</p><input class="ddui-input" id="sk-ar-t" type="datetime-local"/></div>'
          + '<div class="ddui-field"><label class="ddui-label">负责人</label><select class="ddui-input" id="sk-ar-o"><option>vivian</option><option>Catherine</option><option>Debbie</option><option>felina.zhang</option><option>sunny</option><option>刘欣</option><option>王梓楠</option></select></div>',
        actions: [{ text: '取消' }, {
          text: '保存内部安排', type: 'primary', onClick: function (close, body) {
            var t = body.querySelector('#sk-ar-t').value;
            skUp(r.id, function (x) { x.assign = { t: t ? t.replace('T', ' ') + ':00 BST' : nowBst(), by: body.querySelector('#sk-ar-o').value }; });
            close(); render(); DDUI.toast('内部 KYC 安排已保存', 'success');
          }
        }]
      });
    }
    function openRfi(r) {
      DDUI.modal({
        title: '补件进度 - ' + r.name,
        body: '<div class="space-y-3 text-sm">'
          + '<div class="bg-orange-50 border border-orange-100 rounded-lg p-3 text-xs text-orange-600"><b>反馈处理</b><br/>已收到补件反馈，本地任务尚未导入完成。</div>'
          + '<div class="flex items-center justify-between border-b border-gray-50 py-2"><span class="text-gray-500">SK 反馈类型</span><b class="text-dark">企业补件要求</b></div>'
          + '<div class="flex items-center justify-between border-b border-gray-50 py-2"><span class="text-gray-500">补件截止</span><b class="text-dark">2026-10-25</b></div>'
          + '<div class="flex items-center justify-between py-2"><span class="text-gray-500">客户通知</span><b class="text-green-600">邮件已发送</b></div></div>',
        actions: [{ text: '关闭' }]
      });
    }

    /* ---------- 渲染 ---------- */
    function render() {
      var all = records(), rs = view();
      var rfiN = all.filter(function (r) { return r.rfi; }).length;
      var cm = {}; all.forEach(function (r) { cm[r.status] = (cm[r.status] || 0) + 1; });
      var chipsHtml = '<button class="px-3.5 py-1.5 rounded-full text-xs font-bold ' + (chip === 'ALL' && !rfiOnly ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200') + '" style="' + (chip === 'ALL' && !rfiOnly ? 'background:#2563EB' : '') + '" data-chip="ALL">全部 ' + all.length + '</button>'
        + ORDER.filter(function (s) { return cm[s]; }).map(function (s) {
          var on = chip === s && !rfiOnly;
          return '<button class="px-3.5 py-1.5 rounded-full text-xs font-bold ' + (on ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200') + '" style="' + (on ? 'background:#2563EB' : '') + '" data-chip="' + esc(s) + '">' + esc(s) + ' ' + cm[s] + '</button>';
        }).join('');
      mount.innerHTML =
        '<div class="flex items-start justify-between flex-wrap gap-3 mb-4"><div><h2 class="text-xl font-extrabold text-dark">' + (isP ? '个人开户 Sokin' : '商业开户 Sokin') + '</h2><p class="text-xs text-gray-400 mt-1">查看' + (isP ? '个人' : '商业') + '开户的 KYC 状态、提交信息与 Sokin 反馈。</p></div>'
        + '<button class="bg-white border border-gray-200 text-accent2 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-50" data-cmd="refresh">刷新</button></div>'
        + '<div class="bg-white rounded-8 custom-shadow px-4 py-3 mb-3 flex items-center gap-3 flex-wrap"><div class="relative flex-1 min-w-[240px]"><iconify-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" icon="solar:magnifer-bold"></iconify-icon><input class="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-8 text-sm focus:outline-none focus:border-accent2" id="sk-q" placeholder="搜索公司 / 客户名称、申请编号、客户代码或 SK 编号" value="' + esc(q) + '"/></div>'
        + '<button class="px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap ' + (rfiOnly ? 'text-white' : 'text-orange-500') + '" style="background:' + (rfiOnly ? '#FF8106' : 'rgba(255,129,6,.14)') + '" data-cmd="rfi">RFI 待跟进&nbsp;&nbsp;' + rfiN + '</button>'
        + '<span class="text-xs text-gray-400 whitespace-nowrap">显示 ' + rs.length + ' / ' + all.length + '</span></div>'
        + '<div class="bg-white rounded-8 custom-shadow px-4 py-3 mb-4 flex items-center gap-2 flex-wrap"><span class="text-xs text-gray-400 mr-1">状态快捷筛选</span>' + chipsHtml + '</div>'
        + '<div class="bg-white rounded-8 custom-shadow p-5 mb-4 flex items-center justify-between"><div><p class="font-bold text-dark text-sm">' + (isP ? '个人开户 Sokin' : '商业开户 Sokin') + '</p><p class="text-xs text-gray-400 mt-0.5">当前记录</p></div><p class="text-3xl font-extrabold text-dark">' + all.length + '</p></div>'
        + '<div class="bg-white rounded-8 custom-shadow overflow-hidden"><div class="px-5 py-4 border-b border-gray-50 flex items-start justify-between"><div><p class="font-bold text-dark text-sm">' + (isP ? '个人开户 Sokin' : '商业开户 Sokin') + '</p><p class="text-xs text-gray-400 mt-0.5">在此记录人工 Sokin 提交与 KYC 链接，并维护 KYC 状态和最新反馈。</p></div><p class="text-2xl font-extrabold text-dark">' + rs.length + '</p></div>'
        + '<div class="ob-fit"><table class="w-full text-sm"><colgroup><col style="width:15%"/><col style="width:8%"/><col style="width:12%"/><col style="width:13%"/><col style="width:10%"/><col style="width:12%"/><col style="width:12%"/><col style="width:9%"/><col style="width:9%"/></colgroup><thead><tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50"><th class="px-4 py-3 font-semibold">内部 SK 编号</th><th class="px-3 py-3 font-semibold">客户</th><th class="px-3 py-3 font-semibold">内部 KYC 安排</th><th class="px-3 py-3 font-semibold">SOKIN KYC 状态</th><th class="px-3 py-3 font-semibold">提交信息</th><th class="px-3 py-3 font-semibold">提交操作</th><th class="px-3 py-3 font-semibold">KYC 链接</th><th class="px-3 py-3 font-semibold">状态</th><th class="px-3 py-3 font-semibold">反馈处理</th></tr></thead><tbody>'
        + (rs.length ? rs.map(row).join('') : '<tr><td colspan="9" class="px-5 py-14 text-center text-gray-400">无匹配结果</td></tr>')
        + '</tbody></table></div></div>';
      bind();
    }

    function bind() {
      mount.querySelector('[data-cmd="refresh"]').onclick = function () { render(); DDUI.toast('已刷新', 'success'); };
      mount.querySelector('[data-cmd="rfi"]').onclick = function () { rfiOnly = !rfiOnly; render(); };
      var qi = mount.querySelector('#sk-q');
      qi.oninput = function () { q = qi.value.trim().toLowerCase(); render(); var nq = mount.querySelector('#sk-q'); nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); };
      mount.querySelectorAll('[data-chip]').forEach(function (b) { b.onclick = function () { chip = b.getAttribute('data-chip'); rfiOnly = false; render(); }; });
      mount.querySelectorAll('[data-act-sel]').forEach(function (sel) {
        sel.onchange = function () {
          if (!sel.value) return;
          var id = sel.getAttribute('data-act-sel');
          var r = skLoad().filter(function (x) { return x.id === id; })[0];
          skUp(id, function (x) {
            x.manual = { st: sel.value === 'KYC 已发送' ? '进行中' : '已完成', res: sel.value === 'KYC 已通过' ? '通过' : (sel.value === 'KYC 未通过' ? '未通过' : '—') };
          });
          addLog({ time: now(), name: r.name, id: r.appId, ctype: isP ? 'Individual' : 'Business', atype: 'SK/KYC', result: '人工更新：' + sel.value, by: '当前管理员', comment: '手动更新 KYC 状态' });
          render(); DDUI.toast('KYC 状态已更新：' + sel.value, 'success');
        };
      });
      mount.querySelectorAll('[data-act]').forEach(function (b) {
        b.onclick = function () {
          var kind = b.getAttribute('data-act'), id = b.getAttribute('data-id');
          var r = skLoad().filter(function (x) { return x.id === id; })[0];
          if (!r) return;
          if (kind === 'sync') { skUp(id, function (x) { x.lastSync = nowBst(); }); render(); DDUI.toast('已向 Sokin 发起同步，结果将自动回写', 'success'); }
          else if (kind === 'arrange') openArrange(r);
          else if (kind === 'kyc-detail') { detailOpen[id] = !detailOpen[id]; render(); }
          else if (kind === 'draft') openDraft(r);
          else if (kind === 'submit') openSubmit(r);
          else if (kind === 'link') openLink(r);
          else if (kind === 'rfi') openRfi(r);
          else if (kind === 'manual-res') DDUI.modal({ title: '人工更新结果 - ' + r.name, body: '<p class="text-sm text-gray-500">最近一次人工更新：' + esc(r.lastSync || '—') + (r.manualBy ? ' · ' + esc(r.manualBy) : '') + (r.emailSent ? '<br/>结果通知邮件已发送至客户。' : '') + '</p>', actions: [{ text: '关闭' }] });
        };
      });
    }
    render();
  }


  /* ---------------- 页面：开户审核详情（对标 BilinkPay onboarding-audit，Equals → Sokin） ---------------- */
  function renderAudit(mount) {
    var id = new URLSearchParams(location.search).get('id') || '';
    var a = getApp(id);
    if (!a) {
      mount.innerHTML = '<div class="bg-white rounded-8 custom-shadow p-14 text-center text-gray-400">未找到该申请，可能已被删除。<br/><a class="text-accent2 font-bold" href="ob-business.html">返回开户工作台</a></div>';
      return;
    }
    var isP = a.type === 'personal';
    var wbUrl = isP ? 'ob-personal.html' : 'ob-business.html';
    var editMode = false;
    var openGroups = { 0: true };

    /* ---- 表单信息（左上卡片） ---- */
    function formInfo() {
      var stuff = a.id === 'APP-20261015-YTGIJB';
      if (isP) return [
        ['姓名', a.name], ['国籍 / 地区', a.country || '-'], ['证件类型 / 号码', '护照 / -'],
        ['预计交易活动', '10001-50000 / 每 1 年'], ['资金来源', 'Receiving funds from own accounts'],
        ['居住地址', (a.country || '-') + '（详见地址证明）'],
        ['提交文件清单', 'Personal identity proof, Residential address proof, Source of funds document']
      ];
      return [
        ['公司全称', a.name], ['注册国家/地区', a.country || '-'],
        ['法人代表/签字人', stuff ? 'Wai loon Lim' : '-'], ['证件类型/号码', '- / -'],
        ['业务类型', stuff ? 'Transportation And Storage' : 'Wholesale / Retail Trade'],
        ['预计交易活动', '10001-50000 / 每 1 年'], ['股东及最终受益人', '-'],
        ['资金来源', 'Receiving funds from own accounts Receiving payments from clients'],
        ['注册地址', stuff ? '115, Nether street, London, N12 8ab, United Kingdom' : (a.country || '-') + '（详见注册证书）'],
        ['提交文件清单', 'Register of Shareholders, Certificate of Incorporation, Register of Directors, Business Proof of Address, Authorised signatory ID / passport, Signatory proof of address, Authorised Signatory & UBOs passport, Authorised Signatory & UBOs proof of address, Ownership structure chart, Memorandum & Articles']
      ];
    }

    /* ---- 完整登记信息（手风琴分组） ---- */
    function F(l, v, req, ro) { return { l: l, v: v || '未填写', req: req !== false, ro: !!ro }; }
    function regSections() {
      var stuff = a.id === 'APP-20261015-YTGIJB';
      var signatory = stuff ? 'Wai loon Lim' : '-';
      if (isP) return [
        { t: '原始登记信息', note: '第一步登记时保存的只读审计快照。', fields: [
          F('登记姓名', a.name, 1, 1), F('登记邮箱', a.email, 1, 1), F('手机所属国家/地区', a.country || '英国', 0, 1),
          F('电话区号', (a.phone || '').indexOf('+') === 0 ? a.phone.split(' ')[0] : '+44', 1, 1), F('登记电话', a.phone || '-', 1, 1), F('账户类型', '个人', 1, 1)] },
        { t: '个人信息', note: '证件与身份信息。', fields: [
          F('出生日期', '-'), F('国籍', a.country || '-'), F('证件类型', '护照'), F('证件号码', '-')] },
        { t: '居住地址', note: 'Sokin 需要邮编、城市和国家。', fields: [
          F('邮政编码', '-'), F('城镇 / 城市', '-'), F('国家', a.country || '-')] },
        { t: '申请产品', note: '按需选择 Sokin 账户产品。', fields: [F('账户产品', 'Sokin 个人账户', 0)] },
        { t: '付款需求', note: '预计付款活动、国家和币种。', fields: [
          F('预计年付款量', '10001-50000'), F('主要币种', 'EUR / GBP'), F('付款用途', '个人消费与转账')] },
        { t: '声明与签名', note: '本次开户申请的电子签名。', fields: [
          F('签署人姓名', a.name), F('签署日期', a.ts.slice(0, 10))] }
      ];
      return [
        { t: '原始登记信息', note: '第一步登记时保存的只读审计快照。', fields: [
          F('登记姓名', signatory, 1, 1), F('登记邮箱', a.email, 1, 1), F('手机所属国家/地区', a.country === 'United Kingdom' ? '英国' : (a.country || '-'), 0, 1),
          F('电话区号', '+44', 1, 1), F('登记电话', (a.phone || '').replace(/^\+?\d+\s*/, '') || '-', 1, 1), F('账户类型', '商业', 1, 1), F('登记公司名称', a.name, 0, 1)] },
        { t: '商业信息', note: '注册公司信息和业务概况。', fields: [
          F('注册名称', a.name), F('公司类型', 'Private company'), F('公司编号', '未填写', false), F('公司电话', a.phone || '-'),
          F('注册国家', a.country || '-'), F('注册地区', a.country || '-', false), F('成立日期', stuff ? '04-09-2024' : '-'),
          F('员工人数', '1-10'), F('Industry Main', stuff ? 'Transportation And Storage' : 'Wholesale / Retail Trade'),
          F('Industry Sub', stuff ? 'Land Transport' : '-'), F('是否有网站', '否'),
          F('业务推广说明', stuff ? 'We are a removal company where we provide home moving service solution and delivery service' : '-', false),
          F('业务概览', stuff ? 'We provide home moving and delivery service solutions' : '-')] },
        { t: '注册营业地址', note: 'Sokin requires postcode, town / city, and country. Add building and street details when available.', fields: [
          F('邮政编码', stuff ? 'N12 8AB' : '-'), F('城镇 / 城市', stuff ? 'London' : '-'), F('国家', a.country || '-'),
          F('街道', stuff ? 'Nether Street' : '-', false), F('楼栋 / 门牌', stuff ? '115' : '-', false)] },
        { t: '经营营业地址', note: 'Sokin requires postcode, town / city, and country. Add building and street details when available.', fields: [
          F('经营地址', '同注册营业地址', false)] },
        { t: '授权签署人', note: '被授权签署并代表企业的主要人员。', fields: [
          F('名字', stuff ? 'Wai loon' : '-'), F('姓氏', stuff ? 'Lim' : '-'), F('出生日期', '-'), F('国籍', '-'),
          F('职务', 'Director'), F('邮箱', a.email), F('电话', a.phone || '-'), F('证件类型', '护照', false),
          F('证件号码', '-', false), F('是否 UBO', '是')] },
        { t: '签署人居住地址', note: 'Sokin requires postcode, town / city, and country. Add building and street details when available.', fields: [
          F('居住地址', '-', false)] },
        { t: '董事', note: '请添加尚未作为授权签署人或股东记录的公司董事。', fields: [
          F('董事姓名', signatory), F('任命日期', '-', false)] },
        { t: '股东及最终受益人 1', note: 'Add each individual shareholder or ultimate beneficial owner. Complete one block per owner, up to four entries.', tag: '个人', fields: [
          F('类型', '个人'), F('名字', stuff ? 'Wai loon' : '-'), F('姓氏', stuff ? 'Lim' : '-'), F('出生日期', '-'),
          F('国籍', '-'), F('持股比例', '100%'), F('证件类型', '护照', false), F('证件号码', '-', false),
          F('居住国家', a.country || '-'), F('邮政编码', '-', false), F('城市', '-', false), F('是否控制人', '是')] },
        { t: '申请产品', note: '请按需选择一项或两项 Sokin 账户产品。', fields: [F('账户产品', 'Sokin 商业账户', 0)] },
        { t: '付款需求', note: '预计付款活动、国家和币种。', fields: [
          F('预计年付款量', '10001-50000'), F('付款频率', '每 1 年'), F('主要付款国家', 'United Kingdom'),
          F('主要币种', 'GBP / EUR'), F('单笔平均金额', '≤ 5,000'), F('收款方类型', '供应商 / 服务商'),
          F('月均付款笔数', '10-50'), F('资金来源', 'Receiving funds from own accounts')] },
        { t: '卡片需求', note: '预计用卡场景和支出。', fields: [
          F('是否需要卡', '是'), F('卡片类型', '虚拟卡'), F('预计月消费', '1000-5000'),
          F('用卡场景', '广告投放 / 日常采购'), F('卡组织', 'Mastercard'), F('开卡数量', '1-5')] },
        { t: '声明与签名', note: '本次开户申请的电子签名。', fields: [
          F('签署人姓名', signatory), F('签署日期', a.ts.slice(0, 10)), F('签名方式', '电子签名')] },
        { t: '其他提交信息', note: '旧版本或自定义申请表中保留的字段。', fields: [
          F('推荐渠道', a.note || '-', false), F('备注', a.note || '-', false), F('表单版本', 'v2.1', false)] }
      ];
    }

    /* ---- 资料核验计数（稳定伪随机，Stuffmovers 与 BilinkPay 对齐） ---- */
    function verifyCounts() {
      if (a.id === 'APP-20261015-YTGIJB') return { p: 2, w: 4, b: 0 };
      var h = 0;
      for (var i = 0; i < a.id.length; i++) h = (h * 31 + a.id.charCodeAt(i)) % 997;
      return { p: 1 + h % 3, w: 2 + h % 4, b: 0 };
    }

    /* ---- 流程记录 ---- */
    function timeline(d) {
      var t = [];
      d.logs.forEach(function (l) {
        if (l.id === a.id) t.push({ time: l.time, title: l.atype + ' · ' + l.result, desc: (l.by ? l.by + ' · ' : '') + (l.comment || '') });
      });
      (d.docs[a.id] || []).forEach(function (z) {
        if (z.batch > 0) t.push({ time: z.time, title: 'Customer added supporting documents', desc: 'Additional documents were added while the application remained in its current review stage.' });
      });
      t.push({ time: a.ts + ':26', title: '客户提交开户申请', desc: '申请已提交，等待管理员确认价格方案后进入预审。' });
      return t.sort(function (x, y) { return x.time < y.time ? 1 : -1; });
    }

    function fld(f, gi, fi) {
      var key = 'g' + gi + 'f' + fi;
      var val = (a.detailEdits && a.detailEdits[key]) || f.v;
      var valHtml = editMode && !f.ro
        ? '<input class="ddui-input" style="padding:8px 10px;font-size:13px" data-edit="' + key + '" value="' + esc(val) + '"/>'
        : '<p class="text-sm font-medium text-dark mt-0.5 break-all">' + esc(val) + '</p>';
      return '<div class="py-2"><p class="text-xs text-gray-400">' + esc(f.l) + (f.req ? ' <span class="text-red-400">*</span>' : '') + '</p>' + valHtml
        + (f.ro ? '<p class="text-[11px] text-gray-300 mt-0.5">只读登记快照</p>' : '') + '</div>';
    }

    function groupHtml(g, gi) {
      var open = !!openGroups[gi];
      return '<div class="border-b border-gray-100">'
        + '<button class="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50/60" data-grp="' + gi + '">'
        + '<span class="font-bold text-sm text-dark">' + esc(g.t) + '</span>'
        + (g.tag ? '<span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">' + esc(g.tag) + '</span>' : '')
        + '<span class="text-xs text-gray-400 flex-1 truncate">' + esc(g.note || '') + '</span>'
        + '<span class="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-none">' + g.fields.length + '</span>'
        + '<span class="text-gray-400 text-xs flex-none">' + (open ? '︿' : '﹀') + '</span></button>'
        + (open ? '<div class="px-5 pb-4 grid md:grid-cols-2 xl:grid-cols-3 gap-x-6">' + g.fields.map(function (f, fi) { return fld(f, gi, fi); }).join('') + '</div>' : '')
        + '</div>';
    }

    function zoneHtml(z, zi) {
      var head = '<div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">'
        + '<div><p class="font-bold text-dark text-sm">' + esc(z.zone + z.title) + '</p><p class="text-xs text-gray-400 mt-0.5">提交时间：' + esc(z.time) + '</p></div>'
        + (z.batch > 0 ? '<button class="bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-8 text-xs hover:bg-gray-200" data-mark="' + zi + '">标记已审核</button>' : '')
        + '</div>';
      var items = z.items.map(function (it) {
        var files = it.files.map(function (f) {
          return '<div class="flex flex-wrap items-center gap-2 px-5 py-2.5 border-t border-gray-50 text-sm">'
            + '<iconify-icon class="text-gray-300" icon="solar:document-text-bold"></iconify-icon>'
            + '<span class="font-medium text-dark break-all">' + esc(f.name) + '</span>'
            + '<span class="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[11px] font-bold">已上传</span>'
            + '<span class="text-xs text-gray-400">' + esc(f.size) + '</span>'
            + '<span class="text-xs text-gray-300 flex-1">提交时间：' + esc(f.time) + ' · ' + esc(f.ver) + '</span>'
            + '<button class="text-xs font-bold text-accent2 hover:underline" data-prev="' + esc(f.name) + '">预览</button>'
            + '<button class="text-xs font-bold text-gray-500 hover:text-dark" data-dl="' + esc(f.name) + '">下载</button></div>';
        }).join('');
        return '<div class="px-5 pt-3 pb-1 flex items-center gap-2">'
          + '<span class="text-sm font-bold text-dark">' + esc(it.cat) + '</span>'
          + (it.req ? '<span class="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[11px] font-bold">必传</span>' : '<span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">选传</span>')
          + '<span class="text-xs text-gray-400">' + it.files.length + ' 个文件</span></div>' + files;
      }).join('');
      return '<div class="bg-white rounded-8 custom-shadow overflow-hidden">' + head + '<div class="pb-3">' + items + '</div></div>';
    }

    function render() {
      var d = load();
      a = getApp(id);
      var vc = verifyCounts();
      var sync = d.sync[a.id];
      var zones = d.docs[a.id] || [];
      var tl = timeline(d);
      var secs = regSections();
      var myLogs = d.logs.filter(function (l) { return l.id === a.id; });
      var suppZones = zones.filter(function (z) { return z.batch > 0; });

      /* 审核区当前审核材料：按类目汇总 */
      var matOrder = [], matMap = {};
      zones.forEach(function (z) {
        z.items.forEach(function (it) {
          it.files.forEach(function (f) {
            if (!matMap[it.cat]) { matMap[it.cat] = []; matOrder.push(it.cat); }
            matMap[it.cat].push({ f: f, supp: z.batch > 0 });
          });
        });
      });

      var h = '';

      /* ===== 预审工作台（案件治理面板） ===== */
      h += '<div class="bg-white rounded-8 custom-shadow p-6 mb-5">'
        + '<div class="flex flex-wrap items-start justify-between gap-4">'
        + '<div><div class="flex items-center gap-3 flex-wrap"><h2 class="text-lg font-extrabold text-dark">' + (isP ? '个人' : '商业') + '预审工作台</h2>' + badge(a.status) + '</div>'
        + '<p class="text-xs text-gray-400 mt-1.5">客户代码 <span class="font-mono font-bold text-dark">' + esc(a.code) + '</span></p></div>'
        + (a.status === '待管理员确认价格'
          ? '<button class="bg-primary text-dark font-bold px-5 py-2.5 rounded-8 text-sm hover:shadow-lg transition-all" id="btn-price">确认价格方案</button>'
          : '<button class="bg-gray-100 text-gray-600 font-bold px-5 py-2.5 rounded-8 text-sm hover:bg-gray-200" id="btn-price">价格方案：' + esc(a.pricePlan || '标准方案') + '</button>')
        + '</div>'
        + '<div class="grid md:grid-cols-2 gap-4 mt-5">'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">Pre-review Status</p><p class="font-bold text-dark mt-1">' + esc(a.status) + '</p><p class="text-xs text-gray-400 mt-1">' + (a.status === '待管理员确认价格' ? '管理员确认价格方案后才可进行预审。' : '预审员逐项核对资料后可提交主管终审。') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">Current Status</p><p class="font-bold text-dark mt-1">' + (a.status === '待管理员确认价格' ? '确认价格方案' : esc(a.status)) + '</p><p class="text-xs text-gray-400 mt-1">' + esc(a.status) + '</p></div>'
        + '</div>'
        + '<div class="grid md:grid-cols-4 gap-4 mt-4 text-sm">'
        + '<div class="border border-gray-100 rounded-8 p-4"><p class="text-xs text-gray-400">开户阶段</p><p class="font-bold text-dark mt-1">' + (a.status.indexOf('预审') > -1 || a.status === '待管理员确认价格' ? '待预审' : (a.status.indexOf('终审') > -1 ? '主管终审' : (a.status.indexOf('Sokin') > -1 ? 'Sokin 审核' : '已完结'))) + '</p></div>'
        + '<div class="border border-gray-100 rounded-8 p-4"><p class="text-xs text-gray-400">RFI 来源与状态</p><p class="font-bold text-dark mt-1">' + (suppZones.length ? '补件进行中 · 批次 ' + suppZones.length : '暂无进行中的 RFI') + '</p></div>'
        + '<div class="border border-gray-100 rounded-8 p-4"><p class="text-xs text-gray-400">开户后账户状态</p><p class="font-bold text-dark mt-1">' + (a.status === '开户成功' ? '正常' : '-') + '</p></div>'
        + '<div class="border border-gray-100 rounded-8 p-4 flex flex-col justify-between"><p class="text-xs text-gray-400">RFI 补件管理</p><button class="mt-2 text-left text-xs font-bold text-accent2 hover:underline" id="btn-rfi">查看补件轮次、审核回复及管理参考模板 →</button></div>'
        + '</div></div>';

      /* ===== 案件治理 ===== */
      h += '<div class="bg-white rounded-8 custom-shadow p-6 mb-5">'
        + '<h3 class="font-extrabold text-dark">案件治理</h3><p class="text-xs text-gray-400 mt-0.5">内部指派、价格方案与可审计的审核记录。</p>'
        + '<div class="grid md:grid-cols-5 gap-4 mt-4 text-sm">'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">价格方案</p><p class="font-bold text-dark mt-1">' + esc(a.pricePlan || '待管理员确认价格') + '</p><button class="text-xs font-bold text-accent2 hover:underline mt-1" id="btn-plan">设定方案</button></div>'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">预审员</p><p class="font-bold text-dark mt-1">' + esc(a.reviewer || '未指派') + '</p><button class="text-xs font-bold text-accent2 hover:underline mt-1" id="btn-assign">指派预审员</button></div>'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">SOKIN 案件</p><p class="font-bold text-dark mt-1">' + (sync ? '已同步' : '草稿') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">KYC 状态</p><p class="font-bold text-dark mt-1">' + (sync ? esc(sync.kycSt) : '尚未进行') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-4"><p class="text-xs text-gray-400">KYC 结果</p><p class="font-bold text-dark mt-1">' + (sync ? esc(sync.kycRes) : '-') + '</p></div>'
        + '</div>'
        + '<div class="mt-4 space-y-2">'
        + '<button class="w-full flex items-center justify-between border border-gray-100 rounded-8 px-4 py-3 text-sm font-bold text-dark hover:bg-gray-50" data-col="op">内部审核意见 (' + myLogs.length + ')<span class="text-gray-400 text-xs" id="col-op-ic">' + (openGroups.op ? '︿' : '﹀') + '</span></button>'
        + (openGroups.op ? '<div class="border border-gray-100 rounded-8 p-4 space-y-2">' + (myLogs.length ? myLogs.map(function (l) {
            return '<div class="text-sm"><span class="text-gray-400 text-xs">' + esc(l.time) + ' · ' + esc(l.by) + '</span><p class="font-medium text-dark">' + esc(l.atype + ' · ' + l.result) + '</p><p class="text-gray-500 text-xs mt-0.5">' + esc(l.comment) + '</p></div>';
          }).join('') : '<p class="text-xs text-gray-400">暂无审核意见</p>') + '</div>' : '')
        + '<button class="w-full flex items-center justify-between border border-gray-100 rounded-8 px-4 py-3 text-sm font-bold text-dark hover:bg-gray-50" data-col="rfi">RFI 补件记录 (' + suppZones.length + ')<span class="text-gray-400 text-xs">' + (openGroups.rfi ? '︿' : '﹀') + '</span></button>'
        + (openGroups.rfi ? '<div class="border border-gray-100 rounded-8 p-4 space-y-2">' + (suppZones.length ? suppZones.map(function (z) {
            return '<div class="text-sm"><p class="font-medium text-dark">补件批次 ' + z.batch + '</p><p class="text-xs text-gray-400 mt-0.5">提交时间：' + esc(z.time) + '</p></div>';
          }).join('') : '<p class="text-xs text-gray-400">暂无补件记录</p>') + '</div>' : '')
        + '</div></div>';

      /* ===== 开户审核操作 ===== */
      h += '<div class="mb-4 flex flex-wrap items-start justify-between gap-4">'
        + '<div class="min-w-0">'
        + '<p class="text-xs text-gray-400 mb-1"><a class="hover:text-dark" href="' + wbUrl + '">开户管理</a> / <a class="hover:text-dark" href="' + wbUrl + '">开户工作台</a> / <span class="text-dark font-medium">' + esc(a.name) + '</span></p>'
        + '<div class="flex items-center gap-3 flex-wrap"><h1 class="text-xl font-extrabold text-dark">开户审核操作 - ' + esc(a.name) + '</h1>'
        + '<span class="px-2 py-0.5 rounded-full bg-primary/15 text-dark text-xs font-bold">' + esc(a.source) + '</span></div>'
        + '<p class="text-xs text-gray-400 mt-1">全宽布局 · 逐项核对商户提交的证件信息、地址证明和工商信息</p></div>'
        + '<a class="bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-8 text-sm hover:bg-gray-200 flex-none" href="' + wbUrl + '">返回列表</a></div>'
        + '<div class="bg-white rounded-8 custom-shadow px-5 py-4 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">'
        + '<span class="flex items-center gap-2">申请流程状态：' + badge(a.status) + '</span>'
        + '<span class="text-gray-300">|</span>'
        + '<span>资料核验结果：<b class="text-green-600">通过 ' + vc.p + ' 项</b> · <b class="text-orange-500">需人工关注 ' + vc.w + ' 项</b> · <b class="text-red-500">异常 ' + vc.b + ' 项</b></span>'
        + '<span class="flex items-center gap-4 ml-auto text-xs text-gray-400">'
        + '<span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-green-500 inline-block"></i>资料核验通过</span>'
        + '<span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-orange-400 inline-block"></i>需人工关注</span>'
        + '<span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-red-500 inline-block"></i>资料核验异常</span></span></div>';

      /* 表单信息 + AML */
      h += '<div class="grid xl:grid-cols-3 gap-5 mb-5">'
        + '<div class="xl:col-span-2 bg-white rounded-8 custom-shadow overflow-hidden">'
        + '<button class="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-100" data-col="form">'
        + '<span class="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-base">📋</span>'
        + '<span class="text-left flex-1"><span class="font-bold text-dark block text-sm">客户开户表单信息</span><span class="text-xs text-gray-400">表单填写信息一览 · 可用于与证件、文件进行信息比对</span></span>'
        + '<span class="text-xs text-gray-400">' + (openGroups.form ? '收起' : '展开') + '</span></button>'
        + (openGroups.form !== false ? '<div class="p-5 grid md:grid-cols-2 gap-x-8 gap-y-4">' + formInfo().map(function (kv) {
            return '<div><p class="text-xs text-gray-400">' + esc(kv[0]) + '</p><p class="text-sm font-medium text-dark mt-0.5 break-all">' + esc(kv[1]) + '</p></div>';
          }).join('') + '</div>' : '')
        + '</div>'
        + '<div class="bg-white rounded-8 custom-shadow p-5">'
        + '<p class="font-bold text-dark text-sm">AML 筛查结果</p>'
        + '<p class="text-xs text-gray-400 mt-1">本地规则未识别明显 AML 风险。</p>'
        + '<span class="inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-bold" style="background:#FEF3C7;color:#B45309">medium</span>'
        + '<div class="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1.5">'
        + '<p>制裁名单筛查：<b class="text-green-600">未命中</b></p>'
        + '<p>PEP 筛查：<b class="text-green-600">未命中</b></p>'
        + '<p>负面新闻：<b class="text-orange-500">需人工确认</b></p></div></div></div>';

      /* 完整登记信息 */
      h += '<div class="bg-white rounded-8 custom-shadow overflow-hidden mb-5">'
        + '<div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">'
        + '<div><p class="font-bold text-dark text-sm">完整登记信息</p><p class="text-xs text-gray-400 mt-0.5">默认只读；进入编辑模式后，原始登记快照仍受保护。</p></div>'
        + '<div class="flex items-center gap-2">'
        + '<button class="bg-gray-100 text-gray-600 font-bold px-3.5 py-2 rounded-8 text-xs hover:bg-gray-200" id="btn-phone">核对电话</button>'
        + '<button class="bg-gray-100 text-gray-600 font-bold px-3.5 py-2 rounded-8 text-xs hover:bg-gray-200" id="btn-copy">复制</button>'
        + (editMode
          ? '<button class="bg-primary text-dark font-bold px-3.5 py-2 rounded-8 text-xs" id="btn-save">保存</button><button class="bg-gray-100 text-gray-600 font-bold px-3.5 py-2 rounded-8 text-xs hover:bg-gray-200" id="btn-edit">取消</button>'
          : '<button class="bg-gray-100 text-gray-600 font-bold px-3.5 py-2 rounded-8 text-xs hover:bg-gray-200" id="btn-edit">编辑</button>')
        + '</div></div>'
        + secs.map(groupHtml).join('') + '</div>';

      /* 审核区当前审核材料 */
      h += '<div class="bg-white rounded-8 custom-shadow overflow-hidden mb-5">'
        + '<div class="px-5 py-4 border-b border-gray-100"><p class="font-bold text-dark text-sm">审核区 · 当前审核材料</p>'
        + '<p class="text-xs text-gray-400 mt-0.5">预审员代传的非 UBO 文件经当前材料版本终审通过后，可在 Sokin 草稿中选择上传。材料变更后须重新审核；本地保存不代表已发送 Sokin。</p>'
        + '<p class="text-xs text-gray-300 mt-1">PDF / JPG / PNG / HEIC · 每个文件不超过 10 MB</p></div>'
        + matOrder.map(function (cat) {
          var list = matMap[cat];
          return '<div class="px-5 pt-4 pb-1 flex items-center gap-2"><span class="text-sm font-bold text-dark">' + esc(cat) + '</span><span class="text-xs text-gray-400">' + list.length + ' 个文件</span></div>'
            + list.map(function (m) {
              return '<div class="flex flex-wrap items-center gap-2 px-5 py-2 border-t border-gray-50 text-sm">'
                + '<iconify-icon class="text-gray-300" icon="solar:document-text-bold"></iconify-icon>'
                + '<span class="font-medium text-dark break-all">' + esc(m.f.name) + '</span>'
                + (m.supp ? '<span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold">补交材料（未关联轮次）</span>' : '<span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">首次提交</span>')
                + '<span class="text-xs text-gray-300 flex-1">提交时间：' + esc(m.f.time) + '</span>'
                + '<button class="text-xs font-bold text-accent2 hover:underline" data-prev="' + esc(m.f.name) + '">预览</button></div>';
            }).join('');
        }).join('') + '<div class="pb-3"></div></div>';

      /* 原始区 + 补件区 */
      zones.forEach(function (z, zi) { h += '<div class="mb-5">' + zoneHtml(z, zi) + '</div>'; });

      /* SK / KYC 跟进 */
      h += '<div class="bg-white rounded-8 custom-shadow p-5 mb-5">'
        + '<div class="flex flex-wrap items-center justify-between gap-3"><div><p class="font-bold text-dark text-sm">SK / KYC 跟进</p><p class="text-xs text-gray-400 mt-0.5">主管手动 SK 开户、KYC 链接发送、客户 KYC 和 SK 结果记录。</p></div>' + badge(a.status) + '</div>'
        + '<div class="grid md:grid-cols-5 gap-4 mt-4 text-sm">'
        + '<div class="bg-gray-50 rounded-8 p-3.5"><p class="text-xs text-gray-400">客户邮箱</p><p class="font-medium text-dark mt-1 break-all">' + esc(a.email || '-') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-3.5"><p class="text-xs text-gray-400">SK Reference</p><p class="font-mono font-bold text-dark mt-1">' + (sync ? 'SK-' + a.id : '-') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-3.5"><p class="text-xs text-gray-400">Sokin 案件状态</p><p class="font-bold text-dark mt-1">' + (sync ? '已同步' : '草稿') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-3.5"><p class="text-xs text-gray-400">KYC 状态</p><p class="font-bold text-dark mt-1">' + (sync ? esc(sync.kycSt) : '尚未进行') + '</p></div>'
        + '<div class="bg-gray-50 rounded-8 p-3.5"><p class="text-xs text-gray-400">KYC 结果</p><p class="font-bold text-dark mt-1">' + (sync ? esc(sync.kycRes) : '-') + '</p></div>'
        + '</div></div>';

      /* 流程记录 */
      h += '<div class="bg-white rounded-8 custom-shadow p-5">'
        + '<p class="font-bold text-dark text-sm mb-4">流程记录</p>'
        + '<div class="space-y-0">' + tl.map(function (t) {
          return '<div class="flex gap-3 pb-4 relative"><div class="flex flex-col items-center flex-none"><i class="w-2.5 h-2.5 rounded-full bg-primary inline-block mt-1"></i><i class="w-px flex-1 bg-gray-100"></i></div>'
            + '<div class="pb-1"><p class="text-sm font-bold text-dark">' + esc(t.title) + '</p>'
            + '<p class="text-xs text-gray-400 mt-0.5">' + esc(t.time) + (t.desc ? ' · ' + esc(t.desc) : '') + '</p></div></div>';
        }).join('') + '</div></div>';

      mount.innerHTML = h;
      bind();
    }

    function bind() {
      /* 手风琴 */
      mount.querySelectorAll('[data-grp]').forEach(function (b) {
        b.onclick = function () { var g = +b.getAttribute('data-grp'); openGroups[g] = !openGroups[g]; render(); };
      });
      mount.querySelectorAll('[data-col]').forEach(function (b) {
        b.onclick = function () { var k = b.getAttribute('data-col'); openGroups[k] = !openGroups[k]; render(); };
      });
      /* 预览 / 下载 */
      mount.querySelectorAll('[data-prev]').forEach(function (b) {
        b.onclick = function () {
          DDUI.modal({ title: '文件预览 - ' + b.getAttribute('data-prev'),
            body: '<div class="bg-gray-50 rounded-8 p-10 text-center text-gray-400 text-sm"><iconify-icon class="text-4xl text-gray-300" icon="solar:document-text-bold"></iconify-icon><p class="mt-3">' + esc(b.getAttribute('data-prev')) + '</p><p class="text-xs mt-1">原型环境暂不支持在线预览，正式环境将在此展示文件内容。</p></div>',
            actions: [{ text: '关闭' }] });
        };
      });
      mount.querySelectorAll('[data-dl]').forEach(function (b) {
        b.onclick = function () { DDUI.toast('已开始下载：' + b.getAttribute('data-dl'), 'success'); };
      });
      /* 标记已审核 */
      mount.querySelectorAll('[data-mark]').forEach(function (b) {
        b.onclick = function () {
          DDUI.confirm({ title: '标记已审核', text: '确认该补件批次的资料已全部审核？', okText: '确认',
            onOk: function () { addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: '资料审核', result: '补件批次已审核', by: '当前管理员', comment: '补件批次标记为已审核' }); DDUI.toast('已标记为已审核', 'success'); } });
        };
      });
      /* 确认价格方案 / 设定方案 */
      function planModal(confirmFlow) {
        DDUI.modal({
          title: confirmFlow ? '确认价格方案 - ' + a.name : '设定价格方案 - ' + a.name,
          body: '<div class="ddui-field"><label class="ddui-label">价格方案</label><select class="ddui-input" id="pl-v">'
            + '<option>标准方案（开户费 €0 · 月费 €29）</option><option>优惠方案（开户费 €0 · 月费 €19）</option><option>定制方案（大商户议价）</option></select></div>'
            + '<div class="ddui-field"><label class="ddui-label">备注</label><textarea class="ddui-input" id="pl-c" rows="2" placeholder="选填"></textarea></div>',
          actions: [{ text: '取消' }, { text: confirmFlow ? '确认并进入预审' : '保存', type: 'primary', onClick: function (close, body) {
            var plan = body.querySelector('#pl-v').value.split('（')[0];
            var c = body.querySelector('#pl-c').value.trim();
            upApp(a.id, function (x) {
              x.pricePlan = plan;
              if (confirmFlow && x.status === '待管理员确认价格') x.status = '待预审';
            });
            addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: '价格方案', result: confirmFlow ? '确认价格方案' : '设定价格方案', by: '当前管理员', comment: plan + (c ? ' · ' + c : '') });
            close(); render(); DDUI.toast(confirmFlow ? '价格方案已确认，申请进入待预审' : '价格方案已保存', 'success');
          } }]
        });
      }
      var bp = mount.querySelector('#btn-price');
      if (bp) bp.onclick = function () { planModal(a.status === '待管理员确认价格'); };
      var bpl = mount.querySelector('#btn-plan');
      if (bpl) bpl.onclick = function () { planModal(false); };
      /* 指派预审员 */
      var ba = mount.querySelector('#btn-assign');
      if (ba) ba.onclick = function () {
        DDUI.modal({
          title: '指派预审员 - ' + a.name,
          body: '<div class="ddui-field"><label class="ddui-label">预审员</label><select class="ddui-input" id="as-v">' + staffOptions(REVIEWERS, a.reviewer) + '</select></div>',
          actions: [{ text: '取消' }, { text: '保存', type: 'primary', onClick: function (close, body) {
            var v = body.querySelector('#as-v').value;
            upApp(a.id, function (x) { x.reviewer = v; });
            addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: '内部指派', result: v ? '指派预审员 ' + v : '取消指派', by: '当前管理员', comment: v ? '指派预审员：' + v : '取消预审员指派' });
            close(); render(); DDUI.toast('预审员已更新', 'success');
          } }]
        });
      };
      /* RFI 补件管理 */
      var br = mount.querySelector('#btn-rfi');
      if (br) br.onclick = function () {
        DDUI.modal({ title: 'RFI 补件管理 - ' + a.name,
          body: '<p class="text-sm text-gray-500">查看补件轮次、审核回复及管理参考模板。</p><p class="text-sm text-gray-500 mt-2">当前补件批次：<b>' + (load().docs[a.id] || []).filter(function (z) { return z.batch > 0; }).length + '</b>，详细资料请前往「资料归档」页处理。</p>',
          actions: [{ text: '关闭' }, { text: '前往资料归档', type: 'primary', onClick: function () { location.href = isP ? 'ob-personal-archive.html' : 'ob-business-archive.html'; } }] });
      };
      /* 核对电话 / 复制 */
      var bph = mount.querySelector('#btn-phone');
      if (bph) bph.onclick = function () {
        DDUI.modal({ title: '核对电话', body: '<div class="bg-gray-50 rounded-8 p-4 text-center"><p class="text-xs text-gray-400">登记电话</p><p class="text-xl font-extrabold text-dark mt-1 font-mono">' + esc(a.phone || '-') + '</p><p class="text-xs text-gray-400 mt-2">请通过该号码与客户核对身份信息。</p></div>', actions: [{ text: '关闭' }] });
      };
      var bc = mount.querySelector('#btn-copy');
      if (bc) bc.onclick = function () {
        var txt = a.name + '\n' + (a.email || '') + '\n' + (a.phone || '');
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { DDUI.toast('已复制客户联系方式', 'success'); });
        else DDUI.toast('复制成功', 'success');
      };
      /* 编辑模式 */
      var be = mount.querySelector('#btn-edit');
      if (be) be.onclick = function () { editMode = !editMode; render(); };
      var bs = mount.querySelector('#btn-save');
      if (bs) bs.onclick = function () {
        var edits = a.detailEdits || {};
        mount.querySelectorAll('[data-edit]').forEach(function (inp) { edits[inp.getAttribute('data-edit')] = inp.value.trim(); });
        upApp(a.id, function (x) { x.detailEdits = edits; });
        addLog({ time: now(), name: a.name, id: a.id, ctype: isP ? 'Individual' : 'Business', atype: '资料编辑', result: '更新登记信息', by: '当前管理员', comment: '编辑模式下保存登记信息修订' });
        editMode = false; render(); DDUI.toast('登记信息已保存（原始登记快照保持不变）', 'success');
      };
    }

    openGroups.form = true;
    render();
  }

  return {
    renderWorkbench: renderWorkbench, renderArchive: renderArchive,
    renderFinal: renderFinal, renderLog: renderLog, renderSokin: renderSokin,
    renderAudit: renderAudit,
    MANAGERS: MANAGERS, REVIEWERS: REVIEWERS
  };
})();
