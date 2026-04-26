'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface VectorCanvasProps {
  svgContent: string;
  cleanWobbles: number;
  roundCorners: number;
  onSvgUpdate: (svg: string) => void;
}

export default function VectorCanvas({
  svgContent,
  cleanWobbles,
  roundCorners,
  onSvgUpdate,
}: VectorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!svgContent || typeof window === 'undefined') return;

    const applyPaperEffects = async () => {
      setIsProcessing(true);
      try {
        const paper = (await import('paper')).default;
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        paper.setup(canvas);

        // Parse SVG
        const importedItem = paper.project.importSVG(svgContent);
        
        if (cleanWobbles > 0 || roundCorners > 0) {
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
          onSvgUpdate(processed);
          paper.project.clear();
        }
      } catch (err) {
        console.error('Paper.js error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    if (cleanWobbles > 0 || roundCorners > 0) {
      const timer = setTimeout(applyPaperEffects, 400);
      return () => clearTimeout(timer);
    }
  }, [svgContent, cleanWobbles, roundCorners, onSvgUpdate]);

  if (!svgContent) return null;

  return (
    <div className="relative w-full" ref={containerRef}>
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
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
