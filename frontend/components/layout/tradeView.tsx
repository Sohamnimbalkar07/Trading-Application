import { useEffect, useRef } from "react";
import { ChartManager } from "@/utils/ChartManager";
import { KLine } from "@/utils/types";
import { klineParamsState, klineState } from "@/store/klines/klinesState";
import { marketState } from "@/store/depth/depthState";
import { useRecoilValue } from "recoil";
import { SignalingManager } from "@/utils/SignalingManager";

export function TradeView() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager>(null as any);
  const klines = useRecoilValue(klineState);
  const market = useRecoilValue(marketState);

  useEffect(() => {
    const init = async () => {
      let klineData: KLine[] = [];
      try {
        klineData = klines;
      } catch (e) {}

      if (chartRef) {
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }
        const chartManager = new ChartManager(
          chartRef.current,
          [
            ...klineData?.map((x) => ({
              close: parseFloat(x.close),
              high: parseFloat(x.high),
              low: parseFloat(x.low),
              open: parseFloat(x.open),
              timestamp: new Date(x.end),
            })),
          ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
          {
            background: "#0e0f14",
            color: "white",
          }
        );
        chartManagerRef.current = chartManager;
      }
    };
    init();
    SignalingManager.getInstance().registerCallback(
      "kline",
      (data: any) => {
        const newKline = {
          time: new Date(data.timestamp).getTime() / 1000,
          open: parseFloat(data.open),
          high: parseFloat(data.high),
          low: parseFloat(data.low),
          close: parseFloat(data.close),
        };

        chartManagerRef.current.update(newKline);
      },
      `KLINE-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`kline@${market}:1h`],
    });

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`kline@${market}:1h`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "kline",
        `kline@${market}:1h`
      );
    };
  }, [market, chartRef]);

  return (
    <div>
      <div ref={chartRef} style={{ height: "530px", width: "100%" }}></div>
    </div>
  );
}
