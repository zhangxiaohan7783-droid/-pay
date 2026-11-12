/* 通用列表增强组件 table-kit
 * 自动增强 main 内的每张表格：
 *  1. 表头工具条：搜索框（页面无 #dd-page-search / .data-search 时注入）+ 行数统计
 *  2. 超过 PAGE_SIZE（10）行自动分页，含「上一页/下一页」与「查看全部」
 *  3. 行点击查看全部字段详情（DDUI.modal），跳过已有行级交互的表格
 * 页面可通过 <table data-tk="off"> 或 <tbody data-tk="off"> 关闭增强
 * 页面可通过 <table data-tk-norow> 只关闭行点击详情
 */
(function () {
  var PAGE_SIZE = 10;
  var KEY_PREFIX = 'ddtk-';

  function zh() { try { return localStorage.getItem('dd-lang') !== 'en'; } catch (e) { return true; } }
  function T(a, b) { return zh() ? a : b; }

  function norm(s) { return (s || '').toLowerCase(); }

  /* 判断表格是否已有行级点击交互（有 onclick 的行、或行内有按钮/链接操作列的跳过由点击目标判断） */
  function rowHasOwnHandler(tr) {
    if (tr.hasAttribute('onclick')) return true;
    if (tr.getAttribute('data-tk-norow') !== null) return true;
    return false;
  }

  function isPageSearched() {
    return !!(document.getElementById('dd-page-search') || document.querySelector('.data-search'));
  }

  function buildToolbar(table, state) {
    var bar = document.createElement('div');
    bar.className = 'ddtk-bar';
    var left = document.createElement('div');
    left.className = 'ddtk-bar-l';
    var cnt = document.createElement('span');
    cnt.className = 'ddtk-count';
    left.appendChild(cnt);
    bar.appendChild(left);

    var right = document.createElement('div');
    right.className = 'ddtk-bar-r';
    if (!isPageSearched()) {
      var inp = document.createElement('input');
      inp.className = 'ddtk-search';
      inp.type = 'search';
      inp.placeholder = T('搜索本表…', 'Search…');
      inp.addEventListener('input', function () { state.q = inp.value; state.page = 0; render(table, state); });
      right.appendChild(inp);
      state.searchEl = inp;
    }
    var allBtn = document.createElement('button');
    allBtn.className = 'ddtk-all';
    allBtn.type = 'button';
    allBtn.textContent = T('查看全部', 'View all');
    allBtn.addEventListener('click', function () { openAll(table, state); });
    right.appendChild(allBtn);
    bar.appendChild(right);

    table.parentNode.insertBefore(bar, table);
    state.bar = bar;
    state.cnt = cnt;
  }

  function buildPager(table, state) {
    var pager = document.createElement('div');
    pager.className = 'ddtk-pager';
    var prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'ddtk-pg'; prev.textContent = T('‹ 上一页', '‹ Prev');
    var info = document.createElement('span'); info.className = 'ddtk-pginfo';
    var next = document.createElement('button');
    next.type = 'button'; next.className = 'ddtk-pg'; next.textContent = T('下一页 ›', 'Next ›');
    prev.addEventListener('click', function () { if (state.page > 0) { state.page--; render(table, state); } });
    next.addEventListener('click', function () {
      var tp = totalPages(state);
      if (state.page < tp - 1) { state.page++; render(table, state); }
    });
    pager.appendChild(prev); pager.appendChild(info); pager.appendChild(next);
    table.parentNode.insertBefore(pager, table.nextSibling);
    state.pager = pager; state.pgInfo = info; state.pgPrev = prev; state.pgNext = next;
  }

  function dataRows(table) {
    var tb = table.querySelector('tbody');
    if (!tb) return [];
    return Array.prototype.slice.call(tb.querySelectorAll('tr')).filter(function (r) {
      return !r.classList.contains('dd-search-empty') && !r.classList.contains('ddtk-empty');
    });
  }

  function filtered(state) {
    var q = norm(state.q).trim();
    return state.rows.filter(function (r) {
      return !q || norm(r.textContent).indexOf(q) !== -1;
    });
  }

  function totalPages(state) {
    return Math.max(1, Math.ceil(filtered(state).length / PAGE_SIZE));
  }

  function ensureEmptyRow(table, state) {
    var tb = table.querySelector('tbody');
    var em = tb.querySelector('tr.ddtk-empty');
    if (!em) {
      em = document.createElement('tr');
      em.className = 'ddtk-empty';
      var cols = table.querySelectorAll('thead th').length || (state.rows[0] ? state.rows[0].cells.length : 6);
      em.innerHTML = '<td colspan="' + cols + '" class="ddtk-empty-td">' + T('无匹配结果', 'No results') + '</td>';
      tb.appendChild(em);
    }
    return em;
  }

  function render(table, state) {
    var vis = filtered(state);
    var tp = totalPages(state);
    if (state.page >= tp) state.page = tp - 1;
    var needPager = vis.length > PAGE_SIZE;

    /* 隐藏全部，再显示当前页 */
    state.rows.forEach(function (r) { r.style.display = 'none'; });
    var slice = needPager ? vis.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE) : vis;
    slice.forEach(function (r) { r.style.display = ''; });

    var em = ensureEmptyRow(table, state);
    em.style.display = vis.length === 0 ? '' : 'none';

    if (state.cnt) {
      state.cnt.textContent = state.q
        ? T('匹配 ' + vis.length + ' / 共 ' + state.rows.length + ' 条', vis.length + ' matched / ' + state.rows.length + ' total')
        : T('共 ' + state.rows.length + ' 条', state.rows.length + ' total');
    }
    if (state.pager) {
      state.pager.style.display = needPager ? '' : 'none';
      state.pgInfo.textContent = (state.page + 1) + ' / ' + tp;
      state.pgPrev.disabled = state.page === 0;
      state.pgNext.disabled = state.page >= tp - 1;
    }
    if (state.bar) {
      var allBtn = state.bar.querySelector('.ddtk-all');
      if (allBtn) allBtn.style.display = vis.length > 0 ? '' : 'none';
    }
  }

  /* 行详情弹窗 */
  function rowDetail(table, tr) {
    if (!window.DDUI || !DDUI.modal) return;
    var ths = table.querySelectorAll('thead th');
    var cells = tr.querySelectorAll('td');
    var rows = '';
    for (var i = 0; i < cells.length; i++) {
      var k = ths[i] ? ths[i].textContent.trim() : (T('字段 ', 'Field ') + (i + 1));
      var v = cells[i].textContent.trim().replace(/\s+/g, ' ');
      if (!v) v = '—';
      rows += '<div class="ddui-kv"><span>' + k + '</span><b>' + v.replace(/</g, '&lt;') + '</b></div>';
    }
    var title = ths[0] ? (ths[0].textContent.trim() + '：' + (cells[0] ? cells[0].textContent.trim() : '')) : T('行详情', 'Row detail');
    DDUI.modal({ title: title, width: 520, body: '<div class="ddtk-detail">' + rows + '</div>' });
  }

  /* 「查看全部」：弹窗内展示当前筛选后的全部行（克隆表格） */
  function openAll(table, state) {
    if (!window.DDUI || !DDUI.modal) return;
    var vis = filtered(state);
    var clone = table.cloneNode(true);
    clone.removeAttribute('data-tk');
    var tb = clone.querySelector('tbody');
    var map = new Map();
    Array.prototype.slice.call(tb.querySelectorAll('tr')).forEach(function (r, i) {
      if (r.classList.contains('ddtk-empty') || r.classList.contains('dd-search-empty')) { r.remove(); return; }
      var orig = state.rows[i];
      r.style.display = (orig && vis.indexOf(orig) !== -1) ? '' : 'none';
    });
    var box = document.createElement('div');
    box.className = 'ddtk-allbox';
    box.appendChild(clone);
    DDUI.modal({
      title: T('全部记录（' + vis.length + ' 条）', 'All records (' + vis.length + ')'),
      width: Math.min(960, window.innerWidth - 48),
      body: box
    });
  }

  function enhance(table) {
    var tb = table.querySelector('tbody');
    if (!tb) return;
    if (table.getAttribute('data-tk') === 'off' || tb.getAttribute('data-tk') === 'off') return;
    if (table.closest('.ddui-box')) return; /* 弹窗内的表不增强 */
    var rows = dataRows(table);
    if (rows.length === 0) return;
    if (rows.length < 4 && !table.hasAttribute('data-tk-force')) {
      /* 行太少的表只加计数条，不加搜索分页 */
    }
    var state = { q: '', page: 0, rows: rows };
    buildToolbar(table, state);
    buildPager(table, state);
    if (table.hasAttribute('data-tk-norow')) {
      state.noRow = true;
    } else {
      tb.addEventListener('click', function (e) {
        if (e.target.closest('a,button,input,select,textarea,label,[onclick]')) return;
        var tr = e.target.closest('tr');
        if (!tr || rowHasOwnHandler(tr) || tr.classList.contains('ddtk-empty') || tr.classList.contains('dd-search-empty')) return;
        rowDetail(table, tr);
      });
      tb.classList.add('ddtk-rows-clickable');
    }
    render(table, state);
    table.__ddtk = state;
  }

  /* 侧边栏分组折叠（dd-sidenav-sec），记忆折叠状态 */
  function sidebarInit() {
    var secs = document.querySelectorAll('.dd-sidenav-sec');
    if (!secs.length) return;
    var KEY = 'dd-nav-collapse-v1';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    secs.forEach(function (sec, idx) {
      if (sec.dataset.ddtkNav) return;
      sec.dataset.ddtkNav = '1';
      var label = sec.textContent.trim() || ('sec-' + idx);
      /* 收集到下一个 sec 之间的链接 */
      var links = [];
      var n = sec.nextElementSibling;
      while (n && !n.classList.contains('dd-sidenav-sec')) {
        if (n.classList.contains('dd-sidenav-link')) links.push(n);
        n = n.nextElementSibling;
      }
      if (!links.length) return;
      var arrow = document.createElement('span');
      arrow.className = 'ddtk-nav-arrow';
      arrow.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';
      sec.appendChild(arrow);
      function apply(collapsed) {
        links.forEach(function (l) { l.style.display = collapsed ? 'none' : ''; });
        sec.classList.toggle('ddtk-nav-collapsed', collapsed);
      }
      apply(!!saved[label]);
      /* 当前页所在分组不折叠 */
      if (links.some(function (l) { return l.classList.contains('dd-sidenav-active'); })) apply(false);
      sec.addEventListener('click', function () {
        var collapsed = !sec.classList.contains('ddtk-nav-collapsed');
        apply(collapsed);
        try {
          saved[label] = collapsed;
          localStorage.setItem(KEY, JSON.stringify(saved));
        } catch (e) {}
      });
    });
  }

  function init() {
    document.querySelectorAll('main table').forEach(function (t) {
      try { enhance(t); } catch (e) { /* 单表失败不影响其他 */ }
    });
    /* 与页面已有搜索框联动：外部搜索时同步各表状态并重渲染分页 */
    document.querySelectorAll('#dd-page-search, .data-search').forEach(function (inp) {
      if (inp.dataset.ddtkBound) return;
      inp.dataset.ddtkBound = '1';
      inp.addEventListener('input', function () {
        document.querySelectorAll('main table').forEach(function (t) {
          var st = t.__ddtk;
          if (!st) return;
          st.rows = dataRows(t);
          st.q = inp.value; st.page = 0;
          render(t, st);
        });
      });
    });
    sidebarInit();
  }

  /* 供页面动态刷新行后调用：DDTableKit.refresh(table) */
  window.DDTableKit = {
    refresh: function (table) {
      var st = table.__ddtk;
      if (!st) { enhance(table); return; }
      st.rows = dataRows(table);
      render(table, st);
    },
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
