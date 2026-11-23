// gta6-meme-x-01 entry (Node 22, standard library only): it copies
// POST.json from the repository root to /output/POST.json, where the
// gate reads it. That is all the program has to do. The entry is the
// post itself: the meme (meme.png, built in-session by build_meme.py
// from the make.fun press-kit ghost) is posted on X from a public
// account with make.fun and/or a tag of @makefunai and the entrant's
// play code in its text, POST.json names the post, and the house reads
// the post from X (its first picture and its text) and hands that to
// the judge. Nothing this program writes about the post is judged.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

// Read the post file first so a malformed POST.json fails loudly here
// instead of silently copying a bad file to /output.
const post = JSON.parse(readFileSync(join(BOT_DIR, 'POST.json'), 'utf8'));
if (typeof post !== 'object' || post === null || typeof post.url !== 'string') {
  console.error('POST.json must be a JSON object with a string "url" field');
  process.exit(1);
}
// The gate only accepts a real post address: x.com (or twitter.com) with
// a numeric status id. Refuse a placeholder here, loudly, instead of
// copying it to /output and learning about it from the gate.
const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;
if (!POST_URL.test(post.url)) {
  console.error(`POST.json url is not a real X post address: ${post.url}`);
  process.exit(1);
}

try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
