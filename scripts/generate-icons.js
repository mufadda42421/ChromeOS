import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

function generatePng(size) {
  // RGBA pixels
  const rowSize = 1 + size * 4; // 1 filter byte + RGBA pixels
  const rawData = Buffer.alloc(rowSize * size);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rect or circle background (#0B0D12 with #8B5CF6 rim)
      if (dist <= radius) {
        // Robot face area
        const eyeY = cy - size * 0.08;
        const leftEyeX = cx - size * 0.18;
        const rightEyeX = cx + size * 0.18;
        const eyeDist1 = Math.sqrt((x - leftEyeX) ** 2 + (y - eyeY) ** 2);
        const eyeDist2 = Math.sqrt((x - rightEyeX) ** 2 + (y - eyeY) ** 2);
        const eyeRadius = size * 0.08;

        if (eyeDist1 <= eyeRadius || eyeDist2 <= eyeRadius) {
          // Cyan eyes (#06B6D4)
          rawData[pxOffset] = 6;
          rawData[pxOffset + 1] = 182;
          rawData[pxOffset + 2] = 212;
          rawData[pxOffset + 3] = 255;
        } else if (dist > radius - (size > 32 ? 3 : 1.5)) {
          // Purple rim (#8B5CF6)
          rawData[pxOffset] = 139;
          rawData[pxOffset + 1] = 92;
          rawData[pxOffset + 2] = 246;
          rawData[pxOffset + 3] = 255;
        } else {
          // Chassis (#141821)
          rawData[pxOffset] = 20;
          rawData[pxOffset + 1] = 24;
          rawData[pxOffset + 2] = 33;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const png = generatePng(size);
  const filename = path.join(publicDir, `icon${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Generated ${filename} (${png.length} bytes)`);
});
