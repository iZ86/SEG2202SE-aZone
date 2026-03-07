import { RowDataPacket } from "mysql2";

export interface VenueData extends RowDataPacket {
  venueId: number;
  venue: string;
};

export interface VenueWithCountData {
  venues: VenueData[];
  venueCount: number;
}
