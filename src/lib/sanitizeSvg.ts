const BLOCKED_TAGS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
]);

const URL_ATTRS = new Set(['href', 'xlink:href', 'src']);

export function sanitizeSvg(svgString: string): string {
  if (typeof window === 'undefined' || !svgString.trim()) return svgString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;

  if (svg.nodeName.toLowerCase() !== 'svg') {
    return '';
  }

  const allNodes = doc.querySelectorAll('*');
  for (const node of allNodes) {
    const tag = node.nodeName.toLowerCase();

    if (BLOCKED_TAGS.has(tag)) {
      node.remove();
      continue;
    }

    for (const attr of [...node.attributes]) {
      const attrName = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();

      if (attrName.startsWith('on')) {
        node.removeAttribute(attr.name);
        continue;
      }

      if (URL_ATTRS.has(attrName)) {
        if (value.startsWith('javascript:') || value.startsWith('data:text/html')) {
          node.removeAttribute(attr.name);
          continue;
        }
      }

      if (attrName === 'style' && (value.includes('javascript:') || value.includes('expression('))) {
        node.removeAttribute(attr.name);
      }
    }
  }

  return new XMLSerializer().serializeToString(svg);
}
