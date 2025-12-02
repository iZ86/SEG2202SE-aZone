import { RowDataPacket } from "mysql2";

export interface UserData extends RowDataPacket {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
}

/** Gets non personal information, such as latest course, intake, etc. */
export interface StudentInformation extends RowDataPacket {
  courseName: string;
  intake: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  studyMode: string;
  status: number;
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
