# HANDOFF

## 1. 当前目标

将 `design-psychology-museum-portfolio` 从偏静态 PDF 图册感的页面，升级为专业工业设计作品集长滚动网页。

项目主题：

- 名称：《不只是摄像》
- 副标题：一件可被观看、握持与理解的儿童行动相机
- 风格：深色博物馆展览风、克制、高级、温暖、安静、有设计研究感
- 输出：网页版 `index.html` 和 PDF `design-psychology-museum-portfolio.pdf`

用户最新明确要求：

- 照片/渲染图不要做暗化、灰阶、颗粒、滤镜等处理，保留原图。
- 在当前项目基础上重构，不要从零重写或引入复杂框架。

## 2. 已完成内容

- 已确认技术栈：纯静态 HTML/CSS/JS，无 React/Next/Vite。
- 已重构 `index.html` 为更完整的作品集长页结构。
- 已按用户要求组织为主要章节：
  - Hero
  - Project Thesis
  - Research Insight
  - Case Catalogue
  - Design Process
  - Object Study
  - Proportion / Interaction
  - Scenario Gallery
  - Final Board / Archive
- 已去掉原来直接贴整张研究/案例/规格图的倾向，改为 HTML 内容卡片。
- 已加入：
  - 右侧章节进度 rail
  - 图片点击放大 lightbox
  - 案例卡片 hover/focus 展开说明
  - 设计过程 timeline
  - 产品细节 callout
  - 尺寸与交互规格卡
  - 场景画廊三卡片逻辑
- 已把过程图和产品图切换为 `assets/original/` 下的原图。
- 已更新 PDF 导出脚本，使用新版页面叙事内容和原图。
- 已重新生成 `design-psychology-museum-portfolio.pdf`。
- 已停止本地预览服务端口 `4281`。
- 2026-05-17 本轮继续开发已完成：
  - 修复 721–1040px 首屏 Hero 主图不可见问题。
  - 修复 `Proportion / Interaction` 规格卡正文一字一行的问题。
  - 修复 PDF 第 7 页尺寸文字和示意图交叉的问题。
  - 导出脚本现在会重建 `preview/pdf-pages/` 并生成 `preview/pdf-contact.jpg`。
  - 已重新生成 PDF、PDF 总览图和新版交付包。

## 3. 尚未完成内容

- 当前没有已知必须修复的网页/PDF 布局问题。
- 仍可后续补充真实场景素材：目前场景图只有一张儿童手持图，其余场景仍用产品渲染图补位。
- 如果用户继续要求更完整交付，可考虑清理或不打包 `assets/*.webp` 旧暗色资产；当前页面没有引用这些旧资产。

## 4. 已修改文件列表

- `index.html`
- `styles.css`
- `script.js`
- `scripts/export-pdf.mjs`
- `design-psychology-museum-portfolio.pdf`
- `assets/original/*`
- `preview/pdf-contact.jpg`
- `preview/pdf-pages/*`
- `HANDOFF.md`

现有但本轮未重点维护：

- `scripts/build-assets.mjs`
- `style-prompt.md`
- `assets/*.webp`

## 5. 每个文件的关键改动

### `index.html`

- 从旧的图册式 section 改为作品集长滚动项目页。
- 增加语义化结构：`header`、`main`、`section`、`article`、`figure`。
- 新增右侧进度 rail。
- 新增 lightbox 容器。
- 研究数据不再伪装成严谨统计，改为洞察卡片和 `source placeholder`。
- 案例目录改为 2 行 3 列卡片。
- 设计过程改为 timeline。
- 产品细节加入 4 个 callout。
- 场景页改成有逻辑的三张卡片：家庭记录、户外探索、校园分享。
- 结尾页新增 Next Step。
- 新增空 favicon，避免本地预览时产生无关 404 控制台噪音。

### `styles.css`

- 重写颜色变量、间距变量、圆角、阴影、图片容器。
- 修复 Hero 标题行距过窄问题：`h1` line-height 改为更宽松的 `0.98`。
- 新增统一图片组件 `.product-frame`。
- 新增卡片样式：`.info-card`、`.insight-card`、`.case-card`、`.callout-card`、`.spec-card`、`.scenario-card`。
- 新增 timeline 样式：`.process-timeline`、`.process-step`。
- 新增 lightbox 样式。
- 新增响应式断点：
  - `1040px` 以下改为单列或双列
  - `720px` 以下改为移动端单列
- 加入 `prefers-reduced-motion` 支持。
- 新增 721–1040px Hero 双列布局，让中等宽度窗口首屏能看到主产品图。
- 移除 Hero 产品图透明度淡入，避免图片在加载或截图瞬间呈现暗化状态。
- 修复 `.spec-card` grid 排列，让图标在左侧跨两行，标题和正文稳定留在右侧内容列。
- 降低 `Proportion / Interaction` 长标题桌面端字号上限，避免中文句尾异常断行。

### `script.js`

- 新增 section 进入视口状态标记。
- 新增右侧进度 rail 当前章节高亮。
- 新增图片点击放大预览。
- 新增 Escape 和遮罩点击关闭 lightbox。

### `scripts/export-pdf.mjs`

- 删除旧版 PDF 图册内容。
- 新增 9 页 PDF 导出内容，与新版网页叙事对应。
- PDF 中照片使用 `assets/original/` 原图，不做暗化/灰阶/滤镜处理。
- 使用 `sharp` 和 `pdf-lib` 生成 PDF。
- 导出前会清理并重建 `preview/pdf-pages/`，避免旧版残留页进入总览。
- 导出后会同步生成 `preview/pdf-contact.jpg`。
- 修复第 7 页尺寸文字和示意图重叠问题。

### `assets/original/*`

- 新增/更新原图素材：
  - `hero-object.jpg`
  - `feature-object.jpg`
  - `object-front.jpg`
  - `object-angle.jpg`
  - `object-side.jpg`
  - `poster-archive.png`
  - `process-sketch-front.jpg`
  - `process-wireframe.png`
  - `process-orthographic.jpeg`
  - `process-rendering.jpg`
  - `scenario-handheld.png`
- 这些图应保持原貌，不应再做滤镜处理。

### `design-psychology-museum-portfolio.pdf`

- 已由新版 `scripts/export-pdf.mjs` 重新生成。
- 已完成视觉复核，并同步生成 `preview/pdf-contact.jpg`。

### 交付包

- 新版 zip：`/Users/xuzifan/Documents/New project/design-psychology-museum-portfolio-deliverable-2026-05-17.zip`
- 已通过 `unzip -t` 完整性检查。

## 6. 当前项目结构

```text
design-psychology-museum-portfolio/
  index.html
  styles.css
  script.js
  style-prompt.md
  HANDOFF.md
  design-psychology-museum-portfolio.pdf
  assets/
    original/
      feature-object.jpg
      hero-object.jpg
      object-angle.jpg
      object-front.jpg
      object-side.jpg
      poster-archive.png
      process-orthographic.jpeg
      process-rendering.jpg
      process-sketch-front.jpg
      process-wireframe.png
      scenario-handheld.png
    *.webp
    manifest.json
  scripts/
    build-assets.mjs
    export-pdf.mjs
  preview/
    pdf-contact.jpg
    pdf-pages/
```

## 7. 运行方式

进入项目目录：

```bash
cd "/Users/xuzifan/Documents/New project/design-psychology-museum-portfolio"
```

本地预览网页：

```bash
python3 -m http.server 4281
```

浏览器打开：

```text
http://127.0.0.1:4281/index.html
```

重新导出 PDF：

```bash
/Users/xuzifan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/export-pdf.mjs
```

输出 PDF：

```text
/Users/xuzifan/Documents/New project/design-psychology-museum-portfolio/design-psychology-museum-portfolio.pdf
```

## 8. 可能存在的问题

- `scripts/build-assets.mjs` 仍会生成暗色处理后的 webp 资产；如果继续遵守“照片保留原样”，不要用它覆盖网页中的照片引用。
- `assets/*.webp` 中有暗化/风格化旧资产，当前网页主要使用 `assets/original/` 和 HTML 卡片，避免误用。
- 当前 PDF 是手工排版脚本生成，不是网页打印版；网页改动后需要同步维护 `scripts/export-pdf.mjs`。
- 场景图真实素材不足，目前只有一张儿童手持图，其余场景用产品渲染图补位。
- Codex in-app browser 的 full-page screenshot 曾出现黑屏/拼接异常；本轮用可见视口截图和本机 Chrome Playwright 复核通过。

## 9. 下一步最优先处理事项

1. 如继续完善内容，优先补充真实儿童使用/场景素材。
2. 如准备正式提交，可决定是否从交付包中移除未被当前页面引用的旧 `assets/*.webp`。
3. 若网页内容再改动，必须同步更新 `scripts/export-pdf.mjs` 并重新导出 PDF、`preview/pdf-contact.jpg` 和交付包。

## 10. 继续开发约束

- 不要从零重写项目。
- 不要引入 React/Next/Vite 等新框架。
- 不要随意引入新依赖。
- 保持纯静态 HTML/CSS/JS。
- 照片和产品渲染图必须保留原样，不做暗化、灰阶、颗粒、滤镜、局部保色等处理。
- 可以用 CSS 容器统一比例、边框、阴影和背景，但不能改变图片内容。
- 继续保持深色博物馆展览风：
  - 背景：`#11100E`、`#171411`、`#211B17`
  - 主文字：`#F4EFE6`
  - 次文字：`#B8AEA3`
  - 强调色：`#C57A55`
- 保持正文 16px 以上，确保基础可读性。
- 移动端不能横向滚动。
- Hover 效果必须有 focus 状态。
- 动效要轻，不要复杂 3D、粒子、强视差。
- 尊重 `prefers-reduced-motion`。
- 网页和 PDF 内容要同步维护。
- 不要修改外接盘原始素材文件。
