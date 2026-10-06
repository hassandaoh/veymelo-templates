// Measures the clip so the picture follows the real sound:
//   node tools/prepare.mjs [--end 2.6]
// reads assets/clip.m4a, writes src/levels.json (its loudness on every frame,
// 0 to 1) and sets the video's length in veymelo.config.json to the clip plus
// the end card. Run it again whenever the clip changes.
import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

const root = new URL('..', import.meta.url);
const config = JSON.parse(readFileSync(new URL('veymelo.config.json', root), 'utf8'));
const end = Number(process.argv[process.argv.indexOf('--end') + 1]) || 2.6;
const RATE = 48000;
const decoded = spawnSync('ffmpeg', ['-v', 'error', '-i', new URL('assets/clip.m4a', root).pathname, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-'], {maxBuffer: 1 << 30});
if (decoded.status !== 0) throw new Error(decoded.stderr.toString());
const samples = new Float32Array(decoded.stdout.buffer, decoded.stdout.byteOffset, decoded.stdout.length / 4);
const per = RATE / config.fps;
const frames = Math.ceil(samples.length / per);
const rms = Array.from({length: frames}, (_, f) => {
  let sum = 0;
  const from = Math.floor(f * per);
  const to = Math.min(samples.length, Math.floor((f + 1) * per));
  for (let i = from; i < to; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, to - from));
});
const sorted = [...rms].sort((a, b) => a - b);
const top = sorted[Math.floor(sorted.length * 0.98)] || 1;
const levels = rms.map(value => Math.round(Math.min(1, value / top) * 1000) / 1000);
writeFileSync(new URL('src/levels.json', root), JSON.stringify({fps: config.fps, seconds: samples.length / RATE, levels}) + '\n');
config.durationInFrames = frames + Math.round(end * config.fps);
writeFileSync(new URL('veymelo.config.json', root), JSON.stringify(config, null, 2) + '\n');
console.log(`src/levels.json: ${frames} frames (${(samples.length / RATE).toFixed(2)}s); video ${config.durationInFrames} frames with a ${end}s end card`);
