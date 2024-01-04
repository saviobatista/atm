import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import indexRouter from "./routes/index";
import cronRouter from "./routes/cron";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .use("/", indexRouter)
    .use("/cron", cronRouter)
    .get("/test", (req, res) => {
      const key = "SENDGRID_KEY";
      return res.send(key);
    });
  return app;
};
