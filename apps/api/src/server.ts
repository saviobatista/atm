import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import indexRouter from "./routes/index";
import cronRouter from "./routes/cron";

export const createServer = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(morgan("dev"));
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(cors());
  app.use("/", indexRouter);
  app.use("/cron", cronRouter);
  app.get("/test", (req, res) => {
    const key = "SENDGRID_KEY";
    return res.send(key);
  });
  return app;
};
