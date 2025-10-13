"use client";

import { usd } from "@/lib/currency";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { getChainBreakdown } from "@/lib/utils";

const Nft = () => {
  const searchParams = useSearchParams();
  const chainId = Number(searchParams.get("c"));

  const { data: profile, isLoading: profileLoading } =
    trpc.portfolio.getProfile.useQuery();
  const { data, isLoading } = trpc.portfolio.getNfts.useQuery({
    chainId: chainId,
  });
  const nftValues =
    chainId && profile
      ? getChainBreakdown({ chainId, data: profile }).nfts
      : profile?.netWorth.breakdown.nfts ?? 0;

  if (isLoading || profileLoading) {
    return (
      <div className="wrapper w-full rounded-xl border shadow-sm py-4 px-6 my-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-4">
          <div className="border rounded-2xl">
            <Skeleton className="aspect-square w-full overflow-hidden rounded-2xl" />
            <div className="flex flex-col justify-between flex-grow space-y-6 p-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
          <div className="border rounded-2xl">
            <Skeleton className="aspect-square w-full overflow-hidden rounded-2xl" />
            <div className="flex flex-col justify-between flex-grow space-y-6 p-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
          <div className="border rounded-2xl">
            <Skeleton className="aspect-square w-full overflow-hidden rounded-2xl" />
            <div className="flex flex-col justify-between flex-grow space-y-6 p-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <section className="wrapper w-full rounded-xl py-4 my-6 px-6 space-y-4 border shadow-sm">
        <div className="text-lg font-semibold flex items-center justify-between">
          <Link href={"#"} className="hover:underline underline-offset-4">
            <h2>NFT</h2>
          </Link>
          <div>{usd(nftValues)}</div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-2">
          {!data ||
            (data?.length === 0 && (
              <div className="text-sm text-muted-foreground mx-auto my-4">
                No NFTs found
              </div>
            ))}

          {data?.map((nft) => (
            <Link
              href="#"
              className="border rounded-2xl group"
              key={nft.tokenId}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                <Image
                  src={nft.image}
                  alt={nft.tokenId}
                  fill
                  className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw,
             (max-width: 1024px) 50vw,
             (max-width: 1280px) 33vw,
             25vw"
                />
              </div>
              <div className="flex flex-col justify-between flex-grow space-y-2 p-3">
                <div className="font-semibold line-clamp-1">
                  {nft.collection} #{nft.tokenId}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Est. Value
                  </div>
                  <div>
                    <span>{usd(nft.usdValue)}</span>
                    <span className="text-emerald-400 text-xs">
                      &nbsp;+{(Math.random() * 9 + 1).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }
};
export default Nft;
