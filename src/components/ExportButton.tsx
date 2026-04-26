'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { optimizeSvg } from '@/lib/svgOptimizer';

interface ExportButtonProps {
  svgContent: string;
  fileName?: string;
  disabled?: boolean;
}

export default function ExportButton({ svgContent, fileName = 'output', disabled }: ExportButtonProps) {
  const [state, setState] = useState<'idle' | 'optimizing' | 'done'>('idle');

  const handleExport = async () => {
    if (!svgContent || disabled) return;
    setState('optimizing');

    await new Promise(r => setTimeout(r, 300));
    const optimized = optimizeSvg(svgContent);

    const blob = new Blob([optimized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.svg`;
    a.click();
    URL.revokeObjectURL(url);

    setState('done');
    setTimeout(() => setState('idle'), 2500);
  };

  const labels = {
    idle: 'Export SVG',
    optimizing: 'Optimizing…',
    done: 'Downloaded!',
  };

  const icons = {
    idle: <Download className="w-4 h-4" />,
    optimizing: <Loader2 className="w-4 h-4 animate-spin" />,
    done: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <motion.button
      onClick={handleExport}
      disabled={disabled || !svgContent || state === 'optimizing'}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`
        w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm
        transition-all duration-200 shadow-lg
        ${state === 'done'
          ? 'bg-emerald-600 text-white shadow-emerald-900/40'
          : disabled || !svgContent
          ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/50 cursor-pointer'
        }
      `}
    >
      {icons[state]}
      {labels[state]}
      {state === 'idle' && !disabled && svgContent && (
        <Sparkles className="w-3 h-3 opacity-70" />
      )}
    </motion.button>
  );
}
