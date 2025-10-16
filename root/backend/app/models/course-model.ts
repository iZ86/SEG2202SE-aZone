import { RowDataPacket } from "mysql2";

export interface CourseData extends RowDataPacket {
  courseId: number;
  courseName: string;
  programmeId: number;
  programmeName: string;
}