"use client";

import { usd } from "@/lib/currency";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const Defi = ({ defiValues }: { defiValues: number }) => {
  const { data } = trpc.portfolio.getDefi.useQuery();

  return (
    <section className="w-full rounded-xl py-4 px-6 space-y-4 border shadow-sm">
      <div className="text-lg font-semibold flex items-center justify-between">
        <Link href={"#"} className="hover:underline underline-offset-4">
          <h2>Defi</h2>
        </Link>
        <div>{usd(defiValues)}</div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-primary/30">
            <TableHead>Protocol</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.protocol + item.position}>
              <TableCell className="flex items-center gap-2 font-semibold">
                <div className="size-8 relative">
                  <Image
                    src={item.icon}
                    alt={`${item.protocol} logo`}
                    fill
                    sizes="32"
                  />
                </div>
                <div>
                  <Link
                    href={"#"}
                    className="hover:underline underline-offset-2"
                  >
                    {item.protocol}
                  </Link>
                  <div className="text-muted-foreground text-xs">
                    {item.chain}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {usd(item.assets[0].usdValue)}
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
};
export default Defi;
