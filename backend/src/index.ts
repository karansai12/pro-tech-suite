import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();

const port = process.env.PORT!;
app.listen(Number(port), "0.0.0.0", () =>
  console.info(`server started at http://localhost:${process.env.PORT}`),
);
