/* 叮当支付后台 · 风控角色体系（兼容适配层）
 * 已统一至 RC 六角色（assets/js/rc-data.js）：officer/reviewer/supervisor/head/auditor/admin
 * 本文件仅为旧页面保留 DDRisk 接口，内部全部委托 RC；加载前需先加载 rc-data.js。
 * 旧动作名 → RC 角色映射见 ACT。超管仅系统配置，禁止业务操作。
 */
(function () {
  function R() { return window.RC; }
  /* 旧 3 角色 → 新 6 角色 */
  var ROLE_MAP = { prereviewer: 'reviewer', officer: 'officer', compliance: 'supervisor' };
  /* 旧动作 → 允许角色（admin 一律禁止业务操作） */
  var ACT = {
    review_pre: ['officer', 'reviewer', 'supervisor', 'head'],
    review_recheck: ['officer', 'supervisor', 'head'],
    approve_final: ['supervisor', 'head'],
    case_handle: ['officer', 'supervisor', 'head'],
    case_close: ['supervisor', 'head'],
    screen_input: ['officer', 'reviewer', 'supervisor', 'head'],
    screen_recheck: ['officer', 'reviewer', 'supervisor', 'head'],
    intercept: ['officer', 'supervisor', 'head'],
    tx_review: ['officer', 'supervisor', 'head'],
    rule_manage: ['supervisor', 'head'],
    list_manage: ['head'],
    learn: ['officer', 'reviewer', 'supervisor', 'head', 'auditor']
  };
  var NEED_LABEL = {
    review_pre: '风控专员/合规审核员及以上', review_recheck: '风控专员及以上', approve_final: '风控主管及以上',
    case_handle: '风控专员及以上', case_close: '风控主管及以上', screen_input: '合规审核员及以上',
    screen_recheck: '风控专员及以上', intercept: '风控专员及以上', tx_review: '风控专员及以上',
    rule_manage: '风控主管及以上', list_manage: '合规负责人', learn: '任意角色'
  };

  function role() { return R() ? R().role() : 'officer'; }
  function setRole(r) { if (R()) R().setRole(ROLE_MAP[r] || r); }
  function can(action) {
    var rc = R(); if (!rc) return true;
    if (rc.role() === 'admin') return false;
    return (ACT[action] || []).indexOf(rc.role()) > -1;
  }
  function info() { var rc = R(); return rc ? rc.ROLES[rc.role()] : { name: '风控专员' }; }
  function renderSwitcher(el) { if (R()) R().renderSwitcher(el); }

  /* 无权限按钮统一置灰 + 提示 */
  function guard() {
    document.querySelectorAll('[data-risk-need]').forEach(function (b) {
      var need = b.getAttribute('data-risk-need');
      if (can(need)) return;
      b.classList.add('opacity-40', 'cursor-not-allowed');
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (window.DDUI) DDUI.toast('当前角色「' + info().name + '」无此操作权限，需 ' + (NEED_LABEL[need] || '更高权限角色'), 'error');
      }, true);
    });
  }

  window.DDRisk = { role: role, setRole: setRole, can: can, info: info, renderSwitcher: renderSwitcher, guard: guard, ACT: ACT, ROLE_MAP: ROLE_MAP };
})();
