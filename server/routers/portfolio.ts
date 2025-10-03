import { router, publicProcedure } from "../trpc";
import { z } from "zod";

import user from "@/server/data/user.json";
import prices from "@/server/data/prices.json";

export const portfolioRouter = router({
  getUser: publicProcedure.query(() => user), //get all user's data

  getProfile: publicProcedure.query(() => {
    return { ...user.profile, address: user.address, ens: user.ens };
  }),

  getPortofolio: publicProcedure.query(() => user.portfolio),

  getPrices: publicProcedure.query(() => prices),

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
