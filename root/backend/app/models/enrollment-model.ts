import { RowDataPacket } from "mysql2";

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
      startTime: Date;
      endTime: Date;
      numberOfStudentsEnrolled: number;
      numberOfSeats: number;
    }[];
  }[];
};

export interface EnrollmentData extends RowDataPacket {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
};

export interface EnrollmentProgrammeIntakeData extends RowDataPacket {
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  studyModeId: number;
  studyMode: string;
  semester: number,
  semesterStartDate: Date;
  semesterEndDate: Date;
};

export interface EnrollmentSubjectData extends RowDataPacket {
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
};

export interface EnrollmentSubjectWithTypesData extends EnrollmentSubjectData {
  enrollmentSubjectTypes: EnrollmentSubjectTypeData[];
}

/** This model is used when returning enrollmentSubjectTypes.
 * But this is only because of enrollment.service getEnrollmentSubjectTypesByEnrollmentId.
 * Currently, this is the only method that gets erollmentSubjectType and returns it as a response.
 **/
export interface EnrollmentSubjectTypesData {
  enrollmentSubjectId: number;
  enrollmentSubjectTypes: EnrollmentSubjectTypeData[];
}

export interface EnrollmentSubjectTypeData extends RowDataPacket {
  enrollmentSubjectTypeId: number;
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
};

export interface StudentEnrollmentSubjectData extends RowDataPacket {
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
  venueId: number;
  venue: string;
  classTypeId: number;
  classType: string;
  grouping: number;
  dayId: number;
  day: string;
  startTime: Date;
  endTime: Date;
  numberOfStudentsEnrolled: number;
  numberOfSeats: number;
};

export interface StudentEnrolledSubject extends RowDataPacket {
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
  startTime: Date;
  endTime: Date;
}

export interface StudentEnrollmentSchedule extends RowDataPacket {
  programmeIntakeId: number;
  enrollmentId: number;
  enrollmentStartDateTime: Date;
  enrollmentEndDateTime: Date;
}

export interface StudentEnrolledSubjectTypeIds {
  enrollmentSubjectTypeIds: number[];
}

export interface MonthlyEnrollmentData extends RowDataPacket {
  month: string;
  enrollmentCount: number;
}

export interface CreateEnrollmentSubjectTypeData {
  enrollmentSubjectId: number;
  classTypeId: number;
  venueId: number;
  startTime: Date;
  endTime: Date;
  dayId: number;
  numberOfSeats: number;
  grouping: number;
}
