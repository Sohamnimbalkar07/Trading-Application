import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { ON_RAMP } from "../types";

export const onRampRouter = Router();

onRampRouter.post("/", async (req, res) => {
    const { userId, amount } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: ON_RAMP,
        data: {
            userId,
            amount
        }
    });
    res.json(response.payload);
});