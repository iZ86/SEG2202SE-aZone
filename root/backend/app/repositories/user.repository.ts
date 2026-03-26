import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { StudentInformation, UserData, StudentClassData } from "../models/user-model";
import { TotalCount } from "../models/general-model";
import { ENUM_SUBJECT_STATUS_ID } from "../enums/enums";

interface IUserRepostory {
  getAdmins(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getStudents(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getUserById(userId: number): Promise<UserData | undefined>;
  getUserByEmail(email: string): Promise<UserData | undefined>;
  getStudentById(studentId: number): Promise<UserData | undefined>;
  getStudentByEmail(email: string): Promise<UserData | undefined>;
  getAdminById(adminId: number): Promise<UserData | undefined>;
  getAdminCount(query: string): Promise<number>;
  getStudentCount(query: string): Promise<number>;
  isAdminExist(adminId: number): Promise<boolean>;
  isStudentExist(studentId: number): Promise<boolean>;
  createUser(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatusId: number): Promise<ResultSetHeader>;
  createStudent(studentId: number): Promise<ResultSetHeader>;
  updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, userStatusId: number): Promise<ResultSetHeader>;
  updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<ResultSetHeader>;
  getStudentInformationById(studentId: number): Promise<StudentInformation | undefined>;
  getStudentTimetableByIdAndProgrammeIntakeId(studentId: number, programmeIntakeId: number): Promise<StudentClassData[]>;
}

class UserRepository implements IUserRepostory {
  public getAdmins(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.userStatusId, ru.profilePictureUrl " +
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

  public getStudents(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.userStatusId, ru.profilePictureUrl " +
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

  public getUserById(userId: number): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT userId, firstName, lastName, email, phoneNumber, profilePictureUrl, userStatusId " +
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

  public getUserByEmail(email: string): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT userId, firstName, lastName, email, phoneNumber, userStatusId, profilePictureUrl " +
        "FROM REGISTERED_USER " +
        "WHERE email = ?;",
        [email],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public getStudentById(studentId: number): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.profilePictureUrl, ru.userStatusId " +
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

  public getStudentByEmail(email: string): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.userStatusId, ru.profilePictureUrl " +
        "FROM REGISTERED_USER ru " +
        "INNER JOIN STUDENT s ON ru.userId = s.studentId " +
        "WHERE ru.email COLLATE utf8mb4_general_ci = ?;",
        [email],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public getAdminById(adminId: number): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.userStatusId, ru.profilePictureUrl " +
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

  public getStudentCount(query: string): Promise<number> {
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
          resolve(res[0]?.totalCount ?? 0);
        }
      );
    });
  }

  public getAdminCount(query: string): Promise<number> {
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
          resolve(res[0]?.totalCount ?? 0);
        }
      );
    });
  }

  public isAdminExist(adminId: number): Promise<boolean> {
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

  public isStudentExist(studentId: number): Promise<boolean> {
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

  public createUser(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatusId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO REGISTERED_USER (firstName, lastName, email, phoneNumber, password, userStatusId) " +
        "VALUES (?, ?, ?, ?, ?, ?);",
        [firstName, lastName, email, phoneNumber, password, userStatusId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  public createStudent(studentId: number): Promise<ResultSetHeader> {
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

  public updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, userStatusId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE REGISTERED_USER SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, userStatusId = ? " +
        "WHERE userId = ?;",
        [firstName, lastName, phoneNumber, email, userStatusId, userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  public updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE REGISTERED_USER SET profilePictureUrl = ? " +
        "WHERE userId = ?;",
        [profilePictureUrl, userId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  };

  public getStudentInformationById(studentId: number): Promise<StudentInformation | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentInformation[]>(
        "SELECT c.courseId, c.courseName, pi.programmeIntakeId, pi.intakeId as 'intake', pi.semester, " +
        "pi.semesterStartDate, pi.semesterEndDate, sm.studyModeId, sm.studyMode, scpi.studentCourseProgrammeIntakeStatusId " +
        "FROM STUDENT s " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON s.studentId = scpi.studentId " +
        "INNER JOIN COURSE c on scpi.courseId = c.courseId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE s.studentId = ?;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public getStudentTimetableByIdAndProgrammeIntakeId(studentId: number, programmeIntakeId: number): Promise<StudentClassData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentClassData[]>(
        "SELECT est.enrollmentSubjectTypeId, es.enrollmentSubjectId, est.startTime, est.endTime, s.subjectId, s.subjectCode, s.subjectName, s.creditHours, l.lecturerId, l.firstName as lecturerFirstName, l.lastName as lecturerLastName, " +
          "lt.lecturerTitleId, lt.lecturerTitle, " +
          "l.email, ct.classTypeId, ct.classType, v.venueId, v.venue, est.grouping, d.dayId, d.day " +
          "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
          "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
          "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
          "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
          "INNER JOIN PROGRAMME_INTAKE pi ON es.enrollmentId = pi.enrollmentId " +
          "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
          "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
          "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
          "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
          "INNER JOIN VENUE v ON est.venueId = v.venueId " +
          "INNER JOIN DAY d ON est.dayId = d.dayId " +
          "WHERE sest.subjectStatusId = ? " +
          "AND studentId = ? " +
          "AND pi.programmeIntakeId = ?;",
        [ENUM_SUBJECT_STATUS_ID.ACTIVE, studentId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }
}

export default new UserRepository();
