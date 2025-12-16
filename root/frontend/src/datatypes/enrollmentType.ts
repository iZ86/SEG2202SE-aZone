import type { Time } from "@internationalized/date";
import type { ClassType } from "./classTypeType";

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

export interface StudentEnrollmentSubjectOrganizedData {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
  lecturerId: number;
  firstName: string;
  lastName: string;
  lecturerTitleId: number;
  lecturerTitle: string;
  classTypes: {
    classTypeId: number;
    classType: string;
    classTypeDetails: {
      enrollmentSubjectTypeId: number;
      grouping: number;
      dayId: number;
      day: string;
      startTime: string;
      endTime: string;
      numberOfStudentsEnrolled: number;
      numberOfSeats: number;
    }[]
  }[]
};

export interface StudentEnrollmentSchedule {
  programmeIntakeId: number;
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
}

export interface StudentEnrolledSubject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
  lecturerId: number;
  firstName: string;
  lastName: string;
  lecturerTitleId: number;
  lecturerTitle: string;
  enrollmentSubjectTypeId: number;
  classTypeId: number;
  classType: string;
  grouping: number;
  dayId: number;
  day: string;
  startTime: Time;
  endTime: Time;
  numberOfSeats: number;
};

export type CreateEnrollmentSubjectType = {
  classTypeId: number;
  venueId: number;
  dayId: number;
  startTime: string;
  endTime: string;
  numberOfSeats: number;
  grouping: number;
};

export type UpdateEnrollmentSubjectType = {
  enrollmentSubjectTypeId: number;
  classTypeId: number;
  venueId: number;
  dayId: number;
  startTime: string;
  endTime: string;
  numberOfSeats: number;
  grouping: number;
};

export interface EnrollmentSubjectResponse {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
  lecturerTitle: string;
  firstName: string;
  lastName: string;
  classTypes: ClassType[];
}
