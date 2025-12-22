import { VenueData } from "../models/venue-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";
import { TotalCount } from "../models/general-model";

interface IVenueRepository {
  getVenues(query: string, pageSize: number, page: number): Promise<VenueData[]>;
  getVenueById(venueId: number): Promise<VenueData | undefined>;
  getVenueByVenue(venue: string): Promise<VenueData | undefined>;
  getVenueByIdAndVenue(venueId: number, venue: string): Promise<VenueData | undefined>;
  createVenue(venue: string): Promise<ResultSetHeader>;
  updateVenueById(venueId: number, venue: string): Promise<ResultSetHeader>;
  deleteVenueById(venueId: number): Promise<ResultSetHeader>;
  getVenueCount(query: string): Promise<number>;
}

class VenueRepository implements IVenueRepository {
  getVenues(query: string, pageSize: number, page: number): Promise<VenueData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<VenueData[]>(
        "SELECT * " +
        "FROM VENUE " +
        "WHERE venueId LIKE ? " +
        "OR venue LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          pageSize,
          offset,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getVenueById(venueId: number): Promise<VenueData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<VenueData[]>(
        "SELECT * " +
        "FROM VENUE " +
        "WHERE venueId = ?;",
        [venueId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getVenueByVenue(venue: string): Promise<VenueData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<VenueData[]>(
        "SELECT * " +
        "FROM VENUE " +
        "WHERE venue = ?;",
        [venue],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getVenueByIdAndVenue(venueId: number, venue: string): Promise<VenueData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<VenueData[]>(
        "SELECT * " +
        "FROM VENUE " +
        "WHERE venue = ? " +
        "AND venueId = ?;",
        [venue, venueId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createVenue(venue: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO VENUE (venue) " +
        "VALUES (?);",
        [venue],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateVenueById(venueId: number, venue: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE VENUE SET venue = ? " +
        "WHERE venueId = ?;",
        [venue, venueId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteVenueById(venueId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM VENUE WHERE venueId = ?;",
        [venueId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getVenueCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM VENUE " +
        "WHERE venueId LIKE ? " +
        "OR venue LIKE ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0].totalCount);
        }
      );
    });
  }
}

export default new VenueRepository();
