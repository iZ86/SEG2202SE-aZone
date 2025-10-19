import { RowDataPacket } from "mysql2";

export interface SubjectData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
}