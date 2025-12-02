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
  courseId: number;
  courseName: string;
  programmeIntakeId: number;
  intake: number;
  semester: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  studyModeId: number;
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

export interface StudentEnrollmentSubjectData extends RowDataPacket {
  studentId: number;
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
  classTypeId: number;
  classType: string;
  venueId: number;
  venue: string;
  startTime: Date;
  endTime: Date;
  dayId: number;
  day: string;
  numberOfSeats: number;
  grouping: number;
  subjectStatusId: number;
  subjectStatus: string;
}

export interface StudentSemesterStartAndEndData extends RowDataPacket {
  semesterStartDate: Date;
  semesterEndDate: Date;
}
