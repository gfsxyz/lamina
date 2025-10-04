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

const Wallet = ({
  profile,
  chainId,
}: {
  profile: Profile | undefined;
  chainId?: number;
}) => {
  const { data: prices } = trpc.portfolio.getPrices.useQuery();
  const { data: tokens } = trpc.portfolio.getTokens.useQuery({
    count: 5,
    sortBy: "usdValue",
    order: "desc",
    chainId: chainId,
  });

  return (
    <section className="w-full rounded-xl py-4 px-6 space-y-4 border shadow-sm">
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
              <TableCell className="text-right">{usd(item.usdValue)}</TableCell>
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
        >
          View all <ArrowRight />
        </Button>
      </div>
    </section>
  );
};
export default Wallet;
