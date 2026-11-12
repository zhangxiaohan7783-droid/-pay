/* 全站顶栏右上角统一（Web 客户端）
 * 标准右侧集群：主体切换器 + 消息 + 语言切换 + 账户持有人（姓名+认证状态）
 * 由 ui.js 自动注入；仅对带侧边栏布局的客户端页面生效（后台 admin 不适用）
 */
(function () {
  function isClientPage() {
    if (/^\/admin\//.test(location.pathname) || location.pathname.indexOf('/admin/') > -1) return false;
    return !!(document.querySelector('main') && (document.getElementById('dd-ent-switcher') || document.querySelector('.dd-sidenav-link')));
  }

  function zh() { try { return localStorage.getItem('dd-lang') !== 'en'; } catch (e) { return true; } }

  function buildCluster(header) {
    if (document.getElementById('dd-topbar-right')) return;

    /* 1. 找/建右侧容器 */
    var right = document.createElement('div');
    right.id = 'dd-topbar-right';
    right.className = 'dd-top-right';

    /* 2. 主体切换器：移动现有 #dd-ent-switcher（保留 entity.js 渲染内容） */
    var ent = document.getElementById('dd-ent-switcher');
    if (ent) right.appendChild(ent);

    /* 3. 消息 */
    var bell = document.createElement('button');
    bell.type = 'button';
    bell.className = 'dd-top-ic';
    bell.title = zh() ? '消息' : 'Messages';
    bell.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><i class="dd-top-dot"></i>';
    bell.addEventListener('click', function () { location.href = 'messages.html'; });
    right.appendChild(bell);

    /* 4. 语言切换 */
    var lang = document.createElement('button');
    lang.type = 'button';
    lang.className = 'dd-top-lang';
    function paintLang() {
      lang.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z"/></svg><span>' + (zh() ? '简体中文' : 'English') + '</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';
    }
    paintLang();
    lang.addEventListener('click', function (e) {
      e.stopPropagation();
      var old = document.getElementById('dd-top-lang-menu');
      if (old) { old.remove(); return; }
      var menu = document.createElement('div');
      menu.id = 'dd-top-lang-menu';
      menu.className = 'dd-top-menu';
      menu.innerHTML = '<div data-l="zh">中文</div><div data-l="en">English</div>';
      var rect = lang.getBoundingClientRect();
      menu.style.top = (rect.bottom + 6) + 'px';
      menu.style.left = Math.max(8, rect.right - 110) + 'px';
      menu.querySelectorAll('div').forEach(function (d) {
        d.addEventListener('click', function () {
          if (d.dataset.l === 'zh') { try { localStorage.setItem('dd-lang', 'zh'); } catch (e2) {} location.reload(); }
          else { menu.remove(); if (window.DDI18N) { DDI18N.setLang('en'); } paintLang(); }
        });
      });
      document.body.appendChild(menu);
      setTimeout(function () {
        document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
      }, 10);
    });
    right.appendChild(lang);

    /* 5. 账户持有人 + 状态 */
    var acc = document.createElement('button');
    acc.type = 'button';
    acc.className = 'dd-top-acc';
    acc.title = zh() ? '账户设置' : 'Settings';
    acc.innerHTML = '<img src="assets/img/9ebd605cdb4a4eb0a9f64c44f54ad3ee.jpg" alt=""/>' +
      '<span class="dd-top-acc-n">小涵总</span>' +
      '<span class="dd-top-badge">' + (zh() ? '已认证' : 'Verified') + '</span>';
    acc.addEventListener('click', function () { location.href = 'settings.html'; });
    right.appendChild(acc);

    header.appendChild(right);

    /* 6. 清理头部内旧的铃铛/语言/头像碎片（保留搜索框与主体切换器） */
    Array.prototype.slice.call(header.children).forEach(function (child) {
      if (child === right || child.id === 'dd-topbar-right') return;
      if (child.querySelector && child.querySelector('#dd-ent-switcher') && child.contains(ent)) return;
    });
    /* 旧碎片在 header 的其他容器里：整个容器若不含标题/搜索/高频按钮/主体切换器则移除 */
    var keep = right;
    Array.prototype.slice.call(header.querySelectorAll('div')).forEach(function (d) {
      if (keep.contains(d) || d.contains(keep) || d.id === 'dd-ent-switcher') return;
      if (d.querySelector('#dd-ent-switcher')) return;
      if (d.querySelector('#dd-quick-acts')) return;
      if (d.querySelector('input')) return; /* 搜索框容器保留 */
      if (d.querySelector('h1,h2')) return;
      var t = (d.textContent || '').trim();
      var hasBell = !!d.querySelector('iconify-icon[icon*="bell"], svg');
      var hasLang = /^(简体中文|中文|English)?$/.test(t) && d.querySelector('iconify-icon');
      var onlyAvatar = d.querySelector('img') && t.length < 12;
      if ((hasBell && t.length < 20) || hasLang || onlyAvatar) d.remove();
    });

    /* 7. 隐藏 i18n 浮动语言胶囊（已并入顶栏）；i18n 在 DOMContentLoaded 才建胶囊，需 load 时再清一次 */
    document.body.classList.add('dd-has-topbar');
    function killPill() { var pill = document.querySelector('.dd-lang-pill'); if (pill) pill.remove(); }
    killPill();
    window.addEventListener('load', killPill);
    setTimeout(killPill, 800);
  }

  function isRealBar(header) {
    var c = header.className || '';
    return /sticky|h-16|h-20|dd-topbar/.test(c);
  }

  function ensureHeader() {
    var main = document.querySelector('main');
    if (!main) return null;
    var header = main.querySelector('header');
    if (header && isRealBar(header)) {
      /* 真顶栏：确保 flex 布局以容纳右侧集群 */
      if (!/flex/.test(header.className)) header.classList.add('dd-topbar-flex');
      return header;
    }
    /* 无顶栏或仅内容内标题行：注入标准吸顶栏 */
    var bar = document.createElement('header');
    var padded = /(^|\s)p-\d|p-4|p-6|p-8/.test(main.className || '');
    bar.className = 'dd-topbar' + (padded ? ' dd-topbar-card' : '');
    var title = main.querySelector('h1, h2');
    bar.innerHTML = '<div class="dd-topbar-l"><h2>' + (title ? title.textContent.trim() : '') + '</h2></div>';
    main.insertBefore(bar, main.firstChild);
    return bar;
  }

  function init() {
    if (!isClientPage()) return;
    var header = ensureHeader();
    if (!header) return;
    try { buildCluster(header); } catch (e) { /* 不影响页面 */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
