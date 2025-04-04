"use client";
import { useRecoilState } from "recoil";
import { tickerState } from "@/store/ticker/tickerState";
import { useEffect } from "react";
import { SignalingManager } from "@/utils/SignalingManager";
import { Ticker as tickerType } from "@/utils/types";
import { getTicker } from "@/utils/httpClient";

export const Marketbar = ({ market }: { market: string }) => {
  const [ticker, setTicker] = useRecoilState(tickerState);

  useEffect(() => {
    (async () => {
      try {
        const response = await getTicker(market);
        setTicker(response);
      } catch (error) {
        console.error("Error fetching depth data:", error);
      }
    })();
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: tickerType) => {
        setTicker(() => data);
      },
      `TICKER-${market}`
    );

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
    <div className="h-auto md:h-16 px-4 bg-black border-b border-slate-700 py-2">
      <div className="grid grid-cols-1 md:hidden">
        <div className="flex justify-center items-center mb-4">
          <Ticker />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="text-zinc-400 font-normal">Price</div>
            <div className="text-white font-semibold">
              Rs. {ticker.lastPrice.toFixed(2)}
            </div>
            {ticker && (
              <div
                className={`font-semibold ${
                  ticker.priceChangePercent >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                Rs. {ticker.priceChange.toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="text-zinc-400 font-normal">24H Change</div>
            <div
              className={`font-semibold ${
                ticker.priceChangePercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {ticker.priceChangePercent.toFixed(2)} %
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-zinc-400 font-normal">24H Volume</div>
            <div className="text-white font-semibold">
              {ticker.volume.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-zinc-400 font-normal">24H High</div>
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
        </div>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <Ticker />
        <div className="flex flex-col text-white items-center">
          <div className="font-normal">Rs. {ticker.lastPrice.toFixed(2)}</div>
          {ticker && (
            <div
              className={`font-semibold ${
                ticker.priceChangePercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              Rs. {ticker.priceChange.toFixed(2)}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
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
          <div className="text-zinc-400 font-normal">24H High</div>
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
    </div>
  );
};

function Ticker() {
  return (
    <div>
      <div className="flex relative">
        <img className="h-14 w-14" src="/tata.png"></img>
      </div>
    </div>
  );
}
