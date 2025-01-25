"use Client";

import { IndianRupee } from "lucide-react";
import { ArrowDownUp } from "lucide-react";

export const SwapUI = () => {
  return (
    <div className="border-l-2 bg-slate-950 border-slate-700 text-slate-100 h-full">
      <div className="grid grid-cols-2">
        <BuyButton />
        <SellButton />
      </div>
      <div className="flex gap-7 mx-4 h-8">
        <div className="text-slate-100 font-normal cursor-pointer">Limit</div>
        <div className="text-slate-100 font-normal cursor-pointer">Market</div>
      </div>
      <div className="flex mx-4 text-slate-100 h-8 justify-between items-center font-light text-sm">
        <div>Available Balance</div>
        <div className="font-medium">36.94 USDC</div>
      </div>
      <div className="mx-4 font-normal text-sm mt-1">
        <div className="text">Price</div>
        <input className="w-full h-11 rounded-lg my-2 border-slate-300 border-2 text-slate-900 p-2">
        </input>
      </div>
      <div className="mx-4 font-normal text-sm mt-1">
        <div className="text">Quantity</div>
        <input className="w-full h-11 rounded-lg my-2 border-slate-300 border-2 text-slate-900 p-2"></input>
      </div>
      <div className="flex justify-between mx-4 my-2 h-10">
        <div className="bg-slate-100 text-black p-1 rounded-xl h-7 text-center w-14 font-medium cursor-pointer">25 %</div>
        <div className="bg-slate-100 text-black p-1 rounded-xl h-7 text-center w-14 font-medium cursor-pointer">50 %</div>
        <div className="bg-slate-100 text-black p-1 rounded-xl h-7 text-center w-14 font-medium cursor-pointer">75 %</div>
        <div className="bg-slate-100 text-black p-1 rounded-xl h-7 text-center w-14 font-medium cursor-pointer">Max</div>
      </div>
      <div className="m-4 font-normal text-sm mt-1">
      <button type="submit" className="h-14 w-full rounded-lg bg-green-600 p-2 text-white-200 font-semibold text-xl">Buy</button>
      </div>
    </div>
  );
};

const BuyButton = () => {
  return (
    <div className="col-span-1 h-16 text-green-500 flex items-center justify-center cursor-pointer">
      <span className="text-center font-medium">Buy</span>
    </div>
  );
};

const SellButton = () => {
  return (
    <div className="col-span-1 h-16 text-red-600 flex items-center justify-center cursor-pointer">
      <span className="text-center font-medium">Sell</span>
    </div>
  );
};
