import { asksState } from "@/store/depth/depthState";
import { useRecoilValue } from "recoil";

export const AskTable = () => {
  const asks = useRecoilValue(asksState);
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 15);
  relevantAsks.reverse();
  const asksWithTotal: [string, string, number][] = relevantAsks.map(
    ([price, quantity]) => [price, quantity, (currentTotal += Number(quantity))]
  );
  const maxTotal = relevantAsks.reduce(
    (acc, [_, quantity]) => acc + Number(quantity),
    0
  );
  asksWithTotal.reverse();

  return (
    <div>
      {asksWithTotal.map(([price, quantity, total]) => (
        <Ask
          maxTotal={maxTotal}
          key={price}
          price={price}
          quantity={quantity}
          total={total}
        />
      ))}
    </div>
  );
};

function Ask({
  price,
  quantity,
  total,
  maxTotal,
}: {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${(100 * total) / maxTotal}%`,
          height: "100%",
          background: "rgba(228, 75, 68, 0.325)",
          transition: "width 0.3s ease-in-out",
        }}
      ></div>
      <div className="flex justify-between text-xs w-full text-white px-3">
        <div className="flex-1 text-left">{price}</div>
        <div className="flex-1 text-center">{Number(quantity).toFixed(2)}</div>
        <div className="flex-1 text-right">{total?.toFixed(2)}</div>
      </div>
    </div>
  );
}