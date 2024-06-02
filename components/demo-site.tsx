"use client";

import { TriangleAlert, XIcon } from "lucide-react";
import MaxWidthWrapper from "./max-width-wrapper";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DemoSite() {
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className={cn("w-full h-8 bg-red-500", isHidden ? "hidden" : "")}>
      <MaxWidthWrapper className="flex items-center justify-between">
        <div className="flex items-center">
          <TriangleAlert className="h-4 w-4 text-white mr-1" />
          <p className="text-sm text-white">
            This is just a demo site. We do not sell any products. This site is
            for demonstration purposes only.
          </p>
        </div>
        <XIcon
          onClick={() => setIsHidden(true)}
          className="h-4 w-4 text-white cursor-pointer"
        />
      </MaxWidthWrapper>
    </div>
  );
}
