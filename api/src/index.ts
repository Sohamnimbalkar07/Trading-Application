import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});