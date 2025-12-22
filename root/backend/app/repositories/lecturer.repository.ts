import { LecturerData, LecturerTitleData } from "../models/lecturer-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";
import { TotalCount } from "../models/general-model";

interface ILecturerRepository {
  getLecturers(query: string, pageSize: number | null, page: number | null): Promise<LecturerData[]>;
  getLecturerById(lecturerId: number): Promise<LecturerData | undefined>;
  getLecturerByEmail(email: string): Promise<LecturerData | undefined>;
  getLecturerByIdAndEmail(lecturerId: number, email: string): Promise<LecturerData | undefined>;
  createLecturer(firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<ResultSetHeader>;
  updateLecturerById(lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<ResultSetHeader>;
  deleteLecturerById(lecturerId: number): Promise<ResultSetHeader>;
  getLecturerCount(query: string): Promise<number>;
  getAllLecturerTitles(): Promise<LecturerTitleData[]>;
  getLecturerTitleById(lecturerTitleId: number): Promise<LecturerTitleData | undefined>;
}

class LecturerRepository implements ILecturerRepository {
  getLecturers(query: string, pageSize: number | null, page: number | null): Promise<LecturerData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
        SELECT *
        FROM LECTURER l
        INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId
        WHERE l.lecturerId LIKE ?
        OR l.firstName LIKE ?
        OR l.lastName LIKE ?
        OR lt.lecturerTitle LIKE ? `;

      const params: any[] = [
        "%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
      ];

      if (page != null && pageSize != null) {
        const offset: number = (page - 1) * pageSize;
        sql += "LIMIT ? OFFSET ? ";
        params.push(pageSize, offset);
      }

      databaseConn.query<LecturerData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getLecturerById(lecturerId: number): Promise<LecturerData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<LecturerData[]>(
        "SELECT * " +
        "FROM LECTURER l " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE l.lecturerId = ? ",
        [lecturerId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getLecturerByEmail(email: string): Promise<LecturerData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<LecturerData[]>(
        "SELECT * " +
        "FROM LECTURER " +
        "WHERE email = ?;",
        [email],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getLecturerByIdAndEmail(lecturerId: number, email: string): Promise<LecturerData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<LecturerData[]>(
        "SELECT * " +
        "FROM LECTURER " +
        "WHERE email = ? " +
        "AND lecturerId = ?;",
        [email, lecturerId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createLecturer(firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO LECTURER (firstName, lastName, lecturerTitleId, email, phoneNumber) " +
        "VALUES (?,?,?,?,?);",
        [firstName, lastName, lecturerTitleId, email, phoneNumber],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateLecturerById(lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE LECTURER SET firstName = ?, lastName = ?, lecturerTitleId = ?, email = ?, phoneNumber = ? " +
        "WHERE lecturerId = ?;",
        [firstName, lastName, lecturerTitleId, email, phoneNumber, lecturerId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteLecturerById(lecturerId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM LECTURER WHERE lecturerId = ?;",
        [lecturerId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getLecturerCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM LECTURER l " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE l.lecturerId LIKE ? " +
        "OR l.firstName LIKE ? " +
        "OR l.lastName LIKE ? " +
        "OR lt.lecturerTitle LIKE ? ",
        [
          "%" + query + "%",
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

  getAllLecturerTitles(): Promise<LecturerTitleData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<LecturerTitleData[]>(
        "SELECT * " +
        "FROM LECTURER_TITLE ",
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getLecturerTitleById(lecturerTitleId: number): Promise<LecturerTitleData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<LecturerTitleData[]>(
        "SELECT * " +
        "FROM LECTURER_TITLE " +
        "WHERE lecturerTitleId = ? ",
        [lecturerTitleId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }
}

export default new LecturerRepository();
