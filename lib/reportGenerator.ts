import jsPDF from "jspdf";
import type { QuizQuestion, UserAnswer } from "./types";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bgDeep:   [10,  3,  25] as [number,number,number],
  bgMid:    [28,  8,  60] as [number,number,number],
  bgCard:   [22,  6,  48] as [number,number,number],
  purple:   [124, 58, 237] as [number,number,number],
  violet:   [167,139,250] as [number,number,number],
  pink:     [244,114,182] as [number,number,number],
  coral:    [248,113,113] as [number,number,number],
  green:    [ 52,211,153] as [number,number,number],
  yellow:   [251,191, 36] as [number,number,number],
  white:    [255,255,255] as [number,number,number],
  white60:  [180,160,220] as [number,number,number],
  white30:  [120,100,160] as [number,number,number],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function bg(doc: jsPDF) {
  const W = 210, H = 297, steps = 30;
  const [r1,g1,b1] = C.bgDeep;
  const [r2,g2,b2] = C.bgMid;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    doc.setFillColor(
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t)
    );
    doc.rect(0, (i * H) / steps, W, H / steps + 0.5, "F");
  }
}

function accentBar(doc: jsPDF, colors: [number,number,number][]) {
  const W = 210, segW = W / colors.length;
  colors.forEach(([r,g,b], i) => {
    doc.setFillColor(r, g, b);
    doc.rect(i * segW, 0, segW + 0.5, 3, "F");
  });
}

function card(doc: jsPDF, x: number, y: number, w: number, h: number, accentColor?: [number,number,number]) {
  doc.setFillColor(...C.bgCard);
  doc.roundedRect(x, y, w, h, 4, 4, "F");
  if (accentColor) {
    doc.setFillColor(...accentColor);
    doc.roundedRect(x, y, w, 2, 1, 1, "F");
  }
}

function scoreColor(pct: number): [number,number,number] {
  if (pct >= 70) return C.green;
  if (pct >= 50) return C.yellow;
  return C.coral;
}

async function fetchImage(question: string): Promise<string | null> {
  try {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const { imageUrl } = await res.json();
    return imageUrl ?? null;
  } catch {
    return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateQuizReport(
  score: number,
  total: number,
  questions: QuizQuestion[],
  answers: UserAnswer[],
  onProgress?: (msg: string) => void
): Promise<void> {
  const W = 210;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade =
    pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D";
  const sc = scoreColor(pct);
  const wrong = answers.filter((a) => !a.isCorrect);
  const correct = answers.filter((a) => a.isCorrect);

  // ── Fetch images for focus areas (max 4) ──────────────────────────────────
  const focusImages: Record<number, string | null> = {};
  if (wrong.length > 0) {
    onProgress?.("Generating illustrations for focus areas…");
    await Promise.all(
      wrong.slice(0, 4).map(async (a) => {
        const q = questions[a.questionIndex];
        if (q) focusImages[a.questionIndex] = await fetchImage(q.question);
      })
    );
  }

  onProgress?.("Building PDF…");
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  // ══════════════════════════════════════════════════════════════════════════
  //  PAGE 1 — Score summary
  // ══════════════════════════════════════════════════════════════════════════
  bg(doc);
  accentBar(doc, [C.purple, C.pink, C.coral]);

  // ── Logo / title ──────────────────────────────────────────────────────────
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("🧠 QuizWiz", W / 2, 24, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.violet);
  doc.text("Performance Report", W / 2, 32, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(...C.white30);
  doc.text(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    W / 2,
    39,
    { align: "center" }
  );

  // ── Score ring ────────────────────────────────────────────────────────────
  const cx = W / 2, cy = 74, R = 26;
  // Outer glow
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.setGState(doc.GState({ opacity: 0.15 }));
  doc.circle(cx, cy, R + 5, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  // Ring fill
  doc.setFillColor(...C.bgCard);
  doc.circle(cx, cy, R, "F");
  // Ring stroke
  doc.setDrawColor(...sc);
  doc.setLineWidth(2.5);
  doc.circle(cx, cy, R, "S");

  // Score numbers
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${score}/${total}`, cx, cy - 3, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...sc);
  doc.text(`${pct}%`, cx, cy + 8, { align: "center" });

  // Grade badge
  doc.setFillColor(...sc);
  doc.roundedRect(cx - 9, cy + 16, 18, 9, 3, 3, "F");
  doc.setTextColor(...C.bgDeep);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(grade, cx, cy + 22, { align: "center" });

  // ── Stat cards row ────────────────────────────────────────────────────────
  const statsY = 116;
  const items = [
    { label: "Correct",  value: String(correct.length), color: C.green  },
    { label: "Wrong",    value: String(wrong.length),   color: C.coral  },
    { label: "Total Qs", value: String(total),           color: C.violet },
    { label: "Score",    value: `${pct}%`,               color: C.pink   },
  ];
  const cw = 40, gap = 6;
  const rowStart = (W - (items.length * cw + (items.length - 1) * gap)) / 2;

  items.forEach(({ label, value, color }, i) => {
    const x = rowStart + i * (cw + gap);
    card(doc, x, statsY, cw, 26, color);
    doc.setTextColor(...C.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(value, x + cw / 2, statsY + 14, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.white60);
    doc.text(label, x + cw / 2, statsY + 22, { align: "center" });
  });

  // ── Question breakdown ────────────────────────────────────────────────────
  const brkY = 155;
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Question Breakdown", 18, brkY);
  doc.setFillColor(...C.purple);
  doc.rect(18, brkY + 3, 36, 0.8, "F");

  let qy = brkY + 12;
  const ROW_H = 11;
  const SHOW = Math.min(questions.length, 10);

  for (let i = 0; i < SHOW; i++) {
    const ans = answers[i];
    const ok = ans?.isCorrect ?? false;
    const rowColor = ok ? C.green : C.coral;

    // Row bg
    doc.setFillColor(...C.bgCard);
    doc.roundedRect(18, qy - 3, W - 36, ROW_H, 2, 2, "F");
    // Left dot
    doc.setFillColor(...rowColor);
    doc.circle(24, qy + 2, 1.5, "F");
    // Question text
    doc.setTextColor(...C.white);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const truncQ = questions[i].question.length > 72
      ? questions[i].question.slice(0, 72) + "…"
      : questions[i].question;
    doc.text(truncQ, 29, qy + 3);
    // Status badge
    const badgeLabel = ok ? "✓ Correct" : "✗ Wrong";
    doc.setTextColor(...rowColor);
    doc.setFontSize(6.5);
    doc.text(badgeLabel, W - 20, qy + 3, { align: "right" });

    qy += ROW_H + 1;
  }

  if (questions.length > SHOW) {
    doc.setTextColor(...C.white30);
    doc.setFontSize(7);
    doc.text(`+ ${questions.length - SHOW} more questions`, W / 2, qy + 2, { align: "center" });
  }

  // ── Page footer ───────────────────────────────────────────────────────────
  const addFooter = (d: jsPDF, pageNum: number, total: number) => {
    d.setFillColor(...C.purple);
    d.rect(0, 291, W, 6, "F");
    d.setTextColor(...C.white);
    d.setFontSize(6.5);
    d.setFont("helvetica", "normal");
    d.text("Generated by QuizWiz", 10, 295.5);
    d.text(`Page ${pageNum} of ${total}`, W - 10, 295.5, { align: "right" });
  };

  const totalPages = wrong.length > 0 ? 1 + Math.ceil(wrong.slice(0, 6).length / 2) : 1;
  addFooter(doc, 1, totalPages);

  // ══════════════════════════════════════════════════════════════════════════
  //  PAGE 2+ — Focus areas (two cards per page)
  // ══════════════════════════════════════════════════════════════════════════
  if (wrong.length > 0) {
    const focusItems = wrong.slice(0, 6);
    let pageCount = 1;

    for (let fi = 0; fi < focusItems.length; fi += 2) {
      doc.addPage();
      pageCount++;
      bg(doc);
      accentBar(doc, [C.coral, C.pink, C.purple]);

      // Section title
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Areas to Focus On", W / 2, 22, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.violet);
      doc.text(
        `Review these questions to improve your understanding`,
        W / 2, 30, { align: "center" }
      );

      // Two focus cards per page
      const cardSlots = [42, 166];

      for (let slot = 0; slot < 2 && fi + slot < focusItems.length; slot++) {
        const wa = focusItems[fi + slot];
        const q = questions[wa.questionIndex];
        if (!q) continue;

        const cardY = cardSlots[slot];
        const CARD_H = 118;
        const IMG_W = 58, IMG_H = 46;

        // Card background
        doc.setFillColor(...C.bgCard);
        doc.roundedRect(12, cardY, W - 24, CARD_H, 5, 5, "F");
        // Left accent bar
        doc.setFillColor(...C.coral);
        doc.roundedRect(12, cardY, 3, CARD_H, 2, 2, "F");

        // Question number chip
        doc.setFillColor(...C.coral);
        doc.roundedRect(20, cardY + 7, 22, 7, 2, 2, "F");
        doc.setTextColor(...C.bgDeep);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.text(`Q ${wa.questionIndex + 1}`, 31, cardY + 12, { align: "center" });

        // ── Image ──────────────────────────────────────────────────────────
        const img = focusImages[wa.questionIndex];
        if (img) {
          try {
            // Image on right side
            doc.setFillColor(...C.bgDeep);
            doc.roundedRect(W - 24 - IMG_W, cardY + 6, IMG_W, IMG_H, 3, 3, "F");
            doc.addImage(img, "PNG", W - 24 - IMG_W + 1, cardY + 7, IMG_W - 2, IMG_H - 2);
          } catch {
            // Skip image silently
          }
        }

        // Question text
        const maxQW = img ? W - 24 - 20 - IMG_W - 8 : W - 44;
        doc.setTextColor(...C.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        const qLines = doc.splitTextToSize(q.question, maxQW);
        doc.text(qLines.slice(0, 3), 20, cardY + 22);

        // ── Answers block ──────────────────────────────────────────────────
        const ansY = cardY + (qLines.length > 1 ? 38 + (qLines.length - 1) * 4 : 36);

        // Your answer (wrong)
        doc.setFillColor(50, 10, 10);
        doc.roundedRect(20, ansY, 82, 16, 2, 2, "F");
        doc.setFillColor(...C.coral);
        doc.rect(20, ansY, 1.5, 16, "F");
        doc.setTextColor(...C.coral);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.text("YOUR ANSWER", 25, ansY + 5);
        doc.setTextColor(...C.white);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const yourA = (wa.selectedAnswer || "No answer").slice(0, 40);
        doc.text(yourA, 25, ansY + 12);

        // Correct answer
        doc.setFillColor(8, 40, 25);
        doc.roundedRect(20, ansY + 20, 82, 16, 2, 2, "F");
        doc.setFillColor(...C.green);
        doc.rect(20, ansY + 20, 1.5, 16, "F");
        doc.setTextColor(...C.green);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.text("CORRECT ANSWER", 25, ansY + 25);
        doc.setTextColor(...C.white);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const corrA = q.correctAnswer.slice(0, 40);
        doc.text(corrA, 25, ansY + 32);

        // Explanation
        if (q.explanation) {
          doc.setFillColor(20, 10, 45);
          doc.roundedRect(20, ansY + 40, W - 44, 20, 2, 2, "F");
          doc.setTextColor(...C.violet);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6);
          doc.text("💡 EXPLANATION", 25, ansY + 46);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C.white60);
          doc.setFontSize(7);
          const expLines = doc.splitTextToSize(q.explanation, W - 52);
          doc.text(expLines.slice(0, 2), 25, ansY + 53);
        }
      }

      addFooter(doc, pageCount, totalPages);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`QuizWiz-Report-${dateStr}.pdf`);
}
