# Monarca 上架资料（2026-11-22）

## App 用途

Monarca 是面向伊拉克消费者的实物购物 App，提供女装、男装、鞋履、包袋和配饰浏览、搜索、颜色和尺码选择、收藏、购物车、游客结账、订单状态查询，以及联系商店和申请售后。界面提供阿拉伯语和英文。银行卡付款由 Stripe Checkout 处理，购买的是需要配送的实物商品。

可填写的英文用途说明：

> Monarca is a shopping app for customers in Iraq. Customers can browse women's and men's clothing, footwear, bags and accessories, select available colours and sizes, save favourites, manage a shopping bag, check out as guests, view order status and contact the store for support. The app supports Arabic and English. Stripe Checkout processes card payments for physical goods delivered to customers.

商店主分类建议：Shopping（购物）。下载免费，商品另行付费。不要宣称已经具备自动图片识别、承运商实时追踪或跨设备账号同步。

## 计划上架地区

首发建议只选 **Iraq（伊拉克）**，依据是当前商品配送、地址校验和客服面向伊拉克。此项是资料草案，尚未修改 App Store Connect 的实际上架范围。公司位于阿联酋不表示 App 必须在阿联酋上架；如要让其他区 Apple 账号也能下载，可由店家确定扩展地区，并保持配送说明清楚。

苹果说明：下载可用地区由顾客的 Apple 账号地区决定。[管理上架地区](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store/)

## iOS 标识

当前准备上架的 uni-app iOS 和 Android 包统一使用：`com.itsmonarca.shopping`。Apple Developer 的 iOS App ID、App Store Connect 应用记录、App Store 分发描述文件和 HBuilderX 云打包配置必须全部使用同一个 iOS 值。旧 Capacitor 工程及其 GitHub Actions 工作流仍使用 `com.monarca.boutique`，不要混用；新 Android 包名与旧 APK 不同，安装时不能覆盖旧包。

## 隐私政策网址

- Privacy Policy URL：**https://itsmonarca.com/privacy.html**
- 英文直接入口：https://itsmonarca.com/privacy.html#english
- 可选 Privacy Choices URL：https://itsmonarca.com/support.html

政策为阿拉伯语与英文双语，无需登录或执行 JavaScript 即可阅读。内容覆盖订单与联系资料、Stripe、设备存储、照片权限、技术日志、信息分享、跨境处理、保存及删除请求。源文件是 `monarca-mobile-app/www/privacy.html`；uni-app 的内置隐私文字已同步到 `monarca-uniapp/src/data/policies.json`。

## 技术支持网址

- Support URL：**https://itsmonarca.com/support.html**
- 英文直接入口：https://itsmonarca.com/support.html#english
- 邮箱：Info@monarca.com
- 伊拉克 WhatsApp：+964 750 222 3313
- 公司电话：+971 52 894 5131
- 公司：FORT ME GENERAL TRADING L.L.C
- 地址：Al Muraqqabat, Alliance Insurance Building, Deira, Office C1-20, Dubai, UAE

公司邮箱由店家于 2026-11-22 确认为 `Info@monarca.com`，已同步到网站客服配置、公开支持页、隐私政策及 uni-app 源码；公司、电话和地址沿用项目已有资料。本轮未发送邮件或 WhatsApp，因此不能据此认定邮件或消息已被接收。提交前请店家确认其他联系资料仍有效，并能处理隐私请求。

## 审核登录与测试账号

**当前 uni-app 无登录或注册功能，核心购物功能无需登录，不需要创建审核账号。**“我的”页面是本机地址、收藏和订单入口。App Store Connect 的 Sign-in required 可以针对这一版填 No；账号和密码不适用。收货人姓名、电话和地址属于结账信息，不是登录凭证。

已核对加入购物车的代码：商品页选择可用颜色、尺码和数量后直接写入当前设备的购物车，不检查登录状态；查看购物车、修改数量和进入游客结账也没有登录要求。审核员可以按“商品详情 → 选择颜色和尺码 → Add to bag → Bag → Checkout”体验此流程。购物车和收藏在同一设备保存，不代表有服务器账号或跨设备同步。无需为了这一步给苹果填写一个当前系统无法登录的账号。

旧 Capacitor 网页版保留固定验证码的演示登录。它不能作为真实审核账号。本说明以 `monarca-uniapp` 当前代码为准；最终提交包若来自旧 Capacitor 工程，必须重新核对该包的功能，不能直接套用本段。

可复制到 App Review Notes 的英文说明（仅限当前 uni-app 行为）：

> Monarca sells physical clothing, footwear, bags and accessories for delivery in Iraq. Arabic is the default language; English is available in Settings. No sign-in or registration is required. The My Account screen contains information saved on the current device and is not a server-side customer account.
>
> To test the shopping bag, open an in-stock product, select an available colour and size, choose Add to bag, open Bag and continue to Checkout. None of these steps requires sign-in. The bag and favourites are saved on the current device. Reviewers can also browse the catalogue and switch between Women and Men without credentials. Checkout requires a valid Iraqi delivery address. Card payments are processed on Stripe's hosted Checkout page for physical goods. The connected store is a live environment; please contact us before making a payment or placing an order that needs fulfilment. We can coordinate a separate test environment if an end-to-end test payment is needed.
>
> Support: https://itsmonarca.com/support.html#english
> Privacy policy: https://itsmonarca.com/privacy.html#english
> Contact: Info@monarca.com

苹果审核联系人的姓名、电话和邮箱应填写能实际联系到的负责人；本轮没有编造个人联系人或创建虚假测试账号。

## App 隐私申报与最终安装包

不要选择“完全不收集数据”：订单需要姓名、电话、地址、购买记录，支付相关信息由 Stripe 处理。按最终安装包和网页实际行为填写 Contact Info、Purchases、相关 User Content / Diagnostics 等适用项目；照片若仅本机预览且未上传，不应因申请相册权限就错误申报为服务器收集照片。付款金融资料是否需申报还要按 Stripe Checkout 的实际集成及苹果定义核对。

本项目当前关闭 uniStatistics，应用代码未接入广告追踪；原生云打包完成后仍需核对实际嵌入的 DCloud/其他 SDK、隐私清单和数据行为。本轮只发布公开文档并更新 uni-app 源码，没有生成新的 IPA 或替换已有 APK。

仍待完成：最终 iPhone 安装包与签名、真实设备测试、新版 AED 付款到订单确认的完整验证。隐私页面上线不等于已满足所有审核条件。

## 官方依据

- [Apple 审核指南](https://developer.apple.com/app-store/review/guidelines/)：2.1 审核访问和完整性、3.1.3(e) 实物商品支付、5.1.1 隐私政策。
- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)：公开政策网址和各数据类型申报定义。
- [Apple 审核准备](https://developer.apple.com/distribute/app-review/)：支持网址、政策链接和需要登录时的审核账号。

## 发布范围

本轮只新增 `privacy.html`、`support.html` 和 `public-pages.css` 三个公开静态文件到当前正式网站目录。未替换网站业务 JavaScript、后端 JAR、数据库、Stripe 配置或运费规则。公开页面的静态检查和 HTTP 验证记录保存在仓库外 `交付/AppStore资料-20261122/`。

日后发布新的完整网站目录时，需保留这三个文件，避免 App Store 已填写的网址失效。

后续公司邮箱更新：线上 `privacy.html`、`support.html`、`store-contact.js` 的邮箱已改为 `Info@monarca.com`，`index.html` 仅更新客服脚本缓存版本到 `4.7.28`。发布前备份位于 `/var/backups/monarca/company-email-20261122-142417`，其余 160 个网站文件保持一致。App 源码已更新，已有安装包需重新构建才能包含新邮箱。
