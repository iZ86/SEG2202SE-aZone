/**
 * Repositories folder will be used for databse interaction with queries
 * This is an example for User Repository fetching all the users with search query
 */
import databaseConn from "../database/db-connection";
import { UserData } from "../models/user-model";

interface IUserRepostory {
  getUsers(query: string): Promise<UserData[]>;
}

class UserRepository implements IUserRepostory {
  getUsers(query: string): Promise<UserData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT * " +
        "FROM USER " +
        "WHERE firstName LIKE ? " +
        "OR lastName LIKE ? " +
        "OR email LIKE ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    });
  }

  getStudentById(studentId: number): Promise<UserData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT s.studentId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber FROM REGISTERED_USER ru INNER JOIN STUDENT s ON ru.userId = s.studentId WHERE s.studentId = ?;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      )
    });
  }

  getAdminById(adminId: number): Promise<UserData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT a.adminId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber FROM REGISTERED_USER ru INNER JOIN ADMIN a ON ru.userId = a.adminId WHERE a.adminId = ?;",
        [adminId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      )
    });
  }

  isAdminExist(adminId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      databaseConn.query(
        "SELECT EXISTS(SELECT 1 FROM REGISTERED_USER ru " +
        "INNER JOIN ADMIN a ON a.adminId = ru.userId " +
        "WHERE ru.userId = ?) AS userExists;",
        [adminId],
        (err, res: any[]) => {
          if (err) reject(err);
          resolve(Boolean(res[0].userExists));
        }
      );
    });
  }

  isStudentExist(studentId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      databaseConn.query(
        "SELECT EXISTS(SELECT 1 FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON s.studentId = ru.userId " +
        "WHERE ru.userId = ?) AS userExists;",
        [studentId],
        (err, res: any[]) => {
          if (err) reject(err);
          resolve(Boolean(res[0].userExists));
        }
      );
    });
  }
}

export default new UserRepository();
