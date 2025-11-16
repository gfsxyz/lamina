import { router, publicProcedure } from "../trpc";
import { z } from "zod";

import user from "@/server/data/user.json";
import prices from "@/server/data/prices.json";
import activities from "@/server/data/activities.json";
import { fetchLivePrices, type PriceData } from "@/server/services/coingecko";
import { fetchWalletPortfolio, DEFAULT_ADDRESS } from "@/server/services/blockchain";

const chainFilter = z.object({
  chainId: z.number().optional(),
});

const addressInput = z.object({
  address: z.string().optional(),
  chainId: z.number().optional(),
});

export const portfolioRouter = router({
  getUser: publicProcedure.query(() => user), //get all user's data

  getProfile: publicProcedure
    .input(z.object({ address: z.string().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const walletAddress = input?.address || DEFAULT_ADDRESS;

        // Fetch live prices
        const livePrices = await fetchLivePrices();

        // Fetch real blockchain data
        const portfolio = await fetchWalletPortfolio(walletAddress, livePrices);

        // Calculate net worth from portfolio
        const netWorth = portfolio.reduce((total, chain) => {
          const chainTotal = chain.usdValue + chain.assets.reduce((sum, asset) => sum + asset.usdValue, 0);
          return total + chainTotal;
        }, 0);

        // Calculate tokens value
        const tokensValue = portfolio.reduce((total, chain) => {
          const chainTokens = chain.usdValue + chain.assets.reduce((sum, asset) => sum + asset.usdValue, 0);
          return total + chainTokens;
        }, 0);

        // Build chain breakdown
        const chain_breakdown: Record<string, any> = {};
        portfolio.forEach((chain) => {
          const chainTokens = chain.usdValue + chain.assets.reduce((sum, asset) => sum + asset.usdValue, 0);
          chain_breakdown[chain.chainId] = {
            tokens: chainTokens,
            defi: 0,
            nfts: 0,
            total: chainTokens,
          };
        });

        return {
          displayName: walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
          address: walletAddress,
          ens: null,
          avatar: "/placeholder.jpg",
          bio: null,
          following: 0,
          followers: 0,
          earnings: 0,
          netWorth: {
            usd: netWorth,
            changePercent: 0,
            breakdown: {
              tokens: tokensValue,
              defi: 0,
              nfts: 0,
            },
            chain_breakdown,
          },
          links: {
            x: null,
            telegram: null,
            website: null,
          },
        };
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to dummy data
        return { ...user.profile, address: user.address, ens: user.ens };
      }
    }),

  // Portfolio with chain filter - NOW FETCHES REAL DATA
  getPortofolio: publicProcedure
    .input(addressInput.optional())
    .query(async ({ input }) => {
      try {
        const walletAddress = input?.address || DEFAULT_ADDRESS;

        // Fetch live prices first
        const livePrices = await fetchLivePrices();

        // Fetch real blockchain data
        const portfolio = await fetchWalletPortfolio(walletAddress, livePrices);

        // Filter by chain if requested
        if (input?.chainId) {
          return portfolio.filter((c) => c.chainId === input.chainId);
        }

        return portfolio;
      } catch (error) {
        console.error("Failed to fetch wallet portfolio:", error);
        // Fallback to dummy data on error
        if (input?.chainId) {
          return user.portfolio.filter((c) => c.chainId === input.chainId);
        }
        return user.portfolio;
      }
    }),

  getPrices: publicProcedure.query(async (): Promise<PriceData> => {
    try {
      // Fetch live prices from CoinGecko
      const livePrices = await fetchLivePrices();
      return livePrices;
    } catch (error) {
      console.error("Failed to fetch live prices, falling back to static data:", error);
      // Fallback to static prices if API fails, but add empty sparklines
      const fallbackPrices: PriceData = {};
      Object.entries(prices).forEach(([symbol, data]) => {
        fallbackPrices[symbol] = {
          ...data,
          sparkline: [],
        };
      });
      return fallbackPrices;
    }
  }),

  // NFTs with chain filter - Requires paid API (Alchemy/Moralis)
  // Returning empty for now - upgrade to premium plan to enable
  getNfts: publicProcedure.input(chainFilter.optional()).query(({ input }) => {
    // TODO: Integrate with Alchemy NFT API or Moralis
    // For now, return empty array
    return [];
  }),

  // DeFi with chain filter - Requires DeFi protocol APIs
  // Returning empty for now - complex integration needed
  getDefi: publicProcedure.input(chainFilter.optional()).query(({ input }) => {
    // TODO: Integrate with DeFi Llama or individual protocol APIs
    // For now, return empty array
    return [];
  }),

  // Activities with chain filter + sort + limit
  // Requires blockchain explorer APIs (Etherscan, etc.)
  // Showing example activities for now
  getActivities: publicProcedure
    .input(
      z
        .object({
          address: z.string().optional(),
          limit: z.number().min(1).max(100).optional(),
          sort: z.enum(["asc", "desc"]).optional().default("desc"),
          chainId: z.number().optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      // TODO: Fetch real transaction history from blockchain explorers
      // Etherscan API, BSCScan API, etc.
      // For now, return empty to show this wallet has no recent activity displayed
      return [];
    }),

  // Tokens with chain filter + sort + count - NOW USES REAL DATA
  getTokens: publicProcedure
    .input(
      z
        .object({
          address: z.string().optional(),
          chainId: z.number().optional(),
          count: z.number().optional(),
          sortBy: z.enum(["usdValue", "balance", "symbol"]).optional(),
          order: z.enum(["asc", "desc"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const walletAddress = input?.address || DEFAULT_ADDRESS;

        // Fetch live prices
        const livePrices = await fetchLivePrices();

        // Fetch real blockchain data
        const portfolio = await fetchWalletPortfolio(walletAddress, livePrices);

        // Filter by chain if requested
        const chains = input?.chainId
          ? portfolio.filter((c) => c.chainId === input.chainId)
          : portfolio;

        let tokens = chains.flatMap((chain) => [
          {
            symbol: chain.symbol,
            balance: chain.balance,
            usdValue: chain.usdValue,
            icon: chain.icon,
            chain: chain.chain,
            chainIcon: chain.icon,
            chainId: chain.chainId,
          },
          ...chain.assets.map((asset) => ({
            symbol: asset.symbol,
            balance: asset.balance,
            usdValue: asset.usdValue,
            icon: asset.icon,
            chain: chain.chain,
            chainIcon: chain.icon,
            chainId: chain.chainId,
          })),
        ]);

        // sorting
        if (input?.sortBy) {
          tokens = tokens.sort((a, b) => {
            const valA = a[input.sortBy!];
            const valB = b[input.sortBy!];
            if (typeof valA === "number" && typeof valB === "number") {
              return input.order === "asc" ? valA - valB : valB - valA;
            }
            if (typeof valA === "string" && typeof valB === "string") {
              return input.order === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
            }
            return 0;
          });
        }

        // count limit
        if (input?.count) {
          tokens = tokens.slice(0, input.count);
        }

        return tokens;
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        // Fallback to dummy data
        const chains = input?.chainId
          ? user.portfolio.filter((c) => c.chainId === input.chainId)
          : user.portfolio;

        let tokens = chains.flatMap((chain) => [
          {
            symbol: chain.symbol,
            balance: chain.balance,
            usdValue: chain.usdValue,
            icon: chain.icon,
            chain: chain.chain,
            chainIcon: chain.icon,
            chainId: chain.chainId,
          },
          ...chain.assets.map((asset) => ({
            symbol: asset.symbol,
            balance: asset.balance,
            usdValue: asset.usdValue,
            icon: asset.icon,
            chain: chain.chain,
            chainIcon: chain.icon,
            chainId: chain.chainId,
          })),
        ]);

        if (input?.sortBy) {
          tokens = tokens.sort((a, b) => {
            const valA = a[input.sortBy!];
            const valB = b[input.sortBy!];
            if (typeof valA === "number" && typeof valB === "number") {
              return input.order === "asc" ? valA - valB : valB - valA;
            }
            if (typeof valA === "string" && typeof valB === "string") {
              return input.order === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
            }
            return 0;
          });
        }

        if (input?.count) {
          tokens = tokens.slice(0, input.count);
        }

        return tokens;
      }
    }),
});
