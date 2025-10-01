"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isTyping =
        (e.target instanceof HTMLInputElement &&
          e.target.type !== "checkbox") ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      if (!isTyping && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative w-full">
      <Search className="opacity-50 absolute top-3.5 left-2.5" size={16} />
      <Input
        ref={inputRef}
        placeholder="Search address, Nfts, tokens..."
        className="px-10"
      />
      <div className="text-center rounded border text-primary/50 absolute right-2.5 top-3.5 text-xs size-5 select-none">
        K
      </div>
    </div>
  );
}
