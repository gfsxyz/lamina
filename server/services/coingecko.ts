/**
 * CoinGecko API Service
 *
 * Free tier limits: 50 calls/minute
 * No API key required for basic usage
 */

// Map token symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  ETH: "ethereum",
  BNB: "binancecoin",
  AVAX: "avalanche-2",
  ARB: "arbitrum",
  SUI: "sui",
  USDT: "tether",
  USDC: "usd-coin",
  DAI: "dai",
  LINK: "chainlink",
  CAKE: "pancakeswap-token",
  BUSD: "binance-usd",
  JOE: "joe",
  GMX: "gmx",
  MAGIC: "magic",
  CETUS: "cetus-protocol",
  NAVX: "navi-protocol",
};

export interface TokenPrice {
  usd: number;
  change24h: number;
}

export interface PriceData {
  [symbol: string]: TokenPrice;
}

// In-memory cache
interface CacheEntry {
  data: PriceData;
  timestamp: number;
}

let priceCache: CacheEntry | null = null;
const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Fetch live prices from CoinGecko API
 */
export async function fetchLivePrices(): Promise<PriceData> {
  // Check cache first
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    console.log("Returning cached prices");
    return priceCache.data;
  }

  console.log("Fetching fresh prices from CoinGecko");

  try {
    const coinIds = Object.values(SYMBOL_TO_COINGECKO_ID).join(",");

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform CoinGecko response to our format
    const prices: PriceData = {};

    for (const [symbol, coinId] of Object.entries(SYMBOL_TO_COINGECKO_ID)) {
      const coinData = data[coinId];
      if (coinData) {
        prices[symbol] = {
          usd: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
        };
      }
    }

    // Update cache
    priceCache = {
      data: prices,
      timestamp: Date.now(),
    };

    return prices;
  } catch (error) {
    console.error("Failed to fetch prices from CoinGecko:", error);

    // If we have stale cache, return it as fallback
    if (priceCache) {
      console.log("Returning stale cached prices as fallback");
      return priceCache.data;
    }

    // Otherwise, throw the error
    throw error;
  }
}

/**
 * Get price for a specific token symbol
 */
export async function getTokenPrice(symbol: string): Promise<TokenPrice | null> {
  const prices = await fetchLivePrices();
  return prices[symbol] || null;
}

/**
 * Clear the price cache (useful for testing)
 */
export function clearPriceCache() {
  priceCache = null;
}
