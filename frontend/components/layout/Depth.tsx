"use client";
import { useEffect, useMemo } from "react";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import {
  bidsState,
  asksState,
  priceState,
  depthState,
  marketState,
  midPriceState,
} from "@/store/depth/depthState";
import { SignalingManager } from "@/utils/SignalingManager";
import { AskTable } from "./AskTable";
import { BidTable } from "./BidTable";

export const Depth = () => {
  const market = useRecoilValue(marketState);
  const [bids, setBids] = useRecoilState(bidsState);
  const [asks, setAsks] = useRecoilState(asksState);
  const depthData = useRecoilValue(depthState);
  const [midPrice, setMidPrice] = useRecoilState(midPriceState);

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        setBids((originalBids) => {
          const bidsAfterUpdate = [...(originalBids || [])];

          for (let i = 0; i < bidsAfterUpdate.length; i++) {
            for (let j = 0; j < data.bids.length; j++) {
              if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                bidsAfterUpdate[i] = [...bidsAfterUpdate[i]];
                bidsAfterUpdate[i][1] = data.bids[j][1];
                if (Number(bidsAfterUpdate[i][1]) === 0) {
                  bidsAfterUpdate.splice(i, 1);
                }
                break;
              }
            }
          }

          for (let j = 0; j < data.bids.length; j++) {
            if (
              Number(data.bids[j][1]) !== 0 &&
              !bidsAfterUpdate.map((x) => x[0]).includes(data.bids[j][0])
            ) {
              bidsAfterUpdate.push(data.bids[j]);
              break;
            }
          }
          bidsAfterUpdate.sort((x, y) =>
            Number(y[0]) > Number(x[0]) ? -1 : 1
          );
          return bidsAfterUpdate;
        });

        setAsks((originalAsks) => {
          let asksAfterUpdate = [...(originalAsks || [])];

          for (let i = 0; i < asksAfterUpdate.length; i++) {
            for (let j = 0; j < data.asks.length; j++) {
              if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                asksAfterUpdate[i] = [...asksAfterUpdate[i]];
                asksAfterUpdate[i][1] = data.asks[j][1];
                if (Number(asksAfterUpdate[i][1]) === 0) {
                  asksAfterUpdate.splice(i, 1);
                }
                break;
              }
            }
          }

          for (let j = 0; j < data.asks.length; j++) {
            if (
              Number(data.asks[j][1]) !== 0 &&
              !asksAfterUpdate.map((x) => x[0]).includes(data.asks[j][0])
            ) {
              asksAfterUpdate.push(data.asks[j]);
              break;
            }
          }
          asksAfterUpdate.sort((x, y) =>
            Number(y[0]) > Number(x[0]) ? 1 : -1
          );
          return asksAfterUpdate;
        });
      },
      `DEPTH-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth@${market}`],
    });

    setAsks(depthData.asks);
    setBids(depthData.bids);

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth@${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
    };
  }, []);

  const highestBid = useMemo(() => {
    return bids.length > 0 ? Math.max(...bids.map((b) => Number(b[0]))) : 0;
  }, [bids]);

  const lowestAsk = useMemo(() => {
    return asks.length > 0 ? Math.min(...asks.map((a) => Number(a[0]))) : 0;
  }, [asks]);

  const midPriceValue = useMemo(() => {
    return (highestBid + lowestAsk) / 2;
  }, [highestBid, lowestAsk]);

  useEffect(() => {
    setMidPrice(midPriceValue);
  }, [midPriceValue]);

  return (
    <div className="border-l-2 bg-slate-950 border-slate-700">
      <div className="flex gap-7 h-6 p-1 px-2 bg-black">
        <div className="text-slate-100 font-normal cursor-pointer">
          Depth
        </div>
        <div className="text-slate-100 font-normal cursor-pointer">Trade</div>
      </div>
      <TableHeader />
      <AskTable />
      <div className="text-slate-50 px-3">{midPrice.toFixed(2)}</div>
      <BidTable />
    </div>
  );
};

function TableHeader() {
  return (
    <div className="flex justify-between items-center px-3 py-2 text-slate-100 bg-black">
      <div className="text-slate-300">Price</div>
      <div className="text-slate-300">Size</div>
      <div className="text-slate-300">Total</div>
    </div>
  );
}
