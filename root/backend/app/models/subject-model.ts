import { RowDataPacket } from "mysql2";

export interface SubjectData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
}

/** Used when getting the subject data of active subjects for the student. */
export interface StudentSubjectData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
}
