'use client';

import { motion } from 'framer-motion';
import { BarChart2, GitBranch, Zap } from 'lucide-react';

interface LiveStatsProps {
  fileSize: number;
  pointCount: number;
  originalSize?: number;
  isVisible: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function StatBar({ label, value, max, color, icon }: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const health = pct < 30 ? 'Excellent' : pct < 60 ? 'Good' : pct < 85 ? 'Fair' : 'Large';
  const healthColor = pct < 30 ? 'text-emerald-400' : pct < 60 ? 'text-blue-400' : pct < 85 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-violet-400">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${healthColor}`}>{health}</span>
          <span className="text-sm font-mono text-gray-200">
            {label === 'File Size' ? formatBytes(value) : value.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function LiveStats({ fileSize, pointCount, originalSize, isVisible }: LiveStatsProps) {
  if (!isVisible) return null;

  const compression = originalSize && fileSize
    ? Math.round((1 - fileSize / originalSize) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-5"
    >
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider">
          Live Stats
        </h3>
        {compression !== null && compression > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            {compression}% smaller
          </span>
        )}
      </div>

      <StatBar
        label="File Size"
        value={fileSize}
        max={500 * 1024}
        color="bg-gradient-to-r from-violet-600 to-violet-400"
        icon={<BarChart2 className="w-4 h-4" />}
      />

      <StatBar
        label="Path Points"
        value={pointCount}
        max={10000}
        color="bg-gradient-to-r from-blue-600 to-blue-400"
        icon={<GitBranch className="w-4 h-4" />}
      />
    </motion.div>
  );
}
