import { Application, Request, Response } from "express";
import userRoute from "./user.route";
import authRoute from "./auth.route";
import courseRoute from "./course.route";
import intakeRoute from "./intake.route";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/v1/user", userRoute);
    app.use("/api/v1/auth", authRoute);
    app.use("/api/v1/course", courseRoute);
    app.use("/api/v1/intake", intakeRoute);
  }
}
