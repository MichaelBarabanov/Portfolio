// node gen_cat_sprites.js
'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const P = [
  [  0,   0,   0,   0], // 0 transparent
  [208, 112,  40, 255], // 1 orange body
  [120,  56,   8, 255], // 2 dark stripe
  [ 26,   8,   0, 255], // 3 outline
  [240, 208, 144, 255], // 4 cream belly
  [255, 136, 170, 255], // 5 pink
];
const SC = 4; // grid cells → pixels

// Cat faces RIGHT. Tail up-left. Head up-right.
// KEY: neck gap at col 9 in rows 3-4 separates head from body visually.

//                       0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
const WALK_A = [
/*r0  ear tips        */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
/*r1  tail-tip + ears */[3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
/*r2  tail + head-top */[3, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 3, 0],
/*r3  body-top+eyes   */[0, 3, 2, 3, 3, 3, 3, 3, 3, 0, 0, 3, 1, 3, 1, 1, 3, 1, 1, 3],
/*r4  body|gap|nose   */[0, 0, 3, 1, 1, 1, 1, 1, 3, 0, 3, 1, 1, 1, 5, 1, 1, 1, 1, 3],
/*r5  chest (merged)  */[0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
/*r6  body + stripe   */[0, 0, 0, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0],
/*r7  cream belly     */[0, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 0],
/*r8  lower body      */[0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0],
/*r9  leg tops A      */[0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
/*r10 legs            */[0, 0, 0, 0, 3, 1, 3, 0, 3, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
/*r11 paws            */[0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const WALK_B = [
/*r0 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
/*r1 */[3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
/*r2 */[3, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 3, 0],
/*r3 */[0, 3, 2, 3, 3, 3, 3, 3, 3, 0, 0, 3, 1, 3, 1, 1, 3, 1, 1, 3],
/*r4 */[0, 0, 3, 1, 1, 1, 1, 1, 3, 0, 3, 1, 1, 1, 5, 1, 1, 1, 1, 3],
/*r5 */[0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
/*r6 */[0, 0, 0, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0],
/*r7 */[0, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 0],
/*r8 */[0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0],
/*r9  legs shifted +1 */[0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
/*r10*/[0, 0, 0, 0, 0, 3, 1, 3, 0, 3, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0],
/*r11*/[0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const SIT = [
/*r0 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
/*r1 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
/*r2 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 3, 0],
/*r3  ^^ closed eyes  */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 3],
/*r4 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 1, 1, 1, 3],
/*r5 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 3],
/*r6 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 4, 4, 4, 1, 1, 3, 0],
/*r7 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 4, 4, 4, 1, 1, 3, 0],
/*r8 */[0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
/*r9  flat paws       */[0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
/*r10 tail curl       */[0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
/*r11*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const EAT = [
/*r0 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
/*r1 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
/*r2 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 3, 0],
/*r3  ^_^ wide eyes   */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
/*r4 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 1, 1, 1, 3],
/*r5  open mouth      */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 5, 5, 3, 1, 1, 3],
/*r6 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 4, 4, 4, 1, 1, 3, 0],
/*r7 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 4, 4, 4, 1, 1, 3, 0],
/*r8 */[0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
/*r9 */[0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
/*r10*/[0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
/*r11*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const JUMP = [
/*r0 */[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
/*r1 */[3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
/*r2 */[3, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 3, 0],
/*r3 */[0, 3, 2, 3, 3, 3, 3, 3, 3, 0, 0, 3, 1, 3, 1, 1, 3, 1, 1, 3],
/*r4 */[0, 0, 3, 1, 1, 1, 1, 1, 3, 0, 3, 1, 1, 1, 5, 1, 1, 1, 1, 3],
/*r5 */[0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
/*r6 */[0, 0, 0, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0],
/*r7 */[0, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 0],
/*r8 */[0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0],
/*r9  all 4 legs spread */[3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0],
/*r10*/[3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0],
/*r11*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── PNG encoder ────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
  const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, cr]);
}

function makePNG(grid) {
  const GH = grid.length, GW = grid[0].length;
  const IW = GW * SC, IH = GH * SC;
  const raw = Buffer.alloc(IH * (IW * 4 + 1));
  for (let gy = 0; gy < GH; gy++) {
    for (let sy = 0; sy < SC; sy++) {
      const row = gy * SC + sy;
      const base = row * (IW * 4 + 1);
      raw[base] = 0;
      for (let gx = 0; gx < GW; gx++) {
        const [r, g, b, a] = P[grid[gy][gx]];
        for (let sx = 0; sx < SC; sx++) {
          const off = base + 1 + (gx * SC + sx) * 4;
          raw[off] = r; raw[off+1] = g; raw[off+2] = b; raw[off+3] = a;
        }
      }
    }
  }
  const idat = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(IW, 0); ihdr.writeUInt32BE(IH, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, 'cat');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const sprites = { walk_a: WALK_A, walk_b: WALK_B, sit: SIT, eat: EAT, jump: JUMP };
for (const [name, grid] of Object.entries(sprites)) {
  fs.writeFileSync(path.join(outDir, `${name}.png`), makePNG(grid));
  console.log(`✓  ${name}.png  (${grid[0].length * SC}×${grid.length * SC}px)`);
}

const preview = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cat Preview</title>
<style>body{background:#0d1117;display:flex;gap:24px;padding:32px;flex-wrap:wrap;align-items:flex-end;font-family:monospace;color:#888}
figure{margin:0;text-align:center}.bg{background:#2a1a0a;padding:16px;border-radius:4px}
img{image-rendering:pixelated;display:block}</style></head><body>
${Object.keys(sprites).map(n =>
  `<figure class="bg"><img src="${n}.png" width="${sprites[n][0].length*SC*2}" height="${sprites[n].length*SC*2}"><figcaption>${n}</figcaption></figure>`
).join('\n')}
</body></html>`;
fs.writeFileSync(path.join(outDir, 'preview.html'), preview);
console.log('\n→ open cat/preview.html');
