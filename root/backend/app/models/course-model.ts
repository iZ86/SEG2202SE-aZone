import { RowDataPacket } from "mysql2";

export interface CourseData extends RowDataPacket {
  courseId: number;
  courseCode: string;
  courseName: string;
}

export interface CourseProgrammeData extends RowDataPacket {
  courseId: number;
  courseName: string;
  programmeId: number;
  programmeName: string;
}

export interface CourseSubjectData extends RowDataPacket {
  courseId: number;
  courseName: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
}

export interface CourseProgrammeSubjectData extends RowDataPacket {
  courseId: number;
  courseName: string;
  programmeId: number;
  programmeName: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  creditHours: number;
}
