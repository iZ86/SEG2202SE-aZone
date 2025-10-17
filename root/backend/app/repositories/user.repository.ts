import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { UserData } from "../models/user-model";

interface IUserRepostory {
  getAdmins(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getStudents(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getStudentById(studentId: number): Promise<UserData>;
  getAdminById(adminId: number): Promise<UserData>;
  isAdminExist(adminId: number): Promise<boolean>;
  isStudentExist(studentId: number): Promise<boolean>;
  createUser(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<ResultSetHeader>;
  createStudent(studentId: number): Promise<ResultSetHeader>;
}

class UserRepository implements IUserRepostory {
  getAdmins(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN ADMIN a ON ru.userId = a.adminId " +
        "WHERE ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ? " +
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

  getStudents(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ? " +
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

  getStudentById(studentId: number): Promise<UserData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE s.studentId = ?;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  getAdminById(adminId: number): Promise<UserData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN ADMIN a ON ru.userId = a.adminId " +
        "WHERE a.adminId = ?;",
        [adminId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  isUserExist(userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      databaseConn.query(
        "SELECT EXISTS(SELECT 1 FROM REGISTERED_USER " +
        "WHERE userId = ?) AS userExists;",
        [userId],
        (err, res: any[]) => {
          if (err) reject(err);
          resolve(Boolean(res[0].userExists));
        }
      );
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

  createUser(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO REGISTERED_USER (firstName, lastName, email, phoneNumber, password, status) " +
        "VALUES (?, ?, ?, ?, ?, ?);",
        [firstName, lastName, email, phoneNumber, password, status],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  createStudent(studentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT (studentId) " +
        "VALUES (?);",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, status: boolean): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE REGISTERED_USER SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, status = ? " +
        "WHERE userId = ?;",
        [firstName, lastName, phoneNumber, email, status, userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteUserById(userId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM REGISTERED_USER WHERE userId = ?;",
        [userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new UserRepository();
