"use client"

export const Marketbar = ({market}: {market: string}) => {
  return (
    <div className="h-14 px-4 bg-black flex items-center">
      <Ticker market={market} />

    </div>
  );
};

function Ticker({market}: {market: string}) {
  return (
    <div>
     <div className="flex relative">
      <img className="h-6 w-6 z-10" src="/sol.webp"></img>
      <img className="h-6 w-6 -ml-2" src="/usdc.webp"></img>
     </div>
    </div>
  )
}