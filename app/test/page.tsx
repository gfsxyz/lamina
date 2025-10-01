"use client";

import { trpc } from "@/lib/trpc";

export default function Balances() {
  const { data, isLoading } = trpc.portfolio.getBalances.useQuery();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Balances</h2>
      <ul>
        {data?.map((b) => (
          <li key={b.id}>
            {b.tokenSymbol}: {b.amount} (${b.usdValue})
          </li>
        ))}
      </ul>
    </div>
  );
}
