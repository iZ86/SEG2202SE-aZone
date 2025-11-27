import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import VenueController from "../controllers/venue.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateVenueValidator } from "../validators/venue-validator";

class VenueRoute {
  router = Router();
  controller = new VenueController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/:venueId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getVenueById));
    this.router.put("/:venueId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateVenueValidator, asyncHandler(this.controller.updateVenueById));
    this.router.delete("/:venueId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteVenueById));
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllVenues));
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateVenueValidator, asyncHandler(this.controller.createVenue));
  }
}

export default new VenueRoute().router;
