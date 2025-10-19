import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { CourseData, CourseSubjectData } from "../models/course-model";

interface ICourseRepository {
  getCourses(query: string, pageSize: number, page: number): Promise<CourseData[]>;
  getCourseById(courseId: number): Promise<CourseData>;
  createCourse(courseName: string, programmeId: number): Promise<ResultSetHeader>;
  updateCourseById(courseId: number, programmeId: number, courseName: string): Promise<ResultSetHeader>;
  deleteCourseById(courseId: number): Promise<ResultSetHeader>;
  getCourseSubjectByCourseId(courseId: number, query: string, pageSize: number, page: number): Promise<CourseSubjectData[]>;
  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean>;
  createCourseSubject(courseId: number, subjectId: number): Promise<ResultSetHeader>;
  deleteCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<ResultSetHeader>;
}

class CourseRepository implements ICourseRepository {
  getCourses(query: string, pageSize: number, page: number): Promise<CourseData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseData[]>(
        "SELECT c.courseId, c.courseName, p.programmeId, p.programmeName " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE c.courseName LIKE ? " +
        "OR p.programmeName LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          pageSize,
          offset,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getCourseById(courseId: number): Promise<CourseData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseData[]>(
        "SELECT c.courseId, c.courseName, p.programmeId, p.programmeName " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE c.courseId = ?;",
        [
          courseId,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  createCourse(courseName: string, programmeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO COURSE (programmeId, courseName) " +
        "VALUES (?, ?);",
        [programmeId, courseName],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateCourseById(courseId: number, programmeId: number, courseName: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE COURSE SET programmeId = ?, courseName = ? " +
        "WHERE courseId = ?;",
        [programmeId, courseName, courseId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteCourseById(courseId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM COURSE WHERE courseId = ?;",
        [courseId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getCourseSubjectByCourseId(courseId: number, query: string, pageSize: number, page: number): Promise<CourseSubjectData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseSubjectData[]>(
        "SELECT c.courseId, c.courseName, p.programmeId, p.programmeName, s.* " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "INNER JOIN COURSE_SUBJECT cs ON c.courseId = cs.courseId " +
        "INNER JOIN SUBJECT s ON cs.subjectId = s.subjectId " +
        "WHERE c.courseId = ? " +
        "AND (s.subjectName LIKE ? " +
        "OR s.subjectCode LIKE ? " +
        "OR s.creditHours LIKE ?) " +
        "LIMIT ? OFFSET ?;",
        [
          courseId,
          "%" + query + "%",
          "%" + query + "%",
          "%" + query + "%",
          pageSize,
          offset,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      databaseConn.query(
        "SELECT EXISTS(SELECT 1 " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "INNER JOIN COURSE_SUBJECT cs ON c.courseId = cs.courseId " +
        "INNER JOIN SUBJECT s ON cs.subjectId = s.subjectId " +
        "WHERE c.courseId = ? " +
        "AND s.subjectId = ? ) AS courseSubjectExists;",
        [
          courseId,
          subjectId,
        ],
        (err, res: any[]) => {
          if (err) reject(err);
          resolve(Boolean(res[0].courseSubjectExists));
        }
      );
    });
  }

  createCourseSubject(courseId: number, subjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO COURSE_SUBJECT (courseId, subjectId) " +
        "VALUES (?, ?);",
        [courseId, subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM COURSE_SUBJECT WHERE courseId = ? AND subjectId = ?;",
        [courseId, subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new CourseRepository();
