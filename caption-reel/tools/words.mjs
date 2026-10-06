// Turns a whisper.cpp word-level transcript into the WORDS of src/content.ts:
//   whisper-cli -m <model> -f clip16.wav -ml 1 -sow -ojf -of words
//   node tools/words.mjs words.json [--offset 0]
// prints one line per word: ['word', start, end] in seconds of assets/clip.mp4.
// Check the words against the clip (names, numbers) before you use them.
import {readFileSync} from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Usage: node tools/words.mjs words.json [--offset seconds]');
const at = process.argv.indexOf('--offset');
const offset = at > 0 ? Number(process.argv[at + 1]) : 0;
const {transcription} = JSON.parse(readFileSync(file, 'utf8'));
for (const segment of transcription) {
  const text = segment.text.trim();
  if (!text) continue;
  const start = Math.round((segment.offsets.from / 1000 + offset) * 100) / 100;
  const end = Math.round((segment.offsets.to / 1000 + offset) * 100) / 100;
  console.log(`  [${JSON.stringify(text)}, ${start}, ${end}],`);
}
