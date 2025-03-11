import axios from "axios";
import { Depth, KLine, Ticker } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL


export async function getDepth(market: string): Promise<Depth> {
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}
export async function getTicker(market: string): Promise<Ticker> {
    const response = await axios.get(`${BASE_URL}/tickers?symbol=${market}`);
    return response.data;
}

export async function getKlines(market: string, interval: string ): Promise<KLine[]> {
    const startTime = Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 2) / 1000);
    const endTime = Math.floor(Date.now() / 1000);
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}