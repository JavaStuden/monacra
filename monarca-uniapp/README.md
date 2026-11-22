# Monarca uni-app 手机端

这是 2026-11-22 从现有 Monarca Web/Capacitor 项目迁移的 **Vue 3 + uni-app** 工程，主要面向 iOS，也可生成 Android 资源和 H5 预览。购物页面是 `.vue` 组件；没有用一个 WebView 嵌入整个旧网站。

旧工程 `monarca-mobile-app` 继续保留；Spring Boot 后端 `monarca-server` 的现有未提交改动未被本次迁移覆盖。正式网站没有部署本工程。

## 运行

在本目录打开终端：

```powershell
npm ci
npm run dev:h5
npm test
npm run build:h5
npm run build:app
```

- 开发预览地址由控制台打印，默认 `http://127.0.0.1:5173/`。
- H5 输出：`dist/build/h5/`。
- iOS/Android 通用 App 资源：`dist/build/app/`。这是待原生打包的 uni-app 资源，**不是已签名 IPA**。
- H5 开发时 Vite 将 `/api` 代理到 `https://itsmonarca.com`；App 使用 `uni.request` 直接访问正式 HTTPS API。默认没有离线下单或模拟支付回退。
- `package-lock.json` 固定依赖。DCloud 工具链采用官方 Vue 3 模板的 `3.0.0-5030420261029002` 版本，与 HBuilderX 5.34 的编译器系列对应。

## HBuilderX 和 iOS 云打包

1. 在 HBuilderX 中导入本工程目录 `monarca-uniapp`，不要导入旧的 `monarca-mobile-app`。如果项目尚未安装依赖，先运行 `npm ci`。
2. 打开 `src/manifest.json`。根级 `appid` 目前有意留空：通过你自己的 DCloud 账号获取 **DCloud AppID**。它与 Apple Bundle ID 不同，不能填写 `com.monarca.boutique` 代替。
3. iOS Bundle ID 已预填 `com.monarca.boutique`，须与 Apple Developer 中的 App ID、描述文件及 App Store Connect 应用记录一致。
4. 从“发行 → 原生 App 云打包”进入 iOS 正式打包；按当前 HBuilderX 的提示提供 Apple Distribution P12、其密码和 **App Store Connect** 分发描述文件。现有 `.ios-signing/` 中的 CSR 和私钥可继续用于申请同一开发者账号的证书。
5. P12 生成方式见旧工程的 [Windows 签名说明](../monarca-mobile-app/IOS-APPSTORE-WINDOWS.md)。取得 Apple `.cer` 后可在仓库根目录运行：

   ```powershell
   pwsh -NoProfile -File .\monarca-mobile-app\scripts\export-ios-certificate.ps1
   ```

6. 在自己的 iPhone 上通过 TestFlight 验证后，再填写商店截图、App 隐私、审核说明等资料并提交 App Store。

原有 `.github/workflows/release-ios-appstore.yml` 编译的是 **Capacitor Xcode 工程**，不会编译这里的 uni-app。新增 `build-uniapp.yml` 只验证本工程和提供资源包，不上传 Apple；uni-app 的原生云打包需走 HBuilderX/DCloud 流程。

## 已迁移的页面和行为

| 页面 | 代码 | 当前行为 |
| --- | --- | --- |
| 首页 | `src/pages/home/index.vue` | 品牌素材、真实商品推荐 |
| 分类/搜索 | `src/pages/catalog/index.vue` | 分类、文本搜索、新品/价格排序 |
| 商品详情 | `src/pages/product/index.vue` | 服务器商品、上传图片/旧图裁剪、颜色/尺码/库存、购物车、立即购买 |
| 购物车 | `src/pages/cart/index.vue` | 数量、移除、服务器实时运费和总额 |
| 地址簿 | `src/pages/address/index.vue` | 本机多地址、编辑、伊拉克手机号校验 |
| 结账 | `src/pages/checkout/index.vue` | 服务器报价、优惠码、地址、USD/AED、创建 Stripe 会话 |
| 付款确认 | `src/pages/payment/index.vue` | 系统浏览器打开 Stripe、服务器状态查询、返回 App 后手动核实 |
| 订单列表 | `src/pages/orders/index.vue` | 本机订单引用、按订单号恢复、状态筛选 |
| 订单详情/物流/支付摘要 | `src/pages/order/index.vue` | 服务器订单摘要和支付确认；不显示虚构承运商信息 |
| 我的 Monarca | `src/pages/account/index.vue` | 游客入口，连接订单、地址、政策、客服 |
| 收藏 | `src/pages/wishlist/index.vue` | 本机收藏、真实商品 |
| 客服 | `src/pages/support/index.vue` | 原商店 WhatsApp/邮箱及订单号 |
| 政策 | `src/pages/policy/index.vue` | 原站现有中东业务政策的阿拉伯语/英语文本 |
| 退货申请 | `src/pages/returns/index.vue` | 已送达订单提交后端 `/returns`；提交结果不是退款成功 |
| 设置 | `src/pages/settings/index.vue` | 阿拉伯语/英语、RTL、清理本机地址和收藏 |

界面是迁移后的手机布局，尚未逐像素复刻旧站所有视觉细节。商品名称使用服务器 `name` / `enName`，只有阿拉伯语的商品描述仍显示服务器原文。

## 支付和订单的数据约定

- 商品及订单总额为 USD。当前未提交的 Web 代码已提供 USD/AED 选择，本工程沿用该行为；AED 使用 `1 USD = 3.67 AED`。
- 运费、优惠和下单金额来自服务器 `/checkout/quote`，不复制旧站本地固定运费算法。`expectedTotal` 发送当前报价；服务器返回 `CHECKOUT_TOTAL_CHANGED` 时要求重新确认。
- 对会话中的订单号、Stripe 托管 URL、币种及扣款金额作一致性校验；不在客户端接收银行卡号。
- 支付跳转成功或打开页面都不会将订单标为 paid。只有支付状态接口返回 `paymentStatus=paid` 才确认订单并消耗本次购物车数量，而且不会重复消耗。
- 退出/重进后按本机订单引用重新拉取状态；无本机缓存时可使用订单号找回。不会请求已关闭的匿名订单列表，也不会按电话号码批量查订单。
- 初版使用外部系统浏览器支付，Stripe 回跳仍进入原网站，用户返回 App 后在付款页检查状态。Universal Links/自动拉起 App 尚未配置，不能当成已完成的原生支付回跳。
- 地址与收藏保存在本机 uni storage；没有迁移原站固定验证码 `1234` 的演示登录或创建虚假账号。真正的登录、跨设备订单归属和注销仍需后端认证系统。

## 验证与剩余工作

已完成 H5 编译、App 资源编译、8 项业务/状态恢复测试，以及浏览器下的商品加载、语言切换、购物车、地址校验、报价和币种选择检查。测试没有创建真实 Stripe 会话或扣款。

尚需完成：DCloud AppID、Apple 分发证书/描述文件、HBuilderX iOS 云打包、iPhone 真机/安全区域/外链测试、真实 AED 支付及回调验证、App Store 资料和隐私申报。App 图标暂沿用现有品牌图，需要在送审前确认。

旧站的演示评论、演示消息/客服工单、虚拟卡、模拟退款、相机识图、假登录没有作为真实服务迁移。退款执行和真实物流承运商仍需现有后端继续接入；本次未声称这些功能已实现。

## 官方文档

- [uni-app Vue 3 / CLI](https://uniapp.dcloud.net.cn/quickstart-cli)
- [uni-app 项目运行与发布](https://uniapp.dcloud.net.cn/quickstart-hx.html)
- [App Store 分发描述文件](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile/)
