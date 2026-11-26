# 2026-11-22 源码、线上与安卓预览状态

`main` 保存当前开发源码；它包含尚未发布的国际按重量计费和图库改动，不能直接把整个工作区构建后当作现在线上版本覆盖。

| 功能 / 产物 | 正式网站与后端 | Android Preview | uni-app 源码 |
| --- | --- | --- | --- |
| 女装 / 男装 / 通用款 | 已发布 | 已包含 | 已实现 |
| 后台每张照片关联颜色、选色换图 | 已发布，需店家配置商品 | 已包含 | 已实现 |
| 点击图片纵向查看全部原图 | 2026-11-23 已发布 | 已包含 | 已实现 |
| 商品悬浮短视频、后台 MP4 上传 | 2026-11-23 已发布，需上传实际视频 | 未包含，需重打包 | 已实现，需原生打包验证 |
| 每款自定义尺码、红色等 20 色及自定义色、专属尺码表 | 2026-11-24 已发布，需商家按款配置 | 未包含，需重打包 | 已实现，需原生打包验证 |
| 后台自定义商品类别、双语名称和默认尺码 | 2026-11-24 已发布 | WebView 可读取类别；原生页面未重打包 | 已实现动态类别读取 |
| 国际按重量计费与金额变化确认 | 待发布，线上沿用原计费 | 沿用线上原计费 | 使用服务器报价 |
| 原生安装包 | 不适用 | Capacitor 调试签名预览 APK | 资源构建通过，待原生云打包 |

## 可核对的版本

- `prod-20261122-colorphotos`：实际正式发布源码快照；后端与已部署 JAR 的归档源码一致，79 个网站文件与服务器 SHA-256 一致。
- `prod-20261122-webhook-modes`：后续 Stripe 测试/正式回调验签与模式隔离修复后的当前后端源码。网页仍沿用图片颜色版本，详见 [Stripe 回调记录](monarca-server/STRIPE-WEBHOOK-GUIDE.md)。
- `apk-preview-20261122`：已生成的 Capacitor 安卓预览源码，包含纵向图库，保留线上支付与运费规则。包名 `com.monarca.boutique.preview`，版本 `4.7.27-preview` / `2026112201`，可与旧 App 同时安装。
- `main`：后端、网站与 uni-app 的完整最新开发代码，保留用户原有改动和已填写的 DCloud AppID。

APK 文件 `Monarca-4.7.27-preview-20261122.apk` 未提交 Git。SHA-256：`55516d9ade0c8218ba109a619604f869bd2cd1d367d415ad7c04d659b5f01fdf`。已通过 Gradle 编译、v1/v2 签名和包内资源校验，未完成真机运行验证；模拟器因本机可用提交内存不足未启动。APK 连接真实商店接口，此次未执行真实下单或扣款。

## 当前正式部署

- 网站：`/var/www/itsmonarca/current` 当前指向 `/var/www/itsmonarca/releases/v4.7.0-category-manager-fix-20261124-145143`。之前的图片颜色、图库、视频和规格发布目录均保留。
- 后端：`/opt/monarca-server/monarca-server-4.7.0.jar`，服务 `monarca-server.service`。
- 数据库与旧 JAR 备份：`/opt/monarca-server/backups/colorphotos-20261122-111637`；上一版网页目录保留。
- 本次图片颜色发布仅改动后端图片映射、商品编辑器和三个网页文件，支付、订单和配送类与上一版逐字节一致；三组结账报价发布前后一致。
- 商品管理 token 仅由服务器 `/etc/monarca-product-images.env` 的 `MONARCA_PRODUCT_ADMIN_TOKEN` 提供。临时 token 已按店家要求在服务器修改；其值、旧值及备份不提交 Git。代码继续要求 token，并拒绝缺失或错误值。
- Stripe 配置仍由 `/etc/monarca-stripe.env` 加载，密钥不进入源码或安装包。
- 20:47（北京时间）追加独立测试模式回调签名配置，保留正式 API key 与签名密钥。测试事件验签成功后返回 200，禁止修改正式订单或库存；Stripe Dashboard 重发完成/过期事件均返回 200。当前后端备份为 `/opt/monarca-server/backups/webhook-modes-20261122-124709`。

2026-11-23 追加商品短视频：最新后端/数据库/Nginx 备份为 `/opt/monarca-server/backups/product-video-20261123-150912`，新 JAR SHA-256 为 `869562767029229f259092bfdd7dcef60b1d63a1b0b30748e444194e7dbc6172`。新增可空视频字段、后台 MP4 上传和范围播放接口；支付、订单和配送类保持一致，商品、订单快照及三组报价发布前后相同。隔离发布源码、构建日志和验证记录保存在仓库外 `交付/商品短视频-20261123/`，详见 [商品视频说明](monarca-server/PRODUCT-VIDEO-GUIDE.md)。

不要用旧数据库直接覆盖已有新订单的数据库。上线前备份数据库、JAR 和网页；新增可空字段回退程序时可以保留。

## 验证

- 2026-11-24 隔离发布版后端：Maven 36 项测试通过，含 Stripe webhook 11 项、商品视频 6 项、规格和尺码表 7 项。
- uni-app：19 项测试通过，H5 与 App 资源构建通过。
- 网站与管理页 JavaScript 语法检查通过。
- 公网已检查男女切换、图片颜色选择框、资源哈希与服务状态；公开订单列表匿名及只带手机号仍为 401。
- 尚未执行 iOS 真机、App Store 提交或本次真实付款验证。

操作说明见 [商品颜色图片](monarca-server/COLOR-PHOTO-GUIDE.md)、[男女专区](monarca-server/DEPARTMENTS-GUIDE.md)和[纵向图库](monarca-uniapp/VERTICAL-PHOTO-GALLERY.md)。

2026-11-24 追加规格与尺码表：最新后端/数据库/Nginx 备份为 `/opt/monarca-server/backups/product-options-20261124-004738`，JAR SHA-256 为 `952df6f4f06fa520a85bf0b6bc756566381c93452b96fd47f10968062a13dbb3`。尺码、红色及自定义色、独立图表已发布，未改真实商品数据。实际操作和版本对应关系见 [规格与尺码表说明](monarca-server/PRODUCT-OPTIONS-GUIDE.md)。


2026-11-24 追加品类尺码模板管理：服装、鞋、包袋、配饰模板已在管理端设置并可继续修改。新增商品按品类载入模板，已有商品及其手动尺码不会被覆盖。最新网站仍指向 `/var/www/itsmonarca/releases/v4.7.0-product-options-final-20261124-005319`；最新 JAR SHA-256 为 `824a4e421ba8b2c3b6ed616b459a30e440826f098e3d3a1d37af495ed9e04a5e`，部署及数据库备份位于 `/opt/monarca-server/backups/category-templates-20261124-132806`。后端回归测试共 38 项通过。新 App 安装包尚未重打包。

2026-11-24 追加自定义商品类别：管理端现可新增、编辑和停用商品类别，维护阿拉伯语/英语名称及默认尺码；公开类别接口、商品编辑表单、网站首页/分类页/筛选器和 uni-app 分类列表读取启用类别。删除仅允许没有商品引用的自定义类别；内置四类不删除。生产发布以已部署商品规格版本为基线，没有带入工作区未发布的国际按重量计费改动。商品数据与本地、国际、混合三类结账报价发布前后一致；后台类别管理无效 token 返回 403。后端 40 项测试通过，网页资源校验通过。

- 最新正式网站：`/var/www/itsmonarca/releases/v4.7.0-category-manager-fix-20261124-145143`。
- 后端 JAR SHA-256：`c6758122a523148fb8f1c8dd0d7a60284bfccdd37068509c357b7f2abd382e2b`。
- 部署与数据库备份：`/opt/monarca-server/backups/category-management-20261124-144739`；网页分类入口修正备份：`/opt/monarca-server/backups/category-manager-fix-20261124-145143`。
- 本次没有新增或批量修改线上商品类别，也没有重新打包 APK/IPA；现有 App 通过在线 WebView 加载的后台类别功能可用，uni-app 原生包需后续重打包才包含改动。

2026-11-26 更新移动端标识：uni-app iOS Bundle ID 与 Android `applicationId`/`packagename` 统一为 `com.itsmonarca.shopping`，与 Apple Developer 新注册的 App ID 一致。旧 Capacitor 工程、旧 Android 包 `com.monarca.boutique` 和其发布工作流保持不变；重新构建后的 Android APK 属于新包名，不能覆盖旧安装包。Android Debug 构建已通过，正式 APK/IPA 尚未重新打包。
