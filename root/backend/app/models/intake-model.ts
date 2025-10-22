import { RowDataPacket } from "mysql2";

export interface IntakeData extends RowDataPacket {
  intakeId: number;
}
