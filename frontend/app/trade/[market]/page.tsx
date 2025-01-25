"use client";

import { useParams } from "next/navigation";
import { Marketbar } from "@/components/layout/Marketbar";
import { SwapUI } from "@/components/layout/SwapUI";

export default function Page() {
  const { market } = useParams();
  return (
    <div>
      <div className="grid grid-cols-12">
        <div className="col-span-9">
          <Marketbar market={market as string} />
        </div>
        <div className="col-span-3">
          <SwapUI />
        </div>
      </div>
    </div>
  );
}
