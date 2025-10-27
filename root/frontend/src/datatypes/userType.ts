export type User = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userStatus: number;
  courseId: number;
  courseName: string;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: string;
  semesterStartPeriod: string;
  semesterEndPeriod: string;
  courseStatus: number;
  role: "Student" | "Admin";
};
