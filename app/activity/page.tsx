"use client";

import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

const Activities = () => {
  const searchParams = useSearchParams();
  const chainId = Number(searchParams.get("c"));

  const { data, isLoading } = trpc.portfolio.getActivities.useQuery({
    chainId: chainId,
  });

  if (isLoading) {
    return (
      <div className="wrapper w-full rounded-xl border shadow-sm py-4 px-6 my-6 space-y-4">
        <Skeleton className="h-7 w-24" />

        <div className="space-y-4">
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
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
      <section className="wrapper border rounded-xl px-6 my-6 py-4 space-y-4 shadow-sm w-full">
        <div className="text-lg font-semibold flex items-center justify-between">
          <Link href={"#"} className="hover:underline underline-offset-4">
            <h2>Activity</h2>
          </Link>
        </div>

        <Table>
          <TableBody>
            {data?.map((activity) => (
              <TableRow key={activity.txHash}>
                <TableCell className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {activity.user.ens ?? activity.user.address}
                      </div>
                      <div className="relative size-4">
                        <Image
                          src={activity.chain.icon}
                          alt={activity.chain.name}
                          fill
                          sizes="16"
                        />
                      </div>
                      <div className="text-muted-foreground">
                        {timeAgo(activity.timestamp)}
                      </div>
                    </div>
                    <div className="text-base">
                      <span>
                        {activity.action} {activity.details}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div>
                      <Link
                        href={"#"}
                        className="hover:underline text-muted-foreground"
                      >
                        {activity.txHash}
                      </Link>
                    </div>
                    <div className="font-semibold text-base">
                      {activity.value}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    );
  }
};
export default Activities;
