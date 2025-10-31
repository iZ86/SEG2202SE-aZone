import { Application, Request, Response } from "express";
import userRoute from "./user.route";
import authRoute from "./auth.route";
import courseRoute from "./course.route";
import programmeRoute from "./programme.route";
import intakeRoute from "./intake.route";
import subjectRoute from "./subject.route";
import venueRoute from "./venue.route";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/v1/users", userRoute);
    app.use("/api/v1/auth", authRoute);
    app.use("/api/v1/courses", courseRoute);
    app.use("/api/v1/programmes", programmeRoute);
    app.use("/api/v1/intakes", intakeRoute);
    app.use("/api/v1/subjects", subjectRoute);
    app.use("/api/v1/venues", venueRoute);
  }
}
