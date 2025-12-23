import { RowDataPacket } from "mysql2";

export interface SubjectData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
}

export interface StudentSubjectData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
  subjectStatusId: number;
  subjectStatus: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  programmeIntakeId: number;
  semester: number;
  intake: number;
  studyModeId: number;
  studyMode: string;
}

/** Used when getting the subject data of active subjects for the student. */
export interface StudentSubjectOverviewData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
}
