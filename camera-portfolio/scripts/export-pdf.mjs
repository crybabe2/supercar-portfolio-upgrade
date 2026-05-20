import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(
  "/Users/xuzifan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/"
);
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

const root = "/Users/xuzifan/Documents/New project/design-psychology-museum-portfolio";
const assetDir = path.join(root, "assets");
const previewDir = path.join(root, "preview/pdf-pages");
const contactPath = path.join(root, "preview/pdf-contact.jpg");
const pdfPath = path.join(root, "design-psychology-museum-portfolio.pdf");

const W = 1240;
const H = 1754;
const bg = "#11100e";
const panel = "#211b17";
const text = "#f4efe6";
const muted = "#b8aea3";
const accent = "#c57a55";
const imageBg = "#f3eee6";
const line = "rgba(197,122,85,.55)";

const asset = (name) => path.join(assetDir, name);
const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function t(value, x, y, size, options = {}) {
  const {
    fill = text,
    weight = 500,
    family = "Arial, Helvetica, sans-serif",
    spacing = 0,
  } = options;
  return `<text x="${x}" y="${y}" font-family="${family.replace(/"/g, "&quot;")}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${spacing}">${esc(value)}</text>`;
}

function serif(value, x, y, size, options = {}) {
  return t(value, x, y, size, {
    ...options,
    family: 'Georgia, "Times New Roman", "Songti SC", SimSun, serif',
  });
}

function multi(lines, x, y, size, lh, options = {}) {
  return lines.map((line, index) => t(line, x, y + index * lh, size, options)).join("");
}

function pageSvg(content, background = bg) {
  return Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="80%" cy="10%" r="78%">
        <stop offset="0%" stop-color="${accent}" stop-opacity=".16"/>
        <stop offset="55%" stop-color="${background}" stop-opacity=".08"/>
        <stop offset="100%" stop-color="#000" stop-opacity=".35"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${background}"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    ${content}
  </svg>`);
}

async function image(name, width, height, fit = "contain", position = "centre") {
  return sharp(asset(name))
    .resize(width, height, { fit, position, background: imageBg })
    .flatten({ background: imageBg })
    .jpeg({ quality: 92 })
    .toBuffer();
}

function frame(x, y, width, height, caption = "") {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="${imageBg}" stroke="${accent}" stroke-opacity=".5"/>
    ${caption ? t(caption, x, y + height + 38, 18, { fill: muted, weight: 700, spacing: 1 }) : ""}
  `;
}

await fs.rm(previewDir, { recursive: true, force: true });
await fs.mkdir(previewDir, { recursive: true });

const pageNames = [];

async function makePage(name, svgContent, composites = [], background = bg) {
  await fs.mkdir(previewDir, { recursive: true });
  const jpg = await sharp({ create: { width: W, height: H, channels: 3, background } })
    .composite([{ input: pageSvg(svgContent, background), left: 0, top: 0 }, ...composites])
    .jpeg({ quality: 93 })
    .toBuffer();
  await fs.writeFile(path.join(previewDir, `${name}.jpg`), jpg);
  pageNames.push(name);
  return jpg;
}

async function makeContactSheet(pageBuffers, labels) {
  const cols = 3;
  const thumbW = 300;
  const thumbH = Math.round((thumbW * H) / W);
  const labelH = 38;
  const gap = 26;
  const pad = 42;
  const rows = Math.ceil(pageBuffers.length / cols);
  const width = pad * 2 + cols * thumbW + (cols - 1) * gap;
  const height = pad * 2 + rows * (thumbH + labelH) + (rows - 1) * gap;
  const composites = [];

  for (let index = 0; index < pageBuffers.length; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const left = pad + col * (thumbW + gap);
    const top = pad + row * (thumbH + labelH + gap);
    const thumb = await sharp(pageBuffers[index])
      .resize(thumbW, thumbH, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toBuffer();
    const label = Buffer.from(`<svg width="${thumbW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${thumbW}" height="${labelH}" fill="${bg}"/>
      <text x="0" y="25" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="${muted}" letter-spacing="1">${esc(labels[index])}</text>
    </svg>`);

    composites.push({ input: thumb, left, top });
    composites.push({ input: label, left, top: top + thumbH + 10 });
  }

  const contact = await sharp({
    create: { width, height, channels: 3, background: bg },
  })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toBuffer();

  await fs.writeFile(contactPath, contact);
}

const hero = await image("original/hero-object.jpg", 610, 360);
const front = await image("original/object-front.jpg", 960, 540);
const feature = await image("original/feature-object.jpg", 460, 460);
const angle = await image("original/object-angle.jpg", 400, 400);
const side = await image("original/object-side.jpg", 400, 400);
const sketch = await image("original/process-sketch-front.jpg", 440, 300);
const wire = await image("original/process-wireframe.png", 440, 300);
const ortho = await image("original/process-orthographic.jpeg", 440, 300);
const render = await image("original/process-rendering.jpg", 440, 300);
const scene = await image("original/scenario-handheld.png", 420, 315);
const board = await image("original/poster-archive.png", 420, 594);

const card = (x, y, w, h, no, title, body) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${panel}" stroke="${accent}" stroke-opacity=".52"/>
  ${t(no, x + 28, y + 48, 20, { fill: accent, weight: 850 })}
  ${t(title, x + 28, y + 92, 28, { fill: text, weight: 800 })}
  ${multi(body, x + 28, y + 142, 21, 34, { fill: muted, weight: 400 })}
`;

const pages = [
  await makePage(
    "01-hero",
    `
    ${t("EXHIBITION CATALOGUE / CHILDREN'S ACTION CAMERA", 76, 104, 20, { fill: accent, weight: 850, spacing: 2 })}
    ${serif("不只是", 76, 280, 118)}
    ${serif("摄像", 76, 410, 118)}
    ${t("一件可被观看、握持与理解的儿童行动相机", 82, 535, 34, { fill: text, weight: 700 })}
    ${multi(["安全 / 易用 / 趣味 / 探索欲", "Xu Zifan / 233060244", "2025.06"], 82, 610, 24, 45, { fill: muted, weight: 600 })}
    ${frame(565, 300, 610, 360, "Object 01 / original render")}
    <line x1="82" y1="1450" x2="1158" y2="1450" stroke="${accent}" stroke-opacity=".6"/>
    ${t("Portfolio project page", 82, 1518, 24, { fill: muted, weight: 700 })}
    `,
    [{ input: hero, left: 565, top: 300 }],
    bg
  ),
  await makePage(
    "02-thesis",
    `
    ${t("PROJECT THESIS", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("从炫技退后一步，", 76, 250, 74)}
    ${serif("重新看见使用者。", 76, 335, 74)}
    ${multi([
      "儿童相机不只是一个拍摄工具，它也是一个让孩子建立观察、记录与表达行为的产品对象。",
      "设计重点从单纯造型展示，转向安全握持、即时反馈、低负担操作和探索欲激发。"
    ], 82, 470, 28, 48, { fill: text, weight: 400 })}
    ${card(76, 740, 250, 250, "01", "课程来源", ["设计心理学课程作业", "整理为作品集项目页"])}
    ${card(354, 740, 250, 250, "02", "目标用户", ["儿童用户", "低负担安全操作"])}
    ${card(632, 740, 250, 250, "03", "核心问题", ["让拍摄转化为", "主动观察习惯"])}
    ${card(910, 740, 250, 250, "04", "设计目标", ["安全 / 易用 / 趣味", "探索欲激发"])}
    `,
    [],
    "#171411"
  ),
  await makePage(
    "03-research",
    `
    ${t("RESEARCH INSIGHT", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("行为不是被命令出来的，", 76, 240, 64)}
    ${serif("而是被环境轻轻推出的。", 76, 320, 64)}
    ${card(76, 540, 340, 360, "提示", "准备场景", ["儿童需要清晰提示", "与即时反馈", "转译：拍摄入口直观"])}
    ${card(450, 540, 340, 360, "仪式", "游戏化习惯", ["社交化、仪式化", "推动行为养成", "转译：像陪伴物"])}
    ${card(824, 540, 340, 360, "正反馈", "避免命令", ["提醒转译成奖励", "陪伴与游戏感", "转译：降低抵触"])}
    <rect x="76" y="1080" width="1088" height="120" rx="8" fill="${panel}" stroke="${accent}" stroke-opacity=".52"/>
    ${t("DESIGN KEY", 110, 1130, 18, { fill: accent, weight: 850, spacing: 2 })}
    ${t("将提醒转译成正反馈、陪伴和游戏，而不是单向命令。", 110, 1182, 30, { fill: text, weight: 700 })}
    ${t("based on course research and design observation / source placeholder", 76, 1310, 18, { fill: muted })}
    `,
    [],
    bg
  ),
  await makePage(
    "04-case",
    `
    ${t("CASE CATALOGUE", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("六个案例，同一种行为机制。", 76, 250, 72)}
    ${t("降低恐惧，给予反馈，把重复动作变成游戏。", 82, 340, 30, { fill: muted, weight: 500 })}
    ${card(76, 520, 330, 220, "01", "Brush Monster", ["互动牙刷 / 动作反馈"])}
    ${card(454, 520, 330, 220, "02", "Bye Bite", ["咬甲纠正 / 正向转化"])}
    ${card(832, 520, 330, 220, "03", "Soappy", ["洗手打印 / 奖励机制"])}
    ${card(76, 800, 330, 220, "04", "Banamang", ["香蕉夹具 / 模仿游戏"])}
    ${card(454, 800, 330, 220, "05", "Storeat", ["故事餐盘 / 叙事驱动"])}
    ${card(832, 800, 330, 220, "06", "Spring", ["社交训练 / 场景模拟"])}
    `,
    [],
    "#171411"
  ),
  await makePage(
    "05-process",
    `
    ${t("DESIGN PROCESS", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("草图、线框和比例，", 76, 240, 64)}
    ${serif("让童趣进入秩序。", 76, 320, 64)}
    ${frame(76, 490, 440, 300, "01 Sketch / front concept")}
    ${frame(724, 490, 440, 300, "02 Wireframe / hard-surface modeling")}
    ${frame(76, 980, 440, 300, "03 Orthographic / proportion check")}
    ${frame(724, 980, 440, 300, "04 Rendering / object refinement")}
    `,
    [
      { input: sketch, left: 76, top: 490 },
      { input: wire, left: 724, top: 490 },
      { input: ortho, left: 76, top: 980 },
      { input: render, left: 724, top: 980 },
    ],
    bg
  ),
  await makePage(
    "06-object",
    `
    ${t("OBJECT STUDY", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("小型相机，也可以有展品般的形体秩序。", 76, 245, 62)}
    ${multi(["圆角外壳、镜头层级、握持边角与儿童友好比例被重新组织。", "米色机身和红色镜头圈成为产品温度。"], 82, 350, 26, 42, { fill: muted })}
    ${frame(140, 560, 960, 540, "Original product render")}
    ${card(76, 1220, 250, 210, "01", "圆角软胶边角", ["降低跌落碰撞风险"])}
    ${card(354, 1220, 250, 210, "02", "大面积握持面", ["适合儿童稳定抓握"])}
    ${card(632, 1220, 250, 210, "03", "镜头层级", ["建立视觉中心"])}
    ${card(910, 1220, 250, 210, "04", "直观屏幕区域", ["增强观看反馈"])}
    `,
    [{ input: front, left: 140, top: 560 }],
    "#171411"
  ),
  await makePage(
    "07-proportion",
    `
    ${t("PROPORTION / INTERACTION", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("尺寸、握持与反馈共同服务开始使用。", 76, 250, 62)}
    <rect x="76" y="430" width="1088" height="390" rx="10" fill="${panel}" stroke="${accent}" stroke-opacity=".52"/>
    ${t("CORE SIZE", 112, 495, 20, { fill: accent, weight: 850, spacing: 2 })}
    ${serif("87.5 × 55 × 41.25", 112, 610, 60)}
    ${t("mm", 116, 682, 30, { fill: muted, weight: 800 })}
    <rect x="720" y="552" width="300" height="135" rx="34" fill="none" stroke="${accent}" stroke-width="4"/>
    <circle cx="792" cy="619" r="42" fill="none" stroke="${text}" stroke-width="6"/>
    <path d="M1070 525 C1140 595 1135 725 1050 780" fill="none" stroke="${muted}" stroke-width="5" opacity=".75"/>
    ${card(76, 900, 330, 260, "01", "安全性", ["圆角外壳、软质触感", "防摔边角"])}
    ${card(454, 900, 330, 260, "02", "易用性", ["大按钮、直观入口", "降低认知负担"])}
    ${card(832, 900, 330, 260, "03", "趣味性", ["迷你探险伙伴", "陪伴观察记录"])}
    `,
    [],
    bg
  ),
  await makePage(
    "08-scenario",
    `
    ${t("SCENARIO GALLERY", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("从展厅回到日常。", 76, 240, 76)}
    ${t("孩子、相机和一次小小发现。", 82, 335, 30, { fill: muted })}
    ${frame(76, 520, 420, 315, "01 家庭记录")}
    ${frame(536, 520, 400, 315, "02 户外探索")}
    ${frame(76, 980, 400, 315, "03 校园分享")}
    `,
    [
      { input: scene, left: 76, top: 520 },
      { input: angle, left: 536, top: 520 },
      { input: side, left: 76, top: 980 },
    ],
    "#171411"
  ),
  await makePage(
    "09-archive",
    `
    ${t("FINAL BOARD / ARCHIVE", 76, 104, 20, { fill: accent, weight: 850, spacing: 3 })}
    ${serif("把课程展板，", 76, 235, 74)}
    ${serif("重新整理成作品集语言。", 76, 325, 74)}
    ${t("设计，始于看见，终于成全。", 82, 455, 34, { fill: text, weight: 700 })}
    ${card(76, 650, 500, 360, "NEXT STEP", "后续优化", ["01 增加真实儿童握持测试", "02 优化按钮阻尼和防摔结构", "03 补充 CMF 与量产材料方案", "04 完善亲子分享与数据传输方式"])}
    ${frame(720, 250, 420, 594, "Final board thumbnail")}
    ${t("Xu Zifan / 233060244 / Design Psychology Portfolio", 76, 1450, 22, { fill: muted, weight: 700 })}
    `,
    [{ input: board, left: 720, top: 250 }],
    "#211b17"
  ),
];

const pdf = await PDFDocument.create();
for (const buffer of pages) {
  const page = pdf.addPage([595.28, 841.89]);
  const jpg = await pdf.embedJpg(buffer);
  page.drawImage(jpg, { x: 0, y: 0, width: 595.28, height: 841.89 });
}

await fs.writeFile(pdfPath, await pdf.save());
await makeContactSheet(pages, pageNames);
console.log(pdfPath);
