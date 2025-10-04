"use client";

import { trpc } from "@/lib/trpc";
import Wallet from "./overview/Wallet";
import Nft from "./overview/Nft";
import Defi from "./overview/Defi";
import Activities from "./overview/Activities";

const Overview = () => {
  const { data } = trpc.portfolio.getProfile.useQuery();
  return (
    <div className="wrapper py-4 grid grid-cols-2 gap-4">
      <div className="space-y-4">
        <Wallet profile={data} />
        <Nft nftValues={data?.netWorth.breakdown.nfts ?? 0} />
        <Defi defiValues={data?.netWorth.breakdown.defi ?? 0} />
      </div>

      <Activities />
    </div>
  );
};
export default Overview;
