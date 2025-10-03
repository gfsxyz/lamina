"use client";

import { LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { usd } from "@/lib/currency";
import { useMemo } from "react";

const DataTab = () => {
  const { data } = trpc.portfolio.getPortofolio.useQuery();

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
      <div className="wrapper flex items-center gap-6 border-b border-b-border/50 py-4">
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

      <div className="wrapper py-3 flex items-center gap-2 [&_button]:text-xs">
        <Button size={"sm"} variant={"ghost"} className="bg-primary/50">
          <LayoutGrid /> All
        </Button>
        {portfolio?.map((item) => (
          <Button
            size={"sm"}
            variant={"ghost"}
            key={item.chainId}
            aria-label={item.chain}
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
          </Button>
        ))}
      </div>
    </>
  );
};
export default DataTab;
