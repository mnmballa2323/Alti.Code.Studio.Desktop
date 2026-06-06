import sharp from 'sharp';

async function main() {
  const logoPath = '../alti.code.studio.frontend/public/alti-logo.png';
  const outPath = './base-icon.png';
  const size = 1024;
  const radius = 230;

  // Added xmlns to ensure proper SVG rendering by librsvg
  const svgMask = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#ffffff" />
  </svg>`;

  const targetLogoSize = Math.floor(size * 0.65);
  const resizedLogoBuffer = await sharp(logoPath)
    .resize(targetLogoSize, targetLogoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background
    }
  })
    .composite([
      { input: Buffer.from(svgMask), gravity: 'center' }, // draw the rounded rect
      { input: resizedLogoBuffer, gravity: 'center' } // draw the logo
    ])
    .png()
    .toFile(outPath);
    
  console.log('Created base-icon.png successfully!');
}
main().catch(console.error);
