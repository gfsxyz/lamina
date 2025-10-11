import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { timeAgo } from "@/lib/utils";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

const Activities = ({ chainId }: { chainId?: number }) => {
  const { data, isLoading } = trpc.portfolio.getActivities.useQuery({
    limit: 18,
    chainId: chainId,
  });

  if (isLoading) {
    return <Skeleton className="w-full rounded-xl border shadow-sm min-h-96" />;
  } else {
    return (
      <section className="border rounded-xl px-6 py-4 space-y-4 shadow-sm w-full">
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
  }
};
export default Activities;
