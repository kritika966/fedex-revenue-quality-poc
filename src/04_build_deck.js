const pptxgen = require("pptxgenjs");
const path = require("path");

const ICON = (n) => path.join(__dirname, "icons", `${n}.png`);
const FISHBONE = path.join(__dirname, "output", "fishbone.png");

// ---------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------
const PURPLE = "4D148C";
const PURPLE_DARK = "2E0C57";
const BG_DARK = "1B1030";
const ORANGE = "FF6600";
const INK = "241830";
const MUTED = "6B6577";
const CARD = "F6F3FB";
const CARD_BORDER = "E4DCF2";
const WHITE = "FFFFFF";
const GOOD = "1BA97A";

const FONT = "Calibri";
const FONT_HEAD = "Cambria";

let pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";

const PAGE_W = 13.333, PAGE_H = 7.5, MARGIN = 0.55;

function circleIcon(slide, { x, y, size = 0.55, icon, bg = PURPLE }) {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: size, h: size, fill: { color: bg }, line: { type: "none" } });
  const pad = size * 0.24;
  slide.addImage({ path: ICON(icon), x: x + pad, y: y + pad, w: size - 2 * pad, h: size - 2 * pad });
}

function footer(slide, pageNum, label) {
  slide.addText(label || "Revenue Quality & Leakage Recovery Engine — Proof of Concept", {
    x: MARGIN, y: PAGE_H - 0.38, w: 8, h: 0.3, fontFace: FONT, fontSize: 8.5, color: MUTED,
  });
  slide.addText(String(pageNum), {
    x: PAGE_W - MARGIN - 0.6, y: PAGE_H - 0.38, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 8.5,
    color: MUTED, align: "right",
  });
}

function eyebrow(slide, text, opts = {}) {
  slide.addText(text.toUpperCase(), {
    x: opts.x ?? MARGIN, y: opts.y ?? 0.42, w: opts.w ?? 8, h: 0.3,
    fontFace: FONT, fontSize: 12, bold: true, color: opts.color ?? ORANGE, charSpacing: 1.5,
  });
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? MARGIN, y: opts.y ?? 0.72, w: opts.w ?? 11.8, h: opts.h ?? 0.7,
    fontFace: FONT_HEAD, fontSize: opts.size ?? 30, bold: true, color: opts.color ?? INK,
  });
}

function card(slide, { x, y, w, h, fill = CARD, line = CARD_BORDER, radius = 0.12 }) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, width: 1 },
    shadow: { type: "outer", color: "1B1030", opacity: 0.08, blur: 6, offset: 2, angle: 90 },
  });
}

// =======================================================================
// SLIDE 1 — TITLE
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  // soft radial-ish accent circles
  s.addShape(pres.ShapeType.ellipse, { x: 9.6, y: -2.4, w: 7, h: 7, fill: { color: PURPLE_DARK }, line: { type: "none" } });
  s.addShape(pres.ShapeType.ellipse, { x: 11.6, y: 4.6, w: 3.6, h: 3.6, fill: { color: PURPLE }, line: { type: "none" }, transparency: 55 });

  s.addText("REVENUE SCIENCE — PROOF OF CONCEPT", {
    x: 0.9, y: 2.15, w: 9, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ORANGE, charSpacing: 2,
  });
  s.addText("Revenue Quality & Leakage\nRecovery Engine", {
    x: 0.85, y: 2.6, w: 10.6, h: 1.9, fontFace: FONT_HEAD, fontSize: 44, bold: true, color: WHITE, lineSpacing: 50,
  });
  s.addText("Detecting revenue leakage, prioritizing which accounts to act on, and forecasting the recovery — "
    + "an end-to-end analytical approach to revenue quality.", {
    x: 0.9, y: 4.55, w: 8.6, h: 0.8, fontFace: FONT, fontSize: 15, color: "D9D2EA", lineSpacing: 22,
  });

  s.addShape(pres.ShapeType.line, { x: 0.9, y: 5.65, w: 2.2, h: 0, line: { color: ORANGE, width: 2.5 } });
  s.addText([
    { text: "Prepared by  ", options: { color: "AFA5C7" } },
    { text: "Kritika", options: { color: WHITE, bold: true } },
    { text: "   ·   mahnakritika3@gmail.com   ·   August 2026", options: { color: "AFA5C7" } },
  ], { x: 0.9, y: 5.85, w: 10, h: 0.4, fontFace: FONT, fontSize: 12.5 });
}

// =======================================================================
// SLIDE 2 — AGENDA
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "What this deck covers");
  title(s, "From a business signal to a working POC");

  const items = [
    ["search", "The opportunity", "Why revenue quality in low-density, e-commerce-driven shipments is a live, urgent problem — grounded in public earnings calls and industry signals."],
    ["alert", "Root-cause analysis", "5W framing, a 5-Whys chain, and a fishbone diagram tracing the leakage back to its structural causes."],
    ["cpu", "The POC", "A working Python pipeline — Detect → Target → Forecast — built on an illustrative, publicly-grounded synthetic dataset."],
    ["barchart", "Results & business case", "What the model finds, who it flags, and what recovery looks like over the next two quarters."],
    ["map", "From POC to production", "A realistic 4-phase path to putting this on real shipment and billing data."],
    ["award", "Key takeaways", "A summary of the problem, the approach, and the recommended path forward."],
  ];
  const colW = 5.85, gutter = 0.35, rowH = 1.5;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = MARGIN + col * (colW + gutter);
    const y = 1.75 + row * (rowH + 0.18);
    card(s, { x, y, w: colW, h: rowH });
    circleIcon(s, { x: x + 0.28, y: y + 0.28, icon: it[0] });
    s.addText(`${i + 1}.  ${it[1]}`, { x: x + 1.0, y: y + 0.22, w: colW - 1.25, h: 0.4, fontFace: FONT_HEAD, fontSize: 15.5, bold: true, color: INK });
    s.addText(it[2], { x: x + 1.0, y: y + 0.62, w: colW - 1.25, h: rowH - 0.75, fontFace: FONT, fontSize: 10.8, color: MUTED, lineSpacing: 14.5 });
  });
  footer(s, 2);
}

// =======================================================================
// SLIDE 3 — THE SIGNAL
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "The opportunity");
  title(s, "The signal: what's happening in FedEx's business right now");
  s.addText("Four public data points point at the same underlying problem — revenue quality in low-density, e-commerce-driven shipments.",
    { x: MARGIN, y: 1.42, w: 11.8, h: 0.4, fontFace: FONT, fontSize: 12, color: MUTED });

  const signals = [
    ["alert", "DIM-weight rules tightened", "Aug 18, 2025: FedEx began rounding every fractional inch UP on all three dimensions — a direct lever to capture more revenue from light, bulky e-commerce packages.", "Shipping trade press (ShipperHQ, PARCEL Industry, 3PL Center)"],
    ["users", "Competitors moved in lockstep", "UPS rolled out a nearly identical dimensional-rounding change around the same time — this is an industry-wide revenue-quality tactic, not a FedEx-only move.", "Shipping trade press (ShipperHQ, PARCEL Industry, 3PL Center)"],
    ["trending", "“Revenue quality” is the watchword", "Q4 FY26 package yield was reported up 11% year over year, with company commentary attributing the large majority of that gain to base price increases rather than fuel or volume.", "FedEx Q4 FY26 earnings coverage (multiple financial outlets)"],
    ["package", "Ground Economy volume declining", "Ground Economy volume was reported down roughly 5% in the quarter, described as a deliberate trade of low-margin volume for margin quality.", "FedEx Q4 FY26 earnings coverage (multiple financial outlets)"],
  ];
  const colW = 5.85, gutter = 0.35, rowH = 2.15;
  signals.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = MARGIN + col * (colW + gutter);
    const y = 2.0 + row * (rowH + 0.22);
    card(s, { x, y, w: colW, h: rowH });
    circleIcon(s, { x: x + 0.28, y: y + 0.26, icon: it[0] });
    s.addText(it[1], { x: x + 1.0, y: y + 0.2, w: colW - 1.25, h: 0.45, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: INK });
    s.addText(it[2], { x: x + 1.0, y: y + 0.62, w: colW - 1.25, h: 1.15, fontFace: FONT, fontSize: 10.3, color: MUTED, lineSpacing: 13.5 });
    s.addText(it[3], { x: x + 0.28, y: y + rowH - 0.38, w: colW - 0.55, h: 0.3, fontFace: FONT, fontSize: 8.6, italic: true, color: PURPLE });
  });
  footer(s, 3);
}

// =======================================================================
// SLIDE 4 — 5W PROBLEM STATEMENT
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Root-cause analysis, part 1");
  title(s, "Framing the problem: the 5W");

  const w5 = [
    ["What", "Revenue leakage & yield erosion: shipments — especially low-density, “light & bulky” e-commerce packages — are billed below true cost-to-serve and target margin."],
    ["Who", "Revenue Science, Pricing, and Sales teams own the fix; Finance feels the margin impact; SME and e-commerce accounts are most exposed."],
    ["When", "A structural, ongoing issue — acute since the e-commerce boom, now urgent given the Aug 2025 DIM rule change and the CY2026 Ground Economy volume decline."],
    ["Where", "Concentrated in the FedEx Ground / Ground Economy network, in low-density product categories (apparel, home goods) and SME/e-commerce accounts."],
    ["Why", "Static rate cards and periodic reviews can't track fast-moving package-density mix — so pricing lags reality instead of correcting it continuously."],
  ];
  const colW = 2.22, gutter = 0.16;
  w5.forEach((it, i) => {
    const x = MARGIN + i * (colW + gutter);
    const y = 1.85;
    const h = 4.7;
    card(s, { x, y, w: colW, h, fill: i === 4 ? PURPLE : CARD, line: i === 4 ? PURPLE : CARD_BORDER });
    s.addText(it[0], { x: x + 0.18, y: y + 0.22, w: colW - 0.36, h: 0.45, fontFace: FONT_HEAD, fontSize: 18, bold: true, color: i === 4 ? WHITE : PURPLE });
    s.addText(it[1], { x: x + 0.18, y: y + 0.78, w: colW - 0.36, h: h - 1.0, fontFace: FONT, fontSize: 10.2, color: i === 4 ? "EDE7F7" : INK, lineSpacing: 14 });
  });
  footer(s, 4);
}

// =======================================================================
// SLIDE 5 — 5 WHYS
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Root-cause analysis, part 2");
  title(s, "The 5 Whys: tracing leakage to its root");

  const whys = [
    ["Why is revenue quality eroding in e-commerce / Ground Economy?", "Because many shipments are billed below their true, correctly-measured cost-to-serve."],
    ["Why are they billed below true cost?", "Because billable weight is set by static, negotiated rate terms — not continuously reconciled against actual package density."],
    ["Why aren't rates reconciled continuously?", "Because there's no scalable analytics process that monitors account-level density and margin drift and triggers action."],
    ["Why is there no such process?", "Because pricing analytics today is largely retrospective — quarterly GRIs and periodic contract reviews — not a standing statistical monitoring system."],
    ["Why is it retrospective, not continuous?", "Because closing that gap requires building exactly this capability: a revenue science function that combines shipment-level modeling, elasticity analysis, and forecasting into a repeatable, proactive process."],
  ];
  let y = 1.75;
  const rowH = 0.98;
  whys.forEach((w, i) => {
    const isLast = i === whys.length - 1;
    circleIcon(s, { x: MARGIN, y: y + 0.06, size: 0.5, icon: "search", bg: isLast ? ORANGE : PURPLE });
    card(s, { x: MARGIN + 0.72, y, w: 11.0, h: rowH - 0.14, fill: isLast ? "FFF1E6" : CARD, line: isLast ? "FFD9B8" : CARD_BORDER });
    s.addText([
      { text: `Why ${i + 1}:  `, options: { bold: true, color: PURPLE } },
      { text: w[0], options: { bold: true, color: INK } },
    ], { x: MARGIN + 0.95, y: y + 0.07, w: 10.5, h: 0.32, fontFace: FONT, fontSize: 11.3 });
    s.addText(w[1], { x: MARGIN + 0.95, y: y + 0.4, w: 10.5, h: 0.42, fontFace: FONT, fontSize: 10.3, color: MUTED, lineSpacing: 13 });
    y += rowH;
  });
  footer(s, 5);
}

// =======================================================================
// SLIDE 6 — FISHBONE
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Root-cause analysis, part 3");
  title(s, "Fishbone (Ishikawa) diagram");
  s.addText("Five contributing categories, all converging on the same effect — none of them fixable by a one-time rate change alone.",
    { x: MARGIN, y: 1.4, w: 11.8, h: 0.35, fontFace: FONT, fontSize: 11.5, color: MUTED });
  s.addImage({ path: FISHBONE, x: 0.35, y: 1.85, w: 12.63, h: 5.1 });
  footer(s, 6);
}

// =======================================================================
// SLIDE 7 — POC OVERVIEW (Detect / Target / Forecast)
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "The POC, part 1");
  title(s, "How the POC works: Detect → Target → Forecast");
  s.addText("A Python pipeline (pandas, scikit-learn) built on a synthetic, publicly-grounded shipment dataset — 60,000 shipments across 900 accounts, 13 months.",
    { x: MARGIN, y: 1.42, w: 11.8, h: 0.4, fontFace: FONT, fontSize: 11.5, color: MUTED });

  const stages = [
    ["search", "1. DETECT", "Recompute correct dimensional-weight revenue per shipment from length/width/height, and compare to what was actually billed.",
      ["Applies FedEx's published 139 in³/lb DIM divisor", "Models both the legacy and Aug-2025 rounding rules", "Flags the $ gap, shipment by shipment"]],
    ["target", "2. TARGET", "Roll up to the account level; score every account on margin gap + leakage share, and size two levers: a no-risk billing fix and a capped, elasticity-aware repricing ask.",
      ["Composite risk score ranks 900 accounts", "Segment-level price elasticity (SME/Mid/Enterprise)", "Price increases capped 2–9%, net of modeled volume loss"]],
    ["trending", "3. FORECAST", "Project the leakage trend forward, and model the revenue-quality recovery curve as the fix ramps in over 6 months.",
      ["Linear trend baseline vs. intervention scenario", "Ramped rollout curve (15% → 80% capture)", "Output an analyst worklist, not just a chart"]],
  ];
  const colW = 3.95, gutter = 0.24;
  stages.forEach((st, i) => {
    const x = MARGIN + i * (colW + gutter);
    const y = 2.0;
    const h = 4.85;
    card(s, { x, y, w: colW, h, fill: i === 1 ? PURPLE : CARD, line: i === 1 ? PURPLE : CARD_BORDER });
    circleIcon(s, { x: x + 0.28, y: y + 0.28, icon: st[0], bg: i === 1 ? ORANGE : PURPLE });
    s.addText(st[1], { x: x + 0.28, y: y + 0.98, w: colW - 0.56, h: 0.4, fontFace: FONT_HEAD, fontSize: 15, bold: true, color: i === 1 ? WHITE : PURPLE });
    s.addText(st[2], { x: x + 0.28, y: y + 1.4, w: colW - 0.56, h: 1.25, fontFace: FONT, fontSize: 10.6, color: i === 1 ? "EDE7F7" : INK, lineSpacing: 14.5 });
    let by = y + 2.75;
    st[3].forEach((b) => {
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.28, y: by + 0.08, w: 0.07, h: 0.07, fill: { color: i === 1 ? ORANGE : ORANGE }, line: { type: "none" } });
      s.addText(b, { x: x + 0.48, y: by - 0.06, w: colW - 0.76, h: 0.55, fontFace: FONT, fontSize: 9.6, color: i === 1 ? "EDE7F7" : MUTED, lineSpacing: 12.5 });
      by += 0.62;
    });
  });
  footer(s, 7);
}

// =======================================================================
// SLIDE 8 — RESULTS: KPIs + monthly trend
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Results & business case, part 1");
  title(s, "What the model finds");

  const kpis = [
    ["$72.1K", "Leakage identified in sample", "5.4% of sample revenue"],
    ["+46.2%", "Leak $ / shipment since DIM rule change", "vs. prior rounding rule"],
    ["135", "Tier-1 “act now” accounts", "35.7% of total leakage $"],
    ["$69.6K", "Annualized recovery potential", "Levers A + B, sample scale"],
  ];
  const kw = 2.85, kg = 0.2;
  kpis.forEach((k, i) => {
    const x = MARGIN + i * (kw + kg);
    card(s, { x, y: 1.55, w: kw, h: 1.35 });
    s.addText(k[0], { x: x + 0.2, y: 1.68, w: kw - 0.4, h: 0.55, fontFace: FONT_HEAD, fontSize: 26, bold: true, color: PURPLE });
    s.addText(k[1], { x: x + 0.2, y: 2.22, w: kw - 0.4, h: 0.35, fontFace: FONT, fontSize: 9.8, bold: true, color: INK });
    s.addText(k[2], { x: x + 0.2, y: 2.55, w: kw - 0.4, h: 0.3, fontFace: FONT, fontSize: 8.6, color: MUTED });
  });

  card(s, { x: MARGIN, y: 3.15, w: 12.23, h: 3.75 });
  s.addText("Monthly revenue leakage ($)", { x: MARGIN + 0.3, y: 3.35, w: 8, h: 0.35, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: INK });
  s.addText("Dashed marker: Aug 18, 2025 DIM-rounding rule change", { x: MARGIN + 0.3, y: 3.68, w: 8, h: 0.3, fontFace: FONT, fontSize: 9.5, color: MUTED, italic: true });

  const months = ["May25","Jun25","Jul25","Aug25","Sep25","Oct25","Nov25","Dec25","Jan26","Feb26","Mar26","Apr26","May26"];
  const leak = [4092,3835,4935,5071,5914,6249,6699,6119,6855,5036,6440,5875,5011];
  s.addChart(pres.ChartType.line, [{ name: "Leakage $", labels: months, values: leak }], {
    x: MARGIN + 0.25, y: 4.05, w: 11.7, h: 2.7,
    chartColors: [PURPLE], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    showLegend: false, showTitle: false,
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 8.5, catAxisLineColor: CARD_BORDER,
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 8.5, valAxisLabelFormatCode: "$#,##0",
    valGridLine: { color: "EDEAF5", size: 1 }, catGridLine: { style: "none" },
    valAxisLineShow: false, catAxisLineShow: true,
  });
  footer(s, 8);
}

// =======================================================================
// SLIDE 9 — RESULTS: category + tier
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Results & business case, part 2");
  title(s, "Where it's concentrated, and who to act on first");

  card(s, { x: MARGIN, y: 1.65, w: 5.9, h: 5.15 });
  s.addText("Leakage by product category", { x: MARGIN + 0.3, y: 1.85, w: 5.3, h: 0.35, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: INK });
  s.addText("Concentrated in low-density goods — as a DIM-weight billing gap would predict.", { x: MARGIN + 0.3, y: 2.18, w: 5.3, h: 0.4, fontFace: FONT, fontSize: 9.3, color: MUTED });
  s.addChart(pres.ChartType.bar, [{ name: "Leakage $", labels: ["Home & Bulky","Apparel/Soft Goods","Electronics","Health/Beauty","Industrial/B2B"], values: [54652,13340,2071,1546,522] }], {
    x: MARGIN + 0.2, y: 2.65, w: 5.5, h: 3.95, barDir: "bar",
    chartColors: [PURPLE], showLegend: false, showTitle: false, showValue: true, dataLabelFormatCode: "$#,##0",
    dataLabelColor: INK, dataLabelFontSize: 8.5, dataLabelPosition: "outEnd",
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 8.8, valAxisLabelColor: MUTED, valAxisLabelFontSize: 8,
    valAxisLabelFormatCode: "$#,##0", valGridLine: { color: "EDEAF5", size: 1 }, catGridLine: { style: "none" },
  });

  const rx = MARGIN + 6.25;
  card(s, { x: rx, y: 1.65, w: 5.9, h: 5.15 });
  s.addText("Accounts by priority tier", { x: rx + 0.3, y: 1.85, w: 5.3, h: 0.35, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: INK });
  s.addText("Composite risk score (margin gap + leakage share) — the top 15% of accounts carry 36% of the leakage.", { x: rx + 0.3, y: 2.18, w: 5.3, h: 0.5, fontFace: FONT, fontSize: 9.3, color: MUTED });
  s.addChart(pres.ChartType.bar, [{ name: "Leakage $", labels: ["Tier 1 — Act Now","Tier 2 — Monitor","Tier 3 — Healthy"], values: [25753,25830,20548] }], {
    x: rx + 0.2, y: 2.85, w: 5.5, h: 3.6, barDir: "bar",
    chartColors: [ORANGE], showLegend: false, showTitle: false, showValue: true, dataLabelFormatCode: "$#,##0",
    dataLabelColor: INK, dataLabelFontSize: 9, dataLabelPosition: "outEnd",
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 9.5, valAxisLabelColor: MUTED, valAxisLabelFontSize: 8,
    valAxisLabelFormatCode: "$#,##0", valGridLine: { color: "EDEAF5", size: 1 }, catGridLine: { style: "none" },
  });
  footer(s, 9);
}

// =======================================================================
// SLIDE 10 — ACCOUNT WORKLIST
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Results & business case, part 3");
  title(s, "The output is a worklist, not just a chart");
  s.addText("Top accounts by recommended recovery — this is what an analyst or account manager would actually work from.",
    { x: MARGIN, y: 1.42, w: 11.8, h: 0.35, fontFace: FONT, fontSize: 11.5, color: MUTED });

  const rows = [
    ["Account", "Segment", "Category", "Revenue", "Leakage $", "Sugg. Price Δ", "Recovery $"],
    ["A100172", "SME", "Home & Bulky", "$3.3K", "$1.0K", "+2.7%", "$1.0K"],
    ["A100620", "Mid-Market", "Home & Bulky", "$3.7K", "$914", "+4.5%", "$1.0K"],
    ["A100469", "SME", "Home & Bulky", "$3.5K", "$921", "+2.5%", "$957"],
    ["A100809", "Enterprise", "Home & Bulky", "$2.9K", "$800", "+6.3%", "$934"],
    ["A100802", "Mid-Market", "Home & Bulky", "$3.1K", "$836", "+3.1%", "$883"],
    ["A100380", "SME", "Home & Bulky", "$4.4K", "$794", "+2.6%", "$842"],
  ];
  const tblRows = rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: {
      bold: ri === 0, color: ri === 0 ? WHITE : INK, fill: ri === 0 ? { color: PURPLE } : { color: ri % 2 === 0 ? CARD : WHITE },
      fontSize: ri === 0 ? 10.5 : 10.5, align: ci >= 3 ? "right" : "left", fontFace: FONT,
    },
  })));
  s.addTable(tblRows, {
    x: MARGIN, y: 2.0, w: 12.23, h: 3.3,
    colW: [1.7, 1.7, 2.3, 1.7, 1.7, 1.6, 1.53],
    border: { type: "solid", color: CARD_BORDER, pt: 0.75 },
    autoPage: false,
  });

  card(s, { x: MARGIN, y: 5.55, w: 12.23, h: 1.1 });
  s.addText([
    { text: "Read this row: ", options: { bold: true, color: PURPLE } },
    { text: "account A100172 (SME, Home & Bulky) is under-billed by ~$1.0K in the sample window. A capped 2.7% price move — sized to this account's own price elasticity — plus the DIM billing correction recovers essentially all of it, net of modeled volume risk.", options: { color: INK } },
  ], { x: MARGIN + 0.3, y: 5.7, w: 11.6, h: 0.85, fontFace: FONT, fontSize: 10.5, lineSpacing: 15 });
  footer(s, 10);
}

// =======================================================================
// SLIDE 11 — FORECAST & BUSINESS CASE
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Results & business case, part 4");
  title(s, "6-month forecast: do nothing vs. recommended action");

  card(s, { x: MARGIN, y: 1.65, w: 7.6, h: 4.6 });
  s.addChart(pres.ChartType.line, [
    { name: "Baseline (no action)", labels: ["Jun26","Jul26","Aug26","Sep26","Oct26","Nov26"], values: [6448,6576,6705,6833,6962,7090] },
    { name: "With intervention", labels: ["Jun26","Jul26","Aug26","Sep26","Oct26","Nov26"], values: [5916,5310,4677,4202,3975,3971] },
  ], {
    x: MARGIN + 0.25, y: 1.95, w: 7.1, h: 4.15,
    chartColors: [MUTED, ORANGE], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    showLegend: true, legendPos: "b", legendColor: INK, legendFontSize: 10,
    showTitle: true, title: "Projected monthly leakage ($)", titleColor: INK, titleFontSize: 12.5,
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 9, valAxisLabelColor: MUTED, valAxisLabelFontSize: 9,
    valAxisLabelFormatCode: "$#,##0", valGridLine: { color: "EDEAF5", size: 1 }, catGridLine: { style: "none" },
  });

  const rx = MARGIN + 7.85;
  card(s, { x: rx, y: 1.65, w: 4.35, h: 4.6, fill: PURPLE, line: PURPLE });
  s.addText("$12.6K", { x: rx + 0.3, y: 1.9, w: 3.8, h: 0.6, fontFace: FONT_HEAD, fontSize: 30, bold: true, color: WHITE });
  s.addText("cumulative recovery, 6 months (sample scale)", { x: rx + 0.3, y: 2.5, w: 3.8, h: 0.45, fontFace: FONT, fontSize: 10, color: "D9CBEF" });
  s.addText(
    "At FedEx's real shipment volumes — many millions of packages a day — this sample is a rounding error. "
    + "That's the point: the POC's job is to prove the method (detect → target → forecast) on a small, "
    + "transparent dataset, not to size FedEx's real opportunity.\n\n"
    + "The right next step is validating this pipeline on real shipment and billing data, where the same "
    + "logic would surface the actual dollar opportunity.",
    { x: rx + 0.3, y: 3.1, w: 3.8, h: 3.0, fontFace: FONT, fontSize: 10.3, color: "EDE7F7", lineSpacing: 15 }
  );
  footer(s, 11);
}

// =======================================================================
// SLIDE 12 — ROADMAP
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "From POC to production");
  title(s, "A realistic path onto real data");

  const phases = [
    ["flag", "Phase 1 · Days 0–30", "Validate", "Replace synthetic data with a sampled extract of real shipment/billing records; recalibrate cost & elasticity assumptions with Finance and Pricing."],
    ["database", "Phase 2 · Days 30–90", "Integrate", "Connect to the actual rating/billing systems (e.g., Teradata/Oracle); stand up account scorecards refreshed on a rolling basis, not quarterly."],
    ["sliders", "Phase 3 · Days 90–180", "Pilot", "Automate Lever A (billing correction) end-to-end; pilot Lever B (targeted repricing) with a Sales-approved account cohort, tracking churn vs. forecast."],
    ["users", "Phase 4 · Ongoing", "Scale", "Expand to additional segments/products; document the method fully so it can be run and extended by others, not just re-run as a one-off."],
  ];
  const colW = 2.87, gutter = 0.22;
  phases.forEach((p, i) => {
    const x = MARGIN + i * (colW + gutter);
    card(s, { x, y: 1.85, w: colW, h: 4.65 });
    circleIcon(s, { x: x + 0.26, y: 2.12, icon: p[0] });
    s.addText(p[1], { x: x + 0.26, y: 2.78, w: colW - 0.5, h: 0.3, fontFace: FONT, fontSize: 9, bold: true, color: ORANGE });
    s.addText(p[2], { x: x + 0.26, y: 3.05, w: colW - 0.5, h: 0.42, fontFace: FONT_HEAD, fontSize: 16.5, bold: true, color: PURPLE });
    s.addText(p[3], { x: x + 0.26, y: 3.55, w: colW - 0.5, h: 2.8, fontFace: FONT, fontSize: 10, color: INK, lineSpacing: 14 });
    if (i < phases.length - 1) {
      s.addText("→", { x: x + colW - 0.02, y: 3.9, w: 0.4, h: 0.4, fontFace: FONT, fontSize: 16, color: CARD_BORDER, align: "center" });
    }
  });
  footer(s, 12);
}

// =======================================================================
// SLIDE 13 — KEY TAKEAWAYS
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, "Closing");
  title(s, "Key takeaways");

  const rows = [
    ["alert", "The problem is structural, not seasonal", "Static rate cards and periodic reviews can't track fast-moving package-density mix, so low-density shipments are billed below true cost-to-serve — and it compounds every rate change."],
    ["barchart", "The method: Detect → Target → Forecast", "A full Python pipeline (pandas, scikit-learn) — shipment-level leakage detection, composite account risk scoring, and regression-based forecasting."],
    ["target", "The output is a worklist, not just a chart", "A ranked, account-level list with two concrete levers and a capped, elasticity-aware price recommendation per account — something a team can act on directly."],
    ["users", "It's built to be cross-functional", "The fishbone analysis spans people, process, technology, policy, and market causes — the fix touches Pricing, Sales, Finance, and Ops together, not one team alone."],
    ["map", "The next step is validation on real data", "The POC's job is to prove the method on a small, transparent dataset. The path to real impact is a phased rollout — validate, integrate, pilot, scale."],
  ];
  let y = 1.75;
  const rowH = 0.92;
  rows.forEach((r) => {
    circleIcon(s, { x: MARGIN, y: y + 0.06, size: 0.5, icon: r[0] });
    s.addText(r[1], { x: MARGIN + 0.75, y: y - 0.02, w: 4.7, h: rowH - 0.1, fontFace: FONT_HEAD, fontSize: 11.8, bold: true, color: PURPLE, valign: "middle", lineSpacing: 14 });
    s.addShape(pres.ShapeType.line, { x: MARGIN + 5.65, y: y + 0.06, w: 0, h: rowH - 0.22, line: { color: CARD_BORDER, width: 1 } });
    s.addText(r[2], { x: MARGIN + 5.9, y: y - 0.02, w: 6.1, h: rowH - 0.1, fontFace: FONT, fontSize: 10.5, color: INK, valign: "middle", lineSpacing: 14 });
    y += rowH;
  });
  footer(s, 13);
}

// =======================================================================
// SLIDE 14 — CLOSING
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addShape(pres.ShapeType.ellipse, { x: -2.4, y: 4.6, w: 6.5, h: 6.5, fill: { color: PURPLE_DARK }, line: { type: "none" } });

  s.addText("Thank you", { x: 0.9, y: 2.5, w: 9, h: 1.0, fontFace: FONT_HEAD, fontSize: 40, bold: true, color: WHITE });
  s.addText(
    "This POC is a starting point, not a finished product — the real opportunity is validating this method on "
    + "actual shipment and billing data, working alongside Pricing, Sales, and Finance.",
    { x: 0.95, y: 3.4, w: 8.5, h: 0.9, fontFace: FONT, fontSize: 14, color: "D9D2EA", lineSpacing: 20 }
  );

  circleIcon(s, { x: 0.95, y: 4.65, size: 0.42, icon: "mail", bg: PURPLE });
  s.addText("mahnakritika3@gmail.com", { x: 1.5, y: 4.66, w: 4, h: 0.4, fontFace: FONT, fontSize: 12.5, color: WHITE });
  s.addText("Full working code, synthetic dataset, and an interactive dashboard are included as supporting attachments.",
    { x: 0.95, y: 5.3, w: 8.3, h: 0.5, fontFace: FONT, fontSize: 10.5, italic: true, color: "AFA5C7" });
  footer(s, 14, "Revenue Quality & Leakage Recovery Engine — Proof of Concept");
}

pres.writeFile({ fileName: path.join(__dirname, "output", "fedex_revenue_science_poc.pptx") }).then(() => {
  console.log("deck written");
});
