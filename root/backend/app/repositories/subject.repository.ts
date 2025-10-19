import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { SubjectData } from "../models/subject-model";

interface ISubjectRepository {
  getSubjects(query: string, pageSize: number, page: number): Promise<SubjectData[]>;
  getSubjectById(subjectId: number): Promise<SubjectData>;
  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<ResultSetHeader>;
  deleteSubjectById(subjectId: number): Promise<ResultSetHeader>;
}

class SubjectRepository implements ISubjectRepository {
  getSubjects(query: string, pageSize: number, page: number): Promise<SubjectData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<SubjectData[]>(
        "SELECT * " +
        "FROM SUBJECT " +
        "WHERE subjectName LIKE ? " +
        "OR subjectCode LIKE ? " +
        "OR creditHours LIKE ? " +
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

  getSubjectById(subjectId: number): Promise<SubjectData> {
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
          resolve(res?.[0]);
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
}

export default new SubjectRepository();
