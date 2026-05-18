'use client';

import React from 'react';

interface WaveformDisplayProps {
  barCount?: number;
  progress?: number; // 0 to 1
  height?: number;
}

/**
 * Decorative waveform placeholder using CSS.
 * In production, replace with real waveform data from R2.
 */
export default function WaveformDisplay({ barCount = 80, progress = 0, height = 64 }: WaveformDisplayProps) {
  // Generate pseudo-random bar heights that look like a waveform
  const bars = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < barCount; i++) {
      // Create a realistic-looking waveform pattern
      const noise = Math.sin(i * 0.3) * 0.3 + Math.sin(i * 0.7) * 0.2 + Math.sin(i * 1.1) * 0.15;
      const base = 0.3 + Math.abs(noise);
      const h = Math.max(0.1, Math.min(1, base + (Math.random() * 0.15 - 0.075)));
      result.push(h);
    }
    return result;
  }, [barCount]);

  return (
    <div className="flex items-end gap-[2px] w-full" style={{ height }}>
      {bars.map((h, i) => {
        const isPlayed = i / barCount <= progress;
        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-colors duration-100"
            style={{
              height: `${h * 100}%`,
              minWidth: 2,
              backgroundColor: isPlayed
                ? 'var(--color-accent-blue)'
                : 'var(--color-vault-700)',
            }}
          />
        );
      })}
    </div>
  );
}
