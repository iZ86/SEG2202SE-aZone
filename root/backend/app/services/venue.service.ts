import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { VenueData } from "../models/venue-model";
import venueRepository from "../repositories/venue.repository";

interface IVenueService {
  getAllVenues(query: string, pageSize: number, page: number): Promise<Result<VenueData[]>>;
  getVenueById(venueId: number): Promise<Result<VenueData>>;
  getVenueByVenue(venue: string): Promise<Result<VenueData>>;
  getVenueByIdAndVenue(venueId: number, venue: string): Promise<Result<VenueData>>;
  createVenue(venue: string): Promise<Result<VenueData>>;
  updateVenueById(venueId: number, venue: string): Promise<Result<VenueData>>;
  deleteVenueById(venueId: number): Promise<Result<null>>;
  getVenueCount(query: string): Promise<Result<number>>;
}

class VenueService implements IVenueService {
  async getAllVenues(query: string = "", pageSize: number, page: number): Promise<Result<VenueData[]>> {
    const venues: VenueData[] = await venueRepository.getAllVenues(query, pageSize, page);

    return Result.succeed(venues, "Venues retrieve success");
  }

  async getVenueById(venueId: number): Promise<Result<VenueData>> {
    const venue: VenueData | undefined = await venueRepository.getVenueById(venueId);

    if (!venue) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Venue not found");
    }

    return Result.succeed(venue, "Venue retrieve success");
  }

  async getVenueByVenue(venue: string): Promise<Result<VenueData>> {
    const venueData: VenueData | undefined = await VenueRepository.getVenueByVenue(venue);

    if (!venueData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Venue not found");
    }

    return Result.succeed(venueData, "Venue retrieve success");
  }

  async getVenueByIdAndVenue(venueId: number, venue: string): Promise<Result<VenueData>> {
    const venueData: VenueData | undefined = await VenueRepository.getVenueByIdAndVenue(venueId, venue);

    if (!venueData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Venue not found");
    }

    return Result.succeed(venueData, "Venue retrieve success");
  }

  async createVenue(venue: string): Promise<Result<VenueData>> {
    const response = await venueRepository.createVenue(venue);

    const venueResponse: VenueData | undefined = await venueRepository.getVenueById(response.insertId);

    if (!venueResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Venue created not found");
    }

    return Result.succeed(venueResponse, "Venue create success");
  }

  async updateVenueById(venueId: number, venue: string): Promise<Result<VenueData>> {
    await venueRepository.updateVenueById(venueId, venue);

    const venueResponse: VenueData | undefined = await venueRepository.getVenueById(venueId);

    if (!venueResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Venue updated not found");
    }

    return Result.succeed(venueResponse, "Venue update success");
  }

  async deleteVenueById(venueId: number): Promise<Result<null>> {
    await venueRepository.deleteVenueById(venueId);

    return Result.succeed(null, "Venue delete success");
  }

  async getVenueCount(query: string = ""): Promise<Result<number>> {
    const venueCount: number = await venueRepository.getVenueCount(query);

    return Result.succeed(venueCount ? venueCount : 0, "Venue count retrieve success");
  }
}

export default new VenueService();
