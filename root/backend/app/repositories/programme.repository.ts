import { ResultSetHeader } from "mysql2";
import { ProgrammeData, ProgrammeIntakeData } from "../models/programme-model";
import databaseConn from "../database/db-connection";

interface IProgrammeRepository {
  getProgrammes(query: string, pageSize: number, page: number): Promise<ProgrammeData[]>;
  getProgrammeById(programmeId: number): Promise<ProgrammeData | undefined>;
  createProgramme(programmeName: string): Promise<ResultSetHeader>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<ResultSetHeader>;
  deleteProgrammeById(programmeId: number): Promise<ResultSetHeader>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined>;
  getProgrammeIntakes(query: string, pageSize: number, page: number): Promise<ProgrammeIntakeData[]>;
  createProgrammeIntake(programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<ResultSetHeader>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<ResultSetHeader>;
  deleteProgrammeIntakeById(programmIntakeId: number): Promise<ResultSetHeader>;
}

class ProgrammeRepository implements IProgrammeRepository {
  getProgrammes(query: string, pageSize: number, page: number): Promise<ProgrammeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeData[]>(
        "SELECT programmeId, programmeName " +
        "FROM PROGRAMME " +
        "WHERE programmeId LIKE ? " +
        "OR programmeName LIKE ? " +
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

  getProgrammeIntakes(query: string, pageSize: number, page: number): Promise<ProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      const offset: number = (page - 1) * pageSize;
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartPeriod, semesterEndPeriod " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "WHERE pi.programmeIntakeId LIKE ? " +
        "OR p.programmeName LIKE ? " +
        "OR pi.intakeId LIKE ? " +
        "OR pi.semester LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
          "%" + query + "%",
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

  getProgrammeIntakeById(programmeIntakeId: number): Promise<ProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ProgrammeIntakeData[]>(
        "SELECT pi.programmeIntakeId, pi.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartPeriod, semesterEndPeriod " +
        "FROM PROGRAMME_INTAKE pi " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON pi.intakeId = i.intakeId " +
        "WHERE pi.programmeIntakeId = ?;",
        [programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createProgrammeIntake(programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO PROGRAMME_INTAKE (programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod) " +
        "VALUES (?, ?, ?, ?, ?);",
        [programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE PROGRAMME_INTAKE SET programmeId = ?, intakeId = ?, semester = ?, semesterStartPeriod = ?, semesterEndPeriod = ? " +
        "WHERE programmeIntakeId = ?;",
        [programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod, programmeIntakeId],
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
}

export default new ProgrammeRepository();
