import { IntakeData } from "../models/intake-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";
import { TotalCount } from "../models/general-model";

interface IIntakeRepository {
  getAllIntakes(query: string, pageSize: number, page: number): Promise<IntakeData[]>;
  getIntakeById(intakeId: number): Promise<IntakeData | undefined>;
  createIntake(intakeId: number): Promise<ResultSetHeader>;
  updateIntakeById(intakeId: number, newIntakeId: number): Promise<ResultSetHeader>;
  deleteIntakeById(intakeId: number): Promise<ResultSetHeader>;
  getIntakeCount(query: string): Promise<number>;
}

class IntakeRepository implements IIntakeRepository {
  getAllIntakes(query: string, pageSize: number, page: number): Promise<IntakeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<IntakeData[]>(
        "SELECT intakeId " +
        "FROM INTAKE " +
        "WHERE intakeId LIKE ? " +
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

  getIntakeById(intakeId: number): Promise<IntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<IntakeData[]>(
        "SELECT intakeId " +
        "FROM INTAKE " +
        "WHERE intakeId = ?;",
        [intakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createIntake(intakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO INTAKE (intakeId) " +
        "VALUES (?);",
        [intakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateIntakeById(intakeId: number, newIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE Intake SET intakeId = ? " +
        "WHERE intakeId = ?;",
        [newIntakeId, intakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteIntakeById(intakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM INTAKE WHERE intakeId = ?;",
        [intakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getIntakeCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM INTAKE " +
        "WHERE intakeId LIKE ?;",
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
}

export default new IntakeRepository();
