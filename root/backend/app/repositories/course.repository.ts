import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { CourseData, CourseProgrammeData, CourseSubjectData } from "../models/course-model";
import { TotalCount } from "../models/general-model";

interface ICourseRepository {
  getCourses(query: string, pageSize: number, page: number): Promise<CourseProgrammeData[]>;
  getCourseById(courseId: number): Promise<CourseProgrammeData | undefined>;
  getCourseByName(courseName: string): Promise<CourseData | undefined>;
  getCoursesByProgrammeId(programmeId: number): Promise<CourseProgrammeData[] | undefined>;
  getCourseByIdAndCourseName(courseId: number, courseName: string): Promise<CourseProgrammeData | undefined>;
  createCourse(courseName: string, programmeId: number): Promise<ResultSetHeader>;
  updateCourseById(courseId: number, programmeId: number, courseName: string): Promise<ResultSetHeader>;
  deleteCourseById(courseId: number): Promise<ResultSetHeader>;
  getCourseCount(query: string): Promise<number>;
  getCourseSubjectBySubjectId(subjectId: number): Promise<CourseSubjectData[]>;
  getCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<CourseSubjectData | undefined>;
  getCourseSubjectCount(query: string): Promise<number>;
  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean>;
  createCourseSubject(courseId: number, subjectId: number): Promise<ResultSetHeader>;
  deleteCourseSubjectByAndSubjectId(subjectId: number): Promise<ResultSetHeader>;
}

class CourseRepository implements ICourseRepository {
  getCourses(query: string, pageSize: number, page: number): Promise<CourseProgrammeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseProgrammeData[]>(
        "SELECT c.courseId, c.courseName, p.programmeId, p.programmeName " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE c.courseId LIKE ? " +
        "OR c.courseName LIKE ? " +
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

  getCourseById(courseId: number): Promise<CourseProgrammeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseProgrammeData[]>(
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

  getCourseByName(courseName: string): Promise<CourseData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseData[]>(
        "SELECT courseId, courseName " +
        "FROM COURSE " +
        "WHERE courseName COLLATE utf8mb4_general_ci = ?;",
        [courseName],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getCoursesByProgrammeId(programmeId: number): Promise<CourseProgrammeData[] | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseProgrammeData[]>(
        "SELECT c.courseId, c.courseName, p.programmeId, p.programmeName " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE p.programmeId = ?;",
        [
          programmeId,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getCourseByIdAndCourseName(courseId: number, courseName: string): Promise<CourseProgrammeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseProgrammeData[]>(
        "SELECT c.courseId, c.courseName, p.programmeId, p.programmeName " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE c.courseId = ? " +
        "AND c.courseName COLLATE utf8mb4_general_ci = ?;",
        [courseId, courseName],
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

  getCourseCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE c.courseId LIKE ? " +
        "OR c.courseName LIKE ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0].totalCount);
        }
      );
    });
  }

  getCourseSubjectBySubjectId(subjectId: number): Promise<CourseSubjectData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseSubjectData[]>(
        "SELECT c.courseId, c.courseName, s.* " +
        "FROM COURSE c " +
        "INNER JOIN COURSE_SUBJECT cs ON c.courseId = cs.courseId " +
        "INNER JOIN SUBJECT s ON cs.subjectId = s.subjectId " +
        "WHERE cs.subjectId = ?;",
        [
          subjectId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<CourseSubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<CourseSubjectData[]>(
        "SELECT c.courseId, c.courseName, s.* " +
        "FROM COURSE c " +
        "INNER JOIN COURSE_SUBJECT cs ON c.courseId = cs.courseId " +
        "INNER JOIN SUBJECT s ON cs.subjectId = s.subjectId " +
        "WHERE c.courseId = ? " +
        "AND s.subjectId = ? ",
        "GROUP BY s.subjectId;" +
        [
          courseId,
          subjectId,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  getCourseSubjectCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(DISTINCT s.subjectId) AS totalCount " +
        "FROM COURSE c " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "INNER JOIN COURSE_SUBJECT cs ON c.courseId = cs.courseId " +
        "INNER JOIN SUBJECT s ON cs.subjectId = s.subjectId " +
        "WHERE s.subjectId LIKE ? " +
        "OR s.subjectName LIKE ? " +
        "OR s.subjectCode LIKE ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0].totalCount);
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
          resolve(Boolean(res?.[0].courseSubjectExists));
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

  deleteCourseSubjectByAndSubjectId(subjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM COURSE_SUBJECT WHERE subjectId = ?;",
        [subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new CourseRepository();
