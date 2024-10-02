import express from "express";
import { OrderInputSchema } from "./types";

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

app.post('/api/v1/order', async (req, res) => {
   const order = OrderInputSchema.safeParse(req.body);
   
   if (!order.success) {
    res.status(400).send(order.error.message);
    return;
  }

});

app.listen(port, () => {
    console.log(`server is running on ${port}`);
});