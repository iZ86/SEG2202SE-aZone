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

export interface StudentClassData extends RowDataPacket {
  enrollmentSubjectId: number;
  startTime: string;
  endTime: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  lecturerId: number;
  lecturerFirstName: string;
  lecturerLastName: string;
  lecturerTitleId: number;
  lecturerTitle: string;
  email: string;
  classTypeId: number;
  classType: string;
  venueId: number;
  venue: string;
  grouping: string;
  dayId: number;
  day: string;
}
