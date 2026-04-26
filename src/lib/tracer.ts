'use client';

export interface TracingOptions {
  detailLevel: number; // 0-100
  colorMode: 'color' | 'grayscale' | 'binary';
}

export interface TracingResult {
  svg: string;
  width: number;
  height: number;
}

export async function traceImageToSvg(
  imageSource: string,
  options: TracingOptions
): Promise<TracingResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Try imagetracerjs
        try {
          const ImageTracer = (await import('imagetracerjs')).default;
          const svgStr = ImageTracer.imagedataToSVG(
            ctx.getImageData(0, 0, canvas.width, canvas.height),
            getImageTracerOptions(options)
          );
          resolve({ svg: svgStr, width: canvas.width, height: canvas.height });
        } catch {
          // Fallback: canvas-based tracing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const svg = fallbackTrace(imageData, canvas.width, canvas.height, options);
          resolve({ svg, width: canvas.width, height: canvas.height });
        }
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSource;
  });
}

function getImageTracerOptions(options: TracingOptions) {
  const detail = options.detailLevel / 100;
  return {
    numberofcolors: options.colorMode === 'binary' ? 2 : Math.max(4, Math.round(detail * 32)),
    mincolorratio: 0.02,
    colorquantcycles: 3,
    ltres: Math.max(0.1, 2 - detail * 1.9),
    qtres: Math.max(0.1, 2 - detail * 1.9),
    pathomit: Math.round(8 - detail * 7),
    rightangleenhance: true,
    strokewidth: 0,
    linefilter: false,
    scale: 1,
    roundcoords: 2,
    viewbox: true,
    blurradius: 0,
    blurdelta: 20,
  };
}

function fallbackTrace(
  imageData: ImageData,
  width: number,
  height: number,
  options: TracingOptions
): string {
  const { data } = imageData;
  const paths: string[] = [];

  if (options.colorMode === 'binary') {
    // 1.27 = 127/100: maps detailLevel range [0,100] to threshold range [1,255] centered at 128
    const threshold = Math.round(128 + (options.detailLevel - 50) * 1.27);
    const mask = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      mask[i] = a > 128 && brightness < threshold ? 1 : 0;
    }
    const path = scanLineTrace(mask, width, height);
    if (path) paths.push(`<path d="${path}" fill="#000000"/>`);
  } else {
    const numColors = Math.max(4, Math.round(options.detailLevel / 100 * 16));
    const quantized = quantizeImageColors(data, width, height, numColors);
    for (const [color, mask] of quantized) {
      const path = scanLineTrace(mask, width, height);
      if (path) paths.push(`<path d="${path}" fill="${color}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${paths.join('\n')}\n</svg>`;
}

function quantizeImageColors(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  numColors: number
): Map<string, Uint8Array> {
  // Cube root distributes numColors evenly across R/G/B axes (e.g. 8 colors → step=64 → 4 levels per channel)
  const step = Math.round(256 / Math.cbrt(numColors));
  const colorMap = new Map<string, Uint8Array>();

  for (let i = 0; i < width * height; i++) {
    const a = data[i * 4 + 3];
    if (a < 128) continue;
    const r = Math.min(255, Math.round(data[i * 4] / step) * step);
    const g = Math.min(255, Math.round(data[i * 4 + 1] / step) * step);
    const b = Math.min(255, Math.round(data[i * 4 + 2] / step) * step);
    const key = `rgb(${r},${g},${b})`;
    if (!colorMap.has(key)) colorMap.set(key, new Uint8Array(width * height));
    colorMap.get(key)![i] = 1;
  }

  // Filter tiny regions
  return new Map([...colorMap.entries()].filter(([, m]) => m.reduce((s, v) => s + v, 0) > 100));
}

function scanLineTrace(mask: Uint8Array, width: number, height: number): string {
  const segs: string[] = [];
  for (let y = 0; y < height; y++) {
    let inShape = false, startX = 0;
    for (let x = 0; x <= width; x++) {
      const px = x < width ? mask[y * width + x] : 0;
      if (!inShape && px === 1) { inShape = true; startX = x; }
      else if (inShape && px === 0) { inShape = false; segs.push(`M${startX},${y}H${x}V${y+1}H${startX}Z`); }
    }
  }
  return segs.join(' ');
}
