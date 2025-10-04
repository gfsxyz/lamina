import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { Profile } from "./trpc";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export const getChainBreakdown = ({
  chainId,
  data,
}: {
  chainId: number;
  data: Profile;
}) => {
  return data?.netWorth.chain_breakdown[
    chainId.toString() as keyof typeof data.netWorth.chain_breakdown
  ];
};
