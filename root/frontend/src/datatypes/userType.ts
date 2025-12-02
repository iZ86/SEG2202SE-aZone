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
