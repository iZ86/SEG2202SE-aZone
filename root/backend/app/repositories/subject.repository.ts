import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { SubjectData } from "../models/subject-model";
import { TotalCount } from "../models/general-model";

interface ISubjectRepository {
  getAllSubjects(query: string, pageSize: number, page: number): Promise<SubjectData[]>;
  getSubjectById(subjectId: number): Promise<SubjectData | undefined>;
  getSubjectByName(subjectName: string): Promise<SubjectData | undefined>;
  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader>;
  deleteSubjectById(subjectId: number): Promise<ResultSetHeader>;
  getSubjectCount(query: string): Promise<number>;
}

class SubjectRepository implements ISubjectRepository {
  getAllSubjects(query: string, pageSize: number, page: number): Promise<SubjectData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<SubjectData[]>(
        "SELECT * " +
        "FROM SUBJECT " +
        "WHERE subjectId LIKE ? " +
        "OR subjectName LIKE ? " +
        "OR subjectCode LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
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

  getSubjectByName(subjectName: string): Promise<SubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<SubjectData[]>(
        "SELECT * " +
        "FROM SUBJECT " +
        "WHERE subjectName COLLATE utf8mb4_general_ci = ?;",
        [subjectName],
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
}

export default new SubjectRepository();
