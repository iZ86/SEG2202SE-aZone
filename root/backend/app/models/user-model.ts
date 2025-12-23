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

export interface StudentSemesterStartAndEndData extends RowDataPacket {
  semesterStartDate: Date;
  semesterEndDate: Date;
}

/** Used when getting the subject data of active subjects for the student. */
export interface StudentSubjectOverviewData extends RowDataPacket {
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
