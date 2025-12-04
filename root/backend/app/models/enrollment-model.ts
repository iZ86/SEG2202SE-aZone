import { RowDataPacket } from "mysql2";

export interface EnrollmentData extends RowDataPacket {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
};

export interface EnrollmentProgrammeIntakeData extends RowDataPacket {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  studyModeId: number;
  studyMode: string;
  semester: number,
  semesterStartDate: Date;
  semesterEndDate: Date;
};

export interface EnrollmentSubjectData extends RowDataPacket {
  enrollmentSubjectId: number;
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
  lecturerId: number;
  firstName: string;
  lastName: string;
  lecturerTitleId: number;
  lecturerTitle: string;
  email: string;
  phoneNumber: string;
};
