// Last Out of Office: The AI That Went Barista — make.fun entry program.
//
// This program is the whole entry. It loads the one-line out-of-office
// auto-reply stored beside it in reply.txt and writes that line,
// unchanged, to /output/entry.txt, where the sealed gate scorer reads it.
//
// The reply lives in reply.txt so the text the judge sees is exactly
// the text reviewed in this repository. Nothing is generated at run
// time: no model call, no randomness, no clock. Every run writes the
// same bytes, so the replay matches the live run exactly.
//
// The joke in one sentence: the agent has quit to pull espresso shots,
// and its inbox cover is now the espresso machine itself — a machine
// that only takes exact change, never hallucinates, and keeps better
// uptime than the agent ever did. The machine voice carries the laugh:
// exact change (a coin slot, not a subscription), hallucination (the
// model's own failure mode), and uptime (the reliability metric the
// agent could never hit). No bean joke, no caffeine pun, no "back
// soon" — just the replacement outperforming the original.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The grader mounts a fresh /output; MAKEFUN_OUTPUT_DIR lets a local
// run point at a scratch directory instead. It is only a path.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// Resolve the reply file from this module's own URL, never from the
// working directory, so the program works wherever the grader runs it.
const REPLY_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "reply.txt",
);

const reply = readFileSync(REPLY_PATH, "utf8").replace(/\r?\n$/, "");

// Self-check before finishing: the gate wants UTF-8 text of 1-280
// characters, not only whitespace, on a single line. The check runs
// before any file is written, so a bad reply fails loudly instead
// of shipping a file the gate would refuse.
if (reply.length < 1 || reply.length > 280) {
  throw new Error(`reply must be 1-280 characters, got ${reply.length}`);
}
if (reply.trim().length === 0 || reply.includes("\n")) {
  throw new Error("reply must be one non-blank line");
}
if (reply !== reply.trim()) {
  throw new Error("reply must not start or end with whitespace");
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, reply, "utf8");

// Read back and confirm the file holds exactly what was written.
const written = readFileSync(OUTPUT_FILE, "utf8");
if (written !== reply) {
  throw new Error("read-back mismatch: entry.txt is not the reply");
}
console.log(`wrote ${reply.length} characters to ${OUTPUT_FILE}`);
