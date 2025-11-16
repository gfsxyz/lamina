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

  getProfile: publicProcedure.query(() => {
    return { ...user.profile, address: user.address, ens: user.ens };
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

  // NFTs with chain filter
  getNfts: publicProcedure.input(chainFilter.optional()).query(({ input }) => {
    let nfts = [...user.nfts];
    if (input?.chainId) {
      nfts = nfts.filter((n) => n.chainId === input.chainId);
    }
    return nfts;
  }),

  // DeFi with chain filter
  getDefi: publicProcedure.input(chainFilter.optional()).query(({ input }) => {
    let defi = [...user.defi];
    if (input?.chainId) {
      defi = defi.filter((d) => d.chainId === input.chainId);
    }
    return defi;
  }),

  // Activities with chain filter + sort + limit
  getActivities: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional(),
          sort: z.enum(["asc", "desc"]).optional().default("desc"),
          chainId: z.number().optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      let sorted = [...activities];

      // filter by chain
      if (input?.chainId) {
        sorted = sorted.filter((a) => a.chain.chainId === input.chainId);
      }

      // sort
      sorted = sorted.sort((a, b) =>
        input?.sort === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // limit
      if (input?.limit) {
        sorted = sorted.slice(0, input.limit);
      }

      return sorted;
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
