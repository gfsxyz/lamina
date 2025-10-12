"use client";

import { LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { usd } from "@/lib/currency";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

const DataTab = () => {
  const router = useRouter();
  const { data, isLoading } = trpc.portfolio.getPortofolio.useQuery();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const chainId = searchParams.get("c");

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

  const handleChainFilter = (chainId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("c", chainId);

    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const removeChainFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("c");

    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const LoadStateComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 overflow-x-auto">
          <Skeleton className="w-32 h-9" />
          <Skeleton className="w-32 h-9" />
          <Skeleton className="w-32 h-9" />
        </div>
      );
    }
  };

  return (
    <>
      <nav className="wrapper flex items-center gap-6 border-b border-b-border/50 py-4 overflow-x-auto">
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(pathname === "/" && "bg-primary/50")}
          asChild
        >
          <Link href={"/"}>Overview</Link>
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(pathname === "/tokens" && "bg-primary/50")}
          asChild
        >
          <Link href={"/tokens"}>Tokens</Link>
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(pathname === "/defis" && "bg-primary/50")}
          asChild
        >
          <Link href={"/defis"}>DeFi</Link>
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(pathname === "/nfts" && "bg-primary/50")}
          asChild
        >
          <Link href={"/nfts"}>NFTs</Link>
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(pathname === "/activity" && "bg-primary/50")}
          asChild
        >
          <Link href={"/activity"}>Activity</Link>
        </Button>
      </nav>

      <div className="wrapper py-3 flex items-center gap-2 [&_button]:text-xs overflow-x-auto">
        <Button
          size={"sm"}
          variant={"ghost"}
          className={cn(!chainId && "bg-primary/50")}
          onClick={removeChainFilter}
        >
          <LayoutGrid /> All
        </Button>

        <LoadStateComponent />

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
            onClick={() => handleChainFilter(String(item.chainId))}
            asChild
          >
            <div className="flex items-center gap-2">
              <div className="size-4 relative">
                <Image
                  src={item.icon}
                  alt={`${item.chain} logo`}
                  fill
                  sizes="16px"
                />
              </div>
              {usd(item.totalUsdValue)}
            </div>
          </Button>
        ))}
      </div>
    </>
  );
};
export default DataTab;
