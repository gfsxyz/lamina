import { router, publicProcedure } from "../trpc";
import { z } from "zod";

import user from "@/server/data/user.json";
import prices from "@/server/data/prices.json";
import activities from "@/server/data/activities.json";

export const portfolioRouter = router({
  getUser: publicProcedure.query(() => user), //get all user's data

  getProfile: publicProcedure.query(() => {
    return { ...user.profile, address: user.address, ens: user.ens };
  }),

  getPortofolio: publicProcedure.query(() => user.portfolio),

  getPrices: publicProcedure.query(() => prices),

  getNfts: publicProcedure.query(() => user.nfts),

  getDefi: publicProcedure.query(() => user.defi),

  getActivities: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional(),
          sort: z.enum(["asc", "desc"]).optional().default("desc"),
        })
        .optional()
    )
    .query(({ input }) => {
      let sorted = [...activities].sort((a, b) =>
        input?.sort === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      if (input?.limit) {
        sorted = sorted.slice(0, input.limit);
      }

      return sorted;
    }),

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

      //count limit
      if (input?.count) {
        tokens = tokens.slice(0, input.count);
      }

      return tokens;
    }),
});
