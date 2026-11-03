# Monarca透明Logo · v4.4.2

文件：`monarca-logo-ink-v442.svg`。用于首页、桌面侧栏和UI总览。

最终实现使用自包含SVG透明渲染。客户原JPEG按原字节嵌入，裁片与原190×54布局一致，没有重绘字体和蝴蝶。将原图墨色映射到透明度，浅色背景Alpha精确归零；四角透明，裁片85.52%像素完全透明，黑笔画正常保留。

接入规则：容器190×54，图片等比显示；容器背景透明、CSS filter:none、mix-blend-mode:normal，旧伪元素为none。小屏总览按原比例缩小。SVG内部feColorMatrix输出纯黑墨色与Alpha，不会输出白色或奶油色底块。

实现核对：

- 嵌入原图SHA256：`d6539c0b6a289a05521106673c650cce0d557f12c7c31cdc842dcb2e574a4e8f`。
- 透明度：`clamp(1.5665 - 2.163 × sRGB亮度)`，对应原显示的对比度与亮度，再将背景转换为透明。
- SVG没有脚本、foreignObject或外部图片依赖。图片字节包含在文件内。
- 曾尝试AI自动提取PNG，独立核对发现字形略有变化，未用于最终交付。

具体布局与透明度核对见`../release-audit/logo-alpha-layout-v442.json`及`logo-alpha-verification-v442.json`。原JPEG保留为客户参考资料，当前显示不再依赖页面混合合成。首页Banner未改。
