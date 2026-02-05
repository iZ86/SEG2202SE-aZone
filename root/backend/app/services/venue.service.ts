import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { VenueData } from "../models/venue-model";
import venueRepository from "../repositories/venue.repository";

interface IVenueService {
  getVenues(query: string, pageSize: number, page: number): Promise<Result<VenueData[]>>;
  getVenueById(venueId: number): Promise<Result<VenueData>>;
  getVenueByVenue(venue: string): Promise<Result<VenueData>>;
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

  async createVenue(venue: string): Promise<Result<VenueData>> {
    const venueResult: Result<VenueData> = await this.getVenueByVenue(venue);

    if (venueResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Venue duplicated");
    }

    const createVenueResult: ResultSetHeader = await venueRepository.createVenue(venue);

    if (createVenueResult.affectedRows === 0) {
      throw new Error("createVenue failed to insert");
    }

    const venueResponse: Result<VenueData> = await this.getVenueById(createVenueResult.insertId);

    if (!venueResponse.isSuccess()) {
      throw new Error("createVenue created venue not found");
    }

    return Result.succeed(venueResponse.getData(), "Venue create success");
  }

  async updateVenueById(venueId: number, venue: string): Promise<Result<VenueData>> {
    const venueResult: Result<VenueData> = await this.getVenueById(venueId);

    if (!venueResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, venueResult.getMessage());
    }

    if (venueResult.getData().venue !== venue) {
      const isVenueExistResult: Result<VenueData> = await this.getVenueByVenue(venue);

      if (isVenueExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Venue duplicated");
      }
    }

    const updateVenueResult: ResultSetHeader = await venueRepository.updateVenueById(venueId, venue);

    if (updateVenueResult.affectedRows === 0) {
      throw new Error("updateVenueById failed to update");
    }

    const venueResponse: Result<VenueData> = await this.getVenueById(venueId);

    if (!venueResponse.isSuccess()) {
      throw new Error("updateVenueById updated venue not found");
    }

    return Result.succeed(venueResponse.getData(), "Venue update success");
  }

  async deleteVenueById(venueId: number): Promise<Result<null>> {
    const venueResult: Result<VenueData> = await this.getVenueById(venueId);

    if (!venueResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, venueResult.getMessage());
    }

    const deleteVenueResult: ResultSetHeader = await venueRepository.deleteVenueById(venueId);

    if (deleteVenueResult.affectedRows === 0) {
      throw new Error("deleteVenueById failed to delete");
    }

    return Result.succeed(null, "Venue delete success");
  }

  async getVenueCount(query: string = ""): Promise<Result<number>> {
    const venueCount: number = await venueRepository.getVenueCount(query);

    return Result.succeed(venueCount ? venueCount : 0, "Venue count retrieve success");
  }
}

export default new VenueService();
