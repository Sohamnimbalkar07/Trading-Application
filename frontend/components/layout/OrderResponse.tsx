"use client";

import React from "react";
import { IndianRupee } from "lucide-react";
import { OrderResponseData } from "@/utils/types";


export const OrderResponse = ({ orderId, executedQty, fills }: OrderResponseData) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg text-slate-100">
      <div className="mb-4">
        <div className="text-sm text-zinc-400">Order ID</div>
        <div className="text-lg font-semibold">{orderId}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-zinc-400">Executed Quantity</div>
        <div className="text-lg font-semibold">{executedQty.toFixed(2)}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-zinc-400">Fills</div>
        <div className="space-y-2">
          {fills.map((fill, index) => (
            <div key={index} className="p-3 bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm">Price</div>
                <div className="font-semibold">
                  <IndianRupee className="inline h-4" />
                  {fill.price}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Quantity</div>
                <div className="font-semibold">{fill.qty.toFixed(4)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Trade ID</div>
                <div className="font-semibold">{fill.tradeId}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};