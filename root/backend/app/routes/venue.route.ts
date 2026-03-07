import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import VenueController from "../controllers/venue.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader } from "../middlewares/auth";
import { createAndUpdateVenueBodyValidator, venueParamValidator, getVenuesQueryValidator} from "../validators/venue-validator";

class VenueRoute {
  router = Router();
  controller = new VenueController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, getVenuesQueryValidator, asyncHandler(this.controller.getVenues));
    this.router.get("/:venueId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, venueParamValidator, asyncHandler(this.controller.getVenueById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateVenueBodyValidator, asyncHandler(this.controller.createVenue));

    this.router.put("/:venueId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, venueParamValidator, createAndUpdateVenueBodyValidator, asyncHandler(this.controller.updateVenueById));

    this.router.delete("/:venueId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, venueParamValidator, asyncHandler(this.controller.deleteVenueById));
  }
}

export default new VenueRoute().router;
