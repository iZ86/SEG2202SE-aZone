import { RowDataPacket } from "mysql2";

export interface EnrollmentData extends RowDataPacket {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
};
