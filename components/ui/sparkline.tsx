"use client";

import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  className = "",
  color,
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length === 0) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    // Avoid division by zero
    if (range === 0) return `M 0,${height / 2} L ${width},${height / 2}`;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [data, width, height]);

  // Determine color based on price trend (first vs last)
  const isPositive = data.length > 0 && data[data.length - 1] >= data[0];
  const strokeColor = color || (isPositive ? "#22c55e" : "#ef4444");

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
