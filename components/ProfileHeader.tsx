"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpCircle } from "lucide-react";
import { usd } from "@/lib/currency";
import { Skeleton } from "./ui/skeleton";

const ProfileHeader = () => {
  const { data, isLoading } = trpc.portfolio.getProfile.useQuery();

  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("isFollowing");
    if (stored) {
      setIsFollowing(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isFollowing", String(isFollowing));
  }, [isFollowing]);

  const handleCopy = async (address: string) => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setOpen(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <header className="wrapper py-6">
        <div className="flex gap-4 sm:items-center flex-col sm:flex-row">
          <Skeleton className="w-28 h-28 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-52 h-5" />
            <Skeleton className="w-52 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-8 max-w-[32rem] items-center">
          <div>
            <div className="text-sm text-muted-foreground font-medium">
              Following
            </div>
            <Skeleton className="w-16 h-5 mt-1" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium">
              Followers
            </div>
            <Skeleton className="w-16 h-5 mt-1" />
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium cursor-help">
                  <span>Earnings</span>
                  <HelpCircle size={12} />
                </div>
              </TooltipTrigger>

              <TooltipContent>DeFi daily earnings</TooltipContent>
            </Tooltip>
            <Skeleton className="w-20 h-5 mt-1" />
          </div>

          <div>
            <div className="text-sm text-muted-foreground font-medium">
              Net Worth
            </div>
            <Skeleton className="w-20 h-5 mt-1" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="wrapper py-6">
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center">
        <Image
          alt={`${data?.displayName} profile picture`}
          src={data?.avatar || "/placeholder.jpg"}
          width={112}
          height={112}
          className={"rounded-xl"}
        />

        <div className="w-full max-w-fit">
          <div className="font-semibold flex items-center gap-4">
            <div className="text-lg">{data?.ens || data?.displayName || "Unknown"}</div>
            {data?.links?.x && data?.links?.telegram && (
              <div className="flex items-center gap-2">
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="size-6"
                  asChild
                >
                  <Link
                    href={data?.links.x}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image src={"/x.svg"} alt="x logo" width={8} height={8} />
                  </Link>
                </Button>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="size-6"
                  asChild
                >
                  <Link
                    href={data?.links.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={"/telegram.svg"}
                      alt="telegram logo"
                      width={12}
                      height={12}
                    />
                  </Link>
                </Button>
              </div>
            )}

            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              className="h-7"
              onClick={() => setIsFollowing((prev) => !prev)}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          </div>

          <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger
              className="flex gap-2 text-muted-foreground pr-2 text-sm leading-8 cursor-pointer hover:underline"
              onClick={() => handleCopy(data?.address || "")}
            >
              {data?.address || "0x0000...0000"}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{copied ? "Copied!" : "Copy address to clipboard"}</p>
            </TooltipContent>
          </Tooltip>

          <div className="text-sm text-muted-foreground">
            {data?.bio || "Wallet portfolio tracker"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-8 max-w-[32rem] items-center">
        <div>
          <div className="text-sm text-muted-foreground font-medium">
            Following
          </div>
          <div>{data?.following ?? 0}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground font-medium">
            Followers
          </div>
          <div>{data?.followers ?? 0}</div>
        </div>
        <div>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium cursor-help">
                <span>Earnings</span>
                <HelpCircle size={12} />
              </div>
            </TooltipTrigger>

            <TooltipContent>DeFi daily earnings</TooltipContent>
          </Tooltip>
          <div>{usd(data?.earnings ?? 0)}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground font-medium">
            Net Worth
          </div>
          <div>
            <span>{usd(data?.netWorth.usd ?? 0)}</span>
            <span className="text-emerald-400 text-xs pl-2">
              +{data?.netWorth.changePercent ?? 0}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default ProfileHeader;
