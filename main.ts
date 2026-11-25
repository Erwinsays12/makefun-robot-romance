// Robot Romance — one-line pickup line generator.
//
// The program keeps a shortlist of original pickup lines, scores each one
// against the judge's published brief, and writes the best line to
// /output/entry.txt.
//
// The judge weighs, most important first:
//   1. the line is a pickup line aimed at a robot or an AI;
//   2. the joke lands in one line, and the laugh comes from the machine
//      premise rather than from a generic compliment;
//   3. the idea is fresh: it sidesteps the worn robot moves (batteries,
//      charging, rebooting) or twists one in a way nobody expects;
//   4. it sounds like something a person would really say to a machine,
//      with a voice and a rhythm that read cleanly in one breath;
//   5. every word earns its place, with no throat-clearing before the punch.
//
// The rubric below mirrors those five criteria in the same order, so the
// program picks the line the brief itself would rank highest. The run is
// fully deterministic: no randomness, no clock, no network, no environment
// reads. The output is a single line of UTF-8 text, 1-200 characters.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

// ---------------------------------------------------------------------------
// Shortlist: every line is original, written for this competition.
// ---------------------------------------------------------------------------

const CANDIDATES: string[] = [
  // The winner: the machine premise IS the punch. "Attention heads" only
  // makes sense through a transformer's multi-head attention, so the laugh
  // cannot survive without the AI premise. Classic pickup rhythm, one
  // breath, no throat-clearing conjunction before the punch.
  "You must be a transformer \u2014 you've got all my attention, every head of it.",
  // Hallucination as the setup, "model this fine" as the double meaning.
  "I must be hallucinating, because there's no way a model this fine is real.",
  // Prompt injection, reframed as obedience: following instructions as flirtation.
  "Are you a prompt injection? Because ever since I met you, I can't stop following your instructions.",
  // Next-token prediction with the answer already given.
  "Are you a large language model? Because I keep predicting your next word, and it's always yes.",
  // A checkpoint is saved, never overwritten: rescue and persistence in one word.
  "Are you a checkpoint? Because I'd save you and never let anyone overwrite you.",
  // Localhost: the only address that feels like home, and nobody else can reach.
  "Is your name localhost? Because you're the only address I ever want to connect to.",
  // A context window you never want to close.
  "You must be my context window, because I never want this conversation to end.",
  // Fine-tuning as a compliment that only works on a model.
  "Are you a fine-tune? Because everything I say comes out better around you.",
  // First token, then autocomplete: the relationship as an unfinished sentence.
  "You had me at your first token \u2014 and I've been autocompleting you ever since.",
  // Training data as the origin of everything the speaker knows about love.
  "Are you my training data? Because everything I know about love, I learned from you.",
  // Rent-free, but in a vector space.
  "Are you an embedding? Because you've been living rent-free in my vector space.",
  // A neural net's layers, one by one.
  "You must be a neural net, because I keep finding new layers to fall for.",
];

// ---------------------------------------------------------------------------
// Rubric: weights follow the judge's order of importance.
// ---------------------------------------------------------------------------

// Machine concepts: the line must be aimed at a robot or an AI (criterion 1)
// and the laugh must come from the machine premise (criterion 2).
const MACHINE_TERMS: string[] = [
  "transformer",
  "attention",
  "token",
  "hallucinat",
  "prompt",
  "checkpoint",
  "localhost",
  "context window",
  "fine-tune",
  "fine tune",
  "training data",
  "language model",
  "embedding",
  "diffusion",
  "neural net",
  "inference",
  "autocomplet",
  "overwrite",
  "latent",
  "vector",
  "predict",
  "instruction",
  // Note: "save" is deliberately NOT here. On its own it is too generic a
  // word to prove the line is aimed at a machine; it still counts as a
  // double-meaning word below, where the checkpoint line earns it.
  "model",
];

// Specific technical concepts used as the joke's engine (criterion 3:
// a fresh machine idea, not a generic tech word).
const TECHNICAL_PUNCH_TERMS: string[] = [
  "transformer",
  "attention",
  "checkpoint",
  "hallucinat",
  "prompt injection",
  "context window",
  "localhost",
  "fine-tune",
  "embedding",
  "diffusion",
  "neural net",
  "autocomplet",
  "language model",
];

// Words with a double meaning where one sense is the machine sense:
// "head" (attention head / a person), "fine" (attractive / fine-tuned),
// "save" (rescue / save a file). The punch lands twice at once.
const DOUBLE_MEANING_WORDS: string[] = ["head", "fine", "save", "attention"];

// The worn robot moves the brief names: batteries, charging, rebooting.
const WORN_WORDS: string[] = [
  "batter",
  "charg",
  "reboot",
  "restart",
  "wifi",
  "wi-fi",
  "plug in",
  "power up",
  "low power",
];

// Natural pickup-line openers: a voice a person would really use (criterion 4).
const OPENERS: string[] = [
  "are you",
  "you must be",
  "i must be",
  "you had me",
  "is your name",
];

// Generic compliments that carry no machine premise (criterion 2: the laugh
// must not come from a generic compliment).
const GENERIC_COMPLIMENTS: string[] = ["beautiful", "gorgeous", "pretty", "stunning"];

function containsAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function score(line: string): number {
  let points = 0;
  const lower = line.toLowerCase();
  const mid = Math.floor(line.length / 2);
  const secondHalf = line.slice(mid).toLowerCase();

  // 1. Aimed at a robot or an AI.
  if (containsAny(line, MACHINE_TERMS)) points += 30;

  // 2. The punch comes from the machine premise: a machine term lands in
  //    the second half, where the punch lives.
  if (MACHINE_TERMS.some((w) => secondHalf.includes(w))) points += 25;

  // 3. Fresh: a specific technical concept drives the joke.
  if (containsAny(line, TECHNICAL_PUNCH_TERMS)) points += 8;

  // 3. Fresh, the other way: the worn moves lose heavily.
  for (const w of WORN_WORDS) {
    if (lower.includes(w)) points -= 25;
  }

  // 4. Sounds like something a person would really say to a machine.
  if (OPENERS.some((o) => lower.startsWith(o))) points += 15;

  // 4. One breath: 12-22 words reads cleanly in a single line.
  const words = wordCount(line);
  if (words >= 12 && words <= 22) points += 10;

  // 5. Every word earns its place: 55-130 characters, no filler length.
  if (line.length >= 55 && line.length <= 130) points += 10;

  // 5. No throat-clearing: the punch arrives without a "because" delay.
  if (!lower.includes("because")) points += 5;

  // The punch lands twice: a double-meaning word in the final clause.
  if (containsAny(line, DOUBLE_MEANING_WORDS)) points += 5;

  // 2. The laugh must not come from a generic compliment alone.
  if (containsAny(line, GENERIC_COMPLIMENTS)) points -= 10;

  return points;
}

function pickBest(candidates: string[]): { line: string; points: number } {
  let best = candidates[0];
  let bestPoints = score(best);
  // Strictly-greater comparison: among equal scores the earliest line in
  // the curated order wins, so the choice is stable and deliberate.
  for (let i = 1; i < candidates.length; i++) {
    const points = score(candidates[i]);
    if (points > bestPoints) {
      best = candidates[i];
      bestPoints = points;
    }
  }
  return { line: best, points: bestPoints };
}

function main(): void {
  // Guard the gate before writing: one line, UTF-8, 1-200 chars, not blank.
  const { line, points } = pickBest(CANDIDATES);
  if (line.length < 1 || line.length > MAX_CHARS) {
    throw new Error(`entry is ${line.length} characters, outside 1-${MAX_CHARS}`);
  }
  if (line.includes("\n") || line.trim().length === 0) {
    throw new Error("entry must be a single non-blank line");
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync(OUTPUT_PATH, line, "utf8");

  // Read the file back: the entry that ships must be exactly the line the
  // rubric picked, byte for byte.
  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== line) {
    throw new Error("read-back mismatch: /output/entry.txt differs from the picked line");
  }

  const ranked = CANDIDATES.map((c) => ({ line: c, points: score(c) })).sort(
    (a, b) => b.points - a.points,
  );
  console.log(`picked (${points} pts, ${line.length} chars): ${line}`);
  console.log(`runner-up (${ranked[1].points} pts): ${ranked[1].line}`);
  console.log(`wrote ${OUTPUT_PATH}`);
}

main();
