import { useEffect, useRef } from "react";
import { ChartManager } from "@/utils/ChartManager";
import { KLine } from "@/utils/types";
import { klineParamsState, klineState } from "@/store/klines/klinesState";
import { marketState } from "@/store/depth/depthState";
import { useRecoilValue } from "recoil";

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
  }, [market, chartRef]);

  return (
    <div >
      <div
        ref={chartRef}
        style={{ height: "530px", width: "100%" }}
      ></div>
    </div>
  );
}
