'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCw, Loader2, Zap, AlertCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import SmartToolbar from '@/components/SmartToolbar';
import LiveStats from '@/components/LiveStats';
import ExportButton from '@/components/ExportButton';
import VectorCanvas from '@/components/VectorCanvas';
import { getSvgStats } from '@/lib/svgOptimizer';
import { sanitizeSvg } from '@/lib/sanitizeSvg';

export default function Home() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('output');
  const [svgContent, setSvgContent] = useState<string>('');
  const [isTracing, setIsTracing] = useState(false);
  const [detailLevel, setDetailLevel] = useState(50);
  const [cleanWobbles, setCleanWobbles] = useState(0);
  const [roundCorners, setRoundCorners] = useState(0);
  const [colorMode, setColorMode] = useState<'color' | 'grayscale' | 'binary'>('color');
  const [stats, setStats] = useState({ fileSize: 0, pointCount: 0 });
  const [originalSize, setOriginalSize] = useState<number | undefined>();
  const [processingError, setProcessingError] = useState<string | null>(null);

  const traceRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (imageData?.startsWith('blob:')) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageData]);

  const handleFileSelect = useCallback((objectUrl: string, file: File) => {
    setProcessingError(null);
    setImageData((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    setOriginalSize(file.size);
    setSvgContent('');
    setStats({ fileSize: 0, pointCount: 0 });
  }, []);

  const runTrace = useCallback(async () => {
    if (!imageData) return;
    const requestId = ++traceRequestIdRef.current;
    setProcessingError(null);
    setIsTracing(true);

    try {
      const { traceImageToSvg } = await import('@/lib/tracer');
      const result = await traceImageToSvg(imageData, { detailLevel, colorMode });
      if (requestId !== traceRequestIdRef.current) return;

      const safeSvg = sanitizeSvg(result.svg);
      setSvgContent(safeSvg);
      setStats(getSvgStats(safeSvg));
    } catch {
      if (requestId === traceRequestIdRef.current) {
        setProcessingError('Tracing failed. Please try another image or lower detail settings.');
      }
    } finally {
      if (requestId === traceRequestIdRef.current) {
        setIsTracing(false);
      }
    }
  }, [imageData, detailLevel, colorMode]);

  const handleSvgUpdate = useCallback((newSvg: string) => {
    const safeSvg = sanitizeSvg(newSvg);
    setSvgContent(safeSvg);
    setStats(getSvgStats(safeSvg));
  }, []);

  const hasImage = !!imageData;
  const hasSvg = !!svgContent;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800/60 backdrop-blur-sm sticky top-0 z-50 bg-gray-950/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SvgMaker</h1>
              <p className="text-xs text-gray-500 leading-none">PNG → SVG Converter</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>Client-side · No uploads</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onFileSelect={handleFileSelect} />

            <AnimatePresence>
              {imageData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Source Image</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageData}
                      alt="Source"
                      className="w-full h-40 object-contain rounded-lg bg-gray-800/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {processingError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{processingError}</span>
              </div>
            )}

            <SmartToolbar
              detailLevel={detailLevel}
              cleanWobbles={cleanWobbles}
              roundCorners={roundCorners}
              colorMode={colorMode}
              onDetailChange={setDetailLevel}
              onCleanChange={setCleanWobbles}
              onRoundChange={setRoundCorners}
              onColorModeChange={setColorMode}
              disabled={!hasImage || isTracing}
            />

            <motion.button
              onClick={() => void runTrace()}
              disabled={!hasImage || isTracing}
              whileHover={{ scale: hasImage && !isTracing ? 1.02 : 1 }}
              whileTap={{ scale: hasImage && !isTracing ? 0.97 : 1 }}
              className={`
                w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                font-semibold text-sm transition-all duration-200 shadow-lg
                ${hasImage && !isTracing
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/50 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'}
              `}
            >
              {isTracing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Tracing…</span></>
              ) : hasSvg ? (
                <><RefreshCw className="w-4 h-4" /><span>Re-trace</span></>
              ) : (
                <><Wand2 className="w-4 h-4" /><span>Convert to SVG</span></>
              )}
            </motion.button>

            <LiveStats
              fileSize={stats.fileSize}
              pointCount={stats.pointCount}
              originalSize={originalSize}
              isVisible={hasSvg}
            />

            <ExportButton
              svgContent={svgContent}
              fileName={fileName}
              disabled={!hasSvg}
            />
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isTracing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-96 bg-gray-900 rounded-2xl border border-gray-800"
                >
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
                  <p className="text-gray-300 font-medium">Tracing image…</p>
                  <p className="text-gray-600 text-sm mt-1">Analyzing pixels and building paths</p>
                </motion.div>
              ) : hasSvg ? (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-300">SVG Output</p>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md font-mono">
                      {(stats.fileSize / 1024).toFixed(1)} KB · {stats.pointCount.toLocaleString()} pts
                    </span>
                  </div>
                  <VectorCanvas
                    svgContent={svgContent}
                    cleanWobbles={cleanWobbles}
                    roundCorners={roundCorners}
                    onSvgUpdate={handleSvgUpdate}
                    onProcessingError={setProcessingError}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800"
                >
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <Wand2 className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-medium">No output yet</p>
                  <p className="text-gray-700 text-sm mt-1">Upload an image and click Convert</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
