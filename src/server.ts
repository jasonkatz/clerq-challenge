import cors from "cors";
import express, { Request, Response } from "express";
import { calculateSettlement } from "./settlement";

const app = express();

app.use(cors());

app.get("/test", (_, res: Response) => {
  res.send("I am alive...");
});

app.get(
  "/merchant/:merchantId/settlement/:date",
  async (req: Request, res: Response) => {
    try {
      const result = await calculateSettlement(
        req.params.merchantId,
        req.params.date
      );
      res.status(200);
      res.send(`${result}`);
    } catch (e) {
      console.error("Failed to calculate settlement - returning 500");
      res.sendStatus(500);
    }
  }
);

export default app;
