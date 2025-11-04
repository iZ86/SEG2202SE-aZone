import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { StudentCourseProgrammeIntakeData, UserData } from "../models/user-model";
import { TotalCount } from "../models/general-model";

interface IUserRepostory {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getAllStudents(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getUserById(userId: number): Promise<UserData | undefined>;
  getStudentById(studentId: number): Promise<UserData | undefined>; getStudentByEmail(email: string): Promise<UserData | undefined>;
  getStudentByIdAndEmail(studentId: number, email: string): Promise<UserData | undefined>;
  getAdminById(adminId: number): Promise<UserData | undefined>;
  getAdminCount(query: string): Promise<number>;
  getStudentCount(query: string): Promise<number>;
  isAdminExist(adminId: number): Promise<boolean>;
  isStudentExist(studentId: number): Promise<boolean>;
  createUser(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: number): Promise<ResultSetHeader>;
  createStudent(studentId: number): Promise<ResultSetHeader>;
  updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, userStatus: number): Promise<ResultSetHeader>;
  deleteUserById(userId: number): Promise<ResultSetHeader>;
  getAllStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number, status: number): Promise<StudentCourseProgrammeIntakeData[]>; getStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrameIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined>;
  getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<StudentCourseProgrammeIntakeData[] | undefined>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>; updateStudentCourseProgrammeIntakeInactiveByStudentId(studentId: number): Promise<ResultSetHeader>;
  updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<ResultSetHeader>;
  deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
}

class UserRepository implements IUserRepostory {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN ADMIN a ON ru.userId = a.adminId " +
        "WHERE ru.userId LIKE ? " +
        "OR ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
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

  getAllStudents(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE ru.userId LIKE ? " +
        "OR ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ? " +
        "LIMIT ? OFFSET ?;",
        [
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

  getUserById(userId: number): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT userId, firstName, lastName, email, phoneNumber, status " +
        "FROM REGISTERED_USER " +
        "WHERE userId = ?;",
        [userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getStudentById(studentId: number): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE s.studentId = ?;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getStudentByEmail(email: string): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE ru.email = ?;",
        [email],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getStudentByIdAndEmail(studentId: number, email: string): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE ru.email = ? " +
        "AND s.studentId = ?;",
        [email, studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getAdminById(adminId: number): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN ADMIN a ON ru.userId = a.adminId " +
        "WHERE a.adminId = ?;",
        [adminId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getStudentCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE ru.userId LIKE ? " +
        "OR ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ?;",
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

  getAdminCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN ADMIN a ON ru.userId = a.adminId " +
        "WHERE ru.userId LIKE ? " +
        "OR ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ?;",
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
  };

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
  };

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
  };

  createUser(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: number): Promise<ResultSetHeader> {
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
  };

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
  };

  updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, userStatus: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE REGISTERED_USER SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, status = ? " +
        "WHERE userId = ?;",
        [firstName, lastName, phoneNumber, email, userStatus, userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

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
  };

  getAllStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number): Promise<StudentCourseProgrammeIntakeData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.status AS courseStatus " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON s.studentId = scpi.studentId " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE (ru.userId LIKE ? " +
        "OR ru.firstName LIKE ? " +
        "OR ru.lastName LIKE ? " +
        "OR ru.email LIKE ? " +
        "OR c.courseName LIKE ?) " +
        "LIMIT ? OFFSET ?;",
        [
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
  };

  getStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrameIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.status AS courseStatus " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE scpi.studentId = ? " +
        "AND scpi.courseId = ? " +
        "AND scpi.programmeIntakeId = ?;",
        [
          studentId, courseId, programmeIntakeId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  };

  getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<StudentCourseProgrammeIntakeData[] | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentCourseProgrammeIntakeData[]>(
        "SELECT scpi.studentId, scpi.courseId, c.courseName, scpi.programmeIntakeId, p.programmeId, p.programmeName, pi.intakeId, pi.semester, pi.semesterStartDate, pi.semesterEndDate, scpi.status AS courseStatus " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN INTAKE i ON i.intakeId = pi.intakeId " +
        "WHERE scpi.studentId = ?;",
        [
          studentId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT_COURSE_PROGRAMME_INTAKE (studentId, courseId, programmeIntakeId, status) " +
        "VALUES (?, ?, ?, ?);",
        [studentId, courseId, programmeIntakeId, 1],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  updateStudentCourseProgrammeIntakeInactiveByStudentId(studentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE STUDENT_COURSE_PROGRAMME_INTAKE SET status = ? " +
        "WHERE studentId = ? " +
        "AND status = ?;",
        [0, studentId, 1],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

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
  };

  deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM STUDENT_COURSE_PROGRAMME_INTAKE " +
        "WHERE studentId = ? " +
        "AND courseId = ? " +
        "AND programmeIntakeId = ?;",
        [studentId, courseId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new UserRepository();
