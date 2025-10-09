import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import UserController from "../controllers/user.controller";

class UserRoute {
  router = Router();
  controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/users", asyncHandler(this.controller.getUsers));
  }
}

export default new UserRoute().router;
