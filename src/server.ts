import cors from "cors";
import express, { Response } from "express";

const app = express();

app.use(cors());

app.get("/test", (_, res: Response) => {
  res.send("I am alive...");
});

export default app;
