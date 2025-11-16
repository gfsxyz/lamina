"use client";

import { cn } from "@/lib/utils";
import { PriceChangeDirection } from "@/lib/hooks/usePriceChange";

interface PriceCellProps {
  price: string;
  change: PriceChangeDirection;
  className?: string;
}

export function PriceCell({ price, change, className }: PriceCellProps) {
  return (
    <span
      className={cn(
        "inline-block transition-all duration-300",
        change === "up" && "animate-price-flash-up",
        change === "down" && "animate-price-flash-down",
        className
      )}
    >
      {price}
    </span>
  );
}
