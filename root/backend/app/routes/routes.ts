import { Application, Request, Response } from "express";
import userRoute from "./user-route";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/v1/", userRoute);
  }
}
