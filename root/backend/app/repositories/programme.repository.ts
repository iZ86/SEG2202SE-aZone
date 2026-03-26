import { ResultSetHeader } from "mysql2";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData, StudentCourseProgrammeIntakeData, ProgrammeDistribution } from "../models/programme-model";
import databaseConn from "../database/db-connection";
import { IsExist, TotalCount } from "../models/general-model";
import { ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID } from "../enums/enums";


interface IProgrammeRepository {
  getProgrammes(query: string, pageSize: number, page: number): Promise<ProgrammeData[]>;
  getProgrammeById(programmeId: number): Promise<ProgrammeData | undefined>;
  getProgrammeByName(programmeName: string): Promise<ProgrammeData | undefined>;
  createProgramme(programmeName: string): Promise<ResultSetHeader>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<ResultSetHeader>;
  deleteProgrammeById(programmeId: number): Promise<ResultSetHeader>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined>;
  getProgrammeIntakesByIds(programmeIntakeIds: number[]): Promise<ProgrammeIntakeData[]>;
  getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<ProgrammeIntakeData | undefined>;
  getProgrammeIntakes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeIntakeData[]>;
  getProgrammeIntakesByProgrammeId(programmeId: number): Promise<ProgrammeIntakeData[]>;
  getProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<ProgrammeIntakeData[]>;
  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<ResultSetHeader>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<ResultSetHeader>;
  deleteProgrammeIntakeById(programmIntakeId: number): Promise<ResultSetHeader>;
  updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds: number[], enrollmentId: number): Promise<ResultSetHeader>;
  deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader>;
  getProgrammeCount(query: string): Promise<number>;
  getProgrammeIntakeCount(query: string): Promise<number>;
  getProgrammeHistoryByStudentId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<ProgrammeHistoryData[]>;
  getStudentCourseProgrammeIntakeById(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined>;
  updateStudentCourseProgrammeIntakeStatusByStudentIdAndStatus(studentId: number, oldStudentCourseProgrammeIntakeStatusId: number, newStudentCourseProgrammeIntakeStatusId: number): Promise<ResultSetHeader>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, studentCourseProgrammeIntakeStatusId: number): Promise<ResultSetHeader>;
  deleteStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
  getProgrammeDistribution(): Promise<ProgrammeDistribution[]>;
  getProgrammeIntakesByProgrammeIntakeStatusId(programmeIntakeStatusId: number): Promise<ProgrammeIntakeData[]>;
  isExistProgrammeIntakesByProgrammeId(programmeId: number): Promise<IsExist | undefined>;
  getStudentCourseProgrammeIntakeByIdAndStatusId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<StudentCourseProgrammeIntakeData | undefined>;
}

class ProgrammeRepository implements IProgrammeRepository {
  public getProgrammes(query: string, pageSize: number, page: number): Promise<ProgrammeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeData[]>(
        "SELECT p.programmeId, p.programmeName " +
        "FROM PROGRAMME p " +
        "WHERE p.programmeId LIKE ? " +
        "OR p.programmeName LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          pageSize,
          offset
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getProgrammeById(programmeId: number): Promise<ProgrammeData | undefined> {
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

  public getProgrammeByName(programmeName: string): Promise<ProgrammeData | undefined> {
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

  public createProgramme(programmeName: string): Promise<ResultSetHeader> {
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

  public updateProgrammeById(programmeId: number, programmeName: string): Promise<ResultSetHeader> {
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

  public deleteProgrammeById(programmeId: number): Promise<ResultSetHeader> {
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

  public getProgrammeIntakes(query: string, pageSize: number, page: number): Promise<ProgrammeIntakeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.studyModeId, " +
        "sm.studyMode, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE p.programmeName LIKE ? " +
        "OR i.intakeId LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          pageSize,
          offset
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getProgrammeIntakesByProgrammeId(programmeId: number): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
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

  public getProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.enrollmentId = ? ",
        [
          enrollmentId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
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

  public getProgrammeIntakesByIds(programmeIntakeIds: number[]): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.programmeIntakeId IN (?);",
        [programmeIntakeIds],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<ProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
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

  public createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO PROGRAMME_INTAKE (programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, programmeIntakeStatusId) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?);",
        [programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, programmeIntakeStatusId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME_INTAKE SET programmeId = ?, intakeId = ?, studyModeId = ?, semester = ?, semesterStartDate = ?, semesterEndDate = ?, programmeIntakeStatusId = ? " +
        "WHERE programmeIntakeId = ?;",
        [programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, programmeIntakeStatusId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public deleteProgrammeIntakeById(programmIntakeId: number): Promise<ResultSetHeader> {
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

  public updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds: number[], enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME_INTAKE SET enrollmentId = ? " +
        "WHERE programmeIntakeId IN (?);",
        [enrollmentId, programmeIntakeIds],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader> {
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

  public getProgrammeCount(query: string): Promise<number> {
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
          resolve(res[0]?.totalCount ?? 0);
        }
      );
    });
  }

  public getProgrammeIntakeCount(query: string): Promise<number> {
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
          resolve(res[0]?.totalCount ?? 0);
        }
      );
    });
  }

  public getProgrammeHistoryByStudentId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<ProgrammeHistoryData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
          SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.studentCourseProgrammeIntakeStatusId
          FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi
          INNER JOIN COURSE c ON scpi.courseId = c.courseId
          INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId
          INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId
          INNER JOIN INTAKE i ON i.intakeId = pi.intakeId
          WHERE scpi.studentId = ? `;

      const params: any[] = [studentId];

      if (studentCourseProgrammeIntakeStatusId != ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID.ALL) {
        sql += "AND scpi.studentCourseProgrammeIntakeStatusId = ?;";
        params.push(studentCourseProgrammeIntakeStatusId);
      }

      databaseConn.query<ProgrammeHistoryData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  public getStudentCourseProgrammeIntakeById(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.studentCourseProgrammeIntakeStatusId " +
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

  public updateStudentCourseProgrammeIntakeStatusByStudentIdAndStatus(studentId: number, oldStudentCourseProgrammeIntakeStatusId: number, newStudentCourseProgrammeIntakeStatusId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE STUDENT_COURSE_PROGRAMME_INTAKE SET studentCourseProgrammeIntakeStatusId = ? " +
        "WHERE studentId = ? " +
        "AND studentCourseProgrammeIntakeStatusId = ?;",
        [newStudentCourseProgrammeIntakeStatusId, studentId, oldStudentCourseProgrammeIntakeStatusId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };


  public createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, studentCourseProgrammeIntakeStatusId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT_COURSE_PROGRAMME_INTAKE (studentId, courseId, programmeIntakeId, studentCourseProgrammeIntakeStatusId) " +
        "VALUES (?, ?, ?, ?);",
        [studentId, courseId, programmeIntakeId, studentCourseProgrammeIntakeStatusId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  public deleteStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM STUDENT_COURSE_PROGRAMME_INTAKE " +
        "WHERE studentId = ? " +
        "AND courseId = ? " +
        "AND programmeIntakeId = ?;",
        [studentId, courseId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getProgrammeDistribution(): Promise<ProgrammeDistribution[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeDistribution[]>(
        "SELECT p.programmeName, COUNT(*) AS count, ROUND(COUNT(*) * 100 / SUM(COUNT(*)) OVER (), 0) AS percentage " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME p ON c.programmeId = p.programmeId " +
        "WHERE scpi.studentCourseProgrammeIntakeStatusId = 1 " +
        "GROUP BY p.programmeName;",
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getProgrammeIntakesByProgrammeIntakeStatusId(programmeIntakeStatusId: number): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.studyModeId, sm.studyMode, pi.semester, pi.semesterStartDate, pi.semesterEndDate, pi.enrollmentId, pi.programmeIntakeStatusId " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE pi.programmeIntakeStatusId = ?;",
        [
          programmeIntakeStatusId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public isExistProgrammeIntakesByProgrammeId(programmeId: number): Promise<IsExist | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<IsExist[]>(
        "SELECT 1 AS value " +
        "FROM PROGRAMME_INTAKE " +
        "WHERE programmeId = ? " +
        "LIMIT 1",
        [
          programmeId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public getStudentCourseProgrammeIntakeByIdAndStatusId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<StudentCourseProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.studentCourseProgrammeIntakeStatusId " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE scpi.studentId = ? " +
        "AND scpi.studentCourseProgrammeIntakeStatusId = ?;",
        [
          studentId, studentCourseProgrammeIntakeStatusId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  };
}

export default new ProgrammeRepository();
