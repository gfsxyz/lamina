"use client";

import { LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { usd } from "@/lib/currency";
import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const DataTab = () => {
  const { data } = trpc.portfolio.getPortofolio.useQuery();
  const searchParams = useSearchParams();
  const chainId = searchParams.get("c");

  const removeChainFilter = () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    params.delete("c");

    const newQueryString = params.toString();
    const pathname = window.location.pathname;
    const newUrl = `${pathname}${newQueryString ? "?" + newQueryString : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  const portfolio = useMemo(() => {
    if (!data) return [];

    return data.map((chain) => {
      const totalUsdValue =
        chain.usdValue +
        chain.assets.reduce((sum, asset) => sum + asset.usdValue, 0);

      return {
        ...chain,
        totalUsdValue,
      };
    });
  }, [data]);

  return (
    <>
      <div className="wrapper flex items-center gap-6 border-b border-b-border/50 py-4 overflow-x-auto">
        <Button size={"sm"} variant={"ghost"} className="bg-primary/50">
          Overview
        </Button>
        <Button size={"sm"} variant={"ghost"}>
          Tokens
        </Button>
        <Button size={"sm"} variant={"ghost"}>
          DeFi
        </Button>
        <Button size={"sm"} variant={"ghost"}>
          NFTs
        </Button>
        <Button size={"sm"} variant={"ghost"}>
          Activity
        </Button>
      </div>

      <div className="wrapper py-3 flex items-center gap-2 [&_button]:text-xs overflow-x-auto">
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(!chainId && "bg-primary/50")}
          onClick={removeChainFilter}
        >
          <LayoutGrid /> All
        </Button>
        {portfolio?.map((item) => (
          <Button
            size={"sm"}
            variant={"ghost"}
            key={item.chainId}
            aria-label={item.chain}
            className={cn(
              Number(chainId) === item.chainId && "bg-primary/50",
              "text-xs"
            )}
            asChild
          >
            <Link
              href={`/?c=${item.chainId}`}
              className="flex items-center gap-2"
            >
              <div className="size-4 relative">
                <Image
                  src={item.icon}
                  alt={`${item.chain} logo`}
                  fill
                  sizes="16px"
                />
              </div>
              {usd(item.totalUsdValue)}
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
};
export default DataTab;
