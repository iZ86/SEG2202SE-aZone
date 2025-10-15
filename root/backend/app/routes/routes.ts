import { Application, Request, Response } from "express";
import userRoute from "./user-route";
import authRoute from "./auth/auth.route";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/v1/users", userRoute);
    app.use("/api/v1/auth", authRoute);
  }
}
