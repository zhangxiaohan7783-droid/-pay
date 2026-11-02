/* 页面表格搜索：绑定 #dd-page-search，过滤 main 内所有 tbody 行 */
(function () {
  function norm(s) { return (s || '').toLowerCase(); }
  function colCount(tb, rows) {
    var th = tb.parentElement ? tb.parentElement.querySelector('thead') : null;
    if (th) {
      var hs = th.querySelectorAll('th');
      if (hs.length) return hs.length;
    }
    return rows[0] ? rows[0].children.length : 6;
  }
  function apply(q) {
    q = norm(q).trim();
    document.querySelectorAll('main tbody').forEach(function (tb) {
      var rows = Array.prototype.slice.call(tb.querySelectorAll('tr')).filter(function (r) {
        return !r.classList.contains('dd-search-empty');
      });
      var visible = 0;
      rows.forEach(function (r) {
        var show = !q || norm(r.textContent).indexOf(q) !== -1;
        r.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      var empty = tb.querySelector('tr.dd-search-empty');
      if (q && rows.length && visible === 0) {
        if (!empty) {
          empty = document.createElement('tr');
          empty.className = 'dd-search-empty';
          empty.innerHTML = '<td class="py-10 text-center text-sm text-gray-400" colspan="' + colCount(tb, rows) + '">无匹配结果</td>';
          tb.appendChild(empty);
        }
        empty.style.display = '';
      } else if (empty) {
        empty.style.display = 'none';
      }
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    var inp = document.getElementById('dd-page-search');
    if (inp) inp.addEventListener('input', function () { apply(inp.value); });
  });
})();
