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
  lectureId: number;
  firstName: string;
  lastName: string;
  lectureTitleId: number;
  lectureTitle: number;
  classTypes: [{
    classTypeId: number;
    classType: string;
    classTypeDetails: [{
      enrollmentSubjectTypeId: number;
      grouping: number;
      dayId: number;
      day: string;
      startTime: string;
      endTime: string;
    }]
  }]
};

export interface StudentEnrollmentSchedule {
  programmeIntakeId: number | null;
  enrollmentId: number | null;
  enrollmentStartDateTime: Date | null;
  enrollmentEndDateTime: Date | null;
}