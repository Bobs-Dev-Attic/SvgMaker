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
  const pathDataMatches = svgString.match(/d="([^"]+)"/g) ?? [];

  const pointCount = pathDataMatches.reduce((total, dAttr) => {
    const commands = dAttr.match(/[MLCQASTHVZmlcqasthvz]/g) ?? [];
    return total + commands.length;
  }, 0);

  return { fileSize, pointCount };
}
