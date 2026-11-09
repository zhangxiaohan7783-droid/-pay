/* DDDocExp 证件材料有效期提醒：KYC 个人证件 / KYB 营业执照过期或临期时横幅提醒上传 */
window.DDDocExp = (function () {
    var KEY = 'dd-doc-expiry-v1';
    var SEED = {
        kyc: { doc: '个人身份证明（护照/身份证）', due: '2026-11-28', renewYears: 10 },
        kyb: { doc: '营业执照 Business License', due: '2026-10-20', renewYears: 2 }
    };

    function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

    function state(scope) {
        var s = load();
        var cur = s[scope] || SEED[scope];
        var today = new Date().toISOString().slice(0, 10);
        var days = Math.floor((new Date(cur.due) - new Date(today)) / 86400000);
        return { doc: cur.doc, due: cur.due, days: days, renewYears: cur.renewYears };
    }

    function banner(scope, st) {
        var old = document.getElementById('dd-docexp-banner');
        if (old) old.remove();
        if (st.days > 30) return; /* 有效期充足不提醒 */
        var expired = st.days < 0;
        var box = document.createElement('div');
        box.id = 'dd-docexp-banner';
        box.className = 'rounded-8 border p-4 mb-6 flex items-center justify-between gap-4 flex-wrap ' + (expired ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200');
        box.innerHTML =
            '<div class="flex items-center gap-3 min-w-0"><iconify-icon class="text-2xl flex-none ' + (expired ? 'text-red-500' : 'text-yellow-600') + '" icon="solar:danger-triangle-bold"></iconify-icon>' +
            '<div class="text-sm"><p class="font-bold ' + (expired ? 'text-red-600' : 'text-yellow-700') + '">' + (expired ? st.doc + '已过期' : st.doc + '即将到期') + '</p>' +
            '<p class="text-xs ' + (expired ? 'text-red-400' : 'text-yellow-600') + ' mt-0.5">到期日 ' + st.due + (expired ? '（已过期 ' + Math.abs(st.days) + ' 天）' : '（剩余 ' + st.days + ' 天）') + '，请尽快上传新证件，避免账户功能受限。</p></div></div>' +
            '<button class="px-5 py-2.5 text-sm font-bold rounded-8 flex-none ' + (expired ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-dark hover:opacity-90') + '" id="dd-docexp-upload" type="button">上传新证件</button>';
        var main = document.querySelector('main') || document.body;
        main.insertBefore(box, main.children[1] || null);
        document.getElementById('dd-docexp-upload').addEventListener('click', function () { pick(scope, st); });
    }

    function pick(scope, st) {
        var inp = document.getElementById('dd-docexp-inp');
        if (!inp) {
            inp = document.createElement('input');
            inp.type = 'file'; inp.id = 'dd-docexp-inp'; inp.style.display = 'none';
            inp.accept = '.pdf,.jpg,.jpeg,.png';
            document.body.appendChild(inp);
        }
        inp.onchange = function () { renew(scope, st); inp.value = ''; };
        inp.click();
    }

    function renew(scope, st) {
        var s = load();
        var due = new Date();
        due.setFullYear(due.getFullYear() + (st.renewYears || 2));
        s[scope] = { doc: st.doc, due: due.toISOString().slice(0, 10), renewYears: st.renewYears };
        save(s);
        if (window.DDUI) DDUI.toast(st.doc + '已上传并更新有效期至 ' + s[scope].due, 'success');
        banner(scope, state(scope));
        var b = document.getElementById('dd-docexp-banner');
        if (!b) {
            var ok = document.createElement('div');
            ok.id = 'dd-docexp-banner';
            ok.className = 'rounded-8 border border-green-200 bg-green-50 p-4 mb-6 flex items-center gap-3';
            ok.innerHTML = '<iconify-icon class="text-2xl text-green-500" icon="solar:check-circle-bold"></iconify-icon><p class="text-sm font-bold text-green-600">' + st.doc + '已更新，有效期至 ' + s[scope].due + '</p>';
            var main = document.querySelector('main') || document.body;
            main.insertBefore(ok, main.children[1] || null);
        }
    }

    function init() {
        var path = location.pathname;
        var scope = path.indexOf('kyb') > -1 ? 'kyb' : (path.indexOf('kyc') > -1 ? 'kyc' : null);
        if (!scope) return;
        banner(scope, state(scope));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return { state: state, _renew: renew };
})();
