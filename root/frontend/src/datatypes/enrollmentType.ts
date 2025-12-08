import type { Time } from "@internationalized/date";

export type Enrollment = {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
};

export type EnrollmentProgrammeIntake = {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
  programmeIntakeId: number;
  programmeId: number;
  intakeId: number;
  semester: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
};

export type EnrollmentSubject = {
  enrollmentSubjectId: number;
  enrollmentId: number;
  subjectId: number;
  lecturerId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
  subjectCode: string;
  subjectName: string;
  description: number;
  creditHours: number;
  firstName: number;
  lastName: number;
  lecturerTitleId: number;
  email: string;
  phoneNumber: string;
  lecturerTitle: string;
};

export type EnrollmentSubjectType = {
  enrollmentSubjectTypeId: number;
  enrollmentSubjectId: number;
  classTypeId: number;
  classType: string;
  venueId: number;
  venue: string;
  dayId: number;
  day: string;
  startTime: Time;
  endTime: Time;
  numberOfSeats: number;
  grouping: number;
};

export type CreateEnrollmentSubjectType = {
  enrollmentSubjectId: number;
  classTypeId: number;
  venueId: number;
  dayId: number;
  startTime: string;
  endTime: string;
  numberOfSeats: number;
  grouping: number;
};

export type UpdateEnrollmentSubjectType = {
  classTypeId: number;
  venueId: number;
  dayId: number;
  startTime: string;
  endTime: string;
  numberOfSeats: number;
  grouping: number;
};

