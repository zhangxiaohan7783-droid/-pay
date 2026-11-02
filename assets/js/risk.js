/* 叮当支付后台 · 风控系统角色体系（演示版，纯前端）
 * 三个角色：
 *   prereviewer 预审员 —— 开户材料预审（初审）、基础筛查录入
 *   officer      风控员 —— 复核、案件处置、筛查复核、拦截/放行
 *   compliance   合规主管 —— 终审、规则管理、名单管理、全部权限
 * 角色存 localStorage('dd-risk-role')，页面顶栏可切换（演示用）。
 * 用法：DDRisk.role() / DDRisk.can('approve_final') / DDRisk.renderSwitcher(el)
 */
(function () {
  var KEY = 'dd-risk-role';
  var ROLES = {
    prereviewer: { name: '预审员', en: 'Pre-reviewer', color: '#00B7EC', icon: 'solar:document-text-bold',
      desc: '负责开户材料预审、信息完整性核对、基础名单筛查录入' },
    officer: { name: '风控员', en: 'Risk Officer', color: '#FFD008', icon: 'solar:shield-warning-bold',
      desc: '负责风险复核、案件处置、拦截/放行、筛查复核' },
    compliance: { name: '合规主管', en: 'Compliance Lead', color: '#f43f5e', icon: 'solar:verified-check-bold',
      desc: '负责终审放行、风控规则与名单管理、团队管理，拥有全部权限' }
  };
  // 操作权限矩阵
  var ACL = {
    prereviewer: ['review_pre', 'screen_input', 'learn'],
    officer: ['review_pre', 'review_recheck', 'case_handle', 'screen_input', 'screen_recheck', 'intercept', 'learn'],
    compliance: ['review_pre', 'review_recheck', 'approve_final', 'case_handle', 'case_close', 'screen_input', 'screen_recheck', 'intercept', 'rule_manage', 'list_manage', 'learn']
  };

  function role() {
    var r = localStorage.getItem(KEY);
    return ROLES[r] ? r : 'officer';
  }
  function setRole(r) {
    if (!ROLES[r]) return;
    localStorage.setItem(KEY, r);
    location.reload();
  }
  function can(action) { return (ACL[role()] || []).indexOf(action) > -1; }
  function info(r) { return ROLES[r || role()]; }

  // 页面顶栏角色切换器：挂载到传入元素
  function renderSwitcher(el) {
    if (!el) return;
    var cur = role(), meta = ROLES[cur];
    el.innerHTML =
      '<div class="relative" id="dd-role-switch">' +
      '<button class="flex items-center gap-2 px-3 py-1.5 rounded-8 border border-gray-200 bg-white hover:border-gray-300 text-sm font-bold" id="dd-role-btn" type="button">' +
      '<iconify-icon icon="' + meta.icon + '" style="color:' + meta.color + '"></iconify-icon>' +
      '<span>' + meta.name + '</span>' +
      '<iconify-icon class="text-xs text-gray-400" icon="solar:alt-arrow-down-linear"></iconify-icon></button>' +
      '<div class="absolute right-0 mt-2 w-72 bg-white rounded-8 shadow-xl border border-gray-100 p-2 z-50 hidden" id="dd-role-menu"></div></div>';
    var menu = el.querySelector('#dd-role-menu');
    Object.keys(ROLES).forEach(function (k) {
      var m = ROLES[k];
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'w-full text-left px-3 py-2.5 rounded-8 hover:bg-gray-50 flex items-start gap-3' + (k === cur ? ' bg-gray-50' : '');
      item.innerHTML = '<iconify-icon class="text-xl mt-0.5" icon="' + m.icon + '" style="color:' + m.color + '"></iconify-icon>' +
        '<span class="min-w-0"><span class="flex items-center gap-2 text-sm font-bold text-dark">' + m.name +
        (k === cur ? '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">当前</span>' : '') +
        '</span><span class="block text-xs text-gray-400 mt-0.5 leading-relaxed">' + m.desc + '</span></span>';
      item.onclick = function () { setRole(k); };
      menu.appendChild(item);
    });
    var btn = el.querySelector('#dd-role-btn');
    btn.onclick = function (e) { e.stopPropagation(); menu.classList.toggle('hidden'); };
    document.addEventListener('click', function () { menu.classList.add('hidden'); });
  }

  // 无权限按钮统一置灰 + 提示
  function guard(scope) {
    document.querySelectorAll('[data-risk-need]').forEach(function (b) {
      var need = b.getAttribute('data-risk-need');
      if (can(need)) return;
      b.classList.add('opacity-40', 'cursor-not-allowed');
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (window.DDUI) DDUI.toast('当前角色「' + info().name + '」无此操作权限，需 ' + needLabel(need), 'error');
      }, true);
    });
  }
  function needLabel(need) {
    var map = { review_pre: '预审员及以上', review_recheck: '风控员及以上', approve_final: '合规主管', case_handle: '风控员及以上', case_close: '合规主管', screen_recheck: '风控员及以上', intercept: '风控员及以上', rule_manage: '合规主管', list_manage: '合规主管' };
    return map[need] || '更高权限角色';
  }

  window.DDRisk = { role: role, setRole: setRole, can: can, info: info, renderSwitcher: renderSwitcher, guard: guard, ROLES: ROLES };
})();
