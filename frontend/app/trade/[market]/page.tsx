"use client";

import { useParams } from "next/navigation";
import Marketbar from "@/components/layout/Marketbar";

export default function Page() {
    const { market } = useParams();

    return <div>
        <Marketbar market={market as string}/>
    </div>
}