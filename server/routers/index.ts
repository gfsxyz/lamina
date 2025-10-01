import { router } from "../trpc";
import { portfolioRouter } from "./portfolio";

export const appRouter = router({
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;
