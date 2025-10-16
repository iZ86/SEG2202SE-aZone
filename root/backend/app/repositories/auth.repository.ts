import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { BasicAdminLoginData, BasicStudentLoginData } from "../models/auth-model";

interface IAuthRepository {
  getBasicStudentLoginData(studentId: number): Promise<BasicStudentLoginData>;
  getBasicAdminLoginData(userId: number): Promise<BasicAdminLoginData>;
}

class AuthRepository implements IAuthRepository {
  getBasicStudentLoginData(studentId: number): Promise<BasicStudentLoginData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<BasicStudentLoginData[]>(
        "SELECT s.studentId, ru.userId, ru.email, ru.password FROM REGISTERED_USER ru INNER JOIN STUDENT s ON ru.userId = s.studentId WHERE s.studentId = ?;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  getBasicAdminLoginData(adminId: number): Promise<BasicAdminLoginData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<BasicAdminLoginData[]>(
        "SELECT a.adminId, ru.userId, ru.email, ru.password FROM REGISTERED_USER ru INNER JOIN ADMIN a ON ru.userId = a.adminId WHERE a.adminId = ?;",
        [adminId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  updateMe(userId: number, phoneNumber: string, email: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE REGISTERED_USER SET phoneNumber = ?, email = ? " +
        "WHERE userId = ?;",
        [phoneNumber, email, userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new AuthRepository();
