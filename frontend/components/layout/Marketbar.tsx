"use client";

export const Marketbar = ({ market }: { market: string }) => {
  return (
    <div className="h-16 px-4 bg-black flex items-center gap-10">
      <Ticker market={market} />
      <div className="font-black text-white">TATA</div>
      <div className="flex flex-col text-white items-center">
      <div className="font-normal">0.2325</div>
      <div className="font-semibold">$ 0.2325</div>
      </div>
      <div className="flex flex-col  items-center">
      <div className="font-normal text-zinc-400">24H Change</div>
      <div className="text-white font-semibold">+ 0.2325</div>
      </div>
      <div className="flex flex-col items-center">
      <div className=" text-zinc-400 font-normal">24H High</div>
      <div className="text-white font-semibold">$ 0.2325</div>
      </div>
      <div className="flex flex-col items-center">
      <div className="text-zinc-400 font-normal">24H Low</div>
      <div className="text-white font-semibold">$ 0.2325</div>
      </div>
      <div className="flex flex-col items-center">
      <div className="text-zinc-400 font-normal">24H Volume</div>
      <div className="text-white font-semibold">$ 0.2325</div>
      </div>
    </div>
  );
};

function Ticker({ market }: { market: string }) {
  return (
    <div>
      <div className="flex relative">
        <img className="h-6 w-6 z-10" src="/sol.webp"></img>
        <img className="h-6 w-6 -ml-2" src="/usdc.webp"></img>
      </div>
    </div>
  );
}
