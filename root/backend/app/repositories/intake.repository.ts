import { IntakeData } from "../models/intake-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";

interface IIntakeRepository {
  getIntakes(query: string, pageSize: number, page: number): Promise<IntakeData[]>;
  getIntakeById(intakeId: number): Promise<IntakeData>;
  createIntake(intakeId: number): Promise<ResultSetHeader>;
  updateIntakeById(intakeId: number, newIntakeId: number): Promise<ResultSetHeader>;
  deleteIntakeById(intakeId: number): Promise<ResultSetHeader>;
}

class IntakeRepository implements IIntakeRepository {
  getIntakes(query: string, pageSize: number, page: number): Promise<IntakeData[]> {
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

  getIntakeById(intakeId: number): Promise<IntakeData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<IntakeData[]>(
        "SELECT intakeId " +
        "FROM INTAKE " +
        "WHERE intakeId = ?;",
        [intakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
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
}

export default new IntakeRepository();
