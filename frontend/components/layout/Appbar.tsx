"use client"
import { Button } from "../ui/button";

const Appbar = () => {
  return (
    <div className="flex h-16 items-center text-white justify-between bg-black px-4 border-b border-slate-800">
    <div className="flex items-center gap-12">
        <div className="text-xl cursor-pointer">Exchange</div>
        <div className="text-sm font-sans cursor-pointer">Markets</div>
        <div className="text-sm cursor-pointer">Trade</div>
    </div>
    <div className="flex gap-4">
     <Button variant="normal" className="bg-green-200 hover:bg-green-500 text-green-950 cursor-pointer">Deposit</Button>
     <Button variant="normal" className="bg-blue-300 text-blue-800 hover:bg-blue-500 cursor-pointer">Withdraw</Button>
    </div>
    </div>
  );
};

export default Appbar;
