import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { VenueData } from "../models/venue-model";
import venueService from "../services/venue.service";

export default class VenueController {
  async getVenues(req: Request, res: Response) {
    const page: number = Number(req.query.page as string) || 1;
    const pageSize: number = Number(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<VenueData[]> = await venueService.getVenues(query, pageSize, page);
    const venueCount: Result<number> = await venueService.getVenueCount(query);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        venues: response.getData(),
        venueCount: venueCount.isSuccess() ? venueCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getVenueById(req: Request, res: Response) {
    const venueId: number = Number(req.params.venueId as string);

    if (!venueId || isNaN(venueId)) {
      return res.sendError.badRequest("Invalid venueId");
    }

    const response: Result<VenueData> = await venueService.getVenueById(venueId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createVenue(req: Request, res: Response) {
    const venue: string = req.body.venue;

    const isVenueDuplicated: Result<VenueData> = await venueService.getVenueByVenue(venue);

    if (isVenueDuplicated.isSuccess()) {
      return res.sendError.conflict("Venue duplciated");
    }

    const response: Result<VenueData> = await venueService.createVenue(venue);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateVenueById(req: Request, res: Response) {
    const venueId: number = Number(req.params.venueId as string);
    const venue: string = req.body.venue;

    if (!venueId || isNaN(venueId)) {
      return res.sendError.badRequest("Invalid venueId");
    }

    const venueResponse: Result<VenueData> = await venueService.getVenueById(venueId);

    if (!venueResponse.isSuccess()) {
      return res.sendError.notFound("Invalid venueId");
    }

    const isVenueBelongsToVenueId: Result<VenueData> = await venueService.getVenueByIdAndVenue(venueId, venue);

    if (!isVenueBelongsToVenueId.isSuccess()) {
      const isVenueDuplicated: Result<VenueData> = await venueService.getVenueByVenue(venue);

      if (isVenueDuplicated.isSuccess()) {
        return res.sendError.conflict("Venue duplciated");
      }
    }

    const response = await venueService.updateVenueById(venueId, venue);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteVenueById(req: Request, res: Response) {
    const venueId: number = Number(req.params.venueId as string);

    if (!venueId || isNaN(venueId)) {
      return res.sendError.badRequest("Invalid venueId");
    }

    const venueResponse: Result<VenueData> = await venueService.getVenueById(venueId);

    if (!venueResponse.isSuccess()) {
      return res.sendError.notFound("Invalid venueId");
    }

    const response = await venueService.deleteVenueById(venueId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
