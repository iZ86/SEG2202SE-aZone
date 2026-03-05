import { RowDataPacket } from "mysql2";

export interface IntakeData extends RowDataPacket {
  intakeId: number;
}

export interface IntakeWithCountData {
  intakes: IntakeData[];
  intakeCount: number;
}
