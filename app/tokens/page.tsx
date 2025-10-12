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
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { getChainBreakdown } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

const Wallet = () => {
  const searchParams = useSearchParams();
  const chainId = Number(searchParams.get("c"));
  const { data: profile, isLoading: profileLoading } =
    trpc.portfolio.getProfile.useQuery();
  const { data: prices, isLoading: pricesLoading } =
    trpc.portfolio.getPrices.useQuery();
  const { data: tokens, isLoading: tokensLoading } =
    trpc.portfolio.getTokens.useQuery({
      sortBy: "usdValue",
      order: "desc",
      chainId: chainId,
    });

  if (profileLoading || pricesLoading || tokensLoading) {
    return (
      <div className="wrapper w-full rounded-xl border shadow-sm py-4 px-6 my-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>

        <div className="space-y-4">
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
        </div>
      </div>
    );
  } else {
    return (
      <section className="wrapper w-full rounded-xl py-4 my-6 px-6 space-y-4 border shadow-sm">
        <div className="text-lg font-semibold flex items-center justify-between">
          <Link href={"#"} className="hover:underline underline-offset-4">
            <h2>Wallet</h2>
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
                  {usd(prices?.[item.symbol as keyof typeof prices].usd ?? 0)}
                </TableCell>
                <TableCell className="text-right">
                  {usd(item.usdValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    );
  }
};
export default Wallet;
