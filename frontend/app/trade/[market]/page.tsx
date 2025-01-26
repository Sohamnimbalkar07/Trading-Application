"use client";

import { useParams } from "next/navigation";
import { Marketbar } from "@/components/layout/Marketbar";
import { SwapUI } from "@/components/layout/SwapUI";
import { Depth } from "@/components/layout/Depth";
import { SetRecoilState, useSetRecoilState } from "recoil";
import { marketState } from "@/store/depth/depthState";

export default function Page() {
  const { market } = useParams();
  const setMarket = useSetRecoilState(marketState);
  setMarket(market as string);
  
  return (
    <div>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-9">
          <Marketbar market={market as string} />
          <div className="grid grid-cols-12">
            <div className="col-span-8"></div>
            <div className="col-span-4">
              <Depth/>
            </div>
          </div>
        </div>
        <div className="col-span-3 h-full">
          <SwapUI />
        </div>
      </div>
    </div>
  );
}
