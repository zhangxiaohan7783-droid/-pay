/* 叮当支付 Web 客户端登录守卫（演示版，纯前端）
 * - 客户端页面在 <head> 最前面引入本文件：未登录直接跳转 login.html?next=当前页
 * - login.html 调用 DDAuth.login(account, password) 校验
 * - 注意：纯静态站点的前端校验只能防误入，不能代替服务端鉴权
 */
(function () {
  var KEY = 'dd-auth', USERS = 'dd-users', TTL = 12 * 3600 * 1000;
  // 内置账户：账号明文，密码只存 SHA-256 摘要
  var BUILTIN = { 'xiaohan@dingdangpay.com': '445bcdeb648d12c08d2bf17909ed4a2066b024f05a50d19bd0aa6501a8087893' };

  function read(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function session() { var s = read(KEY); return s && s.exp > Date.now() ? s : null; }

  // 同步 SHA-256（不依赖 crypto.subtle，http 局域网访问也可用）
  function sha256hex(str) {
    var bytes = unescape(encodeURIComponent(str)), K = [], H = [], i, j;
    function isP(n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    for (i = 2, j = 0; j < 64; i++) if (isP(i)) { if (j < 8) H[j] = frac(Math.pow(i, 1 / 2)); K[j++] = frac(Math.pow(i, 1 / 3)); }
    var l = bytes.length, w = [];
    for (i = 0; i < l; i++) w[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    w[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    w[((l + 8) >> 6 << 4) + 15] = l * 8;
    function r(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (i = 0; i < w.length; i += 16) {
      var a = H.slice(0), W = [];
      for (j = 0; j < 64; j++) {
        if (j < 16) W[j] = w[i + j] | 0;
        else W[j] = (W[j - 16] + (r(W[j - 15], 7) ^ r(W[j - 15], 18) ^ (W[j - 15] >>> 3)) + W[j - 7] + (r(W[j - 2], 17) ^ r(W[j - 2], 19) ^ (W[j - 2] >>> 10))) | 0;
        var t1 = (a[7] + (r(a[4], 6) ^ r(a[4], 11) ^ r(a[4], 25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[j] + W[j]) | 0;
        var t2 = ((r(a[0], 2) ^ r(a[0], 13) ^ r(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]))) | 0;
        a = [(t1 + t2) | 0].concat(a.slice(0, 7)); a[4] = (a[4] + t1) | 0;
      }
      for (j = 0; j < 8; j++) H[j] = (H[j] + a[j]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  function sha256(str) { return Promise.resolve(sha256hex(String(str))); }

  function users() { return Object.assign({}, read(USERS) || {}, BUILTIN); }

  var api = {
    session: session,
    isAuthed: function () { return !!session(); },
    login: function (account, pwd) {
      var acc = String(account || '').trim().toLowerCase();
      return sha256(pwd).then(function (h) {
        var u = users();
        if (!u[acc] || u[acc] !== h) return false;
        localStorage.setItem(KEY, JSON.stringify({ u: acc, exp: Date.now() + TTL }));
        return true;
      });
    },
    register: function (account, pwd) {
      var acc = String(account || '').trim().toLowerCase();
      return sha256(pwd).then(function (h) {
        var u = read(USERS) || {};
        u[acc] = h;
        localStorage.setItem(USERS, JSON.stringify(u));
        return true;
      });
    },
    logout: function () { localStorage.removeItem(KEY); },
    nextUrl: function () {
      var n = new URLSearchParams(location.search).get('next') || '';
      // 只允许站内相对 .html 地址，防止开放重定向
      return /^[a-z0-9\-_]+\.html(\?[^#]*)?(#.*)?$/i.test(n) && n !== 'login.html' ? n : 'dashboard.html';
    }
  };
  window.DDAuth = api;

  var guard = document.currentScript && document.currentScript.hasAttribute('data-guard');
  if (!guard) return;

  // 演示模式：URL 带 demo=1 且未登录时，自动用内置演示账户建立会话（仅演示环境）
  if (!session() && /[?&]demo=1\b/.test(location.search)) {
    var demoAcc = Object.keys(BUILTIN)[0];
    localStorage.setItem(KEY, JSON.stringify({ u: demoAcc, exp: Date.now() + TTL }));
  }

  if (!session()) {
    var here = location.pathname.split('/').pop() + location.search + location.hash;
    document.documentElement.style.visibility = 'hidden';
    location.replace('login.html?next=' + encodeURIComponent(here));
    return;
  }

  // 客户端内所有「退出登录」入口：清除会话后回登录页
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var ic = el.querySelector('iconify-icon');
    var isOut = /(^|\/)login\.html/.test(href) || /退出/.test(el.getAttribute('title') || '') ||
      /^\s*退出(登录)?\s*$|^\s*Log ?out\s*$|^\s*Sign out\s*$/i.test(el.textContent || '') ||
      (ic && /solar:(logout|exit)/.test(ic.getAttribute('icon') || ''));
    if (!isOut) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    api.logout();
    location.href = 'login.html?logout=1';
  }, true);
})();
