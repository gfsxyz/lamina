"use client";

import { trpc } from "@/lib/trpc";
import Wallet from "./overview/Wallet";
import Nft from "./overview/Nft";
import Defi from "./overview/Defi";
import Activities from "./overview/Activities";
import { useSearchParams } from "next/navigation";
import { getChainBreakdown } from "@/lib/utils";

const Overview = () => {
  const { data } = trpc.portfolio.getProfile.useQuery();
  const searchParams = useSearchParams();
  const chainId = Number(searchParams.get("c"));
  return (
    <div className="wrapper py-4 grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-4">
      <div className="space-y-4">
        <Wallet profile={data} chainId={chainId} />
        <Nft
          nftValues={
            chainId && data
              ? getChainBreakdown({ chainId, data }).nfts
              : data?.netWorth.breakdown.nfts ?? 0
          }
          chainId={chainId}
        />
        <Defi
          defiValues={
            data && chainId
              ? getChainBreakdown({ chainId, data }).defi
              : data?.netWorth.breakdown.defi ?? 0
          }
          chainId={chainId}
        />
      </div>

      <Activities chainId={chainId} />
    </div>
  );
};
export default Overview;
