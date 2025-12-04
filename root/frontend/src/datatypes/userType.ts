export type User = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  userStatus: number;
  role?: "Student" | "Admin";
};

export type StudentCourseProgrammeIntake = {
  studentId: number;
  courseId: number;
  courseName: string;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: string;
  semesterStartDate: string;
  semesterEndDate: string;
  courseStatus: number;
  status: string;
}

export type StudentInformation = {
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

export type StudentSubjectOverviewData = {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
}

export type StudentClassData = {
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
};

export interface StudentSubjectData {
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
