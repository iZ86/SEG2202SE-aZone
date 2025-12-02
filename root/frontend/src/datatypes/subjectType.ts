export type Subject = {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
};

export type StudentSubjectData = {
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
