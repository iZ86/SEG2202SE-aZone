import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { SubjectData, StudentSubjectData } from "../models/subject-model";
import { TotalCount } from "../models/general-model";

interface ISubjectRepository {
  getSubjects(query: string, pageSize: number | null, page: number | null): Promise<SubjectData[]>;
  getSubjectById(subjectId: number): Promise<SubjectData | undefined>;
  getSubjectBySubjectCode(subjectCode: string): Promise<SubjectData | undefined>;
  getSubjectByIdAndSubjectCode(subjectId: number, subjectCode: string): Promise<SubjectData | undefined>;
  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader>;
  deleteSubjectById(subjectId: number): Promise<ResultSetHeader>;
  getSubjectCount(query: string): Promise<number>;
  getSubjectsByStudentId(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<StudentSubjectData[]>;
  getSubjectsCountByStudentId(studentId: number, semester: number, query: string): Promise<number>;
}

class SubjectRepository implements ISubjectRepository {
  getSubjects(query: string, pageSize: number | null, page: number | null): Promise<SubjectData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
        SELECT *
        FROM SUBJECT
        WHERE subjectId LIKE ?
        OR subjectName LIKE ?
        OR subjectCode LIKE ? `;

      const params: any[] = [
        "%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
      ];

      if (page != null && pageSize != null) {
        const offset: number = (page - 1) * pageSize;
        sql += "LIMIT ? OFFSET ? ";
        params.push(pageSize, offset);
      }

      databaseConn.query<SubjectData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getSubjectById(subjectId: number): Promise<SubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<SubjectData[]>(
        "SELECT * " +
        "FROM SUBJECT " +
        "WHERE subjectId = ?;",
        [
          subjectId,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getSubjectBySubjectCode(subjectCode: string): Promise<SubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<SubjectData[]>(
        "SELECT * " +
        "FROM SUBJECT " +
        "WHERE subjectCode COLLATE utf8mb4_general_ci = ?;",
        [subjectCode],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getSubjectByIdAndSubjectCode(subjectId: number, subjectCode: string): Promise<SubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<SubjectData[]>(
        "SELECT * " +
        "FROM SUBJECT " +
        "WHERE subjectCode COLLATE utf8mb4_general_ci = ? " +
        "AND subjectId = ?;",
        [subjectCode, subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO SUBJECT (subjectCode, subjectName, description, creditHours) " +
        "VALUES (?, ?, ?, ?);",
        [subjectCode, subjectName, description, creditHours],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE SUBJECT SET subjectCode = ?, subjectName = ?, description = ?, creditHours = ? " +
        "WHERE subjectId = ?;",
        [subjectCode, subjectName, description, creditHours, subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteSubjectById(subjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM SUBJECT WHERE subjectId = ?;",
        [subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getSubjectCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM SUBJECT " +
        "WHERE subjectId LIKE ? " +
        "OR subjectName LIKE ? " +
        "OR subjectCode LIKE ?;",
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

  getSubjectsByStudentId(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<StudentSubjectData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentSubjectData[]>(
        "SELECT DISTINCT s.subjectId, s.subjectCode, s.subjectName, s.creditHours, sest.subjectStatusId, ss.subjectStatus " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN SUBJECT_STATUS ss ON sest.subjectStatusId = ss.subjectStatusId " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON es.enrollmentId = pi.enrollmentId " +
        "WHERE sest.studentId = ? " +
        "AND (s.subjectCode LIKE ? " +
        "OR s.subjectName LIKE ?) " +
        "AND (? = 0 OR pi.semester = ?) " +
        "ORDER BY sest.subjectStatusId, s.subjectId ASC " +
        "LIMIT ? OFFSET ?;",
        [
          studentId,
          "%" + query + "%",
          "%" + query + "%",
          semester,
          semester,
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

  getSubjectsCountByStudentId(studentId: number, semester: number, query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(DISTINCT(s.subjectId)) AS totalCount " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON es.enrollmentSubjectId = est.enrollmentSubjectId " +
        "INNER JOIN STUDENT_ENROLLMENT_SUBJECT_TYPE sest ON est.enrollmentSubjectTypeId = sest.enrollmentSubjectTypeId " +
        "INNER JOIN SUBJECT_STATUS ss ON sest.subjectStatusId = ss.subjectStatusId " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON e.enrollmentId = pi.enrollmentId " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON pi.programmeIntakeId = scpi.programmeIntakeId " +
        "WHERE sest.studentId = ? " +
        "AND (s.subjectCode LIKE ? " +
        "OR s.subjectName LIKE ?) " +
        "AND (? = 0 OR pi.semester = ?) ",
        [
          studentId,
          "%" + query + "%",
          "%" + query + "%",
          semester,
          semester,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0].totalCount);
        }
      );
    });
  }
}

export default new SubjectRepository();
