import { router, publicProcedure } from "../trpc";
import { z } from "zod";

import balances from "@/server/data/balances.json";
import nfts from "@/server/data/nfts.json";
import defi from "@/server/data/defi.json";
import history from "@/server/data/history.json";
import user from "@/server/data/user.json";

export const portfolioRouter = router({
  getUser: publicProcedure.query(() => user),
  getBalances: publicProcedure.query(() => balances),
  getNFTs: publicProcedure.query(() => nfts),
  getDefi: publicProcedure.query(() => defi),
  getHistory: publicProcedure.query(() => history),

  getHistoryByRange: publicProcedure
    .input(z.object({ from: z.string(), to: z.string() }))
    .query(({ input }) => {
      return history.filter((h) => h.date >= input.from && h.date <= input.to);
    }),
});
