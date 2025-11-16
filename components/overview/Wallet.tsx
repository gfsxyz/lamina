"use client";

import { usd } from "@/lib/currency";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Profile, trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { getChainBreakdown } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

const Wallet = ({
  profile,
  chainId,
}: {
  profile: Profile | undefined;
  chainId?: number;
}) => {
  const { data: prices, isLoading: pricesLoading } =
    trpc.portfolio.getPrices.useQuery(undefined, {
      refetchInterval: 60000, // Auto-refresh every 60 seconds
    });
  const { data: tokens, isLoading: tokensLoading } =
    trpc.portfolio.getTokens.useQuery({
      count: 5,
      sortBy: "usdValue",
      order: "desc",
      chainId: chainId,
    });

  if (pricesLoading || tokensLoading) {
    return (
      <Skeleton className="w-full rounded-xl border shadow-sm h-[26rem]" />
    );
  } else {
    return (
      <section className="w-full rounded-xl py-4 px-6 space-y-4 border shadow-sm">
        <div className="text-lg font-semibold flex items-center justify-between">
          <Link href={"/tokens"} className="hover:underline underline-offset-4">
            <h2 className="flex items-center gap-2">
              Wallet
              <span className="text-xs font-normal text-green-500 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            </h2>
          </Link>
          <div>
            {chainId
              ? usd(
                  profile
                    ? getChainBreakdown({ chainId, data: profile })?.tokens ?? 0
                    : 0
                )
              : usd(profile?.netWorth.breakdown.tokens ?? 0)}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-primary/30">
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tokens?.map((item) => (
              <TableRow key={item.chainId + item.symbol}>
                <TableCell>
                  <div className="size-8 relative">
                    <Image
                      src={item.icon}
                      alt={`${item.symbol} logo`}
                      fill
                      sizes="32"
                    />

                    <span className="absolute size-4 -left-1 -top-1">
                      <Image
                        src={item.chainIcon}
                        alt={`${item.chain} logo`}
                        fill
                        sizes="16"
                        className="rounded-full shadow-md"
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.balance}</TableCell>
                <TableCell className="text-right">
                  {usd(prices?.[item.symbol as keyof typeof prices]?.usd ?? 0)}
                </TableCell>
                <TableCell className="text-right">
                  {usd(item.usdValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between">
          <Button
            variant={"link"}
            size={"sm"}
            className="ml-auto text-primary-foreground"
            style={{ padding: "0" }}
            asChild
          >
            <Link href="/tokens">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    );
  }
};
export default Wallet;
