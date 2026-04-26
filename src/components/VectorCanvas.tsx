'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { sanitizeSvg } from '@/lib/sanitizeSvg';

interface VectorCanvasProps {
  svgContent: string;
  cleanWobbles: number;
  roundCorners: number;
  onSvgUpdate: (svg: string) => void;
  onProcessingError?: (message: string | null) => void;
}

export default function VectorCanvas({
  svgContent,
  cleanWobbles,
  roundCorners,
  onSvgUpdate,
  onProcessingError,
}: VectorCanvasProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const lastEffectKeyRef = useRef<string>('');
  const safeSvgContent = useMemo(() => sanitizeSvg(svgContent), [svgContent]);

  useEffect(() => {
    if (!svgContent || typeof window === 'undefined') return;
    if (cleanWobbles <= 0 && roundCorners <= 0) return;

    let isActive = true;
    const effectKey = `${cleanWobbles}:${roundCorners}:${safeSvgContent}`;
    if (lastEffectKeyRef.current === effectKey) return;

    const applyPaperEffects = async () => {
      setIsProcessing(true);
      onProcessingError?.(null);

      try {
        const paper = (await import('paper')).default;
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        paper.setup(canvas);

        const importedItem = paper.project.importSVG(safeSvgContent);
        const tolerance = cleanWobbles / 100 * 5;
        const smoothFactor = roundCorners / 100;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (importedItem as any).getItems({ class: paper.Path }).forEach((item: paper.Item) => {
          const path = item as paper.Path;
          if (cleanWobbles > 0 && tolerance > 0) {
            path.simplify(tolerance);
          }
          if (roundCorners > 0) {
            path.smooth({ type: 'catmull-rom', factor: smoothFactor });
          }
        });

        const processed = paper.project.exportSVG({ asString: true }) as string;
        if (isActive) {
          lastEffectKeyRef.current = effectKey;
          onSvgUpdate(sanitizeSvg(processed));
        }
        paper.project.clear();
      } catch {
        if (isActive) {
          onProcessingError?.('Vector post-processing failed. Try lowering Clean Wobbles / Round Corners.');
        }
      } finally {
        if (isActive) {
          setIsProcessing(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void applyPaperEffects();
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [svgContent, cleanWobbles, roundCorners, safeSvgContent, onSvgUpdate, onProcessingError]);

  if (!safeSvgContent) return null;

  return (
    <div className="relative w-full">
      {isProcessing && (
        <div className="absolute inset-0 bg-gray-950/60 flex items-center justify-center z-10 rounded-xl">
          <div className="flex items-center gap-2 text-violet-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Applying effects…</span>
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden
                   flex items-center justify-center p-4"
        style={{ minHeight: 300 }}
        dangerouslySetInnerHTML={{ __html: safeSvgContent }}
      />
    </div>
  );
}
