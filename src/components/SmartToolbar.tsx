'use client';

import { Sliders, Sparkles, Circle } from 'lucide-react';

interface SmartToolbarProps {
  detailLevel: number;
  cleanWobbles: number;
  roundCorners: number;
  colorMode: 'color' | 'grayscale' | 'binary';
  onDetailChange: (v: number) => void;
  onCleanChange: (v: number) => void;
  onRoundChange: (v: number) => void;
  onColorModeChange: (v: 'color' | 'grayscale' | 'binary') => void;
  disabled?: boolean;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
  disabled?: boolean;
  description: string;
}

function Slider({ label, value, onChange, icon, disabled, description }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-violet-400">{icon}</span>
          <span className="text-sm font-medium text-gray-200">{label}</span>
        </div>
        <span className="text-sm font-mono text-violet-300 bg-violet-950/50 px-2 py-0.5 rounded">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-900/50
          disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, #7c3aed ${value}%, #374151 ${value}%)`
        }}
      />
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function SmartToolbar({
  detailLevel, cleanWobbles, roundCorners, colorMode,
  onDetailChange, onCleanChange, onRoundChange, onColorModeChange,
  disabled,
}: SmartToolbarProps) {
  const colorModes: { value: 'color' | 'grayscale' | 'binary'; label: string }[] = [
    { value: 'color', label: 'Color' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'binary', label: 'Binary' },
  ];

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-6">
      <div className="flex items-center gap-2 pb-1">
        <Sliders className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider">
          Tracing Controls
        </h3>
      </div>

      {/* Color Mode */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-200">Color Mode</p>
        <div className="flex gap-2">
          {colorModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onColorModeChange(mode.value)}
              disabled={disabled}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all
                ${colorMode === mode.value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200'}
                disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <Slider
        label="Detail Level"
        value={detailLevel}
        onChange={onDetailChange}
        icon={<Sparkles className="w-4 h-4" />}
        disabled={disabled}
        description="Higher values preserve more detail in the traced output"
      />

      <Slider
        label="Clean Wobbles"
        value={cleanWobbles}
        onChange={onCleanChange}
        icon={<Sliders className="w-4 h-4" />}
        disabled={disabled}
        description="Simplify paths to remove noise and jagged edges"
      />

      <Slider
        label="Round Corners"
        value={roundCorners}
        onChange={onRoundChange}
        icon={<Circle className="w-4 h-4" />}
        disabled={disabled}
        description="Smooth sharp corners into curves"
      />
    </div>
  );
}
