/* DD2FA 双因子安全验证：邮箱验证码 + 验证器动态码（登录与全部转账强制） */
window.DD2FA = (function () {
    var EMAIL_CODE = '888888';   /* 演示邮箱验证码 */
    var AUTH_CODE = '123456';    /* 演示验证器动态码 */

    function require(action, onOk) {
        if (!window.DDUI) { onOk(); return; }
        var m = DDUI.modal({
            title: '安全验证 · ' + action,
            body: '<p class="text-xs text-gray-400 mb-4">' + action + '需完成双重验证：邮箱验证码 + 验证器动态码。</p>' +
                '<div class="mb-4"><label class="block text-sm font-bold text-dark mb-2">邮箱验证码</label>' +
                '<div class="flex gap-2"><input class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-8 focus:outline-none focus:border-accent2 text-sm font-mono" id="dd2fa-email" placeholder="6 位验证码" maxlength="6"/>' +
                '<button class="px-4 py-2 text-sm font-bold text-accent2 border border-accent2 rounded-8 hover:bg-accent2/5 whitespace-nowrap" id="dd2fa-send" type="button">发送验证码</button></div></div>' +
                '<div class="mb-2"><label class="block text-sm font-bold text-dark mb-2">验证器动态码</label>' +
                '<input class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-8 focus:outline-none focus:border-accent2 text-sm font-mono" id="dd2fa-auth" placeholder="Authenticator 6 位动态码" maxlength="6"/></div>' +
                '<p class="text-xs text-red-500 hidden" id="dd2fa-err"></p>' +
                '<p class="text-xs text-gray-300 mt-3">演示环境：邮箱验证码 888888 · 验证器 123456</p>',
            actions: [{ text: '验证并继续', type: 'primary', onClick: function (close, body) {
                var e = body.querySelector('#dd2fa-email').value.trim();
                var a = body.querySelector('#dd2fa-auth').value.trim();
                var err = body.querySelector('#dd2fa-err');
                var msg = '';
                if (e !== EMAIL_CODE) msg = '邮箱验证码错误';
                else if (a !== AUTH_CODE) msg = '验证器动态码错误';
                err.textContent = msg;
                err.classList.toggle('hidden', !msg);
                if (msg) return;
                close();
                onOk();
            } }, { text: '取消' }]
        });
        var sendBtn = m.body.querySelector('#dd2fa-send');
        sendBtn.addEventListener('click', function () {
            var left = 60;
            sendBtn.disabled = true;
            sendBtn.textContent = left + 's 后重发';
            DDUI.toast('验证码已发送至您的邮箱（演示码：888888）', 'success');
            var t = setInterval(function () {
                left--;
                if (left <= 0) { clearInterval(t); sendBtn.disabled = false; sendBtn.textContent = '发送验证码'; }
                else sendBtn.textContent = left + 's 后重发';
            }, 1000);
        });
    }

    return { require: require };
})();
