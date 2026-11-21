# 使用 Windows 开发并发布 Monarca iOS App

现有 Capacitor 工程可以继续使用。页面、商品素材、Spring Boot 后端和 Stripe 接口无需因本机没有 Mac 而迁移到 uni-app。编译和签名运行在 GitHub 的 macOS 云端机器上。

## 已提供的构建流程

- `build-mobile.yml`：原有 Android 和未签名 iOS 构建；未签名 IPA 不是 App Store 发布包。
- `release-ios-appstore.yml`：手动触发，使用 Xcode 26 和 iOS 26 SDK 生成正式签名 IPA，可选上传到 App Store Connect，供 TestFlight 测试。上传不自动提交 App Store 审核，也不自动公开发布。
- 本次只增加发布基础设施，没有迁移页面、改变网站部署或修改线上收款配置。真实签名、云端编译和上传需要在配置 Apple 凭据后验证。

## 这台 Windows 电脑已准备好的文件

2026 年 11 月 21 日已在仓库根目录 `.ios-signing/` 生成下列文件，均被 Git 忽略，未上传到 Apple 或 GitHub：

| 文件 | 用途 |
| --- | --- |
| `Monarca-Apple-Distribution.certSigningRequest` | 申请 Apple Distribution 证书时上传的 CSR；`distribution.csr` 为相同内容的副本 |
| `distribution.key` | 已加密的 RSA 2048 位私钥，后续导出 P12 使用 |
| `distribution-password.dpapi` | 私钥密码的 Windows DPAPI 加密记录，仅生成时的 Windows 用户/电脑可解密 |

CSR 的 SHA-256 为 `7D62D9DC90F4BA118171AC01F7D813D96C552FC01A85EFECBF573102013BAB34`。已验证 CSR 签名、与私钥的对应关系及本机密码解密。CSR 的 Common Name 是本地密钥标签 `Monarca iOS Distribution`，Apple 证书的持有人身份来自实际登录的开发者账号。

这些文件已存在，**本机无需重新生成私钥/CSR**。不要用新密钥覆盖旧文件，否则从 Apple 下载的证书可能无法配对。文件夹已限制为当前 Windows 用户访问。DPAPI 文件不是可移植密码备份；更换电脑/用户前，应导出带密码的 P12，并将其密码另外存入自己的密码管理器。

## 以后登录 Apple 时按此顺序操作

以下步骤可在 Windows 浏览器完成，目前没有在你的 Apple 账号执行任何创建操作。

1. 打开 [Apple Developer](https://developer.apple.com/account/)，亲自登录并完成双重验证。
2. 进入 **Certificates, Identifiers & Profiles → Certificates → +**，选择 **Apple Distribution**，继续并上传现成的 `Monarca-Apple-Distribution.certSigningRequest`。生成后下载 `.cer`，保存为仓库根目录 `.ios-signing/distribution.cer`。申请页面若显示协议或证书数量限制，先处理实际提示，不撤销其他 App 的证书。
3. 在 **Identifiers → + → App IDs → App** 注册应用。Description 填 `Monarca`，Bundle ID 选择 **Explicit** 并填 `com.monarca.boutique`，仅启用实际需要的 capabilities。若这个 ID 已属于你的账号，直接复用；若被其他账号占用，需要先统一修改项目中的 ID。
4. 在 **Profiles → + → Distribution** 选择 **App Store Connect**，选择上述 App ID 和第 2 步生成的分发证书，命名 `Monarca App Store`，生成并下载为 `.ios-signing/Monarca.mobileprovision`。这一步不选择测试设备。[Apple 官方说明](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile/)
5. 打开 [App Store Connect](https://appstoreconnect.apple.com/)，在 **My Apps → + → New App** 新建 iOS 应用。名称可填 `Monarca`（取决于名称是否可用），Bundle ID 选同一个 ID，SKU 可用 `MONARCA-IOS-001`。主要语言按实际商店文案选择。个人账号的开发者/卖家名称使用个人法定姓名，App 名称仍可以是 Monarca。
6. 在本机用下方脚本导出 P12，配置前三项 GitHub Secrets；此时可先生成正式签名 IPA，无需上传 API Key。
7. 需要自动上传时，在 App Store Connect **Users and Access → Integrations → App Store Connect API** 申请 API 访问（如尚未开通），创建具有 App Manager 权限的 **Team API Key**。保存 Key ID、Issuer ID 和只能下载一次的 `.p8`。当前工作流采用需要 Issuer ID 的团队 Key，勿混用个人 API Key。[Apple API 说明](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)

创建证书、标识符、描述文件和应用记录的顺序是为了让它们引用相同的 Bundle ID 和分发证书。API Key 可以最后再准备。

## 下载证书后在本机导出 P12

在仓库根目录打开 PowerShell。此电脑已安装 PowerShell 7（`pwsh`）和 Git 的 OpenSSL。保存好 `.ios-signing/distribution.cer` 后运行：

```powershell
pwsh -NoProfile -File .\monarca-mobile-app\scripts\export-ios-certificate.ps1
```

证书文件位于别处时使用 `-CertificatePath '完整路径'`。脚本会检查证书是否过期、Apple Distribution 类型及与当前私钥的配对关系，生成 `distribution.p12` 和 `distribution-p12-password.dpapi`。P12 使用新的随机密码，密码不输出到终端。输入私钥保持原样，已有 P12/密码文件不会被覆盖；脚本不验证 Apple 信任链，证书应从你自己的 Apple Developer 账号下载。

需要填写 GitHub Secret 时，下面每行**分别运行、分别粘贴**，后一个命令会覆盖剪贴板：

```powershell
pwsh -NoProfile -File .\monarca-mobile-app\scripts\copy-ios-secret.ps1 -Kind Certificate
pwsh -NoProfile -File .\monarca-mobile-app\scripts\copy-ios-secret.ps1 -Kind Password
pwsh -NoProfile -File .\monarca-mobile-app\scripts\copy-ios-secret.ps1 -Kind Profile
# 仅自动上传需要；文件名按实际下载结果替换。
pwsh -NoProfile -File .\monarca-mobile-app\scripts\copy-ios-secret.ps1 -Kind ApiPrivateKey -Path '.ios-signing\AuthKey_YOUR_KEY_ID.p8'
Set-Clipboard -Value ''
```

脚本只将所选的一项复制到本机剪贴板并显示对应的 Secret 名称，不上传数据、不输出密码/私钥。Key ID 和 Issuer ID 从 Apple 页面分别复制到对应 Secret。

## 准备 Apple 账号和应用记录

1. 可继续使用你已有的有效个人付费 Apple Developer 账号；商店开发者/卖家名称显示个人法定姓名。若将来需要公司名称作为卖家，再办理组织账号相关手续。
2. 在 Apple Developer 网站注册显式 App ID：`com.monarca.boutique`。若已有上架记录，必须使用原记录的 Bundle ID，并同步修改工程、Capacitor 配置和发布工作流。
3. 在 App Store Connect 网页创建对应的 iOS 应用记录，填写名称、SKU 和主要语言。创建应用记录不需要本地 Mac。
4. 准备 Apple Distribution 证书及其私钥，导出带密码的 `.p12`；创建关联该证书和 App ID 的 **App Store Connect** 分发描述文件 `.mobileprovision`。开发、Ad Hoc、企业分发文件不能用于此流程。
5. 如需自动上传，在 App Store Connect 的“用户和访问 / 集成”中创建可管理此 App 的团队 API Key，记录 Key ID、Issuer ID，并保存仅能下载一次的 `.p8` 私钥。

Windows 上可以使用 OpenSSL 创建私钥和 CSR，在 Apple Developer 网页申请证书后转成 `.p12`；私钥不能由下载的 `.cer` 恢复。已有团队提供的有效 `.p12` 也可以直接使用。

以下命令仅供**其他电脑从零准备新密钥**时参考，本机已有材料不要重跑。命令在装有 OpenSSL 的 Git Bash 中运行，输入密码时不会写入命令行。证书和描述文件放在已忽略的 `.ios-signing/`，不要提交到 Git：

```bash
mkdir -p .ios-signing
cd .ios-signing
openssl genrsa -aes256 -out distribution.key 2048
openssl req -new -key distribution.key -out distribution.csr
# 在 Apple Developer 网站上传 distribution.csr，申请 Apple Distribution 证书，下载为 distribution.cer。
openssl x509 -inform DER -in distribution.cer -out distribution.pem
openssl pkcs12 -export -inkey distribution.key -in distribution.pem -out distribution.p12
```

自行新建 CSR 时填写自己的实际资料或密钥标签。使用与当前付费开发者账号一致的证书和描述文件。

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
- [2026 年 11 月 21 日的 iOS 云端编译和归档已成功](https://github.com/JavaStuden/monacra/actions/runs/44896634065/job/136823582343)，生成未签名 IPA。正式分发签名、上传和 iPhone 真机运行仍待验证；同一工作流中的 Android 任务失败，不影响上述 iOS 任务已经成功的结果。

Monarca 销售实物商品，可以继续采用银行卡/Stripe 收款；这类交易适用 Apple 审核规则 3.1.3(e)。选择 Capacitor 或 uni-app 本身不保证过审，仍需具备完整、稳定的购物体验。

## 官方参考

- [GitHub：在 macOS Runner 安装 Apple 签名证书](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications)
- [Apple：上传构建](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)
- [Apple：当前 SDK 要求](https://developer.apple.com/news/upcoming-requirements/)
- [Apple：App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
