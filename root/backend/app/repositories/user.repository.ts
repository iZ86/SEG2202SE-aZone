import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { StudentCourseProgrammeIntakeData, UserData } from "../models/user-model";

interface IUserRepostory {
  getAdmins(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getStudents(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getUserById(userId: number): Promise<UserData>;
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

  getUserById(userId: number): Promise<UserData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT userId, firstName, lastName, email, phoneNumber, status " +
        "FROM REGISTERED_USER " +
        "WHERE userId = ?;",
        [userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
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

  getStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number, status: number): Promise<StudentCourseProgrammeIntakeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT s.studentId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartPeriod, pi.semesterEndPeriod, scpi.status " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON s.studentId = scpi.studentId " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE scpi.status = ? " +
        "AND (ru.userId LIKE ? " +
        "OR ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ? " +
        "OR c.courseName LIKE ? " +
        "OR pi.intakeId LIKE ?) " +
        "LIMIT ? OFFSET ?;",
        [
          status,
          "%" + query + "%",
          "%" + query + "%",
          "%" + query + "%",
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

  getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<StudentCourseProgrammeIntakeData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT s.studentId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartPeriod, pi.semesterEndPeriod, scpi.status " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON s.studentId = scpi.studentId " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE s.studentId = ?;",
        [
          studentId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res?.[0]);
        }
      );
    });
  }

  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT_COURSE_PROGRAMME_INTAKE (studentId, courseId, programmeIntakeId, status) " +
        "VALUES (?, ?, ?, ?);",
        [studentId, courseId, programmeIntakeId, status],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE STUDENT_COURSE_PROGRAMME_INTAKE SET courseId = ?, programmeIntakeId = ?, status = ?" +
        "WHERE studentId = ?",
        [courseId, programmeIntakeId, status, studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId: number, status: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM STUDENT_COURSE_PROGRAMME_INTAKE WHERE studentId = ? AND status = ?;",
        [studentId, status],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new UserRepository();
