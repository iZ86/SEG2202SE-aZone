import { RowDataPacket } from "mysql2";
import { CourseSubjectData } from "./course-model";

export interface SubjectData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
}

export interface StudentSubjectData extends RowDataPacket {
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

/** Used when getting the subject data of active subjects for the student. */
export interface StudentSubjectOverviewData extends RowDataPacket {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  creditHours: number;
}

export interface SubjectWithCourseSubjectData extends SubjectData {
  courseSubjects: CourseSubjectData[]
}

export interface SubjectWithCountData {
  subjects: SubjectData[];
  subjectCount: number;
}

export interface StudentSubjectWithCountData {
  subjects: StudentSubjectData[];
  subjectCount: number;
}
