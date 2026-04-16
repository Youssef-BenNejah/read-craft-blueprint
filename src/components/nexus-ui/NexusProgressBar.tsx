import React, { useState, useEffect } from 'react';

interface NexusProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

const NexusProgressBar: React.FC<NexusProgressBarProps> = ({ percentage, color, height = 4, showLabel = false }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, backgroundColor: 'hsl(var(--progress-bg))' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${width}%`, backgroundColor: color || 'hsl(var(--progress-fill))' }}
        />
      </div>
      {showLabel && <span className="font-code text-xs text-txt-secondary">{percentage}%</span>}
    </div>
  );
};

export default NexusProgressBar;
