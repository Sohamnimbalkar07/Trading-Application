"use client";

import { useParams } from "next/navigation";
import { Marketbar } from "@/components/layout/Marketbar";
import { SwapUI } from "@/components/layout/SwapUI";
import { Depth } from "@/components/layout/Depth";
import { useSetRecoilState } from "recoil";
import { marketState } from "@/store/depth/depthState";
import { TradeView } from "@/components/layout/tradeView";

export default function Page() {
  const { market } = useParams();
  const setMarket = useSetRecoilState(marketState);
  setMarket(market as string);
  
  return (
    <div className="bg-black">
      <div className="flex flex-col md:grid md:grid-cols-12">
        <div className="md:col-span-9">
          <Marketbar market={market as string} />
          <div className="flex flex-col md:grid md:grid-cols-12">
            <div className="md:col-span-8">
              <TradeView/>
            </div>
            <div className="md:col-span-4">
              <Depth/>
            </div>
          </div> 
        </div>
        <div className="md:col-span-3 h-full">
          <SwapUI market={market as string} />
        </div>
      </div>
    </div>
  );
}