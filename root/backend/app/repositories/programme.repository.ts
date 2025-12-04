import { ResultSetHeader } from "mysql2";
import { ProgrammeData, ProgrammeIntakeData } from "../models/programme-model";
import databaseConn from "../database/db-connection";
import { TotalCount } from "../models/general-model";

interface IProgrammeRepository {
  getAllProgrammes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeData[]>;
  getProgrammeById(programmeId: number): Promise<ProgrammeData | undefined>;
  getProgrammeByName(programmeName: string): Promise<ProgrammeData | undefined>;
  getProgrammeByIdAndName(programmeId: number, programmeName: string): Promise<ProgrammeData | undefined>;
  createProgramme(programmeName: string): Promise<ResultSetHeader>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<ResultSetHeader>;
  deleteProgrammeById(programmeId: number): Promise<ResultSetHeader>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined>;
  getAllProgrammeIntakes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeIntakeData[]>;
  getProgrammeIntakesByProgrammeId(programmeId: number): Promise<ProgrammeIntakeData[]>;
  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<ResultSetHeader>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<ResultSetHeader>;
  deleteProgrammeIntakeById(programmIntakeId: number): Promise<ResultSetHeader>;
  getProgrammeCount(query: string): Promise<number>;
  getProgrammeIntakeCount(query: string): Promise<number>;
}

class ProgrammeRepository implements IProgrammeRepository {
  getAllProgrammes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeData[]> {
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

  getAllProgrammeIntakes(query: string, pageSize: number | null, page: number | null): Promise<ProgrammeIntakeData[]> {
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
}

export default new ProgrammeRepository();
