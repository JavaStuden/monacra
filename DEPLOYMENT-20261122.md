# 2026-11-22 源码、线上与安卓预览状态

`main` 保存当前开发源码；它包含尚未发布的国际按重量计费和图库改动，不能直接把整个工作区构建后当作现在线上版本覆盖。

| 功能 / 产物 | 正式网站与后端 | Android Preview | uni-app 源码 |
| --- | --- | --- | --- |
| 女装 / 男装 / 通用款 | 已发布 | 已包含 | 已实现 |
| 后台每张照片关联颜色、选色换图 | 已发布，需店家配置商品 | 已包含 | 已实现 |
| 点击图片纵向查看全部原图 | 待发布 | 已包含 | 已实现 |
| 国际按重量计费与金额变化确认 | 待发布，线上沿用原计费 | 沿用线上原计费 | 使用服务器报价 |
| 原生安装包 | 不适用 | Capacitor 调试签名预览 APK | 资源构建通过，待原生云打包 |

## 可核对的版本

- `prod-20261122-colorphotos`：实际正式发布源码快照；后端与已部署 JAR 的归档源码一致，79 个网站文件与服务器 SHA-256 一致。
- `apk-preview-20261122`：已生成的 Capacitor 安卓预览源码，包含纵向图库，保留线上支付与运费规则。包名 `com.monarca.boutique.preview`，版本 `4.7.27-preview` / `2026112201`，可与旧 App 同时安装。
- `main`：后端、网站与 uni-app 的完整最新开发代码，保留用户原有改动和已填写的 DCloud AppID。

APK 文件 `Monarca-4.7.27-preview-20261122.apk` 未提交 Git。SHA-256：`55516d9ade0c8218ba109a619604f869bd2cd1d367d415ad7c04d659b5f01fdf`。已通过 Gradle 编译、v1/v2 签名和包内资源校验，未完成真机运行验证；模拟器因本机可用提交内存不足未启动。APK 连接真实商店接口，此次未执行真实下单或扣款。

## 当前正式部署

- 网站：`/var/www/itsmonarca/current` 指向 `/var/www/itsmonarca/releases/v4.7.0-colorphotos-20261122-111637`。
- 后端：`/opt/monarca-server/monarca-server-4.7.0.jar`，服务 `monarca-server.service`。
- 数据库与旧 JAR 备份：`/opt/monarca-server/backups/colorphotos-20261122-111637`；上一版网页目录保留。
- 本次图片颜色发布仅改动后端图片映射、商品编辑器和三个网页文件，支付、订单和配送类与上一版逐字节一致；三组结账报价发布前后一致。
- 商品管理 token 仅由服务器 `/etc/monarca-product-images.env` 的 `MONARCA_PRODUCT_ADMIN_TOKEN` 提供。临时 token 已按店家要求在服务器修改；其值、旧值及备份不提交 Git。代码继续要求 token，并拒绝缺失或错误值。
- Stripe 配置仍由 `/etc/monarca-stripe.env` 加载，密钥不进入源码或安装包。

不要用旧数据库直接覆盖已有新订单的数据库。上线前备份数据库、JAR 和网页；新增可空字段回退程序时可以保留。

## 验证

- 完整后端源码：Maven 12 项测试通过。
- uni-app：15 项测试通过，H5 与 App 资源构建通过。
- 网站与管理页 JavaScript 语法检查通过。
- 公网已检查男女切换、图片颜色选择框、资源哈希与服务状态；公开订单列表匿名及只带手机号仍为 401。
- 尚未执行 iOS 真机、App Store 提交或本次真实付款验证。

操作说明见 [商品颜色图片](monarca-server/COLOR-PHOTO-GUIDE.md)、[男女专区](monarca-server/DEPARTMENTS-GUIDE.md)和[纵向图库](monarca-uniapp/VERTICAL-PHOTO-GALLERY.md)。
