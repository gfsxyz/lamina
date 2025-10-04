"use client";

import { usd } from "@/lib/currency";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import Link from "next/link";

const Nft = ({ nftValues }: { nftValues: number }) => {
  const { data } = trpc.portfolio.getNfts.useQuery();

  return (
    <section className="w-full rounded-xl py-4 px-6 space-y-4 border shadow-sm">
      <div className="text-lg font-semibold flex items-center justify-between">
        <Link href={"#"} className="hover:underline underline-offset-4">
          <h2>NFT</h2>
        </Link>
        <div>{usd(nftValues)}</div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-2">
        {data?.slice(0, 3).map((nft) => (
          <Link href="#" className="border rounded-2xl group" key={nft.tokenId}>
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
                <div className="text-xs text-muted-foreground">Est. Value</div>
                <div>
                  <span>{usd(nft.usdValue)}</span>
                  <span className="text-emerald-400 text-xs">&nbsp;+6%</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

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
export default Nft;
