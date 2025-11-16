import { useEffect, useRef, useState } from "react";

export type PriceChangeDirection = "up" | "down" | "none";

interface PriceChangeState {
  [symbol: string]: PriceChangeDirection;
}

/**
 * Hook to detect price changes and show flash animations
 */
export function usePriceChange(prices: Record<string, { usd: number }> | undefined) {
  const [priceChanges, setPriceChanges] = useState<PriceChangeState>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!prices) return;

    const changes: PriceChangeState = {};

    Object.entries(prices).forEach(([symbol, data]) => {
      const currentPrice = data.usd;
      const prevPrice = prevPricesRef.current[symbol];

      if (prevPrice !== undefined && prevPrice !== currentPrice) {
        changes[symbol] = currentPrice > prevPrice ? "up" : "down";
      } else {
        changes[symbol] = "none";
      }

      prevPricesRef.current[symbol] = currentPrice;
    });

    setPriceChanges(changes);

    // Clear animations after 1 second
    const timeout = setTimeout(() => {
      setPriceChanges((prev) => {
        const cleared: PriceChangeState = {};
        Object.keys(prev).forEach((key) => {
          cleared[key] = "none";
        });
        return cleared;
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [prices]);

  return priceChanges;
}
