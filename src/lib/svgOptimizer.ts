import { optimize } from 'svgo/browser';

export function optimizeSvg(svgString: string): string {
  try {
    const result = optimize(svgString, {
      plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeEditorsNSData',
        'cleanupAttrs',
        'mergeStyles',
        'inlineStyles',
        'minifyStyles',
        'cleanupIds',
        'removeUselessDefs',
        'cleanupNumericValues',
        'convertColors',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'cleanupEnableBackground',
        'removeHiddenElems',
        'removeEmptyText',
        'convertShapeToPath',
        'convertEllipseToCircle',
        'collapseGroups',
        'convertPathData',
        'convertTransform',
        'removeEmptyAttrs',
        'removeEmptyContainers',
        'mergePaths',
        'removeUnusedNS',
        'sortDefsChildren',
        'removeTitle',
        'removeDesc',
      ],
    });
    return result.data;
  } catch {
    return svgString;
  }
}

export function getSvgStats(svgString: string): { fileSize: number; pointCount: number } {
  const fileSize = new Blob([svgString]).size;
  const pathMatches = svgString.match(/[MLCQAZmlcqaz]/g) || [];
  const pointCount = pathMatches.length;
  return { fileSize, pointCount };
}
