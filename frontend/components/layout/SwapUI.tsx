"use client";

import React, { useState } from "react";
import { IndianRupee } from "lucide-react";
import { useRecoilState } from "recoil";
import { orderState } from "@/store/swap/swapState";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { OrderResponse } from "./OrderResponse";
import { ScrollArea } from "@/components/ui/scroll-area";
import { orderResponseState } from "@/store/swap/swapState";
import ProcessingSpinner from "../ui/spinner";
import { SignalingManager } from "@/utils/SignalingManager";

export const SwapUI = ({ market }: { market: string }) => {
  const [activeTab, setActiveTab] = useState("buy");
  const [type, setType] = useState("limit");
  const [order, setOrder] = useRecoilState(orderState);
  const { toast } = useToast();
  const [orderResponse, setOrderResponse] = useRecoilState(orderResponseState);
  const [loading, setLoading] = useState<boolean>(false);
  const [showOrderResponse, setShowOrderResponse] = useState(false);
  const [orderType, setOrderType] = useState("intraday");

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const handleOrderTypeChange = (type: string) => {
    setOrderType(type);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setOrderResponse(null);
    if (order.price < 1000 || order.price > 1010) {
      toast({
        variant: "destructive",
        description: "Price must be between 1000 and 1050.",
      });
      setLoading(false);
      return;
    }

    if (order.quantity < 2 || order.quantity > 5) {
      toast({
        variant: "destructive",
        description: "Quantity must be between 2 and 5.",
      });
      setLoading(false);
      return;
    }
    const newOrder = {
      market,
      price: order.price,
      quantity: order.quantity,
      side: activeTab,
      userId: "5",
      orderType,
    };

    await SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`fills@${market}`],
    });

    try {
      const response = await axios.post(`${BASE_URL}/order`, newOrder, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.orderId) {
        setOrderResponse(response.data);
        setShowOrderResponse(true);
        setLoading(false);
        await SignalingManager.getInstance().registerCallback(
          "fills",
          (data: {
            orderId: string;
            tradeId: number;
            quantity: number;
            price: number;
          }) => {
            if (data.orderId === response.data?.orderId) {
              setOrderResponse(
                (prevOrderResponse: typeof orderResponse | null) => {
                  if (!prevOrderResponse) return null;

                  return {
                    ...prevOrderResponse,
                    executedQty: prevOrderResponse.executedQty + data.quantity,
                    fills: [
                      {
                        tradeId: data.tradeId,
                        qty: data.quantity,
                        price: data.price.toString(),
                      },
                      ...prevOrderResponse.fills,
                    ],
                  };
                }
              );
              toast({
                variant: "success",
                description: "More shares have been added to your order!",
              });
            }
          },
          `fills-${market}`
        );
        toast({
          variant: "success",
          description: "Order Placed Successfully!",
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        description: "Failed to Place Order.",
      });
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="border-l bg-slate-950 border-slate-700 text-slate-100">
        <div className="grid grid-cols-2">
          <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
          <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex gap-7 h-8 mx-4 my-2">
          <div
            className={`text-slate-100 font-normal cursor-pointer border-b-2 ${
              type === "limit"
                ? "border-accentBlue text-baseTextHighEmphasis"
                : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"
            }`}
            onClick={() => setType("limit")}
          >
            Limit
          </div>
          <div
            className={`text-slate-100 font-normal cursor-pointer border-b-2 ${
              type === "market"
                ? "border-accentBlue text-baseTextHighEmphasis"
                : "border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"
            } `}
            onClick={() => setType("market")}
          >
            Market
          </div>
        </div>
        <div className="flex text-slate-100 h-8 mx-4 justify-between items-center font-light text-sm">
          <div>Available Balance</div>
          <div className="flex justify-center items-center">
            <IndianRupee className="h-4" />
            <div className="font-medium">56456.94</div>
          </div>
        </div>
        <div className="font-normal text-sm mt-1 mx-4">
          <div className="text">Price</div>
          <input
            type="text"
            className="w-full h-11 rounded-lg my-2 border-slate-300 border-2 text-slate-900 p-2"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setOrder({ ...order, price: Number(value) });
              }
            }}
            placeholder="Please enter a price from 1000 to 1010."
          ></input>
        </div>
        <div className="font-normal text-sm  mx-4 mt-1">
          <div className="text">Quantity</div>
          <input
            type="text"
            className="w-full h-11 rounded-lg my-2 border-slate-300 border-2 text-slate-900 p-2"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setOrder({ ...order, quantity: Number(value) });
              }
            }}
            placeholder="Please enter a quantity between 2 and 5."
          ></input>
        </div>
        <div className="flex justify-around items-center my-2 h-10 mx-4">
          <div className="flex items-center justify-center gap-3">
            <div>
              <Checkbox
                className="bg-slate-50"
                checked={orderType === "intraday"}
                onCheckedChange={() => handleOrderTypeChange("intraday")}
              />
            </div>
            <div>Intra-Day</div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div>
              <Checkbox
                className="bg-slate-50"
                checked={orderType === "long-term"}
                onCheckedChange={() => handleOrderTypeChange("long-term")}
              />
            </div>
            <div>Long-Term</div>
          </div>
        </div>
        <div className="font-normal text-sm mt-1 mx-4">
          <button
            type="submit"
            onClick={handleSubmit}
            className={`h-14 w-full rounded-lg p-2 text-white-200 font-semibold text-xl ${
              activeTab === "buy" ? "bg-green-600" : "bg-red-500"
            } flex items-center justify-center`}
          >
            {loading ? (
              <ProcessingSpinner size={5} radius={10} text="Processing..." />
            ) : (
              <span>{activeTab === "buy" ? "Buy" : "Sell"}</span>
            )}
          </button>
        </div>

        {orderResponse && (
          <div className="mt-4 mx-4">
            <button
              onClick={() => setShowOrderResponse(!showOrderResponse)}
              className="w-full bg-slate-700 text-slate-100 p-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              {showOrderResponse
                ? "Hide Executed Orders"
                : "Show Executed Orders"}
            </button>
          </div>
        )}

        {orderResponse && showOrderResponse && (
          <div className="mt-4 mx-4">
            <OrderResponse
              orderId={orderResponse.orderId}
              executedQty={orderResponse.executedQty}
              fills={orderResponse.fills}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

const BuyButton = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div
      className={`col-span-1 h-16 border-b-2 text-green-500 flex items-center justify-center cursor-pointer ${
        activeTab === "buy"
          ? "border-b-greenBorder bg-greenBackgroundTransparent"
          : "border-b-baseBorderMed hover:border-b-baseBorderFocus"
      }`}
      onClick={() => setActiveTab("buy")}
    >
      <span className="text-center font-medium">Buy</span>
    </div>
  );
};

const SellButton = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div
      className={`col-span-1 border-b-2 h-16 text-red-600 flex items-center justify-center cursor-pointer ${
        activeTab === "sell"
          ? "border-b-redBorder bg-redBackgroundTransparent"
          : "border-b-baseBorderMed hover:border-b-baseBorderFocus"
      }`}
      onClick={() => setActiveTab("sell")}
    >
      <span className="text-center font-medium">Sell</span>
    </div>
  );
};
