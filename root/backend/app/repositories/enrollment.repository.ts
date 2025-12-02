import { EnrollmentData, EnrollmentProgrammeIntakeData } from "../models/enrollment-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";
import { TotalCount } from "../models/general-model";

interface IEnrollmentRepository {
  getAllEnrollments(query: string, pageSize: number, page: number): Promise<EnrollmentData[]>;
  getEnrollmentById(enrollmentId: number): Promise<EnrollmentData | undefined>;
  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader>;
  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader>;
  deleteEnrollmentById(enrollmentId: number): Promise<ResultSetHeader>;
  getEnrollmentCount(query: string): Promise<number>;
  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined>;
  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<EnrollmentProgrammeIntakeData[]>;
  getEnrollmentProgrammeIntakeByEnrollmentIdAndProgrammeIntakeId(enrollmentId: number, programmeIntakeId: number): Promise<EnrollmentProgrammeIntakeData | undefined>;
  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader>;
}

class EnrollmentRepository implements IEnrollmentRepository {
  getAllEnrollments(query: string, pageSize: number, page: number): Promise<EnrollmentData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId LIKE ? " +
        "ORDER BY enrollmentStartDateTime ASC " +
        "LIMIT ? OFFSET ?;",
        [
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

  getEnrollmentById(enrollmentId: number): Promise<EnrollmentData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT (enrollmentStartDateTime, enrollmentEndDateTime) " +
        "VALUES (?, ?);",
        [enrollmentStartDateTime, enrollmentEndDateTime],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE ENROLLMENT SET enrollmentStartDateTime = ?, enrollmentEndDateTime = ? " +
        "WHERE enrollmentId = ?;",
        [enrollmentStartDateTime, enrollmentEndDateTime, enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteEnrollmentById(enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT WHERE enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId LIKE ? ",
        [
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0].totalCount);
        }
      );
    });
  }

  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentStartDateTime = ? " +
        "AND enrollmentEndDateTime = ?;",
        [
          enrollmentStartDateTime, enrollmentEndDateTime
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<EnrollmentProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentProgrammeIntakeData[]>(
        "SELECT e.* , pi.*, p.programmeName, sm.studyMode " +
        "FROM ENROLLMENT e " +
        "INNER JOIN PROGRAMME_INTAKE pi ON e.enrollmentId = pi.enrollmentId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE e.enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentProgrammeIntakeByEnrollmentIdAndProgrammeIntakeId(enrollmentId: number, programmeIntakeId: number): Promise<EnrollmentProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentProgrammeIntakeData[]>(
        "SELECT * " +
        "FROM ENROLLMENT_PROGRAMME_INTAKE " +
        "WHERE enrollmentId = ? " +
        "AND programmeIntakeId = ?;",
        [enrollmentId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }


  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT_PROGRAMME_INTAKE (enrollmentId, programmeIntakeId) " +
        "VALUES (?, ?);",
        [enrollmentId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT_PROGRAMME_INTAKE " +
        "WHERE enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new EnrollmentRepository();
