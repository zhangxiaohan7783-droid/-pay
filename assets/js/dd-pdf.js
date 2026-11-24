/* dd-pdf.js — 极简 PDF 生成 + 发票/单据预览样式（离线可用，拉丁字符） */
(function () {
    /* 生成单页 PDF（A4，Helvetica）。lines: [{t:'文本', s:字号, x:左边距, dy:行高, b:加粗}] */
    function makePdf(lines, filename) {
        function esc(s) { return String(s).replace(/[^\x20-\x7E\xA0-\xFF]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
        var y = 800, content = '';
        lines.forEach(function (ln) {
            var size = ln.s || 10, dy = ln.dy || (size + 5), x = ln.x == null ? 50 : ln.x;
            content += 'BT /' + (ln.b ? 'F2' : 'F1') + ' ' + size + ' Tf ' + x + ' ' + y + ' Td (' + esc(ln.t) + ') Tj ET\n';
            y -= dy;
        });
        var objs = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
            '<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream'
        ];
        var pdf = '%PDF-1.4\n', offs = [];
        objs.forEach(function (o, i) { offs.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
        var xref = pdf.length;
        pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
        offs.forEach(function (o) { pdf += ('0000000000' + o).slice(-10) + ' 00000 n \n'; });
        pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
        a.download = filename;
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    }

    /* 发票模板配置（发票模板管理页写入） */
    var TPL_KEY = 'dd-inv-tpl-v1';
    var TPL_THEMES = {
        classic: { head: 'background:linear-gradient(90deg,#382b1b,#5a4a2f);color:#fff', sub: 'opacity:.7', name: '经典深棕' },
        violet: { head: 'background:linear-gradient(90deg,#4c1d95,#7c3aed);color:#fff', sub: 'opacity:.75', name: '紫罗兰' },
        minimal: { head: 'background:#fff;color:#382b1b;border-bottom:3px solid #FFD008', sub: 'color:#9ca3af', name: '极简白' }
    };
    function tpl() {
        try {
            var d = JSON.parse(localStorage.getItem(TPL_KEY) || 'null');
            if (d && TPL_THEMES[d.tpl]) return d;
        } catch (e) {}
        return { tpl: 'classic', logo: '', intro: '' };
    }

    /* 单据/发票 A4 预览 HTML（modal 内嵌）。d: {badge,no,date,seller,sellerSub,buyer,buyerSub,heads[],rows[][],foot[][],note,account,shipTo,theme,logo,intro} */
    function docHtml(d) {
        var t = d.theme ? (TPL_THEMES[d.theme] || TPL_THEMES.classic) : TPL_THEMES[tpl().tpl];
        var logo = d.logo !== undefined ? d.logo : tpl().logo;
        var intro = d.intro !== undefined ? d.intro : tpl().intro;
        var rows = d.rows.map(function (r) {
            return '<tr class="border-b border-gray-100">' + r.map(function (c, i) {
                return '<td class="py-2.5 px-2 text-sm ' + (i === 0 ? 'text-left' : 'text-right') + ' text-[#382b1b]">' + c + '</td>';
            }).join('') + '</tr>';
        }).join('');
        var brand = logo
            ? '<img src="' + logo + '" style="height:34px;max-width:140px;object-fit:contain;border-radius:6px;' + (d.theme === 'minimal' || (!d.theme && tpl().tpl === 'minimal') ? '' : 'background:#fff;padding:2px 6px;') + '"/>'
            : '<p class="font-bold text-sm">Dingdang Pay 叮当支付</p>';
        var extra = '';
        if (d.account) {
            extra += '<div class="rounded-8 border border-gray-150 bg-gray-50 p-3 text-xs" style="border:1px solid #f3f4f6"><p class="font-bold text-gray-400 uppercase mb-1">收款账户 / Beneficiary</p>'
                + '<p class="text-sm font-bold text-[#382b1b]">' + d.account.name + '</p>'
                + '<p class="font-mono text-gray-500 mt-0.5">IBAN ' + d.account.iban + ' · BIC ' + d.account.bic + '</p></div>';
        }
        if (d.shipTo) {
            extra += '<div class="rounded-8 p-3 text-xs" style="border:1px dashed #d1d5db"><p class="font-bold text-gray-400 uppercase mb-1">收货地址 / Ship To</p>'
                + '<p class="text-sm text-[#382b1b] leading-relaxed">' + d.shipTo + '</p></div>';
        }
        return '<div class="bg-white border border-gray-200 rounded-8 overflow-hidden shadow-sm">'
            + '<div class="px-6 py-4 flex justify-between items-center" style="' + t.head + '">'
            + '<div>' + brand + '<p class="text-[10px] mt-1" style="' + t.sub + '">' + (intro || d.sellerSub || 'MFSA Licensed Financial Platform') + '</p></div>'
            + '<div class="text-right"><p class="text-lg font-bold tracking-wide">' + (d.badge || 'INVOICE') + '</p><p class="text-[11px] font-mono" style="' + t.sub + '">' + d.no + '</p></div></div>'
            + '<div class="p-6 space-y-4">'
            + '<div class="grid grid-cols-2 gap-6 text-xs"><div><p class="font-bold text-gray-400 uppercase mb-1">开票方 / From</p><p class="font-bold text-sm text-[#382b1b]">' + d.seller + '</p></div>'
            + '<div class="text-right"><p class="font-bold text-gray-400 uppercase mb-1">客户 / To</p><p class="font-bold text-sm text-[#382b1b]">' + d.buyer + '</p>' + (d.buyerSub ? '<p class="text-gray-400 mt-0.5">' + d.buyerSub + '</p>' : '') + '</div></div>'
            + extra
            + '<table class="w-full"><thead><tr class="border-b-2 border-gray-200">' + d.heads.map(function (hd, i) {
                return '<th class="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase ' + (i === 0 ? 'text-left' : 'text-right') + '">' + hd + '</th>';
            }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>'
            + '<div class="flex justify-end"><div class="w-56 space-y-1 pt-2">' + d.foot.map(function (f, i, arr) {
                return '<div class="flex justify-between ' + (i === arr.length - 1 ? 'text-base font-bold text-[#382b1b] pt-2 border-t border-gray-200' : 'text-sm text-gray-500') + '"><span>' + f[0] + '</span><span>' + f[1] + '</span></div>';
            }).join('') + '</div></div>'
            + '<p class="text-[10px] text-gray-400">开具日期: ' + d.date + ' · 单号: ' + d.no + '</p>'
            + '</div><div class="px-6 py-3 bg-gray-50 border-t border-gray-100"><p class="text-[10px] text-gray-400 text-center">' + (d.note || 'Computer-generated document · Dingdang Pay Ltd - Licensed by MFSA') + '</p></div></div>';
    }

    /* 通用 kv 单据 PDF 下载 */
    function kvPdf(title, no, kvs, filename) {
        var lines = [{ t: 'Dingdang Pay', s: 14, b: 1, dy: 20 }, { t: title, s: 18, b: 1, dy: 26 }, { t: 'No: ' + no, s: 11, dy: 22 }];
        kvs.forEach(function (kv) { lines.push({ t: kv[0] + ': ' + kv[1], s: 10, dy: 16 }); });
        lines.push({ t: '', dy: 10 }, { t: 'Computer-generated document - Dingdang Pay Ltd (MFSA)', s: 8 });
        makePdf(lines, filename);
    }

    window.DDPdf = { make: makePdf, docHtml: docHtml, kv: kvPdf, tpl: tpl, themes: TPL_THEMES };
})();
