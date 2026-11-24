import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { CHALLENGE, REQUIREMENTS, EDP_STAGES, STRENGTH, SUBJECTS, STRONGEST, TRAPS, PROVENANCE } from './data.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const FONT_DIR = path.join(ROOT, 'frontend/src/assets/fonts');
const OUT_HTML = path.join(HERE, 'atlas.html');
const OUT_PDF = path.join(ROOT, 'G11S1 LO Connection Atlas.pdf');

// Natural-pigment scale, in order of increasing commitment. Ochre and olive
// are inert; anthocyanin red is the load-bearing end.
const RAMP = {
  1: '#7A6A55',
  2: '#8E9A6B',
  3: '#2E7D5B',
  4: '#3A3F9E',
  5: '#C4183C',
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function b64(file) {
  return fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');
}

function scaleBar(level, label = true) {
  // Fills left to right, so the bar reads as "how far along the scale".
  const cells = [1, 2, 3, 4, 5]
    .map((s) => `<i class="seg${s <= level ? ' on' : ''}" style="--c:${RAMP[s]}"></i>`)
    .join('');
  return `<span class="scale" role="img" aria-label="Connection strength ${level} of 5">${cells}${label ? `<b>${level}</b>` : ''}</span>`;
}

function html() {
  const allLos = SUBJECTS.flatMap((s) => s.los.map((l) => ({ ...l, subject: s.name, key: s.key })));
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: allLos.filter((l) => l.strength === n).length }));

  const subjectBlocks = SUBJECTS.map(
    (s) => `
<section class="sec">
  <div class="sec-head">
    <div class="sec-head-l">
      <span class="sec-code">${esc(s.key)}</span>
      <h2>${esc(s.name)}</h2>
    </div>
    <span class="sec-count">${s.los.length} outcome${s.los.length === 1 ? '' : 's'}</span>
  </div>
  <p class="sec-note">${esc(s.note)}</p>
  <div class="entries">
    ${s.los
      .map(
        (l) => `
    <article class="entry" style="--accent:${RAMP[l.strength]}">
      <div class="entry-head">
        <span class="lo-code">${esc(l.code)}</span>
        ${scaleBar(l.strength)}
        <span class="lo-str">${esc(STRENGTH[l.strength].label)}</span>
        <span class="lo-src lo-src--${esc(l.source)}">${esc(l.source === 'curriculum' ? 'Curriculum PDF' : l.source === 'journal' ? 'Official journal usage' : 'App practice material')}</span>
      </div>
      <blockquote class="lo-stmt">${esc(l.statement)}</blockquote>
      <p class="lo-source">${esc(l.sourceNote)}</p>
      <div class="entry-body">
        <p class="conn"><span class="conn-label">The connection</span>${esc(l.connection)}</p>
        <p class="lands"><span class="conn-label">Where it lands</span>${esc(l.lands)}</p>
      </div>
      <p class="jrnl"><span class="jrnl-tag">Journal prompt</span>${esc(l.question)}</p>
    </article>`,
      )
      .join('\n')}
  </div>
</section>`,
  ).join('\n');

  const ledgerRows = allLos
    .map(
      (l) => `<tr>
      <td class="lg-code">${esc(l.code)}</td>
      <td class="lg-str">${scaleBar(l.strength, false)}<span>${esc(STRENGTH[l.strength].label)}</span></td>
      <td class="lg-sub">${esc(l.subject)}</td>
      <td class="lg-hook">${esc(l.lands.split(';')[0].trim())}</td>
    </tr>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>G11 S1 — LO Connection Atlas · ${esc(CHALLENGE.title)}</title>
<style>
@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${b64('inter-latin.woff2')}) format("woff2")}
@font-face{font-family:"Inter";font-style:italic;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${b64('inter-italic-latin.woff2')}) format("woff2")}
@font-face{font-family:"Fraunces";font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${b64('fraunces-latin.woff2')}) format("woff2")}
@font-face{font-family:"Fraunces";font-style:italic;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${b64('fraunces-italic-latin.woff2')}) format("woff2")}

:root{
  --ground:#070D14; --sheet:#0C1620; --sheet-2:#101E2A; --line:#1B2C3B; --line-soft:#14222E;
  --ink:#E9F1F6; --ink-2:#A7BCCB; --ink-3:#6F8798;
  --accent:#34D399; --accent-deep:#0F7A55; --cyan:#5FB8D8; --warn:#E06A5A;
  --display:"Fraunces",Georgia,serif; --body:"Inter",system-ui,sans-serif;
  --mono:Consolas,"Cascadia Mono",ui-monospace,monospace;
}
*{box-sizing:border-box}
html{background:#05090E}
body{
  margin:0; background:var(--ground); color:var(--ink);
  font-family:var(--body); font-size:9.6pt; line-height:1.62; font-weight:380;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
@page{ size:A4; margin:15mm 14mm 16mm; }

.blueprint{
  position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:
    linear-gradient(rgba(95,184,216,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(95,184,216,.045) 1px, transparent 1px),
    linear-gradient(rgba(95,184,216,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(95,184,216,.022) 1px, transparent 1px);
  background-size:26mm 26mm, 26mm 26mm, 5.2mm 5.2mm, 5.2mm 5.2mm;
}
.wrap{position:relative; z-index:1}

/* ---------- cover ---------- */
.cover{min-height:247mm; display:flex; flex-direction:column; justify-content:space-between; break-after:page}
.cover-top{}
.eyebrow{
  font-family:var(--mono); font-size:7.6pt; letter-spacing:.16em; text-transform:uppercase;
  color:var(--accent); margin:0 0 7mm;
}
.cover h1{
  font-family:var(--display); font-weight:600; font-size:37pt; line-height:1.02;
  letter-spacing:-.018em; margin:0 0 5mm; color:#fff; max-width:22ch;
}
.cover h1 em{font-style:italic; color:var(--accent); font-weight:400}
.cover .lede{font-size:11.4pt; line-height:1.6; color:var(--ink-2); max-width:52ch; margin:0 0 8mm; font-weight:350}
.cover-meta{
  display:grid; grid-template-columns:repeat(3,1fr); gap:0; border-top:1px solid var(--line);
  margin-top:2mm;
}
.cover-meta div{padding:4mm 5mm 0 0; border-right:1px solid var(--line-soft)}
.cover-meta div:last-child{border-right:0}
.cover-meta .k{font-family:var(--mono); font-size:7pt; letter-spacing:.13em; text-transform:uppercase; color:var(--ink-3); display:block; margin-bottom:1.4mm}
.cover-meta .v{font-size:10pt; color:var(--ink); font-weight:500}
.cover-meta .v small{display:block; color:var(--ink-3); font-size:8.2pt; font-weight:350; margin-top:.8mm}

.legend{
  border:1px solid var(--line); border-radius:3px; background:linear-gradient(180deg, rgba(16,30,42,.9), rgba(12,22,32,.72));
  padding:5.5mm 6mm;
}
.legend h3{margin:0 0 4mm; font-family:var(--mono); font-size:7.6pt; letter-spacing:.15em; text-transform:uppercase; color:var(--ink-3); font-weight:500}
.legend-row{display:grid; grid-template-columns:19mm 30mm 1fr; gap:4mm; align-items:center; padding:2.1mm 0; border-top:1px solid var(--line-soft)}
.legend-row:first-of-type{border-top:0}
.legend-row .lbl{font-size:8.8pt; font-weight:560; color:var(--ink); line-height:1.3}
.legend-row .bar{white-space:nowrap}

/* ---------- scale widget ---------- */
.scale{display:inline-flex; align-items:center; gap:1.4mm; vertical-align:middle}
.scale .seg{width:3.4mm; height:3.4mm; border-radius:.6mm; background:transparent; border:1px solid var(--line); display:inline-block}
.scale .seg.on{background:var(--c); border-color:var(--c)}
.scale b{font-family:var(--mono); font-size:7.6pt; color:var(--ink-3); margin-left:1mm; font-weight:500}
.lg-str .scale{margin-right:2mm}

/* ---------- structure ---------- */
h2.sec-title{
  font-family:var(--display); font-weight:600; font-size:20pt; letter-spacing:-.012em;
  margin:0 0 3mm; color:#fff;
}
h3.sub-title{
  font-family:var(--display); font-weight:600; font-size:12.6pt; margin:0 0 2.4mm; color:#fff;
}
p{margin:0 0 2.4mm}
.sec{break-before:page}
.sec-head{display:flex; align-items:baseline; justify-content:space-between; gap:6mm; border-bottom:1.4px solid var(--accent); padding-bottom:2.6mm; margin-bottom:4mm}
.sec-head-l{display:flex; align-items:baseline; gap:4mm}
.sec-code{font-family:var(--mono); font-size:9pt; color:var(--accent); letter-spacing:.1em}
.sec-head h2{margin:0; font-family:var(--display); font-weight:600; font-size:22pt; letter-spacing:-.014em; color:#fff}
.sec-count{font-family:var(--mono); font-size:7.4pt; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3)}
.sec-note{
  font-size:9.4pt; line-height:1.66; color:var(--ink-2); max-width:78ch; margin:0 0 5.5mm;
  border-left:2px solid var(--accent-deep); padding-left:4mm; font-weight:340;
}

/* ---------- entries ---------- */
.entries{display:flex; flex-direction:column; gap:4.6mm}
.entry{
  border:1px solid var(--line); border-left:2.4px solid var(--accent);
  background:linear-gradient(180deg, rgba(16,30,42,.82), rgba(12,22,32,.62));
  border-radius:3px; padding:4.4mm 5mm 4.2mm; break-inside:avoid; page-break-inside:avoid;
}
.entry-head{display:flex; align-items:center; gap:3.4mm; flex-wrap:wrap; margin-bottom:2.6mm}
.lo-code{font-family:var(--mono); font-size:11pt; font-weight:700; color:#fff; letter-spacing:.01em}
.lo-str{font-size:8.6pt; color:var(--ink-2); font-weight:520}
.lo-src{
  margin-left:auto; font-family:var(--mono); font-size:6.9pt; letter-spacing:.1em; text-transform:uppercase;
  padding:.9mm 2.2mm; border-radius:2px; border:1px solid var(--line); color:var(--ink-3);
}
.lo-src--curriculum{color:#7FD3A8; border-color:rgba(52,211,153,.3)}
.lo-src--journal{color:#8CC7E4; border-color:rgba(95,184,216,.32)}
.lo-src--project{color:#D9A05B; border-color:rgba(217,160,91,.32)}
.lo-stmt{
  margin:0 0 1.6mm; padding:0 0 0 3.4mm; border-left:1.6px solid var(--line);
  font-family:var(--display); font-style:italic; font-weight:400; font-size:10.2pt; line-height:1.5; color:var(--ink);
}
.lo-source{font-family:var(--mono); font-size:7pt; color:var(--ink-3); margin:0 0 3mm; letter-spacing:.04em}
.entry-body{margin-bottom:3mm}
.conn, .lands{margin:0 0 2.2mm; font-size:9.3pt; line-height:1.62; color:var(--ink-2); max-width:88ch}
.conn-label{
  display:block; font-family:var(--mono); font-size:6.9pt; letter-spacing:.13em; text-transform:uppercase;
  color:var(--accent); margin-bottom:1.1mm;
}
.lands{color:var(--ink-3)}
.lands .conn-label{color:var(--ink-3)}
.jrnl{
  margin:0; padding:2.6mm 3.2mm; background:rgba(52,211,153,.06);
  border:1px solid rgba(52,211,153,.16); border-radius:2px;
  font-size:9pt; line-height:1.58; color:var(--ink); font-style:italic;
}
.jrnl-tag{
  display:block; font-family:var(--mono); font-style:normal; font-size:6.9pt; letter-spacing:.13em;
  text-transform:uppercase; color:var(--accent); margin-bottom:1mm;
}

/* ---------- ledger table ---------- */
.ledger{width:100%; border-collapse:collapse; font-size:8.6pt; margin-top:2mm}
.ledger th{
  text-align:left; font-family:var(--mono); font-size:6.9pt; letter-spacing:.13em; text-transform:uppercase;
  color:var(--ink-3); font-weight:500; padding:0 3mm 2mm 0; border-bottom:1px solid var(--line);
}
.ledger td{padding:1.9mm 3mm 1.9mm 0; border-bottom:1px solid var(--line-soft); vertical-align:middle}
.lg-code{font-family:var(--mono); font-weight:700; color:#fff; width:21mm; font-size:9pt}
.lg-str{width:50mm; color:var(--ink-2); font-size:8pt; white-space:nowrap; display:flex; align-items:center; gap:2.4mm; padding-right:4mm; box-sizing:content-box}
.lg-sub{width:26mm; color:var(--ink-3); font-size:8pt; padding-right:4mm; box-sizing:content-box}
.lg-hook{color:var(--ink-2); line-height:1.45}

/* ---------- brief ---------- */
.req{border:1px solid var(--line); border-radius:3px; background:rgba(12,22,32,.6); padding:3.6mm 4mm; margin-bottom:3mm; break-inside:avoid}
.req h4{margin:0 0 2mm; font-family:var(--display); font-size:11.2pt; font-weight:600; color:#fff; display:flex; gap:3mm; align-items:baseline}
.req h4 .rid{font-family:var(--mono); font-size:8pt; color:var(--accent); letter-spacing:.1em}
.req ul{margin:0; padding-left:4.4mm}
.req li{font-size:8.9pt; line-height:1.55; color:var(--ink-2); margin-bottom:1.2mm}
.two{display:grid; grid-template-columns:1fr 1fr; gap:0 7mm}
.stages{columns:2; column-gap:7mm; font-size:8.6pt; color:var(--ink-2)}
.stages li{break-inside:avoid; margin-bottom:1.3mm}
.stages .n{font-family:var(--mono); color:var(--accent); font-size:7.6pt}

/* ---------- strongest ---------- */
.rank{display:flex; flex-direction:column; gap:2.6mm; margin-top:2mm}
.rank-row{display:grid; grid-template-columns:26mm 1fr; gap:4.4mm; align-items:start; padding:2.8mm 0; border-top:1px solid var(--line-soft); break-inside:avoid}
.rank-row .code{font-family:var(--mono); font-size:10.4pt; font-weight:700; color:#fff}
.rank-row .code span{display:block; font-size:6.9pt; letter-spacing:.11em; text-transform:uppercase; color:var(--ink-3); margin-top:1mm; font-weight:400}
.rank-row p{margin:0; font-size:9.1pt; line-height:1.58; color:var(--ink-2); max-width:80ch}

/* ---------- traps ---------- */
.trap{border:1px solid var(--line); border-left:2.4px solid var(--warn); border-radius:3px; padding:3.4mm 4mm; margin-bottom:3mm; background:rgba(224,106,90,.045); break-inside:avoid}
.trap h4{margin:0 0 1.6mm; font-family:var(--display); font-size:11pt; font-weight:600; color:#fff}
.trap p{margin:0; font-size:9.1pt; line-height:1.6; color:var(--ink-2)}

/* ---------- provenance ---------- */
.prov{width:100%; border-collapse:collapse; font-size:8.3pt; margin-top:2mm}
.prov th{text-align:left; font-family:var(--mono); font-size:6.9pt; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); font-weight:500; padding:0 3mm 1.8mm 0; border-bottom:1px solid var(--line)}
.prov td{padding:2mm 3mm 2mm 0; border-bottom:1px solid var(--line-soft); vertical-align:top; line-height:1.5}
.prov .p-sub{color:#fff; font-weight:540; white-space:nowrap}
.prov .p-doc{font-family:var(--mono); font-size:7.4pt; color:var(--ink-2)}
.prov .p-how{color:var(--ink-3)}

.foot-note{
  margin-top:5mm; padding-top:3mm; border-top:1px solid var(--line);
  font-size:8.2pt; line-height:1.55; color:var(--ink-3);
}
.tally{display:flex; gap:5mm; flex-wrap:wrap; margin:3mm 0 4mm}
.tally .t{border:1px solid var(--line); border-radius:3px; padding:2.6mm 3.4mm; min-width:26mm}
.tally .t b{font-family:var(--display); font-size:19pt; font-weight:600; display:block; line-height:1}
.tally .t span{font-family:var(--mono); font-size:6.9pt; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-3); display:block; margin-top:1.4mm}
</style></head>
<body>
<div class="blueprint"></div>
<div class="wrap">

  <!-- COVER -->
  <section class="cover">
    <div class="cover-top">
      <p class="eyebrow">Grade 11 · Semester 1 · ${esc(CHALLENGE.year)}</p>
      <h1>Which learning outcomes <em>actually</em> carry the capstone?</h1>
      <p class="lede">Every Grade 11 Semester 1 learning outcome, traced to the place inside the <strong style="color:var(--ink);font-weight:520">${esc(CHALLENGE.title)}</strong> challenge where it does real work — and an honest verdict on the ones that do not. A connection counts here only if it changes a measurement, a design decision, or a piece of evidence.</p>

      <div class="cover-meta">
        <div>
          <span class="k">The challenge</span>
          <span class="v">${esc(CHALLENGE.title)}<small>${esc(CHALLENGE.subtitle)}</small></span>
        </div>
        <div>
          <span class="k">Outcomes mapped</span>
          <span class="v">${allLos.length}<small>across ${SUBJECTS.length} subjects</small></span>
        </div>
        <div>
          <span class="k">Verdicts</span>
          <span class="v">${counts.filter((c) => c.n > 0).length} grades<small>${counts[0].c} load-bearing · ${counts[1].c} strong · ${counts[2].c} method · ${counts[3].c} context · ${counts[4].c} do not claim</small></span>
        </div>
      </div>
    </div>

    <div class="legend">
      <h3>How a connection is graded</h3>
      ${[5, 4, 3, 2, 1]
        .map(
          (n) => `<div class="legend-row">
        <span class="bar">${scaleBar(n, false)}</span>
        <span class="lbl">${esc(STRENGTH[n].label)}</span>
        <span style="font-size:8.4pt;color:var(--ink-2);line-height:1.5">${esc(STRENGTH[n].blurb)}</span>
      </div>`,
        )
        .join('\n')}
    </div>
  </section>

  <!-- HOW TO READ -->
  <section class="sec">
    <div class="sec-head"><div class="sec-head-l"><span class="sec-code">§</span><h2>How to read a connection</h2></div><span class="sec-count">Method</span></div>
    <p class="sec-note">A learning outcome does not “relate” to a project because the words overlap. It relates when the outcome supplies a mechanism, a method or a constraint that changes something you build, measure or claim. Each entry below is graded on that standard, and each one ends at a named artefact — a reading, a graph, a table, a rule, a closure, a safety decision.</p>

    <div class="tally">
      ${counts.map((c) => `<div class="t"><b style="color:${RAMP[c.n]}">${c.c}</b><span>${esc(STRENGTH[c.n].label)}</span></div>`).join('')}
    </div>

    <div class="two">
      <div>
        <h3 class="sub-title">The five questions every claim must survive</h3>
        <ol style="font-size:9pt;line-height:1.6;color:var(--ink-2);margin:0 0 4mm;padding-left:5mm">
          <li style="margin-bottom:1.8mm"><strong style="color:var(--ink)">Mechanism.</strong> Name the physical, chemical, biological or mathematical process. Not the topic — the process.</li>
          <li style="margin-bottom:1.8mm"><strong style="color:var(--ink)">Lever.</strong> State what you changed: a concentration, a rate, a thickness, a variable, a rule.</li>
          <li style="margin-bottom:1.8mm"><strong style="color:var(--ink)">Artefact.</strong> State the reading, graph, table, decision or piece of evidence that came out of it.</li>
          <li style="margin-bottom:1.8mm"><strong style="color:var(--ink)">Boundary.</strong> State what the outcome does <em>not</em> license you to claim. The challenge’s safety brief demands exactly this.</li>
          <li><strong style="color:var(--ink)">Exchange test.</strong> If the food were replaced with a battery, would the sentence still be true? If yes, it is a label, not a connection.</li>
        </ol>
      </div>
      <div>
        <h3 class="sub-title">Sources and honesty rules</h3>
        <p style="font-size:9pt;line-height:1.6;color:var(--ink-2)">Every outcome statement in this atlas was read out of a document in the project folder, never reconstructed from memory. Where a curriculum PDF exists, the statement is quoted from it and the page is named. Where none exists — Computer Science and English — the description is rebuilt from how the official Grade 11 Semester 1 journals actually use that outcome, and the entry says so on its face.</p>
        <p style="font-size:9pt;line-height:1.6;color:var(--ink-2)">The challenge brief itself is quoted from the live challenge record, so the “where it lands” column points at real requirements, real measurement times and the real safety constraints — including the ones most teams treat as decoration.</p>
        <p style="font-size:9pt;line-height:1.6;color:var(--ink-2);margin-bottom:0">Strength is a judgement, and a judgement can be argued with. Where the connection is weak, the entry says so and explains what would have to be true to strengthen it. That is the point of the exercise.</p>
      </div>
    </div>
  </section>

  <!-- BRIEF -->
  <section class="sec">
    <div class="sec-head"><div class="sec-head-l"><span class="sec-code">§</span><h2>The challenge, in one place</h2></div><span class="sec-count">${esc(CHALLENGE.school)}</span></div>
    <p class="sec-note">Connections are only as good as the target they point at. These are the actual requirements of the Grade 11 Semester 1 challenge, so every verdict in this atlas is measured against something real rather than a summary of one.</p>

    <div class="two">
      <div>
        ${REQUIREMENTS.map(
          (r) => `<div class="req">
          <h4><span class="rid">${esc(r.id)}</span>${esc(r.label)}</h4>
          <ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        </div>`,
        ).join('\n')}
      </div>
      <div>
        <h3 class="sub-title">The twelve design stages</h3>
        <ol class="stages" style="padding-left:5mm;margin:0 0 5mm">
          ${EDP_STAGES.map((s, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span> ${esc(s)}</li>`).join('')}
        </ol>
        <div class="req">
          <h4><span class="rid">↳</span>What the brief quietly demands</h4>
          <ul>
            <li><strong style="color:var(--ink)">A number for “adequate structural integrity.”</strong> The brief uses the phrase and never defines it. One outcome in this atlas gives you a way to define it and defend the threshold.</li>
            <li><strong style="color:var(--ink)">A sample budget nobody counted.</strong> “Use separate matched samples for destructive measurements” plus three conditions, two indicators and six time points produces a number of physical samples well above what most teams prepare.</li>
            <li><strong style="color:var(--ink)">A calibration for the indicator itself.</strong> A colour scale has false positives and false negatives, and the safety brief forbids the indicator from certifying safety — so the confidence of the claim has to be argued from data, not asserted.</li>
            <li><strong style="color:var(--ink)">A ceiling on the design.</strong> There is a point where another layer stops buying protection, and knowing it is what separates an optimal prototype from a merely thick one.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- LEDGER -->
  <section class="sec">
    <div class="sec-head"><div class="sec-head-l"><span class="sec-code">§</span><h2>The ledger</h2></div><span class="sec-count">All ${allLos.length} outcomes at a glance</span></div>
    <p class="sec-note">Sorted by subject, in curriculum order. Read the strength strip first, then the hook. The full reasoning follows in the subject sections.</p>
    <table class="ledger">
      <thead><tr><th>Outcome</th><th>Strength</th><th>Subject</th><th>Where it lands</th></tr></thead>
      <tbody>${ledgerRows}</tbody>
    </table>
  </section>

  ${subjectBlocks}

  <!-- STRONGEST -->
  <section class="sec">
    <div class="sec-head"><div class="sec-head-l"><span class="sec-code">§</span><h2>Where the connections are strongest</h2></div><span class="sec-count">If you revise one thing</span></div>
    <p class="sec-note">If a team rebuilds its journal around six outcomes, these are the six that turn a good description into a defensible piece of work — because each one produces a number, a limit or a rule that a reviewer can check.</p>
    <div class="rank">
      ${STRONGEST.map(
        (s) => `<div class="rank-row">
        <span class="code">${esc(s.code)}<span>load-bearing</span></span>
        <p>${esc(s.why)}</p>
      </div>`,
      ).join('\n')}
    </div>
  </section>

  <!-- TRAPS -->
  <section class="sec">
    <div class="sec-head"><div class="sec-head-l"><span class="sec-code">§</span><h2>Five ways to fake a connection</h2></div><span class="sec-count">Read before you write</span></div>
    <p class="sec-note">Most weak journal answers are not wrong about the subject. They are weak because the subject is decorative. These are the specific failure modes this atlas was built to catch — including one that appears in the official journal itself.</p>
    ${TRAPS.map((t) => `<div class="trap"><h4>${esc(t.title)}</h4><p>${esc(t.body)}</p></div>`).join('\n')}
  </section>

  <!-- PROVENANCE -->
  <section class="sec">
    <div class="sec-head"><div class="sec-head-l"><span class="sec-code">§</span><h2>Provenance</h2></div><span class="sec-count">Where every statement came from</span></div>
    <p class="sec-note">Every outcome statement in this document was extracted from a file in the project folder. PDF extraction artefacts were cleaned; no subject content was invented. The method for each extraction is stated so that any claim here can be checked against the source.</p>
    <table class="prov">
      <thead><tr><th>Subject</th><th>Source document</th><th>Extraction method</th></tr></thead>
      <tbody>
        ${PROVENANCE.map(
          (p) => `<tr><td class="p-sub">${esc(p.subject)}</td><td class="p-doc">${esc(p.doc)}</td><td class="p-how">${esc(p.how)}</td></tr>`,
        ).join('\n')}
      </tbody>
    </table>
    <p class="foot-note">Challenge requirements quoted from the live G11 S1 ${esc(CHALLENGE.year)} challenge record. Strength grades are this document’s analysis, not an official rubric, and are open to argument — a teacher who disagrees with a grade can say precisely which of the five questions in §1 the answer failed.</p>
  </section>

</div>
</body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
fs.writeFileSync(OUT_HTML, html());
await page.goto('file:///' + OUT_HTML.replace(/\\/g, '/'), { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: OUT_PDF,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: `<div style="width:100%;padding:0 14mm;font-size:6.8pt;color:#5f7382;font-family:Consolas,monospace;letter-spacing:.08em;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:.4px solid #1b2c3b;padding-bottom:2mm;width:100%;">
      <span>G11 S1 · LEARNING OUTCOME CONNECTION ATLAS</span>
      <span>SMART SUSTAINABLE FOOD PACKAGING · 2026–2027</span>
    </div>
  </div>`,
  footerTemplate: `<div style="width:100%;padding:0 14mm;font-size:6.8pt;color:#5f7382;font-family:Consolas,monospace;">
    <div style="display:flex;justify-content:space-between;border-top:.4px solid #1b2c3b;padding-top:2mm;width:100%;">
      <span>S'28 STEM GHARBIYA · STEM JOURNAL PRACTICE</span>
      <span>PAGE <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  </div>`,
  margin: { top: '18mm', bottom: '16mm', left: '14mm', right: '14mm' },
});
await browser.close();
console.log('wrote', OUT_PDF, fs.statSync(OUT_PDF).size, 'bytes');
