import { RowDataPacket } from "mysql2";

export interface ProgrammeData extends RowDataPacket {
  programmeId: number;
  programmeName: string;
}

export interface ProgrammeIntakeData extends RowDataPacket {
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: number;
  semesterStartPeriod: Date;
  semesterEndPeriod: Date;
}