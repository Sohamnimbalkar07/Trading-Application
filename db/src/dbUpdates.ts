import { DbMessage } from "./types";

export async function processDbUpdates(response: string) {
    try {
        const data: DbMessage = JSON.parse(response);

        switch (data.type) {
            case 'TRADE_ADDED':
                await handleTradeAdded(data.data);
                break;
            case 'ORDER_UPDATE':
                await handleOrderUpdate(data.data);
                break;
            case 'ORDER_CREATE':
                await handleOrderCreate(data.data);
                break;
            default:
                console.log("Unknown data type:");
                break;
        }
    } catch (error) {
        console.error("Error processing message:", error);
    }
}

async function handleTradeAdded(data: DbMessage['data']) {
   
}

async function handleOrderUpdate(data: DbMessage['data']) {
    
}

async function handleOrderCreate(data: DbMessage['data']) {
    
}