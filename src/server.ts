import cors from "cors";
import express, { Response } from "express";

const app = express();

app.use(cors());

app.get("/test", (_, res: Response) => {
  res.send("I am alive...");
});

app.get("/merchant/:merchantId/settlement/:date", (_, res: Response) => {
  res.status(501);
  res.send("Not yet implemented");
});

export default app;
