/* DDEnt 多主体管理：一个平台账户可切换/管理多个主体 */
window.DDEnt = (function () {
    var KEY = 'dd-entities-v1', CUR = 'dd-entity-cur';
    var SEED = [
        { id: 'flash', name: 'Flash Commerce S.r.l.', country: '意大利', reg: 'MI-2598741', vat: 'IT09876543210', status: 'active' },
        { id: 'fast', name: 'Fast Discount S.r.l.', country: '意大利', reg: 'MI-2611345', vat: 'IT11223344556', status: 'active' },
        { id: 'goden', name: 'Goden S.r.l.', country: '意大利', reg: 'MI-2633720', vat: 'IT66778899001', status: 'active' }
    ];
    function all() {
        try { var l = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(l) && l.length) return l; } catch (e) {}
        return SEED.slice();
    }
    function save(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} }
    function cur() { try { return localStorage.getItem(CUR) || all()[0].id; } catch (e) { return all()[0].id; } }
    function obUrl(entId) {
        var ch = 'sokin';
        try { ch = localStorage.getItem('dd-ob-channel') || 'sokin'; } catch (e) {}
        return (ch === 'xgd' ? 'xgd.html' : 'kyb.html') + '?ent=' + entId;
    }
    function current() {
        var id = cur();
        return all().find(function (e) { return e.id === id; }) || all()[0];
    }
    function setCur(id, silent) {
        try { localStorage.setItem(CUR, id); } catch (e) {}
        paint();
        var ent = current();
        if (ent.status === 'pending') {
            if (window.DDUI) DDUI.toast('主体「' + ent.name + '」开户申请未完成，继续填写', 'info');
            setTimeout(function () { location.href = obUrl(ent.id); }, 600);
            return;
        }
        if (!silent && window.DDUI) DDUI.toast('已切换至主体「' + ent.name + '」', 'success');
    }

    function paint() {
        var box = document.getElementById('dd-ent-switcher');
        if (!box) return;
        var e = current();
        box.innerHTML =
            '<button class="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-8 hover:bg-yellow-100 transition-colors" id="dd-ent-btn" type="button">' +
            '<iconify-icon class="text-base text-dark" icon="solar:buildings-2-bold"></iconify-icon>' +
            '<span class="text-sm font-bold text-dark max-w-[140px] truncate">' + e.name + '</span>' +
            '<iconify-icon class="text-xs text-gray-400" icon="solar:alt-arrow-down-linear"></iconify-icon></button>';
        document.getElementById('dd-ent-btn').addEventListener('click', function (ev) {
            ev.stopPropagation();
            toggleMenu();
        });
    }

    function toggleMenu() {
        var old = document.getElementById('dd-ent-menu');
        if (old) { old.remove(); return; }
        var box = document.getElementById('dd-ent-switcher');
        var e = current();
        var menu = document.createElement('div');
        menu.id = 'dd-ent-menu';
        menu.className = 'absolute right-0 top-full mt-2 w-72 bg-white rounded-8 shadow-xl border border-gray-100 z-50 py-2';
        menu.innerHTML =
            '<p class="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase">切换主体（' + all().length + '）</p>' +
            all().map(function (x) {
                var on = x.id === e.id;
                return '<button class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left ent-item" data-id="' + x.id + '" type="button">' +
                    '<div class="w-7 h-7 rounded-8 flex items-center justify-center text-xs font-bold flex-none" style="background:' + (on ? '#FFD008' : '#f3f4f6') + ';color:#382b1b">' + x.name.charAt(0) + '</div>' +
                    '<div class="flex-1 min-w-0"><p class="text-sm font-bold text-dark truncate">' + x.name + (x.status === 'pending' ? ' <span class="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">开户中</span>' : '') + '</p><p class="text-[10px] text-gray-400">' + x.country + ' · ' + (x.vat || x.reg || '') + '</p></div>' +
                    (on ? '<iconify-icon class="text-green-500 flex-none" icon="solar:check-circle-bold"></iconify-icon>' : '') +
                    (all().length > 1 && !on ? '<iconify-icon class="text-gray-300 hover:text-red-400 flex-none ent-del" data-id="' + x.id + '" icon="solar:trash-bin-trash-linear"></iconify-icon>' : '') +
                    '</button>';
            }).join('') +
            '<div class="border-t border-gray-50 mt-1 pt-1"><button class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-accent2 hover:bg-accent2/5" id="dd-ent-add" type="button"><iconify-icon icon="solar:add-circle-bold"></iconify-icon>添加主体</button></div>';
        box.appendChild(menu);
        menu.querySelectorAll('.ent-del').forEach(function (del) {
            del.addEventListener('click', function (ev) {
                ev.stopPropagation();
                var id = del.dataset.id;
                var l = all().filter(function (x) { return x.id !== id; });
                save(l);
                if (cur() === id) setCur(l[0].id, true);
                paint();
                var m2 = document.getElementById('dd-ent-menu'); if (m2) m2.remove();
                if (window.DDUI) DDUI.toast('主体已删除', 'info');
            });
        });
        menu.querySelectorAll('.ent-item').forEach(function (b) {
            b.addEventListener('click', function (ev) {
                if (ev.target.closest('.ent-del')) return;
                setCur(b.dataset.id);
                /* paint() 已销毁菜单，无需再 toggle */
            });
        });
        document.getElementById('dd-ent-add').addEventListener('click', function () {
            toggleMenu();
            addModal();
        });
    }
    /* 单一持久的外部点击关闭监听（init 时注册一次） */
    document.addEventListener('click', function (ev) {
        var m = document.getElementById('dd-ent-menu');
        if (!m) return;
        if (ev.target.closest && (ev.target.closest('#dd-ent-menu') || ev.target.closest('#dd-ent-btn'))) return;
        m.remove();
    });

    function addModal() {
        if (!window.DDUI) return;
        DDUI.modal({
            title: '添加主体',
            body: '<div class="space-y-4">' +
                '<div><label class="block text-sm font-bold text-dark mb-1.5">主体名称 <span class="text-red-500">*</span></label><input id="ent-name" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-8 focus:outline-none focus:border-accent2 text-sm" placeholder="如 New Venture S.r.l."/></div>' +
                '<div class="grid grid-cols-2 gap-4">' +
                '<div><label class="block text-sm font-bold text-dark mb-1.5">注册国</label><select id="ent-country" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-8 text-sm"><option>意大利</option><option>德国</option><option>法国</option><option>西班牙</option><option>荷兰</option><option>奥地利</option><option>爱尔兰</option><option>英国</option><option>中国香港</option><option>其他</option></select></div>' +
                '<div><label class="block text-sm font-bold text-dark mb-1.5">注册号</label><input id="ent-reg" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-8 focus:outline-none focus:border-accent2 text-sm" placeholder="如 MI-26xxxxx"/></div></div>' +
                '<div><label class="block text-sm font-bold text-dark mb-1.5">VAT 税号</label><input id="ent-vat" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-8 focus:outline-none focus:border-accent2 text-sm" placeholder="如 IT..."/></div>' +
                '<p class="text-xs text-gray-400">添加后可在页面顶部随时切换主体，各主体数据独立管理（演示环境共用数据视图）。</p></div>',
            actions: [{ text: '保存并切换', type: 'primary', onClick: function (c) {
                var name = document.getElementById('ent-name').value.trim();
                if (!name) { DDUI.toast('请填写主体名称', 'error'); return; }
                var l = all();
                var e = {
                    id: 'e' + Date.now(),
                    name: name,
                    country: document.getElementById('ent-country').value,
                    reg: document.getElementById('ent-reg').value.trim(),
                    vat: document.getElementById('ent-vat').value.trim()
                };
                e.status = 'pending';
                l.push(e);
                save(l);
                c();
                try { localStorage.setItem(CUR, e.id); } catch (e2) {}
                DDUI.toast('主体已创建，请完成企业开户申请', 'success');
                setTimeout(function () { location.href = obUrl(e.id); }, 800);
            } }, { text: '取消' }]
        });
    }

    function init() { paint(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return { all: all, current: current, setCur: setCur, addModal: addModal, obUrl: obUrl };
})();
