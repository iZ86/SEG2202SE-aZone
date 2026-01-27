import { ResultSetHeader } from "mysql2";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData, StudentCourseProgrammeIntakeData } from "../models/programme-model";
import databaseConn from "../database/db-connection";
import { TotalCount } from "../models/general-model";
import { ENUM_PROGRAMME_STATUS } from "../enums/enums";


interface IProgrammeRepository {
  getProgrammes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeData[]>;
  getProgrammeById(programmeId: number): Promise<ProgrammeData | undefined>;
  getProgrammeByName(programmeName: string): Promise<ProgrammeData | undefined>;
  getProgrammeByIdAndName(programmeId: number, programmeName: string): Promise<ProgrammeData | undefined>;
  createProgramme(programmeName: string): Promise<ResultSetHeader>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<ResultSetHeader>;
  deleteProgrammeById(programmeId: number): Promise<ResultSetHeader>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined>;
  getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<ProgrammeIntakeData | undefined>;
  getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number): Promise<ProgrammeIntakeData | undefined>;
  getProgrammeIntakes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeIntakeData[]>;
  getProgrammeIntakesByProgrammeId(programmeId: number): Promise<ProgrammeIntakeData[]>;
  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<ResultSetHeader>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<ResultSetHeader>;
  deleteProgrammeIntakeById(programmIntakeId: number): Promise<ResultSetHeader>;
  updateProgrammeIntakeEnrollmentIdById(programmeIntakeId: number, enrollmentId: number): Promise<ResultSetHeader>;
  deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader>;
  getProgrammeCount(query: string): Promise<number>;
  getProgrammeIntakeCount(query: string): Promise<number>;
  getProgrammeHistoryByStudentId(studentId: number, status: number): Promise<ProgrammeHistoryData[]>;
  getStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
  getStudentCourseProgrammeIntakeByStudentId(studentId: number, status: number): Promise<StudentCourseProgrammeIntakeData[] | undefined>;
}

class ProgrammeRepository implements IProgrammeRepository {
  getProgrammes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
      SELECT programmeId, programmeName
      FROM PROGRAMME
      WHERE programmeId LIKE ?
      OR programmeName LIKE ? `;

      const params: any[] = [
        "%" + query + "%",
        "%" + query + "%",
      ];

      if (page != null && pageSize != null) {
        const offset: number = (page - 1) * pageSize;
        sql += "LIMIT ? OFFSET ? ";
        params.push(pageSize, offset);
      }
      databaseConn.query<ProgrammeData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getProgrammeById(programmeId: number): Promise<ProgrammeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeData[]>(
        "SELECT programmeId, programmeName " +
        "FROM PROGRAMME " +
        "WHERE programmeId = ?;",
        [programmeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getProgrammeByName(programmeName: string): Promise<ProgrammeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeData[]>(
        "SELECT programmeId, programmeName " +
        "FROM PROGRAMME " +
        "WHERE programmeName COLLATE utf8mb4_general_ci = ?;",
        [programmeName],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getProgrammeByIdAndName(programmeId: number, programmeName: string): Promise<ProgrammeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeData[]>(
        "SELECT programmeId, programmeName " +
        "FROM PROGRAMME " +
        "WHERE programmeName = ? " +
        "AND programmeId = ?;",
        [programmeName, programmeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createProgramme(programmeName: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO PROGRAMME (programmeName) " +
        "VALUES (?);",
        [programmeName],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateProgrammeById(programmeId: number, programmeName: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME SET programmeName = ? " +
        "WHERE programmeId = ?;",
        [programmeName, programmeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteProgrammeById(programmeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM PROGRAMME WHERE programmeId = ?;",
        [programmeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getProgrammeIntakes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
      SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.studyModeId, sm.studyMode, pi.semesterStartDate, pi.semesterEndDate
      FROM PROGRAMME_INTAKE pi
      INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId
      INNER JOIN INTAKE i ON pi.intakeId = i.intakeId
      INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId
      WHERE p.programmeName LIKE ?
      OR i.intakeId LIKE ? `;

      const params: any[] = [
        "%" + query + "%",
        "%" + query + "%",
      ];

      if (page != null && pageSize != null) {
        const offset: number = (page - 1) * pageSize;
        sql += "LIMIT ? OFFSET ? ";
        params.push(pageSize, offset);
      }

      databaseConn.query<ProgrammeIntakeData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getProgrammeIntakesByProgrammeId(programmeId: number): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.programmeId = ? ",
        [
          programmeId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, semesterEndDate " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.programmeIntakeId = ?;",
        [programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<ProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, semesterEndDate " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.programmeId = ? " +
        "AND pi.intakeId = ? " +
        "AND pi.semester = ?;",
        [programmeId, intakeId, semester],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number): Promise<ProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, semesterEndDate " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.programmeIntakeId = ? " +
        "AND pi.programmeId = ? " +
        "AND pi.intakeId = ? " +
        "AND pi.semester = ?;",
        [programmeIntakeId, programmeId, intakeId, semester],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO PROGRAMME_INTAKE (programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate) " +
        "VALUES (?, ?, ?, ?, ?, ?);",
        [programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME_INTAKE SET programmeId = ?, intakeId = ?, studyModeId = ?, semester = ?, semesterStartDate = ?, semesterEndDate = ? " +
        "WHERE programmeIntakeId = ?;",
        [programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteProgrammeIntakeById(programmIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM PROGRAMME_INTAKE WHERE programmeIntakeId = ?;",
        [programmIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateProgrammeIntakeEnrollmentIdById(programmeIntakeId: number, enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME_INTAKE SET enrollmentId = ? " +
        "WHERE programmeIntakeId = ?;",
        [enrollmentId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME_INTAKE SET enrollmentId = ? " +
        "WHERE enrollmentId = ?;",
        [null, enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getProgrammeCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM PROGRAMME " +
        "WHERE programmeId LIKE ? " +
        "OR programmeName LIKE ?;",
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

  getProgrammeIntakeCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE p.programmeName LIKE ? " +
        "OR i.intakeId LIKE ?; ",
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

  getProgrammeHistoryByStudentId(studentId: number, status: number): Promise<ProgrammeHistoryData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
          SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.status AS courseStatus
          FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi
          INNER JOIN COURSE c ON scpi.courseId = c.courseId
          INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId
          INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId
          INNER JOIN INTAKE i ON i.intakeId = pi.intakeId
          WHERE scpi.studentId = ? `;

      const params: any[] = [studentId];

      if (status && status != 0) {
        sql += "AND scpi.status = ?;";
        params.push(status);
      }

      databaseConn.query<ProgrammeHistoryData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  getStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.status AS courseStatus " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE scpi.studentId = ? " +
        "AND scpi.courseId = ? " +
        "AND scpi.programmeIntakeId = ?;",
        [
          studentId, courseId, programmeIntakeId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  };

  updateStudentCourseProgrammeIntakeStatusByStudentIdAndStatus(studentId: number, status: ENUM_PROGRAMME_STATUS): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE STUDENT_COURSE_PROGRAMME_INTAKE SET status = ? " +
        "WHERE studentId = ? " +
        "AND status = ?;",
        [status, studentId, 1],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };


  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT_COURSE_PROGRAMME_INTAKE (studentId, courseId, programmeIntakeId, status) " +
        "VALUES (?, ?, ?, ?);",
        [studentId, courseId, programmeIntakeId, 1],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  getStudentCourseProgrammeIntakeByStudentId(studentId: number, status: number): Promise<StudentCourseProgrammeIntakeData[] | undefined> {
    return new Promise((resolve, reject) => {
      let sql: string = `
          SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.status AS courseStatus
          FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi
          INNER JOIN COURSE c ON scpi.courseId = c.courseId
          INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId
          INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId
          INNER JOIN INTAKE i ON i.intakeId = pi.intakeId
          WHERE scpi.studentId = ? `;

      const params: any[] = [studentId];

      if (status && status != 0) {
        sql += "AND scpi.status = ?;";
        params.push(status);
      }

      databaseConn.query<StudentCourseProgrammeIntakeData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };
}

export default new ProgrammeRepository();
