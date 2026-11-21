# 使用 Windows 开发并发布 Monarca iOS App

现有 Capacitor 工程可以继续使用。页面、商品素材、Spring Boot 后端和 Stripe 接口无需因本机没有 Mac 而迁移到 uni-app。编译和签名运行在 GitHub 的 macOS 云端机器上。

## 已提供的构建流程

- `build-mobile.yml`：原有 Android 和未签名 iOS 构建；未签名 IPA 不是 App Store 发布包。
- `release-ios-appstore.yml`：手动触发，使用 Xcode 26 和 iOS 26 SDK 生成正式签名 IPA，可选上传到 App Store Connect，供 TestFlight 测试。上传不自动提交 App Store 审核，也不自动公开发布。
- 本次只增加发布基础设施，没有迁移页面、改变网站部署或修改线上收款配置。真实签名、云端编译和上传需要在配置 Apple 凭据后验证。

## 准备 Apple 账号和应用记录

1. 准备有效的付费 Apple Developer 账号。Monarca 由公司经营，优先使用实际经营公司的组织账号，并确认公司授权。
2. 在 Apple Developer 网站注册显式 App ID：`com.monarca.boutique`。若已有上架记录，必须使用原记录的 Bundle ID，并同步修改工程、Capacitor 配置和发布工作流。
3. 在 App Store Connect 网页创建对应的 iOS 应用记录，填写名称、SKU 和主要语言。创建应用记录不需要本地 Mac。
4. 准备 Apple Distribution 证书及其私钥，导出带密码的 `.p12`；创建关联该证书和 App ID 的 **App Store Connect** 分发描述文件 `.mobileprovision`。开发、Ad Hoc、企业分发文件不能用于此流程。
5. 如需自动上传，在 App Store Connect 的“用户和访问 / 集成”中创建可管理此 App 的团队 API Key，记录 Key ID、Issuer ID，并保存仅能下载一次的 `.p8` 私钥。

Windows 上可以使用 OpenSSL 创建私钥和 CSR，在 Apple Developer 网页申请证书后转成 `.p12`；私钥不能由下载的 `.cer` 恢复。已有团队提供的有效 `.p12` 也可以直接使用。

以下命令在装有 OpenSSL 的 Git Bash 中运行，输入密码时不会写入命令行。证书和描述文件放在已忽略的 `.ios-signing/`，不要提交到 Git：

```bash
mkdir -p .ios-signing
cd .ios-signing
openssl genrsa -aes256 -out distribution.key 2048
openssl req -new -key distribution.key -out distribution.csr
# 在 Apple Developer 网站上传 distribution.csr，申请 Apple Distribution 证书，下载为 distribution.cer。
openssl x509 -inform DER -in distribution.cer -out distribution.pem
openssl pkcs12 -export -inkey distribution.key -in distribution.pem -out distribution.p12
```

CSR 中填写实际公司资料。使用与当前付费开发者账号一致的证书和描述文件。

## 配置 GitHub Actions Secrets

打开仓库 Settings → Secrets and variables → Actions → New repository secret。

| Secret | 内容 |
| --- | --- |
| `MONARCA_IOS_CERTIFICATE_P12_BASE64` | `.p12` 文件的 Base64 |
| `MONARCA_IOS_CERTIFICATE_PASSWORD` | 导出 `.p12` 时设置的密码 |
| `MONARCA_IOS_PROVISIONING_PROFILE_BASE64` | App Store Connect `.mobileprovision` 文件的 Base64 |
| `MONARCA_APPSTORE_API_KEY_ID` | 上传 API Key 的 Key ID；仅上传时必填 |
| `MONARCA_APPSTORE_API_ISSUER_ID` | 团队 Issuer ID；仅上传时必填 |
| `MONARCA_APPSTORE_API_PRIVATE_KEY` | `.p8` 的完整文本，保留实际换行；仅上传时必填 |

PowerShell 示例：转换结果只复制到剪贴板，再粘贴到相应 GitHub Secret，不输出到终端或聊天：

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path '.ios-signing/distribution.p12').Path)) | Set-Clipboard
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path '.ios-signing/Monarca.mobileprovision').Path)) | Set-Clipboard
Get-Content -LiteralPath '.ios-signing/AuthKey_YOUR_KEY_ID.p8' -Raw | Set-Clipboard
```

以上三行分别执行、分别粘贴到对应 Secret；后一行会覆盖剪贴板。配置完清空剪贴板：`Set-Clipboard -Value ''`。

## 手动构建与上传

1. 将发布流程代码推送到 GitHub 默认分支后，在 Actions 选择 **Build signed iOS App Store IPA** → **Run workflow**。
2. `version` 对应 App Store 的版本号，例如 `4.7.0`。
3. `build_number` 填 1–9999 的整数；同一版本每次重新上传都要增加，工作流不会自动递增。
4. 首次可保持 `upload_to_testflight=false`，验证签名并下载 Artifact 中的 IPA。该 IPA 用于 App Store 分发，不能按 Ad Hoc 包直接安装。
5. 需要上传时设置 `upload_to_testflight=true` 并增加构建号。上传后仍需等待 Apple 处理构建，再在 App Store Connect 配置合规信息和 TestFlight 测试人员。
6. 用 iPhone 完成测试后，通过 App Store Connect 网页填写商店资料、截图、年龄分级、App 隐私和审核说明，选择构建并提交审核。

工作流只将签名应用作为 Artifact 保存，凭据写入临时目录和临时钥匙串，结束后清理。签名配置只在云端作用于 App 的 Release target，不向 CocoaPods 依赖强加分发描述文件。

## 当前源码需要完成的产品工作

生成签名包不等于已经适合送审。以下是本次代码检查发现的实际缺口：

- 客户登录仍接受固定演示验证码 `1234`，后端没有真实的客户身份和订单归属校验。应接入正式认证；若首版采用游客结账，应明确订单找回方式并移除虚假登录。
- 若保留账号注册，需实现 App 内发起账号删除及服务端数据处理，不能只清空手机缓存。
- 移除或明确处理示例订单、模拟物流、模拟退款及其他演示入口。退款必须接入实际业务审核与 Stripe 退款结果。
- 完成 iPhone 内的 Stripe 支付、付款后订单确认、退出重进、无缓存订单恢复测试。已核实的 USD 付款不能替代新版 AED 路径的端到端验证。
- 核查阿拉伯语 RTL、英文、刘海安全区域、键盘、外链、离线提示、相机入口及所需权限说明。准备实际数据处理对应的隐私政策与 App 隐私申报。
- 检查当前 Capacitor 6 及依赖在 Xcode 26 下的编译和运行情况，再决定是否升级；本次未在 Windows 上声称完成 iOS 编译验证。

Monarca 销售实物商品，可以继续采用银行卡/Stripe 收款；这类交易适用 Apple 审核规则 3.1.3(e)。选择 Capacitor 或 uni-app 本身不保证过审，仍需具备完整、稳定的购物体验。

## 官方参考

- [GitHub：在 macOS Runner 安装 Apple 签名证书](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications)
- [Apple：上传构建](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)
- [Apple：当前 SDK 要求](https://developer.apple.com/news/upcoming-requirements/)
- [Apple：App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
