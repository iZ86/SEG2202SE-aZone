import { EnrollmentData } from "../models/enrollment-model";
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
}

class EnrollmentRepository implements IEnrollmentRepository {
  getAllEnrollments(query: string, pageSize: number, page: number): Promise<EnrollmentData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId LIKE ? " +
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
}

export default new EnrollmentRepository();
