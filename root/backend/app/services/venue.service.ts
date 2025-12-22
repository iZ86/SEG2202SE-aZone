import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { VenueData } from "../models/venue-model";
import venueRepository from "../repositories/venue.repository";

interface IVenueService {
  getVenues(query: string, pageSize: number, page: number): Promise<Result<VenueData[]>>;
  getVenueById(venueId: number): Promise<Result<VenueData>>;
  getVenueByVenue(venue: string): Promise<Result<VenueData>>;
  getVenueByIdAndVenue(venueId: number, venue: string): Promise<Result<VenueData>>;
  createVenue(venue: string): Promise<Result<VenueData>>;
  updateVenueById(venueId: number, venue: string): Promise<Result<VenueData>>;
  deleteVenueById(venueId: number): Promise<Result<null>>;
  getVenueCount(query: string): Promise<Result<number>>;
}

class VenueService implements IVenueService {
  async getVenues(query: string = "", pageSize: number, page: number): Promise<Result<VenueData[]>> {
    const venues: VenueData[] = await venueRepository.getVenues(query, pageSize, page);

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
    const venueData: VenueData | undefined = await venueRepository.getVenueByVenue(venue);

    if (!venueData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Venue not found");
    }

    return Result.succeed(venueData, "Venue retrieve success");
  }

  async getVenueByIdAndVenue(venueId: number, venue: string): Promise<Result<VenueData>> {
    const venueData: VenueData | undefined = await venueRepository.getVenueByIdAndVenue(venueId, venue);

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
    const updateVenueResponse: ResultSetHeader = await venueRepository.updateVenueById(venueId, venue);

    if (updateVenueResponse.affectedRows === 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to update venue");
    }

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
