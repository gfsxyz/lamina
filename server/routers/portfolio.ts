import { router, publicProcedure } from "../trpc";
import { z } from "zod";

import user from "@/server/data/user.json";
import prices from "@/server/data/prices.json";
import activities from "@/server/data/activities.json";
import { fetchLivePrices } from "@/server/services/coingecko";

const chainFilter = z.object({
  chainId: z.number().optional(),
});

export const portfolioRouter = router({
  getUser: publicProcedure.query(() => user), //get all user's data

  getProfile: publicProcedure.query(() => {
    return { ...user.profile, address: user.address, ens: user.ens };
  }),

  // Portfolio with chain filter
  getPortofolio: publicProcedure
    .input(chainFilter.optional())
    .query(({ input }) => {
      if (input?.chainId) {
        return user.portfolio.filter((c) => c.chainId === input.chainId);
      }
      return user.portfolio;
    }),

  getPrices: publicProcedure.query(async () => {
    try {
      // Fetch live prices from CoinGecko
      const livePrices = await fetchLivePrices();
      return livePrices;
    } catch (error) {
      console.error("Failed to fetch live prices, falling back to static data:", error);
      // Fallback to static prices if API fails
      return prices;
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

  // Tokens with chain filter + sort + count
  getTokens: publicProcedure
    .input(
      z
        .object({
          chainId: z.number().optional(),
          count: z.number().optional(),
          sortBy: z.enum(["usdValue", "balance", "symbol"]).optional(),
          order: z.enum(["asc", "desc"]).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
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
    }),
});
