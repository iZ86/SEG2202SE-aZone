import { RowDataPacket } from "mysql2";

export interface UserData extends RowDataPacket {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  userStatusId: number;
  userStatus: string;
}

export interface UserWithCountData {
  users: UserData[];
  userCount: number;
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
  studentCourseProgrammeIntakeStatusId: number;
  studentCourseProgrammeIntakeStatus: string;
}

export interface StudentSemesterStartAndEndData extends RowDataPacket {
  semesterStartDate: Date;
  semesterEndDate: Date;
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

export interface StudentTimeTable extends StudentSemesterStartAndEndData {
  timetable: StudentClassData[];
}
