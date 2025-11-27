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
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
  classTypeId: number;
  classType: string;
  venueId: number;
  venue: string;
  startTime: Date;
  endTime: Date;
  dayId: number;
  day: string;
};
