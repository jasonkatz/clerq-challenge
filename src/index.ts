import express, { Response } from "express";
import cors from "cors";

const PORT = 8080;

const app = express();

app.use(cors());

app.get("/test", (_, res: Response) => {
  res.send("I am alive...");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
