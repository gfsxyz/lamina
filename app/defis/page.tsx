"use client";

import { usd } from "@/lib/currency";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getChainBreakdown } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

const Defi = () => {
  const searchParams = useSearchParams();
  const chainId = Number(searchParams.get("c"));

  const { data: profile, isLoading: profileLoading } =
    trpc.portfolio.getProfile.useQuery();

  const { data, isLoading } = trpc.portfolio.getDefi.useQuery({
    chainId: chainId,
  });

  const defiValues =
    profile && chainId
      ? getChainBreakdown({ chainId, data: profile }).defi
      : profile?.netWorth.breakdown.defi ?? 0;

  if (isLoading || profileLoading) {
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
        </div>
      </div>
    );
  } else {
    return (
      <section className="wrapper w-full rounded-xl py-4 my-6 px-6 space-y-4 border shadow-sm">
        <div className="text-lg font-semibold flex items-center justify-between">
          <Link href={"#"} className="hover:underline underline-offset-4">
            <h2>Defi</h2>
          </Link>
          <div>{usd(defiValues)}</div>
        </div>

        {!data ||
          (data.length === 0 && (
            <div className="text-sm text-muted-foreground text-center my-4">
              No positions found
            </div>
          ))}

        <Table className={cn(!data || (data.length === 0 && "hidden"))}>
          <TableHeader>
            <TableRow className="bg-primary/30">
              <TableHead>Protocol</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item) => (
              <TableRow key={item.protocol + item.position}>
                <TableCell className="flex items-center gap-2 font-semibold">
                  <div className="size-8 relative">
                    <Image
                      src={item.icon}
                      alt={`${item.protocol} logo`}
                      fill
                      sizes="32"
                    />
                  </div>
                  <div>
                    <Link
                      href={"#"}
                      className="hover:underline underline-offset-2"
                    >
                      {item.protocol}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {item.chain}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {usd(item.assets[0].usdValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    );
  }
};
export default Defi;
