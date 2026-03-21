import { RowDataPacket } from "mysql2";

export interface ProgrammeData extends RowDataPacket {
  programmeId: number;
  programmeName: string;
}

export interface ProgrammeWithCountData {
  programmes: ProgrammeData[];
  programmeCount: number;
}

export interface ProgrammeIntakeData extends RowDataPacket {
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  studyModeId: number;
  studyMode: string;
  semester: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  enrollmentId: number | null;
  programmeIntakeStatusId: number;
}

export interface ProgrammeIntakeWithCountData {
  programmeIntakes: ProgrammeIntakeData[];
  programmeIntakeCount: number;
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
  studentCourseProgrammeIntakeStatusId: number;
  statusLabel: string;
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
  studentCourseProgrammeIntakeStatusId: number;
}

export interface ProgrammeDistribution extends RowDataPacket {
  programmeName: string;
  count: number;
  percentage: number;
}

export interface SemesterSchedule {
  semesterStartDate: Date;
  semesterEndDate: Date;
}
