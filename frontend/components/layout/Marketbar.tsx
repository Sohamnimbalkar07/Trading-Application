"use client";
import { useRecoilValue, useRecoilState } from "recoil";
import { tickerState, tickerSelector } from "@/store/ticker/tickerState";
import { useEffect } from "react";
import { SignalingManager } from "@/utils/SignalingManager";
import { Ticker as tickerType } from "@/utils/types";

export const Marketbar = ({ market }: { market: string }) => {
  const tickerData = useRecoilValue(tickerSelector);
  const [ticker, setTicker] = useRecoilState(tickerState);

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: tickerType) => {
        setTicker(() => data);
      },
      `TICKER-${market}`
    );

    setTicker(tickerData);

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker@${market}`],
    });
    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker@${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "ticker",
        `ticker@${market}`
      );
    };
  }, [market]);

  return (
    <div className="h-16 px-4 bg-black flex items-center gap-10 border-b border-slate-700">
      <Ticker  />
      <div className="flex flex-col text-white items-center">
        <div className="font-normal">Rs. {ticker.lastPrice.toFixed(2)}</div>
        { ticker && <div
          className={`font-semibold ${
            ticker.priceChangePercent >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          Rs. {ticker.priceChange.toFixed(2)}
        </div>
}
      </div>
      <div className="flex flex-col  items-center">
        <div className="font-normal text-zinc-400">24H Change</div>
        <div
          className={`font-semibold ${
            ticker.priceChangePercent >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {ticker.priceChangePercent.toFixed(2)} %
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className=" text-zinc-400 font-normal">24H High</div>
        <div className="text-white font-semibold">
          Rs. {ticker.high.toFixed(2)}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-zinc-400 font-normal">24H Low</div>
        <div className="text-white font-semibold">
          Rs. {ticker.low.toFixed(2)}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-zinc-400 font-normal">24H Volume</div>
        <div className="text-white font-semibold">
          {ticker.volume.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

function Ticker() {
  return (
    <div>
      <div className="flex relative">
        <img className="ml-4 h-14 w-14" src="/tata.png"></img>
      </div>
    </div>
  );
}
