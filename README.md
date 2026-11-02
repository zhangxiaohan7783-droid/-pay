# Dingdang Pay 叮当支付 · 官网原型

纯静态站点源码，源码即成品：HTML + 本地 vendor 的 Tailwind CSS + 原生 JavaScript，无构建、无压缩、无依赖安装。

## 线上地址

https://c4355a0ac361482d8e0108c690b772ff.sh3.agentos-app.net/home.html

## 本地预览

双击 `index.html` 即可（自动跳转 `home.html`），或任选一种静态服务：

```bash
python -m http.server 8899
# 打开 http://localhost:8899/home.html
```

## 页面清单

**官网（13 页）**
`home` / `about` / `compliance` / `help` / `privacy` / `terms` / `offline` / `404` / `500` / `product-accounts`（全球账户）/ `product-expense`（费用管理，含卡支付）/ `product-payments`（全球即时付款）/ `product-acquiring`（全球收单）

**Web 端（登录 xiaohan@dingdangpay.com / Dingdang@2026）**
`login` / `register` / `kyc`（个人开户 6 步）/ `kyb`（企业开户 8 步）/ `dashboard` / `wallet` / `transactions` / `cards` / `sub-accounts` / `sub-account-detail` / `receivables` / `remittance` / `transfer` / `internal-transfer` / `recipients` / `exchange` / `acquiring` / `offline-acquiring` / `crypto-wallet` / `usdt-wallet` / `crypto-acquiring` / `invoices` / `cost-invoices` / `vat` / `analytics` / `annual` / `api` / `customers` / `shops` / `stores` / `logistics` / `pay-link` / `pay-process` / `payall` / `checkout` / `messages` / `logs` / `team` / `settings` / `settlements` / `iban_account` 等

**App 端（demo@dingdangpay.com / 123456）**
`app/index.html`

**管理后台（admin@dingdangpay.com / Admin@2026 / 888888）**
`admin/login` / `admin/dashboard` / 开户管理（个人/商业开户工作台、归档、终审、日志、Sokin 通道、开户审核详情 ob-audit）等 27 页

## 目录结构

```
├── index.html          # 跳转 home.html
├── *.html              # 官网 + Web 端页面
├── admin/              # 管理后台
├── app/                # App 端
└── assets/
    ├── css/            # 样式
    ├── js/             # 公共 JS（ui/i18n/store/search/auth 等）
    ├── img/            # 图片资源
    └── vendor/         # 本地化三方库（Tailwind / iconify 等）
```

## 技术栈

- 纯静态 HTML + 原生 JS，Tailwind CSS 经本地 vendor 引入
- 图标：iconify（本地 vendor）
- 数据：localStorage 模拟，无后端依赖
- 多语言：assets/js/i18n.js 中英切换
