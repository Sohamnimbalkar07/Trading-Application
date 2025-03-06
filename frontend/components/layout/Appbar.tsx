"use client";
import { Button } from "../ui/button";

const Appbar = () => {
  const isMenuOpen = false;

  return (
    <div className="flex h-16 items-center text-white justify-between bg-black px-4 border-b border-slate-700">
      <div className="flex items-center gap-12">
        <div className="text-xl cursor-pointer">Exchange</div>
        <div className="hidden md:flex items-center gap-12">
          <div className="text-sm font-sans cursor-pointer">Markets</div>
          <div className="text-sm cursor-pointer">Trade</div>
        </div>
      </div>
      <div className="hidden md:flex gap-4">
        <Button
          variant="normal"
          className="bg-green-300 hover:bg-green-500 text-green-950 cursor-pointer"
        >
          Deposit
        </Button>
        <Button
          variant="normal"
          className="bg-blue-300 text-blue-800 hover:bg-blue-500 cursor-pointer"
        >
          Withdraw
        </Button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-black border-b border-slate-700">
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-sm font-sans cursor-pointer">Markets</div>
            <div className="text-sm cursor-pointer">Trade</div>
            <Button
              variant="normal"
              className="bg-green-300 hover:bg-green-500 text-green-950 cursor-pointer w-full"
            >
              Deposit
            </Button>
            <Button
              variant="normal"
              className="bg-blue-300 text-blue-800 hover:bg-blue-500 cursor-pointer w-full"
            >
              Withdraw
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appbar;