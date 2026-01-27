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
  semesterStartDate: Date;
  semesterEndDate: Date;
}

export interface ProgrammeHistoryData extends RowDataPacket {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  courseId: number;
  courseName: string;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  courseStatus: number;
}

export interface StudentCourseProgrammeIntakeData extends RowDataPacket {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  courseId: number;
  courseName: string;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  courseStatus: number;
}
