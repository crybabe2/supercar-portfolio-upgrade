import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(
  "/Users/xuzifan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/"
);
const sharp = require("sharp");

const previousAssets = "/Users/xuzifan/Documents/New project/design-psychology-portfolio/assets/edited";
const outDir = "/Users/xuzifan/Documents/New project/design-psychology-museum-portfolio/assets";

const src = (name) => path.join(previousAssets, name);
const out = (name) => path.join(outDir, name);

const palette = {
  black: "#171716",
  charcoal: "#222120",
  graphite: "#2d2b29",
  stone: "#e8e1d6",
  grey: "#8f8a83",
  copper: "#b97955",
  terracotta: "#c98768",
};

function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function attr(value) {
  return esc(value).replace(/"/g, "&quot;");
}

function t(value, x, y, size, options = {}) {
  const {
    fill = palette.stone,
    weight = 500,
    anchor = "start",
    family = "Arial, Helvetica, sans-serif",
    spacing = 0,
  } = options;
  return `<text x="${x}" y="${y}" font-family="${attr(family)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(value)}</text>`;
}

function serif(value, x, y, size, options = {}) {
  return t(value, x, y, size, {
    family: 'Georgia, "Times New Roman", "Songti SC", SimSun, serif',
    weight: options.weight ?? 500,
    fill: options.fill ?? palette.stone,
    anchor: options.anchor ?? "start",
    spacing: options.spacing ?? 0,
  });
}

function lineText(lines, x, y, size, lh, options = {}) {
  return lines.map((line, i) => t(line, x, y + i * lh, size, options)).join("");
}

async function museumPhoto(input, output, options = {}) {
  const {
    width = 1600,
    height = 1000,
    fit = "cover",
    position = "centre",
    quality = 90,
  } = options;

  const base = await sharp(input)
    .resize({ width, height, fit, position, background: palette.charcoal })
    .flatten({ background: palette.charcoal })
    .modulate({ saturation: 0.32, brightness: 0.78 })
    .tint({ r: 232, g: 225, b: 214 })
    .linear(0.92, -8)
    .sharpen({ sigma: 0.8, m1: 0.6, m2: 1 })
    .toBuffer();

  const grain = Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="v" cx="50%" cy="42%" r="75%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="70%" stop-color="#000" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
      </radialGradient>
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.08"/>
        </feComponentTransfer>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#v)"/>
    <rect width="${width}" height="${height}" filter="url(#n)" opacity="0.5"/>
  </svg>`);

  await sharp(base)
    .composite([{ input: grain, left: 0, top: 0, blend: "multiply" }])
    .webp({ quality })
    .toFile(output);
}

async function darkLine(input, output, options = {}) {
  const { width = 1600, height = 980, fit = "contain", invert = false } = options;
  let pipeline = sharp(input)
    .resize({ width, height, fit, background: palette.black })
    .flatten({ background: palette.black })
    .grayscale()
    .normalize();

  if (invert) pipeline = pipeline.negate();

  const image = await pipeline
    .linear(0.68, 18)
    .tint({ r: 232, g: 225, b: 214 })
    .toBuffer();

  const frame = Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${palette.copper}" stroke-width="2" opacity="0.75"/>
  </svg>`);

  await sharp(image)
    .composite([{ input: frame, left: 0, top: 0 }])
    .webp({ quality: 90 })
    .toFile(output);
}

async function svgAsset(svg, output, width, height) {
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: "contain" })
    .webp({ quality: 92 })
    .toFile(output);
}

function researchSvg() {
  return `<svg width="1800" height="1160" viewBox="0 0 1800 1160" xmlns="http://www.w3.org/2000/svg">
    <rect width="1800" height="1160" fill="${palette.black}"/>
    <rect x="72" y="72" width="1656" height="1016" fill="none" stroke="${palette.copper}" stroke-width="2" opacity="0.72"/>
    ${t("ARCHIVAL RESEARCH / DESIGN PSYCHOLOGY", 110, 142, 24, { fill: palette.grey, weight: 700, spacing: 2 })}
    ${serif("儿童行为习惯养成", 110, 255, 88)}
    ${serif("研究摘要", 110, 355, 88)}
    <line x1="110" y1="430" x2="1690" y2="430" stroke="${palette.copper}" stroke-width="3"/>
    <g transform="translate(110 540)">
      ${serif("50%", 0, 0, 150, { fill: palette.stone })}
      ${t("早晨准备被认为是最需要辅助的场景", 330, -54, 42, { fill: palette.stone, weight: 700 })}
      ${t("按时起床、整理书包、出门准备等动作，需要更清晰的提示与反馈。", 330, 6, 30, { fill: palette.grey, weight: 400 })}
    </g>
    <g transform="translate(110 770)">
      ${serif("70%", 0, 0, 150, { fill: palette.stone })}
      ${t("社交礼仪是最突出的行为培养需求", 330, -54, 42, { fill: palette.stone, weight: 700 })}
      ${t("礼貌沟通、分享、遵守规则，说明儿童产品需要将规则转译成体验。", 330, 6, 30, { fill: palette.grey, weight: 400 })}
    </g>
    <g transform="translate(110 930)">
      <rect width="1580" height="92" fill="${palette.graphite}"/>
      ${t("DESIGN KEY", 36, 58, 26, { fill: palette.copper, weight: 800, spacing: 2 })}
      ${t("将提醒转译成正反馈、陪伴和游戏，而不是单向命令。", 310, 58, 30, { fill: palette.stone, weight: 500 })}
    </g>
  </svg>`;
}

function caseSvg() {
  const items = [
    ["Brush Monster", "互动牙刷", "动作反馈"],
    ["Bye Bite", "戒咬指甲", "正向替代"],
    ["Soappy", "洗手打印", "奖励机制"],
    ["Banannang", "香蕉衣架", "模仿游戏"],
    ["Storeat", "故事餐盘", "叙事驱动"],
    ["Spring", "社交训练", "场景模拟"],
  ];
  const cards = items
    .map((item, i) => {
      const x = 110 + (i % 3) * 530;
      const y = 390 + Math.floor(i / 3) * 270;
      return `<g transform="translate(${x} ${y})">
        <rect width="450" height="190" fill="${i % 2 ? palette.charcoal : palette.graphite}" stroke="${palette.copper}" stroke-width="2" opacity="0.96"/>
        ${t(`0${i + 1}`, 28, 50, 28, { fill: palette.copper, weight: 800 })}
        ${serif(item[0], 28, 100, 40)}
        ${t(`${item[1]} / ${item[2]}`, 28, 146, 24, { fill: palette.grey, weight: 500 })}
      </g>`;
    })
    .join("");
  return `<svg width="1800" height="980" viewBox="0 0 1800 980" xmlns="http://www.w3.org/2000/svg">
    <rect width="1800" height="980" fill="${palette.black}"/>
    ${t("CASE CATALOGUE", 110, 120, 24, { fill: palette.grey, weight: 700, spacing: 3 })}
    ${serif("六个案例，", 110, 235, 86)}
    ${serif("同一种行为机制。", 110, 330, 86)}
    ${cards}
    <line x1="110" y1="890" x2="1690" y2="890" stroke="${palette.copper}" stroke-width="2"/>
    ${t("reduce fear / give feedback / make repetition playable", 110, 935, 24, { fill: palette.grey, weight: 500 })}
  </svg>`;
}

function specSvg() {
  return `<svg width="1800" height="1160" viewBox="0 0 1800 1160" xmlns="http://www.w3.org/2000/svg">
    <rect width="1800" height="1160" fill="${palette.black}"/>
    <circle cx="1450" cy="270" r="150" fill="none" stroke="${palette.copper}" stroke-width="3"/>
    <circle cx="1450" cy="270" r="78" fill="none" stroke="${palette.stone}" stroke-width="16" opacity="0.85"/>
    <circle cx="1450" cy="270" r="30" fill="${palette.terracotta}"/>
    ${t("OBJECT NOTES", 110, 135, 24, { fill: palette.grey, weight: 700, spacing: 3 })}
    ${serif("87.5 × 55 × 41.25 mm", 110, 280, 95)}
    <line x1="110" y1="360" x2="1690" y2="360" stroke="${palette.copper}" stroke-width="3"/>
    ${lineText(["01 安全性", "圆角外壳、软质触感、防摔边角，减少儿童使用中的受伤风险。"], 110, 500, 34, 54, { fill: palette.stone, weight: 700 })}
    ${lineText(["02 易用性", "大按钮、直观拍摄入口、小手可握持比例，降低操作认知负担。"], 110, 680, 34, 54, { fill: palette.stone, weight: 700 })}
    ${lineText(["03 趣味性", "像迷你探险伙伴一样陪伴户外、旅行、校园活动和日常观察。"], 110, 860, 34, 54, { fill: palette.stone, weight: 700 })}
    <rect x="110" y="1015" width="1580" height="2" fill="${palette.copper}"/>
    ${t("catalogue dimensions redrawn from submitted project material", 110, 1070, 24, { fill: palette.grey, weight: 500 })}
  </svg>`;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  await Promise.all([
    museumPhoto(src("product-wide-detail.webp"), out("hero-object.webp"), {
      width: 1500,
      height: 980,
      position: "centre",
    }),
    museumPhoto(src("hero-product.webp"), out("feature-object.webp"), {
      width: 1200,
      height: 1500,
      position: "south",
    }),
    museumPhoto(src("product-front-wide.webp"), out("object-front.webp"), {
      width: 1200,
      height: 720,
    }),
    museumPhoto(src("product-angle.webp"), out("object-angle.webp"), {
      width: 1000,
      height: 1000,
    }),
    museumPhoto(src("poster-board-light.webp"), out("poster-archive.webp"), {
      width: 900,
      height: 1260,
      position: "north",
    }),
    museumPhoto(src("usage-child-handheld.webp"), out("scenario-handheld.webp"), {
      width: 1200,
      height: 900,
    }),
    museumPhoto(src("usage-child-front.webp"), out("scenario-front.webp"), {
      width: 900,
      height: 900,
    }),
    museumPhoto(src("usage-child-lifestyle.webp"), out("scenario-lifestyle.webp"), {
      width: 1200,
      height: 900,
    }),
    darkLine(src("technical-wireframe.png"), out("wireframe-dark.webp"), {
      width: 1400,
      height: 860,
      fit: "cover",
      invert: false,
    }),
    darkLine(src("technical-views.png"), out("views-dark.webp"), {
      width: 1400,
      height: 860,
      fit: "cover",
      invert: false,
    }),
    darkLine(src("sketch-front-layout.webp"), out("sketch-dark.webp"), {
      width: 1400,
      height: 860,
      fit: "cover",
      invert: true,
    }),
    svgAsset(researchSvg(), out("research-museum.webp"), 1800, 1160),
    svgAsset(caseSvg(), out("case-museum.webp"), 1800, 980),
    svgAsset(specSvg(), out("spec-museum.webp"), 1800, 1160),
  ]);

  await fs.writeFile(
    out("manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        style:
          "dark museum editorial, charcoal black, warm copper rules, serif hierarchy, low contrast grayscale product imagery",
        source: previousAssets,
      },
      null,
      2
    )
  );

  console.log(`Museum assets generated in ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
