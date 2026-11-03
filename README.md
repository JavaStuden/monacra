# Monarca · 伊拉克购物系统 (全栈工程与移动双端发布版)

> **版本**：`v4.7.0` · 2026-10-28  
> **定位**：面向伊拉克（Iraq）市场的时尚轻奢购物平台，包含 **Spring Boot 后端与运营管理后台**、**Android/iOS 原生工程**。安装包由源码构建，不随 Git 仓库提交。

---

## 目录结构

```
代码/
├── monarca-server/                 # [后端系统] Spring Boot 3.3.4 + Java 21 + JPA
│   ├── pom.xml                     # Maven 依赖与构建配置
│   ├── src/main/java/com/monarca/  # 后端业务源码 (实体、数据访问、双供货履约算法、API、管理后台)
│   ├── src/main/resources/         # 配置文件 (application.yml)、静态管理后台
│   │   └── static/admin/index.html # Monarca 运营与履约管理后台系统
│   └── data/                       # 本地自动持久化数据库目录
│
├── monarca-mobile-app/             # [移动端工程] 跨平台 Android 与 iOS 原生工程
│   ├── package.json                # Capacitor 与 App 依赖
│   ├── capacitor.config.json       # App 跨平台原生桥配置
│   ├── www/                        # 移动端 Web 核心资产 (v4.7.0 离线/在线自适应)
│   ├── android/                    # Android 原生 Studio 工程 (支持 Gradle 编译生成 APK)
│   ├── ios/                        # iOS 原生 Xcode 工程 (App.xcworkspace，支持导出 IPA)
│   ├── release/                    # 发布说明；安装包由构建生成，不纳入 Git
│   ├── scripts/                    # 自动化编译脚本
│   └── .github/workflows/          # CI/CD 自动化云编译工作流 (build-mobile.yml)
│
└── README.md                       # 本文档
```

---

## 一、 后端服务与运营管理后台 (monarca-server)

### 1. 技术栈
* **核心框架**：Spring Boot 3.3.4 + Spring MVC + Spring Data JPA
* **运行环境**：Java 21 (LTS)
* **数据库**：默认采用嵌入式文件持久化库（启动即可开箱使用，数据持久化于 `./data/monarcadb`），并提供标准 MySQL 切换配置
* **接口规范**：OpenAPI 3 / Swagger 交互式文档
* **内置管理后台**：轻量级响应式运营管理系统，契合 Monarca 品牌视觉，全界面纯英文（无任何中文字符），支持中东/伊拉克国际化运营标准

### 2. 快速启动与访问

#### 命令行启动
```bash
cd monarca-server
mvn spring-boot:run
```

也可以使用 IntelliJ IDEA 打开 `monarca-server`，运行 `com.monarca.MonarcaApplication`。

#### 访问入口清单：
* **运营与履约管理系统**：[http://localhost:8080/admin/](http://localhost:8080/admin/)
  * **数据看板**：实时汇总总订单数、GMV（美元标价）、待备货订单、待审核售后。
  * **货源渠道管理**：可针对 14 款商品一键切换“伊拉克现货”或“中国预订”，调整美元价格与库存。
  * **订单履约流转**：查看收货地址（伊拉克 18 省份地标）、一键推进状态（`placed` → `preparing` → `shipped` → `delivered`）。
  * **售后退款审核**：按件审核退换货申请，严格执行 COD 未收款“零退款退货（`noRefund`）”策略。
  * **全局规则配置**：配置满 $75 免邮门槛、标准运费 $4、官方 WhatsApp 咨询热线。
* **Swagger API 接口文档**：[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **H2 数据控制台**：[http://localhost:8080/h2-console](http://localhost:8080/h2-console)（JDBC URL: `jdbc:h2:file:./data/monarcadb`）

---

## 二、 移动端 App (APK & IPA)

构建产物写入 `monarca-mobile-app/release/`，不会提交到 Git：

### 1. Android 安装包 (`Monarca-v4.7.0.apk`)
* **支持系统**：Android 7.0 及以上
* **安装方式**：构建签名 APK 后，将其传输至手机安装。
* **源码工程**：可在 Android Studio 中直接打开 `monarca-mobile-app/android` 工程进行真机调试与热重载。
* **一键编译脚本**：运行 `monarca-mobile-app/scripts/build-android.bat` 重新编译 APK。
* **Release 签名**：仓库不包含私钥。需要签名发布包时，在构建环境设置 `MONARCA_ANDROID_KEYSTORE`、`MONARCA_ANDROID_STORE_PASSWORD`、`MONARCA_ANDROID_KEY_ALIAS` 和 `MONARCA_ANDROID_KEY_PASSWORD`；未配置时可构建未签名 Release 包用于本地测试。

### 2. iOS 工程与 IPA 构建
* **最低系统版本**：iOS 13.0
* **安装方式**：
  * 在 macOS 上使用 Xcode 为 App 配置 Apple Developer Team 后，Archive 并通过 TestFlight 或 App Store Connect 发布。
  * **macOS 源码签名**：在 Mac 上双击打开 `monarca-mobile-app/ios/App/App.xcworkspace` 进行官方证书签名与 Archive。
  * **GitHub Actions**：工作流可生成未签名构建产物；安装或商店发布前仍需使用 Apple 开发者证书签名。

---

## 三、 v4.7.0 核心商业规则与算法实现

1. **双供货渠道与履约规则（Dual-Sourcing Fulfillment）**：
   * **伊拉克现货**：12 款商品，本地仓配约 2 天送达，支持 COD（货到付款）或测试卡支付。
   * **中国预订**：商品 ID 2（经典高跟鞋）与 ID 5（羊毛夹克），跨境 15–20 天送达，**系统强制要求卡预付，严禁 COD**。
   * **混合购物车**：当同时勾选现货和中国预订商品时，结账页同屏显示两组时效分组，并禁用 COD；取消勾选中国商品后，COD 动态恢复可用。
2. **美元标价与运费优惠**：
   * 统一为 USD 演示价格（精确到美分）。
   * 折前商品小计满 **$75.00** 免运费，未满收 **$4.00** 标准运费。
   * 优惠券 `M10`（满 $40 打 9 折），采用单次消耗机制（仅在订单确认或支付成功时核销）。
3. **资金流与售后真实度**：
   * COD 订单记录已付金额为 0，若未付款取消或退货，严格标记为“无退款退货（`noRefund`）”，杜绝虚假流水。
   * 退货分摊退款金额采用美分累计算法，避免浮点数精度漂移。
