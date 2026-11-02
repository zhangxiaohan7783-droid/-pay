/* 叮当支付 全站中英文切换 DDI18N
 * 用法：自动加载，读取 localStorage 'dd-lang'；右上角语言胶囊切换 */
(function () {
  'use strict';

  var DICT = {
    /* ---- 侧边栏 ---- */
    '叮当支付': 'Dingdang Pay', '控制面板': 'Dashboard', '我的钱包': 'My Wallet',
    '资金与汇款': 'FUNDS & REMITTANCE', '我的账户': 'My Accounts', '转账': 'Transfer',
    '全球即时付款': 'Instant Payout', '速汇中国': 'Express China', 'IBAN 账户': 'IBAN Accounts',
    '法币交易记录': 'Fiat Transactions', '收款人': 'Recipients',
    '数字资产': 'DIGITAL ASSETS', '数字资产兑换': 'Exchange', 'USDT 钱包': 'USDT Wallet', '加密钱包': 'Crypto Wallet',
    '收单管理': 'ACQUIRING', '线上收单': 'Online Acquiring', '线上加密币收单': 'Crypto Acquiring',
    '线下收单': 'Offline Acquiring', '收款链接': 'Payment Links', '营收发票': 'Invoices',
    '商务运营': 'OPERATIONS', '即时聊天': 'Messages', '结算记录': 'Settlements', '数据分析': 'Analytics',
    '客户管理': 'Customers', '门店列表': 'Stores',
    '系统与合规': 'SYSTEM & COMPLIANCE', '团队协作': 'Team', '账户设置': 'Settings', 'API 开发': 'API',
    'KYC 认证': 'KYC Verification', 'KYB 认证': 'KYB Verification', '合规中心': 'Compliance',
    '帮助中心': 'Help Center', '操作日志': 'Activity Logs',
    '叮当商户': 'Dingdang Merchant', '退出登录': 'Log out',
    /* ---- 顶栏/通用 ---- */
    '中文': '中文', '搜索': 'Search', '通知中心': 'Notifications', '全部已读': 'Mark all read',
    '确定': 'OK', '取消': 'Cancel', '关闭': 'Close', '保存': 'Save', '提交': 'Submit', '确认': 'Confirm',
    '下一步': 'Next', '上一步': 'Back', '完成': 'Done', '编辑': 'Edit', '查看': 'View', '详情': 'Details',
    '导出数据': 'Export', '导出报表': 'Export Report', '打印对账单': 'Print Statement', '筛选记录': 'Apply Filters',
    '搜索功能页面，如：转账 / 发票 / KYC': 'Search features, e.g. Transfer / Invoices / KYC',
    '没有找到相关功能': 'No matching features', '系统提示': 'Notice', '这是提示信息。': 'This is a notice.',
    '充值': 'Deposit', '提现': 'Withdraw', '兑换': 'Convert', '全部': 'All', '登录': 'Log in', '注册': 'Sign up',
    /* ---- 表格/状态 ---- */
    '状态': 'Status', '操作': 'Actions', '金额': 'Amount', '时间': 'Time', '类型': 'Type', '币种': 'Currency',
    '订单号': 'Order No.', '手续费': 'Fee', '汇率': 'Rate', '实时汇率': 'Live Rate', '结算费率': 'Settlement Fee',
    '网络': 'Network', '数量': 'Qty', '备注': 'Note', '客户': 'Customer', '收款方式': 'Payment Method',
    '支付方式': 'Payment Method', '收款人姓名': 'Recipient Name', '收款账号': 'Account No.',
    '已完成': 'Completed', '处理中': 'Processing', '进行中': 'In Progress', '已完成 ': 'Completed',
    '已结算': 'Settled', '结算中': 'Settling', '已认证': 'Verified', '审核中': 'Under Review', '待审核': 'Pending Review',
    '成功': 'Success', '失败': 'Failed', '退款中': 'Refunding', '退款': 'Refund', '重试': 'Retry',
    '营业中': 'Open', '在线': 'Online', '离线': 'Offline', '待接受': 'Pending', '运行中': 'Active',
    '全部状态': 'All Status', '所有状态': 'All Status', '所有币种': 'All Currencies', '全部类型': 'All Types',
    '今日': 'Today', '昨天': 'Yesterday', '近 7 天': 'Last 7 days', '近 30 天': 'Last 30 days', '近 90 天': 'Last 90 days',
    '最近7天': 'Last 7 days', '最近30天': 'Last 30 days', '本月累计': 'This Month', '查看全部': 'View All',
    /* ---- 钱包/兑换 ---- */
    '我的钱包': 'My Wallet', '管理多币种账户余额、充值与提现': 'Manage multi-currency balances, deposits & withdrawals',
    '可用余额': 'Available Balance', '冻结金额': 'Frozen Amount', '近期钱包动态': 'Recent Activity',
    '摘要': 'Summary', '美元账户 USD': 'USD Account', '欧元账户 EUR': 'EUR Account',
    '人民币账户 CNY': 'CNY Account', '港币账户 HKD': 'HKD Account',
    '数字资产兑换': 'Exchange', '法币兑换': 'Fiat', '币币兑换': 'Crypto', '支付': 'You Pay', '获得': 'You Receive',
    '获得 (预计)': 'You Receive (est.)', '余额': 'Balance', '立即开启': 'Enable Now', '确认兑换': 'Confirm Exchange',
    'USDT 钱包': 'USDT Wallet', '充币': 'Deposit', '提币': 'Withdraw', '充币地址': 'Deposit Address',
    '提币地址': 'Withdrawal Address', '查看详情': 'View Details', '加密钱包': 'Crypto Wallet',
    '管理您的多币种数字资产': 'Manage your multi-currency digital assets', '添加钱包': 'Add Wallet',
    '查看全部历史记录': 'View All History', '立即提交提币申请': 'Submit Withdrawal', '确认提币': 'Confirm Withdrawal',
    /* ---- 收单 ---- */
    '线上收单': 'Online Acquiring', '管理您的在线支付收单业务': 'Manage your online payment acceptance',
    '创建支付链接': 'Create Payment Link', 'API文档': 'API Docs', '独立站收单': 'Standalone Site', '支付链接': 'Payment Link',
    '游戏站点收单': 'Gaming Site', '视频网站收单': 'Video Site', '生成链接': 'Generate', '预览链接': 'Preview',
    '确认并生成': 'Confirm & Generate', '线上加密币收单': 'Crypto Acquiring',
    '支持 BTC、ETH、USDT 等主流数字货币支付收单': 'Accept BTC, ETH, USDT and other major cryptocurrencies',
    '获取 API Key': 'Get API Key', '开发文档': 'Developer Docs', '币种设置': 'Coin Settings',
    '线下收单': 'Offline Acquiring', '线下收单管理': 'Offline Acquiring',
    '添加门店': 'Add Store', '创建收款码': 'Create QR Code', '下载对账单': 'Download Statement',
    '收款链接': 'Payment Links', '营收发票': 'Invoices', '导入发票': 'Import Invoice', '开票': 'Issue Invoice',
    /* ---- 资金 ---- */
    '全球即时付款': 'Global Instant Payment', '您汇出金额': 'You Send', '对方收到金额': 'Recipient Gets',
    '继续下一步': 'Continue', '收款人信息': 'Recipient Info', '确认付款': 'Confirm Payment',
    '汇款用途': 'Purpose', '附言（可选）': 'Note (optional)', '手续费 (0.5%)': 'Fee (0.5%)',
    '实际汇出金额': 'Net Amount', '填写金额': 'Amount', '收款人': 'Recipient', '付款指令已提交': 'Payment Submitted',
    '再汇一笔': 'Send Another', '查看交易记录': 'View Transactions', '从收款人列表选择': 'Choose from Recipients',
    '结算记录': 'Settlements', '查看各收单通道的周期结算明细与到账状态': 'Periodic settlement details by channel',
    '本月已结算': 'Settled This Month', '结算中金额': 'Settling', '结算失败': 'Failed',
    '结算单号': 'Settlement No.', '来源通道': 'Channel', '结算日期': 'Date', '交易总额': 'Total', '实结金额': 'Net Amount',
    '我的账户': 'My Accounts', '查看对账单': 'View Statement', '下载确认函': 'Download Confirmation',
    '转账': 'Transfer', '保存收款人': 'Save Recipient', '全部收款人': 'All Recipients',
    '个人收款人': 'Individual', '企业收款人': 'Corporate', '添加收款人': 'Add Recipient',
    /* ---- 运营 ---- */
    '即时聊天': 'Messages', '输入消息...': 'Type a message...', '发送': 'Send',
    '数据分析': 'Analytics', '交易趋势、渠道构成与客户维度的经营洞察': 'Trends, channels and customer insights',
    '交易总额': 'Volume', '交易笔数': 'Orders', '客单价': 'Avg. Order', '退款率': 'Refund Rate',
    '交易额趋势（近 30 天）': 'Volume Trend (30d)', '渠道占比': 'By Channel', '门店交易排行': 'Top Stores',
    '客户管理': 'Customers', '管理收单客户资料、消费记录与认证状态': 'Manage customer profiles, spending and KYC status',
    '邀请客户': 'Invite Customer', '客户总数': 'Total Customers', '已认证客户': 'Verified', '高价值客户': 'High Value',
    '客户编号': 'Customer ID', '累计消费': 'Total Spend', '订单数': 'Orders', '认证状态': 'KYC Status', '最近交易': 'Last Transaction',
    '门店列表': 'Stores', '管理线下门店资料、收款码与经营状态': 'Manage store profiles, QR codes and status',
    '今日收款': "Today's Revenue", '管理': 'Manage',
    '团队协作': 'Team', '管理团队成员、角色与操作权限': 'Manage members, roles and permissions',
    '邀请成员': 'Invite Member', '团队成员': 'Members', '角色模板': 'Roles', '本月操作': 'Actions This Month',
    '成员': 'Member', '角色': 'Role', '权限范围': 'Permissions', '最近活跃': 'Last Active', '权限说明': 'Permission Notes',
    '发送邀请': 'Send Invite', '成员姓名': 'Name', '邮箱': 'Email', '分配角色': 'Assign Role',
    '操作日志': 'Activity Logs', '审计团队成员的全部敏感操作与登录记录': 'Audit all sensitive operations and logins',
    '导出日志': 'Export Logs', '操作人': 'Operator', '操作内容': 'Action', 'IP 地址': 'IP Address', '结果': 'Result',
    /* ---- 系统 ---- */
    '账户设置': 'Settings', '管理商户资料、安全选项与通知偏好': 'Manage profile, security and notifications',
    '商户资料': 'Business Profile', '商户名称': 'Business Name', '统一社会信用代码': 'Business License No.',
    '联系邮箱': 'Contact Email', '结算币种': 'Settlement Currency', '保存修改': 'Save Changes',
    '安全设置': 'Security', '登录密码': 'Password', '两步验证 (2FA)': 'Two-factor Auth (2FA)',
    '提现二次确认': 'Withdrawal Confirmation', '通知偏好': 'Notifications', '修改': 'Change', '已开启': 'Enabled',
    '每笔收款成功通知': 'Payment received alerts', '结算到账通知': 'Settlement alerts', '风控预警通知': 'Risk alerts',
    'API 开发': 'API Development', '管理 API 密钥、Webhook 与接口调用情况': 'Manage API keys, webhooks and usage',
    '生成新密钥': 'Generate Key', '生产环境密钥': 'Live Keys', 'Webhook 配置': 'Webhook Config',
    '回调地址': 'Callback URL', '发送测试事件': 'Send Test Event', '接口调用概览（近 30 天）': 'API Usage (30d)',
    '接口': 'Endpoint', '说明': 'Description', '调用次数': 'Calls', '今日调用量': 'Calls Today',
    '平均延迟': 'Avg. Latency', '限流阈值': 'Rate Limit', '复制': 'Copy', '查看': 'View',
    '身份认证 (KYC)': 'Identity Verification (KYC)', '为了保障您的账户安全并提升交易限额，请完成实名认证': 'Complete verification to secure your account and raise limits',
    '基本信息': 'Basic Info', '证件上传': 'Document Upload', '人脸识别': 'Face Verification', '法定姓名 (中文)': 'Legal Name (Chinese)',
    '姓名拼音 / 英文名': 'Name in Pinyin / English', '证件类型': 'Document Type', '证件号码': 'Document No.',
    '居住地址': 'Residential Address', '国家/地区': 'Country/Region', '详细地址': 'Address',
    '稍后认证': 'Later', '下一步：上传证件': 'Next: Upload Document', '下一步：人脸识别': 'Next: Face Verification',
    '提交审核': 'Submit for Review', '开始核验': 'Start Verification', '返回控制面板': 'Back to Dashboard',
    '认证提示': 'Notice', '请确保填写的信息与您的有效身份证件一致，否则将无法通过审核。': 'Ensure the information matches your valid ID, or the review will fail.',
    '帮助中心': 'Help Center', '提交工单': 'Submit Ticket', '在线咨询': 'Live Chat',
    '合规中心': 'Compliance', '合规声明': 'Compliance Statement',
    '操作成功': 'Success', '确定': 'OK',
    /* ---- 登录注册 ---- */
    '欢迎回来': 'Welcome Back', '登录您的跨境数字钱包': 'Log in to your cross-border wallet',
    '邮箱 / 手机号': 'Email / Phone', '忘记密码？': 'Forgot password?', '立即登录': 'Log In',
    '还没有账户？': 'No account?', '立即注册': 'Sign Up', '开启全球支付之旅': 'Start Your Global Payment Journey',
    '个人注册': 'Personal', '企业注册': 'Business', '电子邮箱': 'Email', '手机号码': 'Phone Number',
    '验证码': 'Verification Code', '获取验证码': 'Get Code', '设置密码': 'Set Password',
    '已有账号？': 'Have an account?', '去登录': 'Log in', '企业名称': 'Company Name',
    '重置登录密码': 'Reset Password', '发送重置链接': 'Send Reset Link',
    /* ---- 404/其他 ---- */
    '哎呀，页面走丢了': 'Oops, page not found', '返回首页': 'Back to Home',
    '中国': 'China', '英国': 'United Kingdom', '美国': 'United States', '马耳他': 'Malta',
    '支付宝': 'Alipay', '微信支付': 'WeChat Pay', '银联卡': 'UnionPay', '欧洲': 'Europe', '亚太': 'Asia-Pacific',
    '北美': 'North America', '其他': 'Others', '立即汇款': 'Send Now', '汇至支付宝': 'To Alipay', '汇至银联卡': 'To UnionPay',
    '即时到账': 'Instant', '秒级到账': 'Seconds', '分钟级': 'Minutes', '预计到账': 'ETA', '预计到账时间': 'ETA',
    '单笔限额': 'Per-transaction Limit', '今日剩余额度': 'Remaining Today', '费用预估': 'Fee Estimate',
    '付款金额': 'Payment Amount', '汇出金额': 'Send Amount', '预计到账金额': 'Recipient Gets',
    '转账用途': 'Purpose', '转账备注': 'Note', '请选择转账用途': 'Select purpose',
    '选择支付方式': 'Select Payment Method', '确认支付': 'Confirm Payment', '立即支付': 'Pay Now',
    '支付金额': 'Amount', '支付成功': 'Payment Successful', '查看订单详情': 'View Order', '返回商户': 'Back to Merchant',
    '联系客服寻求帮助': 'Contact Support', '更换支付方式': 'Change Method',
    '全球即时付款通道': 'PayAll Instant Channel', '付款限制': 'Payment Limits',
    '提升额度请更新 KYC 认证': 'Update KYC to raise limits', '全球速汇网络': 'Global Network',
    '叮当优选（深圳）科技有限公司': 'Dingdang Youxuan (Shenzhen) Tech Co., Ltd.'
  };

  /* ---- 第二批：页面内容 ---- */
  Object.assign(DICT, {
    '简体中文': '简体中文', '中文 (简体)': '中文 (简体)', 'English': 'English',
    /* dashboard */
    '账户总览': 'Account Overview', '欧元余额 (EUR)': 'EUR Balance', '英镑余额 (GBP)': 'GBP Balance',
    '数字资产 (USDT)': 'Digital Assets (USDT)', 'TRC-20 链上资产': 'TRC-20 on-chain assets',
    '已激活 FPS 快速通道': 'FPS fast channel activated', '新增币种账户': 'Add Currency Account',
    '交易趋势 (近7天)': 'Transaction Trend (7d)', '收入': 'Income', '支出': 'Expense',
    '快捷操作': 'Quick Actions', '收款': 'Collect', '开户': 'Open Account',
    'KYC 待更新': 'KYC Update Required', '您的身份验证已过期，请及时更新以确保持续享受高额付款额度。': 'Your identity verification has expired. Please update it to keep your higher payment limits.',
    '立即认证': 'Verify Now', '全球即时付款': 'Global Instant Payment',
    '交易趋势': 'Transaction Trend', '近7日交易趋势': '7-day Trend', '今日交易额': "Today's Volume",
    '今日订单数': "Today's Orders", '支付方式分布': 'Payment Methods', '最近结算记录': 'Recent Settlements',
    '成功率': 'Success Rate', '净额': 'Net',
    /* 收银台 */
    '收银台 - Dingdang Pay': 'Checkout - Dingdang Pay', '确认支付': 'Confirm Payment',
    '支付给：Dingdang Merchant': 'Pay to: Dingdang Merchant', 'Dingdang 钱包余额': 'Dingdang Wallet Balance',
    '当前余额: € 8,245.50': 'Balance: € 8,245.50', '使用绑定的银行卡支付': 'Pay with linked bank card',
    '支付宝支付': 'Alipay', '实时汇率结算': 'Real-time FX settlement', '立即支付 € 128.50': 'Pay € 128.50',
    '资金由 Dingdang Pay 安全加密保护': 'Funds secured by Dingdang Pay encryption',
    /* crypto-acquiring */
    '24h 加密交易额': '24h Crypto Volume', '24h 订单数': '24h Orders', '平均确认时间': 'Avg. Confirmation',
    '活跃币种': 'Active Coins', '较昨日 +12.5%': '+12.5% vs yesterday', '较昨日 +8 笔': '+8 vs yesterday',
    '网络状态良好': 'Network healthy', '支持收单币种': 'Supported Coins', '结算费率': 'Settlement Fee',
    '加密收单记录': 'Crypto Orders', '金额 (法币)': 'Amount (Fiat)', '金额 (加密)': 'Amount (Crypto)',
    '确认数': 'Confirmations', '确认中': 'Confirming', '超时失败': 'Timed Out', '搜索订单号...': 'Search order no...',
    '显示 1 到 4 笔，共 342 笔': 'Showing 1-4 of 342', '收款地址管理': 'Address Management',
    '添加新地址': 'Add Address', '获取 API 凭证': 'Get API Credentials', '生成 API Key': 'Generate API Key',
    '生成您的 API Key 和 Webhook Secret，用于身份验证。': 'Generate your API Key and Webhook Secret for authentication.',
    '快速集成步骤': 'Quick Integration', '配置回调地址': 'Configure Webhook',
    '设置 Webhook URL，以便在支付成功后接收系统通知。': 'Set a Webhook URL to receive payment notifications.',
    '参考我们的 API 手册，只需几行代码即可完成集成。': 'See our API manual — integrate in a few lines of code.',
    '查看集成文档': 'View Docs', '立即生成 →': 'Generate →', '前往配置 →': 'Configure →', '开始阅读 →': 'Read →',
    '加密结算记录': 'Crypto Settlements', '汇率与费率参考': 'Rates & Fees', 'BTC 收单': 'BTC Acquiring',
    'ETH 收单': 'ETH Acquiring', 'BTC 主网地址': 'BTC Mainnet Address', 'ETH/ERC20 地址': 'ETH/ERC20 Address',
    'USDT (TRC20) 地址': 'USDT (TRC20) Address', '最低结算: €50.00': 'Min. settlement: €50.00',
    '最低结算: €20.00': 'Min. settlement: €20.00', '最低结算: €10.00': 'Min. settlement: €10.00',
    '预计 10-30m 确认': '~10-30m confirmation', '预计 5-15m 确认': '~5-15m confirmation', '预计 1-3m 确认': '~1-3m confirmation',
    '分钟': 'min', '笔': '', '种': '',
    /* crypto-wallet */
    '总资产等值估算 (EUR)': 'Total Assets (est. EUR)', '4 种数字货币资产': '4 digital currencies',
    '当前持有': 'Holdings', '最近交易记录': 'Recent Transactions', '时间 / ID': 'Time / ID',
    '金额(EUR)': 'Amount (EUR)', '提现数量': 'Withdrawal Amount', '提现网络': 'Network',
    '二次验证码': '2FA Code', '返回修改': 'Back', '确认提现': 'Confirm Withdrawal',
    '选择币种': 'Select Coin', '请选择币种': 'Select a coin', '请选择网络': 'Select a network',
    '添加加密币种': 'Add Cryptocurrency', '选择您要添加到钱包的加密货币': 'Choose coins to add to your wallet',
    '添加到钱包': 'Add to Wallet', '确认添加': 'Confirm', '充值地址': 'Deposit Address',
    '充值地址管理': 'Deposit Addresses', '添加充值地址': 'Add Deposit Address', '添加地址': 'Add Address',
    '为您的加密币种添加新的充值地址': 'Add a new deposit address for your coins',
    '网络名称': 'Network', '请输入或选择区块链网络名称': 'Enter or select a blockchain network',
    '请输入有效的充值地址': 'Enter a valid deposit address', '设为默认地址': 'Set as Default',
    '安全提示': 'Security Notice', '安全提醒': 'Security Notice',
    '请务必选择正确的网络，否则资产可能丢失': 'Select the correct network, or assets may be lost',
    '请务必妥善保管您的密钥，系统将不再显示。如果您丢失了密钥，必须重新生成。': 'Keep your key safe — it will not be shown again. If lost, you must regenerate it.',
    '请仔细核对提现地址和网络。区块链交易一旦发出不可撤回。建议先进行小额测试交易。': 'Double-check the address and network. Blockchain transactions are irreversible. Try a small test first.',
    '请输入提现地址和金额': 'Enter withdrawal address and amount', '请输入有效的提现地址': 'Enter a valid address',
    '金额不能超过可用余额': 'Amount exceeds available balance', '网络费 (Gas)': 'Network Fee (Gas)', '网络费': 'Network Fee',
    '10-30 分钟': '10-30 min', '地址已成功复制': 'Address copied', '已复制到剪贴板': 'Copied',
    /* customers */
    '认证率 91.4%': '91.4% verified', '近90天消费超 ¥10,000': 'Spent >¥10,000 in 90d',
    '待补充资料': 'Info Incomplete', '风险关注': 'Risk Watch', '陈先生': 'Mr. Chen', '王女士': 'Ms. Wang', '赵先生': 'Mr. Zhao',
    '搜索客户姓名 / 邮箱 / 编号': 'Search name / email / ID', '本月新增 216': '+216 this month',
    /* 其它零散 */
    '我已保存': 'Saved', '服务协议': 'Service Agreement', '开始核验': 'Start',
    '系统状态：正常运行': 'System Status: Operational', '© 2026 叮当支付 DingDang Pay. 版权所有.': '© 2026 DingDang Pay. All rights reserved.',
    '发送至财务邮箱': 'Send to finance email', '申请开票': 'Request Invoice',
    '编辑发票信息': 'Edit Invoice', '发票抬头': 'Invoice Title', '税号': 'Tax ID', '接收邮箱': 'Email',
    '发票号码': 'Invoice No.', '抬头': 'Title', '开票日期': 'Issue Date', '开票中': 'Issuing',
    '本月总交易笔数：8,642 笔': '8,642 transactions this month', '显示第 1 至 8 条，共 1,280 条记录': 'Showing 1-8 of 1,280',
    '结算周期': 'Settlement Cycle', '滚动保证金': 'Rolling Reserve', '冻结比例：交易额的 10%': '10% of volume',
    '结算周期：12.01 - 12.20': 'Cycle: 12.01 - 12.20', '待结算资金': 'Pending Settlement',
    '已结清': 'Cleared', '稳定': 'Stable', '永不过期': 'Never expires', '过期时间': 'Expiry',
    '商品/服务名称': 'Item/Service Name', '订单描述 (选填)': 'Description (optional)',
    '关联订单': 'Link Order', '关联发票': 'Link Invoice', '已关联订单:': 'Linked order:',
    '已关联发票:': 'Linked invoice:', '— 请选择要关联的订单 —': '— Select an order —',
    '— 请选择要关联的发票 —': '— Select an invoice —', '链接生成成功！': 'Link created!',
    '支付链接预览': 'Link Preview', '管理全库': 'Manage All',
    '收款商户': 'Merchant', '收款商户名称': 'Merchant Name', 'CRYPTO-001 - BTC 交易 - €2,500.00': 'CRYPTO-001 - BTC - €2,500.00',
    'INV-2024-003 - BTC 交易 - €2,500.00': 'INV-2024-003 - BTC - €2,500.00',
    '结算ID': 'Settlement ID', '交易金额': 'Transaction Amount', '实际到账': 'Net Received',
    '待处理退款': 'Pending Refunds', '总额成交': 'Total Volume', '冻结中': 'Frozen', '待激活': 'Pending Activation',
    '盘点中': 'Stocktaking', '暂停营业': 'Closed', '退款失败': 'Refund Failed', '结算失败': 'Settlement Failed',
    '大额提现需短信 + 邮箱双重确认': 'Large withdrawals need SMS + email confirmation',
    '上次修改：2026-06-24': 'Last changed: 2026-06-24', '已绑定 Google Authenticator': 'Google Authenticator linked',
    '邮件 + 站内信': 'Email + In-app', '邮件': 'Email', '邮件 + 短信 + 站内信': 'Email + SMS + In-app',
    /* 第三批：钱包等补充 */
    '可用余额 · 尾号 1024': 'Available · ·1024', '可用余额 · IBAN 已绑定': 'Available · IBAN linked',
    '可用余额 · 尾号 8888': 'Available · ·8888', '可用余额 · FPS 已开通': 'Available · FPS enabled',
    '冻结金额 $1,250.00': 'Frozen $1,250.00', '包含 2 笔进行中的争议订单保证金': 'Includes margin for 2 disputed orders',
    '查看全部交易': 'View All Transactions',
    '充值 - 银行转账': 'Deposit - Bank Transfer', '提现 - 招商银行 (8888)': 'Withdrawal - CMB (8888)',
    '收单结算入账': 'Acquiring Settlement', '货币兑换 USD → EUR': 'Exchange USD → EUR', '手续费扣款': 'Fee Deduction',
    '账户充值': 'Deposit', '充值币种': 'Currency', '充值方式': 'Method', '充值金额': 'Amount',
    '余额提现': 'Withdraw', '提现账户': 'Account', '提现金额': 'Amount', '确认充值': 'Confirm',
    '提交提现申请': 'Submit', '新增币种账户': 'Add Currency Account', '开通账户': 'Open Account',
    '选择要开通的币种账户，开通后立即可用于收款与兑换：': 'Choose a currency account to open for receiving and exchange:',
    '银行转账（1-2 个工作日，免手续费）': 'Bank Transfer (1-2 days, free)',
    'USDT-TRC20（约 5 分钟到账，0.1% 手续费）': 'USDT-TRC20 (~5 min, 0.1% fee)',
    '交易详情': 'Transaction Details', '订单详情': 'Order Details', '结算单详情': 'Settlement Details',
    '账户对账单': 'Account Statement', '客户详情': 'Customer Details', '邀请团队成员': 'Invite Team Member',
    '发票详情': 'Invoice Details', '会话选项': 'Chat Options', '门店详情': 'Store Details',
    '订单金额': 'Order Amount', '收款地址': 'Receiving Address', '查看收款码': 'View QR Codes',
    /* 网店列表 / 收款链接管理 */
    '网店列表': 'Online Stores', '管理您的线上商城收款接入，支持独立站与主流建站平台': 'Manage payment integration for your online stores',
    '添加网店': 'Add Store', '网店总数': 'Total Stores', '今日订单': "Today's Orders", '今日 GMV': "Today's GMV",
    '支付成功率': 'Success Rate', '搜索网店名称 / 域名': 'Search store / domain', '平台': 'Platform',
    '收款对接': 'Payment Link', '已对接': 'Connected', '未对接': 'Not Connected', '对接中': 'Connecting',
    '已停用': 'Disabled', '停用': 'Disable', '启用': 'Enable', '网店详情': 'Store Details',
    'API 对接': 'API Integration', '查看订单': 'View Orders', '网店名称': 'Store Name', '建站平台': 'Platform',
    '网店域名': 'Domain', '添加并对接': 'Add & Connect', '较昨日 +9.2%': '+9.2% vs yesterday',
    '较昨日 +14.6%': '+14.6% vs yesterday', '近 7 天均值': '7-day average', '4 家已对接收款': '4 connected',
    '创建收款链接': 'Create Payment Link', '创建即收链接，通过社交软件、邮件或短信发送给客户完成收款': 'Create instant payment links to share via chat, email or SMS',
    '链接总数': 'Total Links', '本月通过链接收款': 'Collected This Month', '链接打开次数': 'Link Opens',
    '支付转化率': 'Conversion Rate', '打开到支付成功': 'Open to payment', '本月累计': 'This month',
    '较上月 +22.8%': '+22.8% vs last month', '3 个生效中': '3 active',
    '搜索链接名称 / 编号': 'Search link name / ID', '链接编号': 'Link ID', '名称': 'Name',
    '收款次数': 'Payments', '创建时间': 'Created', '生效中': 'Active', '已过期': 'Expired',
    '复制链接': 'Copy Link', '二维码': 'QR Code', '生成链接': 'Generate Link', '链接已生成': 'Link Created',
    '链接名称': 'Link Name', '金额方式': 'Amount Type', '固定金额': 'Fixed Amount', '顾客输入金额': 'Customer-defined',
    '有效期': 'Validity', '长期有效': 'No expiry', '7 天': '7 days', '30 天': '30 days',
    '单次收款后失效': 'Expires after one payment', '备注（可选）': 'Note (optional)', '仅自己可见': 'Visible to you only',
    '停用链接': 'Disable Link', '启用链接': 'Enable Link', '下载图片': 'Download Image',
    '财务管理': 'Finance', '成本发票': 'Cost Invoices', 'VAT 管理': 'VAT', '年报管理': 'Annual Reports',
    /* ---- 官网收单广告区 ---- */
    '一站式商户收单': 'One-Stop Merchant Acquiring', '全场景收单解决方案': 'Acquiring for Every Scenario',
    '无论您是游戏厂商、独立站卖家，还是需要触达中国消费者，Dingdang Pay 都能提供合规、稳定、高转化的收款通道。': 'Whether you are a game publisher, an independent store seller, or need to reach Chinese consumers, Dingdang Pay offers compliant, stable, high-conversion payment channels.',
    '游戏收单': 'Gaming Acquiring', '面向游戏厂商与发行商的全球收款通道，覆盖手游、端游、页游全品类。': 'Global payment channels for game studios and publishers, covering mobile, PC and web games.',
    '点卡 / 内购 / 订阅全支持': 'Game cards, in-app purchases & subscriptions', '专属风控，拒付率保障': 'Dedicated risk control with chargeback protection', '多币种结算，T+1 到账': 'Multi-currency settlement, T+1 payout',
    '独立站收单': 'Independent Store Acquiring', '为 Shopify、WooCommerce 等独立站卖家提供一站式全球收款。': 'One-stop global payments for Shopify, WooCommerce and other independent stores.',
    'Visa / Mastercard / 本地支付': 'Visa / Mastercard / local payment methods', '插件 5 分钟快速接入': 'Plug-in integration in 5 minutes', '高转化率收银台体验': 'High-conversion checkout experience',
    '微信收单': 'WeChat Pay Acquiring', '直连微信支付官方通道，全场景触达 13 亿微信用户。': 'Direct access to official WeChat Pay channels, reaching 1.3 billion WeChat users.',
    '扫码 / 小程序 / 公众号支付': 'QR code, mini-program & official account payments', '跨境人民币结算秒到账': 'Instant cross-border CNY settlement', '线上线下全场景覆盖': 'Full online & offline coverage',
    '支付宝收单': 'Alipay Acquiring', '支付宝境内外收单，触达 10 亿+ 中国消费者。': 'Domestic and cross-border Alipay acquiring, reaching 1 billion+ Chinese consumers.',
    '扫码 / 条码 / APP 支付': 'QR code, barcode & in-app payments', 'Alipay+ 覆盖东南亚钱包': 'Alipay+ coverage across SEA wallets', '跨境结算一站式完成': 'One-stop cross-border settlement',
    '了解详情': 'Learn More', '准备好开始收款了吗？': 'Ready to start accepting payments?',
    '开通商户账户，一个后台管理所有收单通道，费率低至 0.8%。': 'Open a merchant account and manage all acquiring channels in one dashboard, with rates as low as 0.8%.',
    '免费开通商户账户': 'Open Merchant Account Free',
    /* ---- 官网覆盖地区 ---- */
    '全球即时收付款网络': 'Global Instant Payment Network', '支持即时收付款的地区': 'Regions with Instant Pay & Collect',
    '覆盖 40+ 国家和地区，本地通道直连，付款秒级到账，收款实时入账。': 'Covering 40+ countries and regions with direct local rails — payouts arrive in seconds, collections settle in real time.',
    '国家 / 地区': 'Countries / Regions', '结算币种': 'Settlement Currencies', '最快到账': 'Fastest Arrival', '全天候清算': 'Always-On Clearing',
    '欧洲': 'Europe', '大中华区': 'Greater China', '东南亚及亚太': 'Southeast Asia & APAC', '美洲及中东': 'Americas & Middle East',
    'SEPA Instant / FPS · 秒级': 'SEPA Instant / FPS · Instant', '微信 / 支付宝 / 银联 · 秒级': 'WeChat / Alipay / UnionPay · Instant',
    '本地钱包直连 · 秒级': 'Direct local wallets · Instant', 'ACH / 本地清算 · 当日达': 'ACH / local clearing · Same day',
    '英国': 'United Kingdom', '德国': 'Germany', '法国': 'France', '意大利': 'Italy', '西班牙': 'Spain', '荷兰': 'Netherlands', '马耳他': 'Malta',
    '中国大陆': 'Chinese Mainland', '中国香港': 'Hong Kong, China', '中国澳门': 'Macao, China', '中国台湾': 'Taiwan, China',
    '新加坡': 'Singapore', '马来西亚': 'Malaysia', '泰国': 'Thailand', '印度尼西亚': 'Indonesia', '越南': 'Vietnam', '菲律宾': 'Philippines', '日本': 'Japan', '韩国': 'South Korea',
    '美国': 'United States', '加拿大': 'Canada', '澳大利亚': 'Australia', '阿联酋': 'UAE', '沙特阿拉伯': 'Saudi Arabia',
    '+ 欧元区 19 国': '+ 19 Eurozone countries', '持续拓展中': 'Expanding',
    '具体通道与到账时效以商户后台实时通道状态为准。': 'Actual rails and settlement times are subject to real-time channel status in the merchant dashboard.',
    /* ---- 官网导航 ---- */
    '首页': 'Home', '全球账户': 'Global Account', '全球收单': 'Global Acquiring', '关于我们': 'About Us', '帮助': 'Help', '立即开户': 'Open Account',
    '管理物流、采购、服务等进项发票，认证后计入出口退税申报': 'Manage input invoices for logistics, purchasing and services; verified invoices count toward export tax rebate',
    '管理销项发票开具与作废，电子发票经 Fatture in Cloud 推送税局': 'Manage sales invoicing and voiding; e-invoices are pushed to tax authority via Fatture in Cloud',
    '运单跟踪、出口报关单与米兰仓出入库管理': 'Shipment tracking, export customs declarations and Milan warehouse operations',
    '欧盟多国 VAT 申报与缴款管理，截止日自动预警': 'Multi-country EU VAT filing and payment with deadline alerts',
    '三家意大利主体年度财报编制、提交与备案跟踪': 'Annual report preparation, filing and registration for three Italian entities',
    '本月成本发票': 'Cost Invoices (Month)', '可抵扣税额': 'Deductible Tax', '进项税（22% 税率）': 'Input VAT (22%)',
    '需在月底前完成认证': 'Verify before month end', '已计入退税申报': 'Included in rebate filing',
    '录入发票': 'Add Invoice', '批量导入': 'Batch Import', '导出明细': 'Export', '供应商': 'Supplier',
    '类目': 'Category', '金额': 'Amount', '税额': 'Tax', '税率': 'Rate', '日期': 'Date',
    '搜索发票号 / 供应商 / 类目': 'Search invoice no. / supplier / category',
    '航空物流': 'Air Freight', '快递物流': 'Express', '仓储服务': 'Warehousing', '报关服务': 'Customs Brokerage',
    '商品采购': 'Goods Purchase', '软件服务': 'Software', '卡服务费': 'Card Service', '尾程派送': 'Last-mile Delivery',
    '成本发票详情': 'Cost Invoice Details', '发票号': 'Invoice No.', '认证状态': 'Verification Status',
    '进项税归属': 'Input Tax Batch', '确认认证该发票？认证后计入当期进项税。': 'Verify this invoice? It will count toward current input VAT.',
    '发票已认证': 'Invoice verified', '认证凭证已生成并开始下载': 'Certificate generated, downloading',
    '发票 PDF 已开始下载': 'Invoice PDF downloading', '明细已导出 CSV': 'Exported as CSV',
    '录入成本发票': 'Add Cost Invoice', '请完整填写发票信息': 'Please complete all fields', '成本发票已录入，待认证': 'Invoice added, pending verification',
    '已选择 ': 'Selected ', '，解析导入 12 张发票': ', 12 invoices imported',
    '物流运单': 'Shipments', '报关单': 'Customs Declarations', '仓库': 'Warehouse',
    '在途运单': 'In Transit', '本月报关单': 'Declarations (Month)', '放行率 100%': '100% clearance rate',
    '库存件数': 'Stock Units', '今日出入库': 'Today In/Out', '清点中 1 批': '1 batch counting',
    '新建运单': 'New Shipment', '运单号': 'Tracking No.', '渠道': 'Channel', '线路': 'Route',
    '件数': 'Pieces', '重量': 'Weight', '时效': 'ETA', '跟踪': 'Track', '物流跟踪 · ': 'Tracking · ',
    '深圳仓出库': 'Departed Shenzhen Warehouse', '已打托 42 托': '42 pallets packed',
    'SZX 机场交运': 'Handed to SZX Airport', '安检通过': 'Security cleared',
    '航班 CA967 在途': 'Flight CA967 in transit', '预计 09-26 06:40 抵达 MXP': 'ETA MXP 09-26 06:40',
    '到港清关': 'Arrival Clearance', '待进行': 'Pending', '运单详情': 'Shipment Details', '运费': 'Freight',
    '下载面单': 'Download Label', '面单已开始下载': 'Label downloading', '目的地': 'Destination', '创建': 'Create',
    '请填写件数': 'Enter piece count', '运单已创建，单号 AWB-88045': 'Shipment created, AWB-88045',
    '新建报关单': 'New Declaration', '关联运单': 'Linked Shipment', '申报金额': 'Declared Value', 'HS 编码': 'HS Code',
    '报关单详情': 'Declaration Details', '申报主体': 'Declaring Entity', '贸易方式': 'Trade Mode',
    '一般贸易（出口退税）': 'General Trade (Export Rebate)', '确认提交海关申报？': 'Submit customs declaration?',
    '报关单已提交海关': 'Declaration submitted', '报关单 PDF 已开始下载': 'Declaration PDF downloading',
    '报关单已创建，待申报': 'Declaration created, pending filing', '请填写申报金额和 HS 编码': 'Enter declared value and HS code',
    '待申报': 'Pending Filing', '已申报': 'Filed', '已放行': 'Released',
    '入库登记': 'Stock-in Registration', '库存盘点': 'Stocktake', '单据号': 'Doc No.', '批次/波次': 'Batch/Wave',
    'SKU 数': 'SKUs', '库位': 'Location', '时间': 'Time', '出入库单详情': 'Stock Order Details',
    '批次': 'Batch', '关联运单/批次': 'Shipment/Batch', '请填写入库件数': 'Enter quantity',
    '入库单已登记，进入清点流程': 'Stock-in registered, counting started',
    '发起库存盘点任务？将锁定当前库存快照。': 'Start stocktake? Current stock snapshot will be locked.',
    '盘点任务已下发至米兰仓': 'Stocktake task sent to Milan warehouse', '已上架': 'Shelved', '已出库': 'Outbound', '清点中': 'Counting',
    '本季应缴 VAT': 'VAT Due (Quarter)', '待申报': 'Pending', '最近截止 10-10（德国）': 'Next deadline 10-10 (DE)',
    '本年已缴': 'Paid (Year)', 'Q1/Q2 全部缴清': 'Q1/Q2 fully paid', '退税进行中': 'Rebate in Progress', 'Q1 进项退税审批中': 'Q1 input rebate under review',
    '新建申报': 'New Filing', '导出汇总': 'Export Summary', '申报周期': 'Filing Period', '国家/税号': 'Country/Tax ID',
    '应税销售额': 'Taxable Sales', '应缴 VAT': 'VAT Due', '截止日': 'Deadline',
    '搜索周期 / 国家': 'Search period / country', '缴款记录': 'Payment Records', '缴款方式': 'Payment Method',
    '缴款日期': 'Payment Date', '回执编号': 'Receipt No.', '下载回执': 'Download Receipt', '缴款回执已开始下载': 'Receipt downloading',
    '确认提交该周期 VAT 申报？提交后将生成缴款通知。': 'Submit VAT filing for this period? A payment notice will be generated.',
    '申报已提交，缴款通知已生成': 'Filed, payment notice generated', '申报方式': 'Filing Method', '本地会计师代理申报': 'Filed by local accountant',
    '新建 VAT 申报': 'New VAT Filing', '国家': 'Country', '请填写应税销售额': 'Enter taxable sales',
    '申报任务已创建，待会计师复核': 'Filing task created, pending accountant review', '已缴纳': 'Paid',
    '管理主体': 'Entities', '已备案年报': 'Filed Reports', '编制中': 'In Preparation',
    '新建年报任务': 'New Report Task', '公司主体': 'Entity', '财年': 'Fiscal Year', '法定截止日': 'Statutory Deadline',
    '负责会计师': 'Accountant', '提交日期': 'Submission Date', '搜索公司 / 财年': 'Search entity / fiscal year',
    '年报详情 · ': 'Report Details · ', '报表类型': 'Report Type', '附注文件': 'Notes',
    '确认向商会 (Camera di Commercio) 提交年报？': 'Submit annual report to Chamber of Commerce?',
    '年报已提交并备案': 'Report submitted and registered', '年报 PDF 已开始下载': 'Report PDF downloading',
    '年报任务已创建并通知会计师': 'Task created, accountant notified', '已备案': 'Registered', '待提交': 'Pending Submission',
    '营收发票': 'Sales Invoices',
    '物流': 'Logistics', '导出': 'Export', '待认证': 'Pending', '已抵扣': 'Deducted',
    '航空托盘': 'Air Pallet', '在途': 'In Transit', '已到港': 'Arrived', '派送中': 'Delivering',
    '已签收': 'Signed', '已清关': 'Cleared', '认证': 'Verify', '凭证': 'Certificate',
    '深圳 SZX → 米兰 MXP': 'Shenzhen SZX → Milan MXP', '深圳 SZX → 罗马 FCO': 'Shenzhen SZX → Rome FCO',
    '米兰 → 柏林': 'Milan → Berlin', '香港 HKG → 米兰 MXP': 'Hong Kong HKG → Milan MXP', '罗马 → 巴黎': 'Rome → Paris',
    '航空托盘 4 票 · UPS 2 票': '4 air pallet · 2 UPS', '米兰仓 3,200㎡': 'Milan warehouse 3,200㎡',
    '入 2,150 / 出 380': 'In 2,150 / Out 380', '合计 €186,400': 'Total €186,400',
    '较上月 +18.2%': '+18.2% vs last month', '电子发票经由 Fatture in Cloud': 'E-invoices via Fatture in Cloud',
    '订单已交付未开票': 'Delivered, not invoiced', '冲红已同步税局': 'Reversals synced to tax authority',
    '意大利 IT': 'Italy IT', '德国 DE': 'Germany DE', '法国 FR': 'France FR', '西班牙 ES': 'Spain ES',
    'IT €106,964 + DE €24,396': 'IT €106,964 + DE €24,396',
    '小贴士：固定金额链接适合商品售卖；"顾客输入金额"链接适合打赏、活动收款等场景。链接支持微信、支付宝、银行卡与加密币支付。': 'Tip: fixed-amount links suit product sales; customer-defined links suit tips and events. Links support WeChat, Alipay, cards and crypto.',
    /* 法币交易记录 / 速汇中国 / 全球即时付款 */
    '法币交易记录': 'Fiat Transactions', '仅展示法币（EUR / GBP / USD / CNY 等）资金往来流水，数字资产记录请前往对应钱包查看': 'Fiat (EUR / GBP / USD / CNY) flows only. For digital assets, see the wallets.',
    '国际电汇': 'Wire Transfer', 'EUR 电汇至 GBP 账户': 'EUR wire to GBP account',
    '速汇中国': 'Express China', '即时付款到微信、支付宝、银联卡，分钟级到账，透明费率': 'Instant payout to WeChat, Alipay or UnionPay. Arrives in minutes with transparent fees.',
    '速汇中国通道': 'Express China Channel', '使用速汇中国通道付款至微信、支付宝或银联卡，最快可实现 5 分钟内到账。': 'Pay to WeChat, Alipay or UnionPay via Express China — as fast as 5 minutes.',
    '支付宝速汇': 'Alipay Express', '微信汇款': 'WeChat Remittance', '微信号 / 手机号': 'WeChat ID / Phone',
    '全球即时付款': 'Instant Payout', '平台已对接的即时汇款国家通道，实时汇率、透明费率、分钟级到账': 'Connected instant payout corridors. Live rates, transparent fees, minute-level arrival.',
    '全部通道': 'All Corridors', '运行正常': 'Operational', '热门通道': 'Popular', '分钟级到账': 'Minute-level',
    '到账方式': 'Methods', '到账时间': 'Arrival', '费率': 'Fee', '单笔限额': 'Limit', '热门': 'Hot',
    '通道说明': 'Corridor Notes', '合规保障': 'Compliance', '新通道申请': 'New Corridor Request',
    '所有通道以下单时锁定汇率为准，页面展示汇率每 30 秒刷新。': 'Rates lock at order time and refresh every 30 seconds.',
    '各通道均通过当地持牌合作机构清算，资金流向全程可追踪。': 'All corridors settle via licensed local partners with full traceability.',
    '需要其他国家/地区通道？联系商务经理，最快 5 个工作日完成对接。': 'Need another corridor? Contact your account manager — setup in as fast as 5 business days.',
    '汇款金额 (EUR)': 'Amount (EUR)', '确认汇款': 'Confirm', '快速汇款': 'Quick Remit'
  });

  /* ---- 设计系统 v2：官网页脚 / 关于我们 / 错误页 / 员工登录 / App ---- */
  Object.assign(DICT, {
    '关于我们': 'About Us', '让每一笔跨境资金': 'Make every cross-border payment', '都像本地转账一样简单': 'as simple as a local transfer',
    '叮当支付是一家持牌跨境数字支付机构，为跨境电商、外贸企业与全球化团队提供全球账户、即时付款与全场景收单服务。': 'Dingdang Pay is a licensed cross-border payment institution offering global accounts, instant payouts and omni-channel acquiring for e-commerce sellers, exporters and global teams.',
    '成立于马耳他': 'Founded in Malta', '企业与个人客户': 'Business & personal clients', '支持国家和地区': 'Countries & regions', '年度处理交易额': 'Annual processed volume',
    '我们的使命': 'Our Mission', '消除跨境支付的时间与成本壁垒，让中小企业也能享受与跨国公司同等的金融基础设施。': 'Remove the time and cost barriers of cross-border payments so SMEs get the same financial infrastructure as multinationals.',
    '合规为本': 'Compliance First', '持有马耳他 EMI 与英国 FCA 牌照，客户资金 100% 隔离存管，接受当地监管机构定期审计。': 'Licensed by Malta (EMI) and UK FCA. Client funds are 100% safeguarded and regularly audited by regulators.',
    '以客户为中心': 'Customer Centric', '7×24 中英文客服、专属客户经理与开放 API，帮助客户在 1 天内完成开户并开始收付款。': '24/7 bilingual support, dedicated account managers and open APIs get you live within one day.',
    '发展历程': 'Our Journey', '公司成立': 'Company founded', '在马耳他注册成立，获得 MFSA 电子货币机构（EMI）牌照。': 'Incorporated in Malta and licensed by MFSA as an Electronic Money Institution (EMI).',
    '上线全球账户': 'Global Account launched', '推出多币种 IBAN 账户，覆盖欧元、英镑、美元等 20 余种币种。': 'Multi-currency IBAN accounts covering 20+ currencies including EUR, GBP and USD.',
    '获得英国 FCA 授权': 'UK FCA authorisation', '开通英国本地清算通道，实现 GBP 5 分钟到账。': 'Local UK clearing enables GBP arrival within 5 minutes.',
    '全场景收单': 'Omni-channel acquiring', '上线游戏、独立站、微信与支付宝收单，费率低至 0.8%。': 'Gaming, DTC store, WeChat Pay and Alipay acquiring from 0.8%.',
    '支持 40+ 国家和地区 7×24 即时到账，并发布叮当支付 App。': '24/7 instant payouts to 40+ countries and regions, plus the Dingdang Pay app.',
    '全球办公室': 'Global Offices', 'MT · 总部': 'MT · Headquarters', '马耳他 瓦莱塔': 'Valletta, Malta', 'GB · 欧洲运营': 'GB · European Ops', '英国 伦敦': 'London, UK', 'HK · 亚太运营': 'HK · APAC Ops',
    '中环皇后大道中 99 号中环中心 28 楼': '28/F, The Center, 99 Queen\'s Road Central, Central',
    '准备好走向全球了吗？': 'Ready to go global?', '5 分钟完成注册，1 个工作日内开通全球账户。': 'Sign up in 5 minutes. Global account ready within 1 business day.', '联系我们': 'Contact Us',
    '叮当支付是全球领先的数字金融服务商，致力于为跨境电商、数字游民及全球化企业提供合规、高效、低成本的支付解决方案。': 'Dingdang Pay is a leading digital financial services provider delivering compliant, efficient and low-cost payments for cross-border sellers, digital nomads and global businesses.',
    '客服邮箱: support@dingdangpay.com': 'Support: support@dingdangpay.com', '产品服务': 'Products', '关于叮当': 'Company', '监管牌照': 'Licenses', '下载 App': 'Get the App', '法律条款': 'Legal',
    '隐私协议': 'Privacy Policy', '服务条款': 'Terms of Service', '实名认证': 'Identity Verification', '马耳他注册号: C102938': 'Malta Reg. No: C102938', '英国注册号: 902837': 'UK Reg. No: 902837', '菜单': 'Menu',
    '页面不存在': 'Page Not Found', '页面走丢了': 'This page wandered off', '您访问的页面可能已被移动或删除。请检查网址，或返回首页继续浏览。': 'The page may have been moved or deleted. Check the URL or head back home.',
    '如持续出现此问题，请联系 support@dingdangpay.com': 'If this keeps happening, contact support@dingdangpay.com',
    '服务异常': 'Service Error', '服务暂时不可用': 'Service temporarily unavailable', '系统开小差了，我们的工程师已收到告警并正在处理。您的资金安全不受影响，请稍后重试。': 'Something went wrong. Our engineers have been alerted. Your funds are safe; please try again shortly.',
    '重新加载': 'Reload', '错误编号：': 'Error ID: ', '网络已断开': 'Offline', '网络连接已断开': 'You are offline', '请检查 Wi-Fi 或移动网络后重试。网络恢复后页面会自动刷新。': 'Check your Wi-Fi or cellular connection. The page will refresh once you are back online.',
    '重新连接': 'Reconnect', '正在等待网络…': 'Waiting for network…', '仍未检测到网络': 'Still no connection', '网络已恢复，正在返回…': 'Back online, returning…',
    '员工登录': 'Staff Sign In', '叮当支付 · 运营后台': 'Dingdang Pay · Ops Console', '仅限授权员工使用，所有操作均会记录审计日志。': 'Authorized staff only. All actions are audit-logged.',
    '企业邮箱': 'Work Email', '密码': 'Password', '动态验证码（2FA）': 'One-time Code (2FA)', '登录后台': 'Sign In', '← 返回官网': '← Back to website', '忘记密码请联系 IT 管理员': 'Forgot password? Contact IT',
    '请输入密码': 'Enter password', '请输入有效的企业邮箱': 'Enter a valid work email', '密码至少 6 位': 'At least 6 characters', '请输入 6 位动态验证码': 'Enter the 6-digit code', '登录成功': 'Signed in',
    '此项为必填': 'Required', '邮箱格式不正确': 'Invalid email', '至少 6 位': 'At least 6 characters', '网络已断开，部分功能暂不可用': 'You are offline. Some features are unavailable.', '网络已恢复': 'Back online',
    '暂无数据': 'No data', '这里还没有任何记录': 'Nothing here yet', '没有匹配结果': 'No results', '换个关键词或调整筛选条件试试': 'Try a different keyword or filter', '加载失败': 'Failed to load', '网络开小差了，请稍后重试': 'Network hiccup, please retry', '操作失败，请重试': 'Something went wrong, please retry',
    /* App */
    '叮当支付 App': 'Dingdang Pay App', '全球账户、即时付款、全场景收单，装进口袋。': 'Global accounts, instant payouts and acquiring — in your pocket.', '此为 H5 可交互原型，在手机上打开可全屏体验。': 'Interactive H5 prototype. Open on a phone for full screen.',
    '官网': 'Website', 'Web 客户端': 'Web App', '员工后台': 'Staff Console', '主导航': 'Main navigation',
    '账户': 'Accounts', '付款': 'Pay', '收单': 'Acquiring', '我的': 'Me', '返回': 'Back', '收款': 'Receive', '换汇': 'Exchange', '收款链接': 'Pay Link',
    '全球资金，': 'Global money,', '一个 App 搞定': 'one app.', '多币种全球账户、40+ 国家即时付款、游戏/独立站/微信/支付宝全场景收单。': 'Multi-currency accounts, instant payouts to 40+ countries, and gaming/DTC/WeChat/Alipay acquiring.',
    '注册新账户': 'Create Account', '继续即表示同意': 'By continuing you agree to the', '与': 'and', '登录叮当支付': 'Sign in to Dingdang Pay', '演示账号已预填，直接登录即可。': 'Demo credentials are prefilled.', '使用面容 ID': 'Use Face ID', '邮箱': 'Email',
    '总资产估值 (EUR)': 'Total balance (EUR)', '我的账户': 'My Accounts', '全部': 'All', '新增币种': 'Add currency', '新增币种账户': 'Add currency account', '速汇中国 · 微信到账': 'China Express · to WeChat', '欧元直达微信/银行卡，最快 5 分钟': 'EUR to WeChat/bank card in as fast as 5 min', '去付款': 'Pay now',
    '最近交易': 'Recent Activity', '查看全部': 'See all', '请在手机上使用相机扫码': 'Use your phone camera to scan', '瑞士法郎': 'Swiss Franc', '港币': 'Hong Kong Dollar', '新加坡元': 'Singapore Dollar', '日元': 'Japanese Yen',
    '已开通全部可用币种': 'All currencies already enabled', '免费开通 · 即时生效': 'Free · instant', '欧元账户': 'EUR Account', '美元账户': 'USD Account', '英镑账户': 'GBP Account', 'USDT 钱包': 'USDT Wallet',
    '管理': 'Manage', '银行卡': 'Cards', '交易记录': 'Transactions', '货币兑换': 'Exchange', '账户名': 'Account name', '钱包地址': 'Wallet address', '复制': 'Copy', '已复制': 'Copied', '已复制到剪贴板': 'Copied to clipboard', '可用余额': 'Available balance',
    '交易': 'Activity', '暂无交易': 'No transactions', '该账户还没有任何交易记录': 'This account has no transactions yet', '去收款': 'Receive money', '暂无记录': 'No records', '该分类下还没有交易': 'No transactions in this category',
    '收入': 'In', '支出': 'Out', '兑换': 'FX', '搜索交易': 'Search transactions', '交易详情': 'Details', '交易状态': 'Status', '交易渠道': 'Channel', '交易时间': 'Time', '交易单号': 'Reference', '手续费': 'Fee', '付款账户': 'From account',
    '已完成': 'Completed', '处理中': 'Processing', '失败': 'Failed', '收款人微信账户未实名，资金已原路退回。请核对收款信息后重试。': 'The recipient\'s WeChat account is unverified; funds were returned. Check the details and retry.',
    '资金正在清算中，预计 30 分钟内到账。': 'Funds are clearing and should arrive within 30 minutes.', '重新付款': 'Pay again', '下载电子回单': 'Download receipt', '对此交易有疑问': 'Question about this transaction', '回单已保存到文件': 'Receipt saved to Files',
    '全球即时付款': 'Global Instant Pay', '速汇中国': 'China Express', '40+ 国家 · 7×24': '40+ countries · 24/7', '微信 / 银行卡到账': 'To WeChat / bank card', '常用收款人': 'Frequent Recipients', '添加收款人': 'Add recipient', '费率': 'Fees',
    '€0.50 / 笔': '€0.50 / txn', '0.3%，最低 €2': '0.3%, min €2', 'SWIFT 国际电汇': 'SWIFT wire', '€8 / 笔': '€8 / txn', '手续费 €0.50 · 预计即时到账': 'Fee €0.50 · arrives instantly', '1 EUR ≈ 7.8200 CNY · 预计 5 分钟到账': '1 EUR ≈ 7.8200 CNY · arrives in ~5 min',
    '收款人': 'Recipient', '更换': 'Change', '选择收款人': 'Choose recipient', '附言': 'Memo', '选填，最多 40 字': 'Optional, up to 40 chars', '下一步': 'Next', '余额不足': 'Insufficient balance', '单笔最低 €1': 'Minimum €1',
    '确认付款': 'Confirm Payment', '到账方式': 'Delivery', '合计扣款': 'Total debit', '预计到账': 'Arrives', '5 分钟内': 'Within 5 min', '即时': 'Instant', '取消': 'Cancel', '确定': 'OK',
    '输入支付密码': 'Enter payment PIN', '演示密码：123456': 'Demo PIN: 123456', '面容 ID': 'Face ID', '删除': 'Delete', '支付密码错误，还可尝试 4 次': 'Wrong PIN, 4 attempts left',
    '正在提交付款': 'Submitting payment', '请勿关闭页面': 'Please keep this page open', '网络异常': 'Network error', '付款未提交，资金未扣除。请检查网络后重试。': 'Payment not submitted and no funds were debited. Check your network and retry.', '重试': 'Retry',
    '付款已提交': 'Payment submitted', '完成': 'Done', '查看详情': 'View details', '刚刚': 'Just now', '今天': 'Today', '昨天': 'Yesterday',
    '添加': 'Add', '还没有收款人': 'No recipients yet', '添加收款人后可一键快速付款': 'Add a recipient to pay in one tap', '删除收款人': 'Delete recipient', '删除后不可恢复，确定删除吗？': 'This cannot be undone. Delete?', '已删除': 'Deleted',
    '银行账户': 'Bank account', '微信': 'WeChat', '支付宝': 'Alipay', '币种': 'Currency', '姓名或企业全称': 'Full name or company', '请填写收款人姓名': 'Enter recipient name', '请填写收款账号': 'Enter account number', '账户信息仅用于付款，受银行级加密保护。': 'Account details are used only for payments and protected by bank-grade encryption.',
    '保存': 'Save', '微信号': 'WeChat ID', 'wxid / 手机号': 'WeChat ID / phone', '手机号 / 邮箱': 'Phone / email', '收款人已添加': 'Recipient added',
    '扫码向我付款': 'Scan to pay me', '支持叮当支付 App · 微信 · 支付宝': 'Works with Dingdang Pay · WeChat · Alipay', '分享收款信息': 'Share details', '创建收款链接': 'Create pay link', '收款信息已复制，可粘贴分享': 'Details copied, ready to share',
    '卖出': 'Sell', '买入': 'Buy', '汇率实时更新，锁定 30 秒 · 0 手续费': 'Live rate locked for 30s · no fee', '立即兑换': 'Exchange now', '兑换成功': 'Exchanged',
    '商品名称': 'Item', '金额': 'Amount', '例如：定制T恤': 'e.g. Custom T-shirt', '请填写商品名称': 'Enter item name', '请输入大于 0 的金额': 'Enter an amount above 0', '支付方式': 'Payment methods', '生成链接': 'Generate link', '收款链接已生成': 'Pay link created',
    '今日收款': 'Today\'s volume', '订单数': 'Orders', '成功率': 'Success rate', '待结算': 'Pending settlement', '近 7 日': 'Last 7 days', '周一': 'Mon', '周二': 'Tue', '周三': 'Wed', '周四': 'Thu', '周五': 'Fri', '周六': 'Sat', '周日': 'Sun',
    '收单渠道': 'Channels', '游戏收单': 'Gaming', '独立站': 'DTC Store', '微信支付': 'WeChat Pay', '最新订单': 'Latest Orders', '订单服务响应超时，请稍后重试': 'Order service timed out, please retry',
    'Steam · 游戏点卡': 'Steam · Game card', '独立站 · 定制T恤': 'DTC · Custom T-shirt', '微信 · 门店消费': 'WeChat · In-store',
    '通知': 'Notifications', '全部已读': 'Mark all read', '暂无通知': 'No notifications', '交易与安全提醒会显示在这里': 'Transaction and security alerts appear here', '清空通知': 'Clear all', '清空': 'Clear', '确定清空全部通知吗？': 'Clear all notifications?', '已清空': 'Cleared', '已全部标为已读': 'All marked as read',
    '收款到账': 'Money received', '付款处理中': 'Payment processing', '安全提醒': 'Security alert',
    'KYB 已认证': 'KYB verified', '安全中心': 'Security', '通用设置': 'Settings', '帮助与客服': 'Help & Support', '退出登录': 'Sign Out', '退出后需重新验证身份才能使用。': 'You will need to verify again to sign back in.', '退出': 'Sign out', '叮当支付 v3.2.0 · MFSA & FCA 持牌': 'Dingdang Pay v3.2.0 · Licensed by MFSA & FCA',
    '登录与支付': 'Sign-in & Payments', '面容 ID 登录与支付': 'Face ID for sign-in & pay', '两步验证 (2FA)': 'Two-factor auth (2FA)', '登录新设备时需动态验证码': 'Require a code on new devices', '修改支付密码': 'Change payment PIN', '登录设备': 'Devices',
    'iPhone 15 Pro（本机）': 'iPhone 15 Pro (this device)', '米兰 · 当前在线': 'Milan · Online now', '米兰 · 2 小时前': 'Milan · 2 hours ago', '下线': 'Sign out', '已开启': 'On', '已关闭': 'Off', '身份验证通过，请设置新密码': 'Verified. Set a new PIN.', '下线设备': 'Sign out device', '该设备将立即退出登录。': 'This device will be signed out immediately.', '设备已下线': 'Device signed out',
    '推送通知': 'Push notifications', '隐藏首页余额': 'Hide balance on Home', '语言': 'Language', '其他': 'Other', '清除缓存': 'Clear cache', '缓存已清除': 'Cache cleared',
    '还没有绑定银行卡': 'No cards yet', '绑定实体卡或虚拟卡后，可用于充值和线下消费': 'Add a physical or virtual card for top-ups and in-store spending', '申请虚拟卡': 'Get a virtual card', '虚拟卡申请已提交，预计 1 分钟内开通': 'Virtual card requested, ready in about a minute', '请在 Web 客户端完成实体卡申请': 'Please apply for a physical card on the Web app',
    '付款多久到账？': 'How long do payments take?', '如何开通新的币种账户？': 'How do I add a currency account?', '速汇中国支持哪些收款方式？': 'Which methods does China Express support?', '收单结算周期是多久？': 'What is the settlement cycle?',
    '在线客服 · 7×24': 'Live chat · 24/7', '发送邮件': 'Send email', '知道了': 'Got it', '客服 Lucia 已接入，请描述您的问题': 'Lucia from support has joined. How can we help?',
    'SEPA Instant 与速汇中国通常 5 分钟内到账；SWIFT 国际电汇 1–3 个工作日。如超时未到账，可在交易详情中发起查询。': 'SEPA Instant and China Express usually arrive within 5 minutes; SWIFT takes 1–3 business days. If delayed, open a query from the transaction details.',
    '该功能可能已下线或链接有误': 'This feature may be unavailable or the link is wrong', '返回首页': 'Back to Home', '扫一扫': 'Scan', '显示/隐藏余额': 'Show/hide balance', '收款二维码': 'Payment QR code', '付款金额': 'Payment amount', '帮助中心': 'Help Center',
    '演示账号': 'Demo account', '至少 6 位字符': 'At least 6 characters'
  });

  // dd-products:start
  Object.assign(DICT, {
      "欧元账户": "EUR Account",
      "英镑账户": "GBP Account",
      "美元账户": "USD Account",
      "港币账户": "HKD Account",
      "总资产估值": "Total Balance",
      "4 个币种账户": "4 currency accounts",
      "全球账户": "Global Accounts",
      "一个账户": "One account,",
      "收付全球 30+ 币种": "30+ currencies worldwide",
      "在线开通欧元、英镑、美元、港币等本地收款账户，像当地公司一样收款，资金实时到账，统一管理。": "Open local EUR, GBP, USD and HKD receiving accounts online. Get paid like a local business, with funds arriving in real time and managed in one place.",
      "本地 IBAN": "Local IBAN",
      "0 开户费": "No setup fee",
      "资金隔离存管": "Safeguarded funds",
      "免费开户": "Open Free Account",
      "登录账户": "Sign In",
      "支持币种": "Currencies",
      "1 天": "1 day",
      "最快开通": "Fastest activation",
      "开户与月费": "Setup & monthly fee",
      "客户资金隔离": "Funds segregated",
      "核心能力": "Capabilities",
      "为全球化生意准备的账户": "An account built for global business",
      "从收款、换汇到对账，一个后台全部完成。": "Receive, convert and reconcile, all from one dashboard.",
      "本地收款账户": "Local receiving accounts",
      "独立 IBAN 及英国 Sort Code、美国 ACH 账号，平台回款与客户打款均按本地转账到账。": "Dedicated IBAN, UK sort code and US ACH details, so marketplace payouts and customer transfers arrive as local payments.",
      "多币种余额": "Multi-currency balances",
      "30+ 币种独立余额，无需提前结汇，按需持有与使用。": "Hold separate balances in 30+ currencies with no forced conversion.",
      "实时换汇": "Real-time FX",
      "银行间中间价加透明点差，支持汇率锁定，兑换秒级完成。": "Interbank mid-market rate plus a transparent margin, with rate locking and instant conversion.",
      "自动对账": "Auto reconciliation",
      "每笔入账自动匹配付款方与备注，支持导出 Excel / CSV 账单。": "Every credit is matched to payer and reference automatically, with Excel / CSV exports.",
      "团队与权限": "Team & permissions",
      "多成员协作，按角色分配查看、发起、审批权限。": "Invite teammates and assign view, initiate and approve rights by role.",
      "开放 API": "Open API",
      "账户、余额、流水全量开放，轻松接入 ERP 与财务系统。": "Accounts, balances and transactions via API for easy ERP and finance integration.",
      "适用场景": "Use Cases",
      "谁在使用全球账户": "Who uses Global Accounts",
      "跨境电商卖家": "Cross-border sellers",
      "Amazon、eBay、Shopify 等平台回款直达本地账户，避免多层中转扣费。": "Receive Amazon, eBay and Shopify payouts straight into local accounts without intermediary fees.",
      "外贸与服务企业": "Trade & service companies",
      "向海外客户提供本地账户收款，缩短账期，提升回款率。": "Give overseas clients local account details to shorten payment cycles.",
      "自由职业与数字游民": "Freelancers & nomads",
      "个人即可开户，多币种收取稿费与项目款，随时兑换使用。": "Individuals can open an account to receive fees in multiple currencies and convert anytime.",
      "四步开通全球账户": "Open your account in four steps",
      "注册账户": "Sign up",
      "使用邮箱或手机号注册，2 分钟完成。": "Register with email or phone in 2 minutes.",
      "身份认证": "Verify identity",
      "个人上传证件，企业提交营业执照与股东信息。": "Upload ID, or company registration and UBO details.",
      "开通币种": "Add currencies",
      "审核通过后按需开通各币种收款账户。": "Add currency accounts once approved.",
      "开始收款": "Start receiving",
      "把账户信息发给付款方，入账实时通知。": "Share your details and get notified instantly on every credit.",
      "如何开始": "How It Works",
      "全球账户费率": "Global Accounts pricing",
      "开户费": "Account setup",
      "免费": "Free",
      "账户管理费": "Monthly fee",
      "本地币种入账": "Local currency credits",
      "SWIFT 入账": "SWIFT credits",
      "笔": "txn",
      "币种兑换": "Currency conversion",
      "起": "from",
      "具体费率以开户后控制台展示为准，企业客户可申请阶梯优惠。": "Final pricing is shown in your dashboard after sign-up. Volume discounts are available for businesses.",
      "透明费率": "Transparent Pricing",
      "开通全球账户需要多久？": "How long does it take to open an account?",
      "资料齐全的情况下，个人账户最快当天开通，企业账户通常 1 个工作日内完成审核。": "With complete documents, personal accounts can open the same day and business accounts are usually approved within 1 business day.",
      "账户里的资金安全吗？": "Are my funds safe?",
      "客户资金由 Sokin 等持牌合作机构 100% 隔离存管，不用于公司运营；叮当支付自有牌照正在申请中。": "Client funds are 100% safeguarded by licensed partners such as Sokin and never used for operations; Dingdang Pay's own licenses are under application.",
      "可以用于接收电商平台回款吗？": "Can I receive marketplace payouts?",
      "可以，支持 Amazon、eBay、Shopify、Etsy 等主流平台，以本地转账形式到账。": "Yes. Amazon, eBay, Shopify, Etsy and other major platforms pay out as local transfers.",
      "个人可以开户吗？": "Can individuals open an account?",
      "可以，年满 18 周岁并完成实名认证即可开通个人全球账户。": "Yes. Anyone aged 18+ who completes identity verification can open a personal account.",
      "常见问题": "Frequently Asked Questions",
      "还有其他问题？": "More questions?",
      "访问帮助中心": "Visit Help Center",
      "今天就开通你的全球账户": "Open your global account today",
      "免费注册，最快 1 天开始全球收款。": "Sign up free and start receiving worldwide in as little as one day.",
      "立即开户": "Open Account",
      "登录": "Log in",
      "付款已提交": "Payment submitted",
      "合规审核通过": "Compliance cleared",
      "通道清算中": "Clearing via network",
      "已到账": "Delivered",
      "付款详情": "Payment details",
      "4 分 41 秒到账": "Delivered in 4m 41s",
      "你支付": "You send",
      "对方收到": "They receive",
      "汇率": "Rate",
      "手续费": "Fee",
      "全球即时付款": "Global Instant Payments",
      "全球付款": "Pay anyone, anywhere,",
      "最快 5 分钟到账": "in as fast as 5 minutes",
      "覆盖 40+ 国家和地区的本地清算网络，7×24 实时付款给供应商、员工与合作伙伴，汇率与费用提前可见。": "Local clearing networks across 40+ countries and regions. Pay suppliers, staff and partners 24/7, with rates and fees shown upfront.",
      "中国速汇": "China Express",
      "国家和地区": "Countries & regions",
      "5 分钟": "5 min",
      "最快到账": "Fastest delivery",
      "全天候付款": "Always on",
      "单笔起": "Per payment from",
      "付款，就该又快又清楚": "Payments that are fast and clear",
      "从单笔到批量，从发起到审批，全流程可追踪。": "From single to bulk, from initiation to approval, every step is trackable.",
      "本地即时清算": "Local instant clearing",
      "直连 SEPA Instant、英国 FPS 等本地网络，绝大多数付款几分钟内到账。": "Direct access to SEPA Instant, UK FPS and other local rails, so most payments land in minutes.",
      "付款到中国": "Pay into China",
      "支持人民币到银行卡、微信、支付宝，适合供应商货款与个人款项。": "Pay CNY to bank cards, WeChat Pay or Alipay, suited for supplier and personal payments.",
      "批量付款": "Bulk payments",
      "上传 Excel 一次付款最多 1,000 笔，自动校验收款信息。": "Upload a spreadsheet to send up to 1,000 payments at once, with automatic validation.",
      "汇率锁定": "Rate lock",
      "下单即锁定汇率，到账金额确定，不受市场波动影响。": "Lock the rate when you pay, so the amount received is guaranteed.",
      "多级审批": "Approval workflows",
      "按金额设置审批规则，大额付款需双人复核。": "Set approval rules by amount, with dual control for large payments.",
      "实时追踪与回单": "Tracking & receipts",
      "每一步状态实时推送，到账后自动生成电子回单。": "Real-time status updates and an automatic e-receipt once delivered.",
      "欧洲": "Europe",
      "欧元区 20 国、英国、瑞士、北欧": "Eurozone, UK, Switzerland, Nordics",
      "大中华区": "Greater China",
      "中国内地、中国香港、中国澳门": "Chinese Mainland, Hong Kong, Macao",
      "银行卡 · 微信 · 支付宝": "Bank · WeChat · Alipay",
      "10 分钟": "10 min",
      "东南亚": "Southeast Asia",
      "新加坡、马来西亚、泰国、越南、菲律宾": "Singapore, Malaysia, Thailand, Vietnam, Philippines",
      "本地清算": "Local rails",
      "30 分钟": "30 min",
      "美洲及中东": "Americas & Middle East",
      "美国、加拿大、墨西哥、阿联酋": "US, Canada, Mexico, UAE",
      "当日": "Same day",
      "覆盖网络": "Coverage",
      "通往 40+ 国家和地区": "Reach 40+ countries and regions",
      "以下为典型到账时间，节假日与合规审核可能影响时效。": "Typical delivery times shown; holidays and compliance checks may affect timing.",
      "四步完成一笔国际付款": "Send an international payment in four steps",
      "添加收款人": "Add recipient",
      "填写银行账户、微信或支付宝信息，系统自动校验。": "Enter bank, WeChat or Alipay details, verified automatically.",
      "输入金额": "Enter amount",
      "实时显示汇率、手续费与预计到账时间。": "See the rate, fee and ETA in real time.",
      "确认付款": "Confirm",
      "支付密码或审批流确认，资金立即发出。": "Confirm with your PIN or approval flow and funds go out immediately.",
      "到账通知": "Delivered",
      "到账后通知双方，并可下载电子回单。": "Both sides are notified, and a receipt is ready to download.",
      "全球即时付款费率": "Instant payments pricing",
      "欧元 SEPA 付款": "EUR SEPA payment",
      "英镑 FPS 付款": "GBP FPS payment",
      "人民币付款（银行卡/微信/支付宝）": "CNY payout (bank / WeChat / Alipay)",
      "SWIFT 国际电汇": "SWIFT wire",
      "同单笔费率": "Same as single",
      "跨币种付款按实时汇率换算，点差在付款前完整展示。": "Cross-currency payments use the live rate, with the full margin shown before you pay.",
      "付款真的能 5 分钟到账吗？": "Do payments really arrive in 5 minutes?",
      "通过 SEPA Instant、FPS 等即时网络发出的付款通常 5 分钟内到账；首次付款或大额付款可能需要额外合规审核。": "Payments over SEPA Instant, FPS and similar rails usually arrive within 5 minutes. First-time or large payments may need extra compliance review.",
      "可以给中国供应商付款吗？": "Can I pay suppliers in China?",
      "可以，支持付款到中国内地银行卡及微信、支付宝账户，需提供真实贸易背景。": "Yes, to Chinese Mainland bank cards, WeChat Pay and Alipay, subject to a genuine trade background.",
      "付款失败怎么办？": "What if a payment fails?",
      "若收款信息有误或被退回，资金会原路退回你的账户，通常 1–3 个工作日。": "If details are wrong or the payment is returned, funds go back to your account, usually within 1–3 business days.",
      "单笔付款有限额吗？": "Are there payment limits?",
      "默认单笔上限 €100,000，企业客户完成增强认证后可申请提高额度。": "The default single-payment limit is €100,000. Verified businesses can request higher limits.",
      "让每一笔付款都准时到达": "Make every payment arrive on time",
      "开户后即可向 40+ 国家和地区发起即时付款。": "Send instant payments to 40+ countries and regions once your account is open.",
      "微信": "WeChat",
      "支付宝": "Alipay",
      "今日收单": "Today's volume",
      "较昨日": "vs yesterday",
      "成功率": "Success",
      "已启用支付方式": "Payment methods enabled",
      "全球收单": "Global Acquiring",
      "全场景收单": "Accept payments,",
      "把生意做到全球": "everywhere you sell",
      "一次接入，覆盖国际信用卡、电子钱包、微信与支付宝。游戏、独立站、线下门店都能用，T+1 多币种结算。": "One integration for cards, wallets, WeChat Pay and Alipay. Built for games, online stores and physical shops, with T+1 multi-currency settlement.",
      "T+1 结算": "T+1 settlement",
      "收单方案": "Solutions",
      "游戏收单": "Gaming",
      "独立站收单": "Online Stores",
      "微信收单": "WeChat Pay",
      "支付宝收单": "Alipay",
      "支付方式": "Payment methods",
      "系统可用性": "Uptime",
      "多币种结算": "Multi-currency settlement",
      "平均拒付率": "Avg. chargeback rate",
      "为全球玩家提供顺滑的充值体验": "Smooth top-ups for players worldwide",
      "面向手游、端游、页游厂商与发行商，支持点卡、内购、订阅等计费模式，按地区自动展示玩家熟悉的支付方式。": "For mobile, PC and web game publishers. Supports top-ups, in-app purchases and subscriptions, showing local payment methods by region.",
      "点卡 / 内购 / 订阅全支持": "Top-ups, IAP and subscriptions",
      "专属游戏风控模型，降低盗卡与拒付": "Gaming risk models cut fraud and chargebacks",
      "支持 SDK 与 H5 收银台快速接入": "SDK and H5 checkout for fast integration",
      "多币种 T+1 结算": "T+1 multi-currency settlement",
      "提升独立站支付转化率": "Lift conversion on your online store",
      "即插即用的 Shopify、WooCommerce、Magento 插件和托管收银台，支持国际卡、Apple Pay、Google Pay 与欧洲本地支付。": "Plug-and-play Shopify, WooCommerce and Magento plugins plus a hosted checkout, with cards, Apple Pay, Google Pay and European local methods.",
      "主流建站平台插件，10 分钟上线": "Platform plugins, live in 10 minutes",
      "3DS 2.0 智能验证，兼顾安全与转化": "3DS 2.0 balances security and conversion",
      "支持收款链接，无网站也能收款": "Payment links, no website required",
      "拒付预警与争议处理协助": "Chargeback alerts and dispute support",
      "触达 13 亿微信用户": "Reach 1.3 billion WeChat users",
      "海外商户可直接收取中国游客与消费者的微信支付，支持线上扫码、公众号、小程序及线下门店收款。": "Overseas merchants can accept WeChat Pay from Chinese travellers and shoppers online, in Official Accounts, Mini Programs and in store.",
      "扫码、公众号、小程序、H5 全场景": "QR, Official Account, Mini Program, H5",
      "人民币付款，外币结算": "Customers pay in CNY, you settle in your currency",
      "支持线下收款设备与静态码": "POS devices and static QR codes",
      "交易实时到账提醒": "Real-time payment alerts",
      "支付宝 + 全球钱包一次接入": "Alipay and global wallets in one",
      "接入支付宝及 Alipay+ 合作钱包，覆盖中国及东南亚、韩国等地区的主流电子钱包用户。": "Accept Alipay and Alipay+ partner wallets, covering popular e-wallets in China, Southeast Asia, Korea and more.",
      "支付宝与 Alipay+ 多钱包": "Alipay and Alipay+ wallets",
      "线上线下统一对账": "Unified online and offline reconciliation",
      "支持退款与部分退款": "Full and partial refunds",
      "T+1 结算至全球账户": "T+1 settlement to your global account",
      "确认支付": "Pay now",
      "安全加密 · 由叮当支付提供": "Secured by Dingdang Pay",
      "接入方式": "Integration",
      "选择适合你的接入方式": "Choose how you integrate",
      "建站平台插件": "Platform plugins",
      "Shopify、WooCommerce、Magento、OpenCart 一键安装。": "One-click install for Shopify, WooCommerce, Magento and OpenCart.",
      "API 与 SDK": "API & SDK",
      "RESTful API 及 iOS / Android / Unity SDK，完整文档与沙箱环境。": "RESTful API and iOS / Android / Unity SDKs with full docs and sandbox.",
      "托管收银台": "Hosted checkout",
      "无需处理卡数据，自动适配 30+ 语言与本地支付方式。": "No card data handling, with 30+ languages and local methods built in.",
      "收款链接": "Payment links",
      "生成链接或二维码，通过社交媒体与邮件收款。": "Create a link or QR code and get paid via social media or email.",
      "线下收款设备": "In-store devices",
      "智能 POS 与扫码盒子，门店同时受理刷卡与扫码。": "Smart POS and QR terminals accept cards and wallets in store.",
      "数据看板": "Analytics",
      "实时交易、成功率、渠道占比与拒付分析。": "Live volume, success rate, channel mix and chargeback analytics.",
      "四步开通收单": "Start accepting payments in four steps",
      "注册商户账户": "Create merchant account",
      "注册并完成企业认证。": "Sign up and complete business verification.",
      "提交收单申请": "Apply for acquiring",
      "填写业务类型、网站或门店信息。": "Tell us about your business, website or store.",
      "完成技术接入": "Integrate",
      "插件、API 或收款链接任选其一。": "Use a plugin, the API or payment links.",
      "上线收款": "Go live",
      "开始收款，资金 T+1 结算至全球账户。": "Start selling, with T+1 settlement to your global account.",
      "收单费率": "Acquiring pricing",
      "欧洲国际卡": "European cards",
      "非欧洲国际卡": "Non-European cards",
      "微信 / 支付宝": "WeChat Pay / Alipay",
      "游戏行业": "Gaming",
      "按业务评估": "Custom quote",
      "结算周期": "Settlement",
      "高风险行业与大额商户可申请定制费率，具体以商务合同为准。": "High-risk industries and high-volume merchants can request custom rates, subject to contract.",
      "哪些行业可以申请收单？": "Which industries can apply?",
      "支持游戏、跨境电商、SaaS、教育、旅游等合规行业；博彩、成人等受限行业不在服务范围内。": "Gaming, e-commerce, SaaS, education, travel and other compliant industries. Gambling, adult and other restricted industries are not supported.",
      "没有网站可以收款吗？": "Can I accept payments without a website?",
      "可以，使用收款链接或二维码即可通过社交媒体、邮件或线下收款。": "Yes. Use payment links or QR codes via social media, email or in person.",
      "多久可以结算到账？": "When do I get settled?",
      "默认 T+1 结算至你的叮当全球账户，可选择欧元、英镑、美元等多币种结算。": "Default T+1 settlement to your Dingdang global account, in EUR, GBP, USD and more.",
      "遇到拒付怎么办？": "What about chargebacks?",
      "系统会提前预警，并由专属团队协助你准备证据、处理争议。": "You get early alerts, and a dedicated team helps you prepare evidence and handle disputes.",
      "一次接入，收遍全球": "Integrate once, sell everywhere",
      "提交申请后，客户经理将在 1 个工作日内联系你。": "Apply now and an account manager will contact you within 1 business day.",
      "进入账户": "My Account",
      "账户或密码错误，请重新输入": "Incorrect account or password",
      "登录成功，正在进入账户": "Signed in, opening your account",
      "注册成功，请登录": "Registered. Please sign in",
      "请先登录": "Please sign in first",
      "已退出登录": "Signed out",
      "在线客服": "Live Chat",
      "客服邮箱：support@dingdangpay.com": "Email: support@dingdangpay.com",
      "服务时间：7×24 小时": "Hours: 24/7",
      "登录后可在「消息中心」与客服实时沟通。": "Sign in to chat with us in real time from Messages.",
      "去登录": "Sign In",
      "关闭": "Close",
      "微信 / 支付宝收单": "WeChat Pay / Alipay",
      "游戏与独立站收单": "Gaming & Online Stores"
  });
  // dd-products:end
  // dd-company:start
  Object.assign(DICT, {
      "成立于 2025 · 欧盟 / 英国牌照申请中": "Founded 2025 · EU / UK licenses under application",
      "叮当支付成立于 2025 年，通过对接 Sokin 持牌系统与开放 API，为企业提供多币种全球账户、即时付款与全场景收单服务。": "Founded in 2025, Dingdang Pay connects to Sokin's licensed system with open APIs, offering businesses multi-currency global accounts, instant payments and full-scenario acquiring.",
      "合规优先": "Compliance First",
      "欧盟与英国支付牌照申请中，交易经 Sokin 等持牌合作机构处理，遵循 GDPR 数据保护。": "EU and UK payment licenses are under application. Transactions are processed by licensed partners such as Sokin, with GDPR-compliant data protection.",
      "叮当支付成立于 2025 年，是一家跨境支付科技公司。我们正通过对接 Sokin 系统与开放 API，为全球化企业构建全球收付款基础设施。": "Founded in 2025, Dingdang Pay is a cross-border payment technology company building global payment infrastructure for international businesses through Sokin integration and open APIs.",
      "支付牌照申请中，资金服务由 Sokin 等持牌合作机构提供。": "Payment licenses under application. Fund services are provided by licensed partners such as Sokin.",
      "系统对接: Sokin": "System partner: Sokin",
      "开放 API": "Open API",
      "叮当支付成立于 2025 年，是一家跨境支付科技公司。我们正通过对接 Sokin 系统与开放 API，为全球化企业构建全球账户、即时付款与全场景收单能力。": "Founded in 2025, Dingdang Pay is a cross-border payment technology company. Through Sokin integration and open APIs, we are building global accounts, instant payments and full-scenario acquiring for international businesses.",
      "公司成立": "Company Founded",
      "叮当支付注册成立，组建支付与合规团队。": "Dingdang Pay is incorporated and builds its payments and compliance team.",
      "对接 Sokin 系统": "Sokin Integration",
      "与 Sokin 完成系统对接，打通全球账户与跨境付款底层能力。": "System integration with Sokin completed, unlocking global accounts and cross-border payment capabilities.",
      "牌照申请与 API 业务": "License Applications & API Business",
      "提交欧盟与英国支付牌照申请，同步开放 API 业务，服务企业客户。": "EU and UK payment license applications submitted; API business opened for business clients.",
      "下一步": "What's Next",
      "持牌运营": "Licensed Operations",
      "获得牌照后以自有资质为客户提供全球账户、付款与收单服务。": "Once licensed, we will serve clients with our own global account, payment and acquiring capabilities.",
      "联系我们": "Contact Us",
      "商务合作": "Business Partnerships",
      "收单、API 接入与渠道合作，1 个工作日内回复。": "Acquiring, API integration and channel partnerships. Replies within 1 business day.",
      "客户支持": "Customer Support",
      "开户与使用问题，7×24 小时响应。": "Account and usage questions, answered 24/7.",
      "准备好把支付接入你的业务了吗？": "Ready to build payments into your business?",
      "留下邮箱，产品上线后第一时间通知你。": "Leave your email and be the first to know when we launch.",
      "申请中": "Under Application",
      "欧盟 / 英国支付牌照": "EU / UK payment licenses",
      "持牌系统对接": "Licensed system partner",
      "开放接口优先": "API-first",
      "欧盟与英国支付牌照正在申请中。现阶段交易经 Sokin 等持牌合作机构处理，客户资金隔离存管。": "EU and UK payment licenses are under application. For now, transactions are processed by licensed partners such as Sokin, with client funds safeguarded.",
      "API 优先": "API First",
      "账户、付款、收单能力全部开放 API，让企业把全球收付款嵌入自己的系统与流程。": "Accounts, payments and acquiring are all available via API, so businesses can embed global payments into their own systems.",
      "叮当支付成立于 2025 年，欧盟与英国支付牌照正在申请中。现阶段我们通过对接 Sokin 等持牌合作机构为客户提供合规的资金服务。": "Founded in 2025, Dingdang Pay is applying for EU and UK payment licenses. We currently provide compliant fund services through licensed partners such as Sokin.",
      "当前状态：": "Status: ",
      "申请已提交，审核中": "Application submitted, under review",
      "拟业务范围：获批后将在全欧洲范围内发行电子货币、提供支付服务及管理数字钱包账户。": "Scope once approved: issuing e-money, payment services and digital wallet accounts across Europe.",
      "申请材料筹备中": "Application materials in preparation",
      "拟业务范围：获批后将在英国境内提供汇款服务、执行支付交易并接入快速支付通道 (FPS)。": "Scope once approved: remittance, payment transactions and access to Faster Payments (FPS) in the UK.",
      "筹备中": "In Preparation",
      "现阶段客户资金由 Sokin 等持牌合作机构在独立托管账户中隔离存管。": "Client funds are currently safeguarded in segregated accounts held by licensed partners such as Sokin.",
      "牌照获批前，所有资金交易均通过 Sokin 等持牌合作机构处理，叮当支付不直接经手客户资金。": "Until licenses are granted, all fund transactions are processed by licensed partners such as Sokin. Dingdang Pay never touches client funds directly.",
      "成立于 2025": "Founded 2025"
  });
  // dd-company:end
  // dd-client-v3:start
  Object.assign(DICT, {
      "子账户": "Sub-accounts",
      "虚拟卡": "Virtual Cards",
      "内部转账": "Internal Transfer",
      "每个用户最多可开立 100 个子账户，用于分业务、分店铺独立核算。": "Up to 100 sub-accounts per user, for separate bookkeeping by business line or store.",
      "搜索子账户名称 / 编号": "Search name / ID",
      "开立子账户": "New Sub-account",
      "主账户": "Main Account",
      "可用余额": "Available",
      "子账户说明": "About sub-accounts",
      "子账户共享主账户的实名资质，无需重复认证。": "Sub-accounts share the main account's KYC, no repeated verification.",
      "主账户与子账户、子账户之间可通过「内部转账」实时互转，零手续费。": "Move funds instantly and free between main and sub-accounts via Internal Transfer.",
      "虚拟卡需绑定子账户后使用，只能消费对应子账户的余额。": "Virtual cards must be linked to a sub-account and can only spend its balance.",
      "虚拟银行卡": "Virtual Cards",
      "每个用户最多可开通 100 张虚拟卡；卡需绑定子账户，只能消费该子账户的余额。": "Up to 100 virtual cards per user. Each card is linked to a sub-account and can only spend its balance.",
      "搜索卡号 / 子账户 / 成员": "Search card / account / member",
      "开通虚拟卡": "New Card",
      "两种卡型": "Two card types",
      "线上付款卡": "Online-only Card",
      "仅支持线上消费：广告投放、SaaS 订阅、电商采购等场景，即开即用。": "Online spending only: ads, SaaS subscriptions, e-commerce procurement. Ready instantly.",
      "线下消费卡": "In-store Card",
      "除线上消费外，可绑定 Apple Pay / Google Pay，在手机钱包中线下刷卡消费。": "Online plus in-store: add to Apple Pay / Google Pay and tap to pay offline.",
      "主账户与子账户、子账户之间实时互转，零手续费。": "Instant, free transfers between the main account and sub-accounts.",
      "付款账户": "From",
      "收款账户": "To",
      "金额": "Amount",
      "附言（选填）": "Note (optional)",
      "最多 40 字": "Up to 40 chars",
      "确认转账": "Transfer Now",
      "转账规则": "Rules",
      "仅限同一用户名下账户互转，实时到账。": "Only between your own accounts. Instant arrival.",
      "同币种转账零手续费；跨币种按实时汇率兑换。": "Same-currency transfers are free; cross-currency converts at the live rate.",
      "金额不能超过付款账户可用余额。": "Amount cannot exceed the available balance.",
      "内部转账记录": "Transfer History",
      "暂无子账户": "No sub-accounts",
      "开立子账户后可按业务线独立管理资金。": "Create sub-accounts to manage funds by business line.",
      "子账户数量已达上限（100 个）": "Sub-account limit reached (100)",
      "账户名称": "Account name",
      "请输入账户名称": "Enter an account name",
      "币种": "Currency",
      "开立后立即可用，共享主账户实名资质。": "Ready instantly, sharing the main account KYC.",
      "确认开立": "Create",
      "子账户已开立": "Sub-account created",
      "正常": "Active",
      "开立日期": "Opened",
      "明细": "Details",
      "暂无虚拟卡": "No virtual cards",
      "开通虚拟卡并绑定子账户后即可消费。": "Create a card and link a sub-account to start spending.",
      "虚拟卡数量已达上限（100 张）": "Card limit reached (100)",
      "请先开立子账户，再开通虚拟卡": "Create a sub-account first",
      "卡类型": "Card type",
      "仅限线上消费": "Online spending only",
      "可绑 Apple Pay / Google Pay": "Works with Apple Pay / Google Pay",
      "绑定子账户": "Linked sub-account",
      "卡片只能消费该子账户的余额": "The card can only spend this sub-account's balance",
      "月限额 (EUR)": "Monthly limit (EUR)",
      "请输入大于 0 的限额": "Enter a limit greater than 0",
      "确认开通": "Create Card",
      "虚拟卡已开通": "Card created",
      "已冻结": "Frozen",
      "月限额": "Monthly limit",
      "限额": "Limit",
      "冻结": "Freeze",
      "解冻": "Unfreeze",
      "交易": "Transactions",
      "冻结虚拟卡": "Freeze Card",
      "解冻虚拟卡": "Unfreeze Card",
      "冻结后该卡所有交易将被拒绝，可随时解冻。": "All transactions will be declined while frozen. You can unfreeze anytime.",
      "解冻后该卡立即恢复消费。": "The card resumes spending immediately.",
      "确认冻结": "Freeze",
      "确认解冻": "Unfreeze",
      "卡片已冻结": "Card frozen",
      "卡片已解冻": "Card unfrozen",
      "调整月限额": "Adjust Monthly Limit",
      "限额作用于绑定的子账户余额，超过限额的消费会被拒绝。": "The limit applies to the linked sub-account balance; spending above it is declined.",
      "限额已更新": "Limit updated",
      "保存": "Save",
      "取消": "Cancel",
      "付款与收款账户不能相同": "From and To cannot be the same account",
      "请输入大于 0 的金额": "Enter an amount greater than 0",
      "余额不足，当前可用": "Insufficient balance, available",
      "转账成功，资金已实时到账": "Transferred, funds arrived instantly",
      "已到账": "Arrived",
      "暂无转账记录": "No transfers yet",
      "完成一笔内部转账后会显示在这里。": "Completed transfers will appear here.",
      "时间": "Time",
      "状态": "Status",
      "关联：": "Linked: ",
      "未关联人员": "No member linked",
      "未关联": "Not linked",
      "关联虚拟卡": "Linked cards",
      "暂无": "None",
      "取消关联": "Unlink",
      "选择成员": "Select member",
      "关联后该成员可在团队权限内查看与操作此子账户。": "The member can view and operate this sub-account within team permissions.",
      "关联后该成员可在团队权限内使用此卡。": "The member can use this card within team permissions.",
      "关联人员": "Link Member",
      "暂不关联": "Skip for now",
      "已关联 ": "Linked ",
      "已取消关联": "Unlinked",
      "关联人员 - ": "Link Member - ",
      "尾号 ": "card ending ",
      "绑定子账户：": "Linked sub-account: ",
      "仅可消费该子账户余额": "spends this sub-account balance only",
      "关联后该成员可在团队权限内使用此卡": "The member can use this card within team permissions",
      "无匹配结果": "No matches",
      "换个关键词试试。": "Try another keyword.",
      "搜索成员 / 角色 / 权限": "Search members / roles / scope",
      "搜索订单号 / 商户 / 金额": "Search order / merchant / amount",
      "搜索名称 / 编号 / 门店": "Search name / ID / store",
      "搜索运单号 / 渠道 / 线路": "Search tracking no. / channel / route"
  });
  // dd-client-v3:end
  // dd-exchange:start
  Object.assign(DICT, {
      "资产兑换": "Asset Exchange",
      "法币 / 稳定币兑换": "Fiat / Stablecoin Exchange",
      "法币互换 · 法币与稳定币 · 币币兑换，实时行情，极低点差": "Fiat-to-fiat, fiat-stablecoin and crypto swaps with live rates and minimal spreads",
      "¥ CNY 人民币": "¥ CNY Chinese Yuan",
      "已切换兑换方向": "Direction swapped",
      "余额:": "Balance: "
  });
  // dd-exchange:end
  // dd-letter:start
  Object.assign(DICT, {
      "账户证明信": "Account Letter",
      "账户证明信预览": "Account Letter Preview",
      "下载证明信": "Download Letter",
      "打印 / 存为 PDF": "Print / Save as PDF",
      "证明信已开始下载": "Letter download started",
      "浏览器拦截了弹窗，请允许后重试": "Popup blocked. Please allow popups and retry.",
      "搜索交易 / 对手方 / 金额": "Search transactions / counterparty / amount"
  });
  // dd-letter:end
  // dd-exchange2:start
  Object.assign(DICT, {
      "法币 / USDT 兑换": "Fiat / USDT Exchange",
      "法币互换 · 法币与 USDT 双向兑换 · 币币兑换，实时行情，极低点差": "Fiat-to-fiat, fiat-USDT two-way and crypto swaps with live rates and minimal spreads"
  });
  // dd-exchange2:end
  var LANG_KEY = 'dd-lang';

  function getLang() { return localStorage.getItem(LANG_KEY) || 'zh'; }

  /* 反向映射 en->zh 用于切回中文（重新加载即可，无需反向表） */

  function translateNode(node) {
    var t = node.nodeValue;
    if (!t) return;
    var trimmed = t.trim();
    if (!trimmed) return;
    var lead = t.slice(0, t.length - t.trimStart().length);
    var trail = t.slice(t.trimEnd().length);
    if (DICT[trimmed]) node.nodeValue = lead + DICT[trimmed] + trail;
  }

  function translateAttrs(el) {
    ['placeholder', 'title', 'alt'].forEach(function (attr) {
      var v = el.getAttribute && el.getAttribute(attr);
      if (v && DICT[v.trim()]) el.setAttribute(attr, DICT[v.trim()]);
    });
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'OPTION') {
      // value of submit buttons
      if (el.type === 'submit' && el.value && DICT[el.value.trim()]) el.value = DICT[el.value.trim()];
    }
  }

  function applyEn(root) {
    var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateNode);
    (root || document).querySelectorAll && (root || document).querySelectorAll('[placeholder],[title],[alt],input[type="submit"]').forEach(translateAttrs);
    if (DICT[document.title.split(' - ')[0]]) {
      var parts = document.title.split(' - ');
      parts[0] = DICT[parts[0]] || parts[0];
      document.title = parts.join(' - ');
    }
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    if (lang === 'en') {
      applyEn(document.body);
      observe();
    }
    updatePills();
  }

  /* 动态内容（JS 渲染的列表/消息）也翻译 */
  var observer = null;
  var pending = false;
  function observe() {
    if (observer || getLang() !== 'en') return;
    observer = new MutationObserver(function (muts) {
      if (pending) return;
      pending = true;
        setTimeout(function () {
          pending = false;
          muts.forEach(function (m) {
            m.addedNodes.forEach(function (n) {
              if (n.nodeType === 3) translateNode(n);
              else if (n.nodeType === 1 && !n.closest('.dd-lang-pill')) {
                if (!n.querySelector) return;
                var w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
                var list = [];
                while (w.nextNode()) list.push(w.currentNode);
                list.forEach(translateNode);
                n.querySelectorAll('[placeholder],[title],[alt]').forEach(translateAttrs);
              }
            });
          });
        }, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------- 语言切换胶囊 ---------------- */
  var pillCss = '.dd-lang-pill{position:fixed;top:74px;right:18px;z-index:850;display:flex;background:#fff;border:1px solid #e5e7eb;border-radius:20px;box-shadow:0 4px 14px rgba(0,0,0,.08);overflow:hidden;font-family:\'Inter\',\'PingFang SC\',sans-serif}' +
    '.dd-lang-pill button{padding:6px 14px;font-size:12px;font-weight:700;border:0;background:transparent;color:#6b7280;cursor:pointer;transition:all .15s}' +
    '.dd-lang-pill button.on{background:#FFD008;color:#382b1b}' +
    '.dd-lang-pill button:hover:not(.on){background:#f3f4f6}';
  var se = document.createElement('style');
  se.textContent = pillCss;
  document.head.appendChild(se);

  var pill;
  function buildPill() {
    pill = document.createElement('div');
    pill.className = 'dd-lang-pill';
    pill.innerHTML = '<button data-lang="zh">中文</button><button data-lang="en">EN</button>';
    pill.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.lang === getLang()) return;
        if (b.dataset.lang === 'zh') { localStorage.setItem(LANG_KEY, 'zh'); location.reload(); }
        else setLang('en');
      });
    });
    document.body.appendChild(pill);
  }

  /* 已有语言 chip 的页面：复用 chip 位置，隐藏我们注入的胶囊 */
  function upgradeChip() {
    var chip = null;
    document.querySelectorAll('div,button,a').forEach(function (el) {
      if (chip) return;
      var txt = el.textContent.trim();
      if (txt === '中文' || txt === '简体中文') {
        var hasFlag = el.querySelector('iconify-icon,[class*="flag"]');
        var inHeader = el.closest('header');
        if (hasFlag && inHeader && el.children.length <= 4) chip = el;
      }
    });
    if (chip) {
      chip.style.cursor = 'pointer';
      chip.title = 'Switch language / 切换语言';
      // 当前语言高亮显示
      var labelSpan = null;
      chip.querySelectorAll('span').forEach(function (s) { if (!labelSpan && /^(中文|简体中文)$/.test(s.textContent.trim())) labelSpan = s; });
      if (labelSpan && getLang() === 'en') labelSpan.textContent = 'EN';
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = document.getElementById('dd-lang-menu');
        if (menu) { menu.remove(); return; }
        menu = document.createElement('div');
        menu.id = 'dd-lang-menu';
        menu.style.cssText = 'position:fixed;z-index:860;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.12);overflow:hidden;font-size:13px';
        var rect = chip.getBoundingClientRect();
        menu.style.top = (rect.bottom + 6) + 'px';
        menu.style.left = (rect.left - 20) + 'px';
        menu.innerHTML = '<div data-l="zh" style="padding:9px 20px;cursor:pointer;font-weight:600">中文</div><div data-l="en" style="padding:9px 20px;cursor:pointer;font-weight:600">English</div>';
        menu.querySelectorAll('div').forEach(function (d) {
          d.addEventListener('mouseenter', function () { d.style.background = '#f3f4f6'; });
          d.addEventListener('mouseleave', function () { d.style.background = ''; });
          d.addEventListener('click', function () {
            if (d.dataset.l === getLang()) { menu.remove(); return; }
            if (d.dataset.l === 'zh') { localStorage.setItem(LANG_KEY, 'zh'); location.reload(); }
            else { menu.remove(); setLang('en'); }
          });
        });
        document.body.appendChild(menu);
        setTimeout(function () {
          document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
        }, 10);
      });
      return true;
    }
    return false;
  }

  function updatePills() {
    if (!pill) return;
    var lang = getLang();
    pill.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === lang);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var hasChip = upgradeChip();
    if (!hasChip) { buildPill(); updatePills(); }
    if (getLang() === 'en') { applyEn(document.body); observe(); }
  });

  window.DDI18N = { setLang: setLang, getLang: getLang, applyEn: applyEn };
})();
