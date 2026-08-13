const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, BorderStyle, ImageRun, PageBreak,
  Header, Footer, PageNumber, LevelFormat, convertInchesToTwip, VerticalAlign,
} = require("docx");

const PURPLE = "4D148C";
const ORANGE = "FF6600";
const INK = "241830";
const MUTED = "6B6577";
const CARD = "F6F3FB";
const LETTER = { width: 12240, height: 15840 };

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 300 },
    children: [new TextRun({ text, size: 22, color: INK, ...opts })],
  });
}
function bullet(text, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 90, line: 290 },
    children: [new TextRun({ text, size: 21, color: INK, ...opts })],
  });
}
function caption(text) {
  return new Paragraph({
    spacing: { before: 60, after: 220 },
    children: [new TextRun({ text, italics: true, size: 18, color: MUTED })],
  });
}
function pQuote(text, source) {
  return new Paragraph({
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: PURPLE, space: 8 } },
    spacing: { after: 40, before: 120 },
    children: [new TextRun({ text, italics: true, size: 21, color: INK })],
  });
}
function pSource(text) {
  return new Paragraph({
    indent: { left: 360 },
    spacing: { after: 200 },
    children: [new TextRun({ text, size: 17, color: PURPLE, italics: true })],
  });
}

function cell(text, opts = {}) {
  const { bold = false, fill = null, color = INK, width = null, align = AlignmentType.LEFT, size = 20 } = opts;
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text), bold, color, size })],
    })],
  });
}

function dataTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((hText, i) => cell(hText, { bold: true, fill: PURPLE, color: "FFFFFF", width: colWidths[i], size: 19 })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((c, ci) => cell(c, {
      fill: ri % 2 === 0 ? CARD : "FFFFFF",
      width: colWidths[ci],
      align: ci > 0 ? AlignmentType.RIGHT : AlignmentType.LEFT,
      size: 19,
    })),
  }));
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...bodyRows],
  });
}

// ---------------------------------------------------------------------
// Fishbone image sizing
// ---------------------------------------------------------------------
const fishboneBuf = fs.readFileSync(path.join(__dirname, "output", "fishbone.png"));
const FB_W = 624, FB_H = Math.round(624 * (1699 / 3066));

// ---------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
    }],
  },
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22, color: INK } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Cambria", size: 32, bold: true, color: PURPLE },
        paragraph: { spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E4DCF2", space: 6 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Cambria", size: 25, bold: true, color: INK },
        paragraph: { spacing: { before: 260, after: 110 } } },
    ],
  },
  sections: [
    // =====================================================================
    // TITLE PAGE
    // =====================================================================
    {
      properties: { page: { size: LETTER, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 2200 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: "REVENUE SCIENCE — PROOF OF CONCEPT", bold: true, size: 20, color: ORANGE, allCaps: true, characterSpacing: 20 })],
        }),
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "Revenue Quality & Leakage Recovery", bold: true, size: 52, font: "Cambria", color: PURPLE })],
        }),
        new Paragraph({
          spacing: { after: 500 },
          children: [new TextRun({ text: "Problem Statement, Root-Cause Analysis, and a Working Proof-of-Concept Solution", size: 26, color: INK, font: "Cambria" })],
        }),
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 16, color: ORANGE, space: 1 } },
          spacing: { before: 200 },
          children: [],
        }),
        new Paragraph({
          spacing: { before: 240 },
          children: [
            new TextRun({ text: "Prepared by  ", size: 22, color: MUTED }),
            new TextRun({ text: "Kritika", size: 22, color: INK, bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 2000 },
          children: [new TextRun({ text: "mahnakritika3@gmail.com   ·   August 2026", size: 20, color: MUTED })],
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({ text: "A revenue leakage in low-density, e-commerce-driven shipments is a structural, quantifiable, and fixable "
            + "problem. This document lays out the problem, traces it to its root causes, and proposes a working, "
            + "data-driven solution — with a proof-of-concept built end to end to demonstrate the approach.", size: 21, italics: true, color: MUTED })],
        }),
        new Paragraph({
          spacing: { before: 500 },
          children: [new TextRun({
            text: "Independent analysis, not affiliated with or endorsed by FedEx. Built entirely on public information "
              + "— no proprietary, confidential, or internal FedEx data was used anywhere in this document.",
            size: 17, italics: true, color: MUTED,
          })],
        }),
      ],
    },

    // =====================================================================
    // MAIN BODY
    // =====================================================================
    {
      properties: {
        page: { size: LETTER, margin: { top: 1300, bottom: 1300, left: 1350, right: 1350 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E4DCF2", space: 4 } },
            children: [new TextRun({ text: "Revenue Quality & Leakage Recovery — Proof of Concept", size: 16, color: MUTED })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", size: 16, color: MUTED }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }),
            ],
          })],
        }),
      },
      children: [
        // ---------------------------------------------------------------
        h1("1. Executive Summary"),
        body(
          "Shipments that are low-density — bulky relative to their weight, like apparel and home goods — are "
          + "systematically billed below their true cost-to-serve. This is not a one-off billing error; it is a "
          + "structural gap between how rate cards are set (on average density assumptions, negotiated once and "
          + "rarely revisited) and how the shipment mix actually behaves (fast-moving, e-commerce-driven, and "
          + "increasingly weighted toward light, bulky goods). The gap is real, measurable, and — based on public "
          + "industry signals — actively being worked on by carriers right now."
        ),
        body(
          "This document lays out the problem end to end: a formal problem statement (5W), a root-cause analysis "
          + "(5 Whys and a fishbone diagram), and a proposed solution — a three-stage analytical engine (Detect → "
          + "Target → Forecast) that finds the leakage, decides which accounts to act on and how, and forecasts the "
          + "recovery. The approach is demonstrated with a working proof-of-concept: a full Python pipeline run on a "
          + "synthetic but realistic dataset, calibrated to publicly disclosed industry facts. No proprietary or "
          + "confidential data was used anywhere in this analysis."
        ),

        // ---------------------------------------------------------------
        h1("2. Problem Statement"),
        body(
          "Revenue leakage and yield erosion: a meaningful share of shipments — especially low-density, "
          + "“light & bulky” e-commerce packages — are billed below their true cost-to-serve and below "
          + "target margin. The gap is driven by static rate structures that don't adjust as fast as the underlying "
          + "package-density mix shifts, and it is largest in exactly the categories e-commerce has grown fastest: "
          + "apparel, home goods, and similar bulky-but-light goods."
        ),
        dataTable(
          ["", "Framing"],
          [
            ["What", "Shipments — especially low-density e-commerce packages — are billed below true cost-to-serve and target margin."],
            ["Who", "Pricing and revenue teams own the fix; Sales and Finance feel the downstream impact; SME and e-commerce accounts are most exposed."],
            ["When", "A structural, ongoing issue — acute since the e-commerce boom, now more urgent given recent dimensional-weight rule changes and shifting parcel volume mix."],
            ["Where", "Concentrated in low-density product categories (apparel, home goods) and in SME / e-commerce-heavy accounts."],
            ["Why", "Static rate cards and periodic reviews can't track fast-moving package-density mix, so pricing lags reality instead of continuously correcting for it."],
          ],
          [1600, 7760]
        ),
        new Paragraph({ spacing: { after: 300 }, children: [] }),

        // ---------------------------------------------------------------
        h1("3. Why This Matters Now"),
        body(
          "Four public data points, taken together, point at the same underlying problem: revenue quality in "
          + "low-density, e-commerce-driven shipments is under active pressure across the parcel industry."
        ),
        h2("Dimensional-weight rules have been tightened"),
        pQuote("Carriers now round every fractional inch UP on all three package dimensions — a direct lever to capture more revenue from light, bulky e-commerce packages, up from a more forgiving rounding standard.", ""),
        pSource("Source: shipping-industry trade press (ShipperHQ, PARCEL Industry, 3PL Center)"),
        h2("Competitors moved in lockstep"),
        pQuote("UPS rolled out a nearly identical dimensional-rounding change around the same time — evidence this is an industry-wide revenue-quality tactic, not a FedEx-only move.", ""),
        pSource("Source: shipping-industry trade press (ShipperHQ, PARCEL Industry, 3PL Center)"),
        h2("“Revenue quality” is the watchword"),
        pQuote("Q4 FY26 package yield was reported up 11% year over year, with company commentary attributing the large majority of that gain to base price increases rather than fuel surcharges or volume growth — a deliberate, disciplined pricing stance.", ""),
        pSource("Source: FedEx Q4 FY26 earnings coverage (multiple financial outlets)"),
        h2("Low-margin volume is being deliberately traded for margin"),
        pQuote("Ground Economy volume was reported down roughly 5% in the quarter — a signal that low-margin volume is being traded for margin quality, not chased at any cost.", ""),
        pSource("Source: FedEx Q4 FY26 earnings coverage (multiple financial outlets)"),

        // ---------------------------------------------------------------
        h1("4. Root-Cause Analysis"),
        h2("4.1  The Five Whys"),
        body("Tracing the problem back through five iterations of “why” surfaces the structural root cause:"),
        bullet("Why 1 — Why is revenue quality eroding in e-commerce / low-density shipments?  Because many shipments are billed below their true, correctly-measured cost-to-serve."),
        bullet("Why 2 — Why are they billed below true cost?  Because billable weight is set by static, negotiated rate terms — not continuously reconciled against actual package density."),
        bullet("Why 3 — Why aren't rates reconciled continuously?  Because there's no scalable analytics process that monitors account-level density and margin drift and triggers action."),
        bullet("Why 4 — Why is there no such process?  Because pricing analytics today is largely retrospective — periodic rate reviews and contract audits — not a standing statistical monitoring system."),
        bullet("Why 5 — Why is it retrospective, not continuous?  Because closing that gap requires building a dedicated capability: a revenue science function that combines shipment-level modeling, elasticity analysis, and forecasting into a repeatable, proactive process. This is precisely the capability the proposed solution builds."),
        new Paragraph({ spacing: { after: 200 }, children: [] }),

        h2("4.2  Fishbone (Ishikawa) Diagram"),
        body("Five contributing categories converge on the same effect — none of them fixable by a one-time rate change alone."),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
          children: [new ImageRun({ data: fishboneBuf, transformation: { width: FB_W, height: FB_H }, type: "png" })],
        }),
        caption("Figure 1. Root causes of revenue leakage, grouped into People, Process, Technology & Data, Policy & Pricing, and Market & External categories, all converging on the same effect."),

        new Paragraph({ children: [new PageBreak()] }),

        // ---------------------------------------------------------------
        h1("5. Proposed Solution: A Revenue Quality & Leakage Recovery Engine"),
        body(
          "The proposed solution is a three-stage analytical pipeline — Detect, Target, Forecast — that turns "
          + "shipment-level data into an account-level action list, not just a report. Each stage is designed to "
          + "close one link in the root-cause chain above."
        ),
        h2("5.1  Detect"),
        body("Recompute the correct dimensional-weight revenue for every shipment from its length, width, and height, and compare it to what was actually billed."),
        bullet("Applies the published domestic dimensional-weight divisor (139 in³/lb)"),
        bullet("Models both the legacy and the current, tightened rounding rule, so the shift itself is visible in the data"),
        bullet("Flags the dollar gap, shipment by shipment, rather than waiting for a periodic audit"),

        h2("5.2  Target"),
        body("Roll shipment-level findings up to the account level; score every account on a blended margin-gap and leakage-share risk score, and size two concrete levers."),
        bullet("A composite risk score ranks every account, concentrating attention on the ones that are both under-margin and leaking revenue — not just one or the other"),
        bullet("Segment-level price elasticity (e.g., SME vs. mid-market vs. enterprise) sizes how much room there is to correct pricing without triggering churn"),
        bullet("Two levers per account: a no-risk billing correction (Lever A), and a capped, elasticity-aware repricing recommendation (Lever B), each sized independently"),

        h2("5.3  Forecast"),
        body("Project the leakage trend forward, and model the revenue-quality recovery curve as both levers ramp in over a multi-month rollout."),
        bullet("A trend baseline (“do nothing”) is compared against an intervention scenario"),
        bullet("The intervention scenario uses a realistic ramp curve (partial capture in month one, building toward full run-rate) rather than assuming an unrealistic overnight fix"),
        bullet("The output is a monthly recovery curve leadership can use for planning, not a single static number"),

        h2("5.4  Data & Transparency"),
        body(
          "The proof-of-concept below runs on a synthetic dataset — 60,000 shipments across 900 accounts over a "
          + "13-month window — generated to mirror publicly disclosed facts: the published dimensional-weight "
          + "divisor, the industry-reported dimensional-rounding rule change, and public earnings commentary on base "
          + "yield and revenue quality. No proprietary or confidential shipment, billing, or customer data was used "
          + "anywhere in this analysis. Every modeling assumption — the cost curve, price elasticity by segment, and "
          + "the leakage-probability model — is clearly labeled as an illustrative assumption in the underlying code, "
          + "not a claim about any carrier's actual internal economics. The purpose of the proof-of-concept is to "
          + "demonstrate the method; validating it against real shipment and billing data is the natural next step "
          + "(see Section 8)."
        ),

        // ---------------------------------------------------------------
        h1("6. Results from the Proof-of-Concept"),
        h2("6.1  Headline metrics"),
        dataTable(
          ["Metric", "Value", "Detail"],
          [
            ["Leakage identified (sample)", "$72.1K", "5.4% of sample revenue"],
            ["Leak $ / shipment, current rule", "$1.32", "+46.2% vs. the prior, looser rounding rule"],
            ["Tier-1 “act now” accounts", "135", "35.7% of total leakage dollars, from 15% of accounts"],
            ["Annualized recovery potential", "$69.6K", "Levers A + B combined, at sample scale"],
            ["6-month forecast recovery", "$12.6K", "Cumulative, under a realistic phased rollout"],
          ],
          [3800, 1800, 3760]
        ),
        new Paragraph({ spacing: { after: 240 }, children: [] }),

        h2("6.2  Where the leakage concentrates"),
        body("Leakage is concentrated in exactly the categories a dimensional-weight billing gap would predict — low-density, bulky goods."),
        dataTable(
          ["Category", "Leakage ($)", "% of category revenue"],
          [
            ["Home & Bulky", "$54,652", "11.9%"],
            ["Apparel / Soft Goods", "$13,340", "6.7%"],
            ["Electronics", "$2,071", "1.4%"],
            ["Health / Beauty", "$1,546", "2.9%"],
            ["Industrial / B2B", "$522", "0.1%"],
          ],
          [4200, 2600, 2560]
        ),
        new Paragraph({ spacing: { after: 240 }, children: [] }),

        h2("6.3  Account prioritization"),
        body("A composite risk score (blending margin gap and leakage share) ranks all 900 accounts into three action tiers."),
        dataTable(
          ["Tier", "Accounts", "Leakage ($)", "Recommended recovery ($)"],
          [
            ["Tier 1 — Act Now", "135", "$25,753", "$29,002"],
            ["Tier 2 — Monitor", "225", "$25,830", "$25,830"],
            ["Tier 3 — Healthy", "540", "$20,548", "$20,548"],
          ],
          [3200, 2000, 2100, 2060]
        ),
        new Paragraph({ spacing: { after: 240 }, children: [] }),

        h2("6.4  Sample worklist (top accounts)"),
        body("The output of the model is a ranked, actionable worklist — not just a summary chart. A sample of the top accounts by recommended recovery:"),
        dataTable(
          ["Account", "Segment", "Leakage ($)", "Sugg. price Δ", "Recovery ($)"],
          [
            ["A100172", "SME", "$1,001", "+2.7%", "$1,038"],
            ["A100620", "Mid-Market", "$914", "+4.5%", "$1,020"],
            ["A100469", "SME", "$921", "+2.5%", "$957"],
            ["A100809", "Enterprise", "$800", "+6.3%", "$934"],
            ["A100802", "Mid-Market", "$836", "+3.1%", "$883"],
          ],
          [1600, 1700, 2000, 2000, 2240]
        ),
        caption(
          "Read this row: account A100172 (SME, Home & Bulky) is under-billed by roughly $1,000 in the sample window. "
          + "A capped 2.7% price move — sized to this account's own price elasticity — plus the dimensional-weight "
          + "billing correction recovers essentially all of it, net of modeled volume risk."
        ),

        // ---------------------------------------------------------------
        h1("7. Forecast & Business Case"),
        body(
          "Under a “do nothing” baseline, monthly leakage continues to trend upward as e-commerce mix "
          + "shifts further toward low-density goods. Under the proposed intervention — billing correction plus "
          + "targeted, elasticity-capped repricing, ramped in over six months — monthly leakage is projected to fall "
          + "by roughly 44% by month six, worth a cumulative $12.6K in this sample window."
        ),
        body(
          "At real-world shipment volumes — many millions of packages a day for a major parcel carrier — this "
          + "sample is a rounding error. That is by design: the purpose of the proof-of-concept is to prove the "
          + "method (Detect → Target → Forecast) on a small, fully transparent dataset, not to size the real "
          + "opportunity. The right next step is validating this pipeline against real shipment and billing data, "
          + "where the same logic would surface the actual dollar opportunity at scale."
        ),

        // ---------------------------------------------------------------
        h1("8. From POC to Production: Implementation Roadmap"),
        dataTable(
          ["Phase", "Timeline", "Focus"],
          [
            ["1. Validate", "Days 0–30", "Replace synthetic data with a sampled extract of real shipment/billing records; recalibrate cost and elasticity assumptions with Finance and Pricing stakeholders."],
            ["2. Integrate", "Days 30–90", "Connect to the actual rating/billing systems; stand up account scorecards refreshed on a rolling basis instead of quarterly."],
            ["3. Pilot", "Days 90–180", "Automate the billing-correction lever end to end; pilot the targeted-repricing lever with an approved account cohort, tracking churn against forecast."],
            ["4. Scale", "Ongoing", "Expand to additional segments and products; document the method fully so it can be run and extended by others, not re-run as a one-off exercise."],
          ],
          [1600, 1600, 6160]
        ),
        new Paragraph({ spacing: { after: 260 }, children: [] }),

        // ---------------------------------------------------------------
        h1("9. Key Takeaways & Recommendations"),
        bullet("The problem is structural, not seasonal. Static rate cards and periodic reviews can't track fast-moving package-density mix, so low-density shipments are billed below true cost-to-serve — and the gap compounds with every rate change."),
        bullet("The method — Detect, Target, Forecast — is fully demonstrated end to end: shipment-level leakage detection, composite account risk scoring, and a forecast that fits a linear trend to the leakage baseline and layers a modeled (not fitted) intervention ramp on top — all built and run in this proof-of-concept."),
        bullet("The output is a worklist, not just a chart: a ranked, account-level list with two concrete levers and a capped, elasticity-aware price recommendation per account — something a team can act on directly."),
        bullet("The fix is inherently cross-functional. The fishbone analysis spans people, process, technology, policy, and market causes — closing the gap touches Pricing, Sales, Finance, and Operations together, not one team in isolation."),
        bullet("The recommended next step is validation on real data: a phased rollout — validate, integrate, pilot, scale — turns this proof-of-concept into a production capability."),

        // ---------------------------------------------------------------
        h1("Appendix: Methodology, Assumptions & Data Sources"),
        body(
          "This proof-of-concept uses a synthetic, illustrative dataset (60,000 shipments across 900 accounts, "
          + "spanning a 13-month window) generated to mirror publicly disclosed facts. No proprietary, confidential, "
          + "or customer data was used anywhere in this analysis. All figures in this document are directional, "
          + "meant to demonstrate an analytical method that could be applied to real shipment and billing data — not "
          + "to represent any carrier's actual financial results."
        ),
        h2("Public facts the dataset is calibrated to"),
        bullet("The published domestic dimensional-weight divisor (139 in³/lb) used by major US parcel carriers."),
        bullet("The industry-reported dimensional-weight rounding rule change (rounding every fractional inch up on all three dimensions), reported across shipping-industry trade press."),
        bullet("Public earnings-call commentary on base-yield-led revenue quality and shifting low-margin parcel volume."),
        h2("Modeling assumptions (clearly labeled, not claims about real economics)"),
        bullet("Cost-to-serve curve: a fixed handling/space cost plus a per-pound linehaul cost that scales with shipping zone."),
        bullet("Price elasticity by segment: illustrative values within the general range reported in parcel-industry pricing literature (roughly -0.2 to -0.7), more elastic for smaller accounts and less elastic for larger ones."),
        bullet("Leakage probability: a function of how large the gap is between a shipment's actual and correctly-measured billable weight, and how long it has been since an account's rate terms were last reviewed."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(__dirname, "output", "revenue_quality_problem_and_solution.docx"), buf);
  console.log("doc written");
});
