import { ResultSetHeader } from "mysql2";
import databaseConn from "../database/db-connection";
import { StudentCourseProgrammeIntakeData, StudentInformation, StudentSemesterStartAndEndData, UserData, StudentSubjectData, StudentClassData, StudentSubjectOverviewData } from "../models/user-model";
import { TotalCount } from "../models/general-model";

interface IUserRepostory {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getAllStudents(query: string, pageSize: number, page: number): Promise<UserData[]>;
  getUserById(userId: number): Promise<UserData | undefined>;
  getStudentById(studentId: number): Promise<UserData | undefined>;
  getStudentByEmail(email: string): Promise<UserData | undefined>;
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
  updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<ResultSetHeader>;
  getAllStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number, status: number): Promise<StudentCourseProgrammeIntakeData[]>; getStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrameIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<StudentCourseProgrammeIntakeData | undefined>;
  getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<StudentCourseProgrammeIntakeData[] | undefined>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>; updateStudentCourseProgrammeIntakeInactiveByStudentId(studentId: number): Promise<ResultSetHeader>;
  updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<ResultSetHeader>;
  deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
  getStudentInformationById(studentId: number): Promise<StudentInformation | undefined>;
  getStudentActiveSubjectsOverviewById(studentId: number): Promise<StudentSubjectOverviewData[]>;
  getStudentTimetableById(studentId: number): Promise<StudentClassData[]>;
  getStudentSemesterStartAndEndDateById(studentId: number): Promise<StudentSemesterStartAndEndData | undefined>;
  getStudentSubjectsById(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<StudentSubjectData[]>;
  getStudentSubjectsCountById(studentId: number, semester: number, query: string): Promise<number>;
}

class UserRepository implements IUserRepostory {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<UserData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus, ru.profilePictureUrl " +
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
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus, ru.profilePictureUrl " +
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
        "SELECT userId, firstName, lastName, email, phoneNumber, profilePictureUrl, status AS userStatus " +
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
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.profilePictureUrl, ru.status AS userStatus " +
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
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus, ru.profilePictureUrl " +
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

  getStudentByIdAndEmail(studentId: number, email: string): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<UserData[]>(
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus, ru.profilePictureUrl " +
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
        "SELECT ru.userId, ru.firstName, ru.lastName, ru.email, ru.phoneNumber, ru.status AS userStatus, ru.profilePictureUrl " +
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

  updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<ResultSetHeader> {
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
        "UPDATE STUDENT_COURSE_PROGRAMME_INTAKE SET courseId = ?, programmeIntakeId = ?, status = ? " +
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

  getStudentInformationById(studentId: number): Promise<StudentInformation | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentInformation[]>(
        "SELECT c.courseId, c.courseName, pi.programmeIntakeId, pi.intakeId as 'intake', pi.semester, " +
        "pi.semesterStartDate, pi.semesterEndDate, sm.studyModeId, sm.studyMode, scpi.status " +
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

  getStudentActiveSubjectsOverviewById(studentId: number): Promise<StudentSubjectOverviewData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentSubjectOverviewData[]>(
        "SELECT DISTINCT s.subjectId, s.subjectCode, s.subjectName, s.creditHours " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
        "WHERE sest.subjectStatusId = 1 " +
        "AND sest.studentId = ? " +
        "ORDER BY s.subjectId;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getStudentTimetableById(studentId: number): Promise<StudentClassData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentClassData[]>(
        "SELECT es.enrollmentSubjectId, est.startTime, est.endTime, s.subjectId, s.subjectCode, " +
        "s.subjectName, l.lecturerId, l.firstName as lecturerFirstName, l.lastName as lecturerLastName, " +
        "lt.lecturerTitleId, lt.lecturerTitle, " +
        "l.email, ct.classTypeId, ct.classType, v.venueId, v.venue, est.grouping, d.dayId, d.day " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE sest.subjectStatusId = 1 " +
        "AND studentId = ?;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getStudentSemesterStartAndEndDateById(studentId: number): Promise<StudentSemesterStartAndEndData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentSemesterStartAndEndData[]>(
        "SELECT pi.semesterStartDate, pi.semesterEndDate " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "WHERE scpi.studentId = ? " +
        "AND scpi.status = 1;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getStudentSubjectsById(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<StudentSubjectData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentSubjectData[]>(
        "SELECT s.subjectId, s.subjectCode, s.subjectName, s.creditHours, sest.subjectStatusId, ss.subjectStatus, " +
        "c.courseId, c.courseCode, c.courseName, pi.programmeIntakeId, pi.semester, pi.intakeId as intake, sm.studyModeId, sm.studyMode " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN SUBJECT_STATUS ss ON sest.subjectStatusId = ss.subjectStatusId " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON es.enrollmentId = pi.enrollmentId " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON pi.programmeIntakeId = scpi.programmeIntakeId " +
        "INNER JOIN COURSE c ON scpi.courseId = c.courseId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE sest.studentId = ? " +
        "AND scpi.studentId = ? " +
        "AND (s.subjectCode LIKE ? " +
        "OR s.subjectName LIKE ?) " +
        "AND (? = 0 OR pi.semester = ?) " +
        "ORDER BY sest.subjectStatusId, s.subjectId ASC " +
        "LIMIT ? OFFSET ?;",
        [
          studentId,
          studentId,
          "%" + query + "%",
          "%" + query + "%",
          semester,
          semester,
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

  getStudentSubjectsCountById(studentId: number, semester: number, query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(DISTINCT(s.subjectId)) AS totalCount " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON es.enrollmentSubjectId = est.enrollmentSubjectId " +
        "INNER JOIN STUDENT_ENROLLMENT_SUBJECT_TYPE sest ON est.enrollmentSubjectTypeId = sest.enrollmentSubjectTypeId " +
        "INNER JOIN SUBJECT_STATUS ss ON sest.subjectStatusId = ss.subjectStatusId " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectId = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "INNER JOIN PROGRAMME_INTAKE pi ON e.enrollmentId = pi.enrollmentId " +
        "INNER JOIN STUDENT_COURSE_PROGRAMME_INTAKE scpi ON pi.programmeIntakeId = scpi.programmeIntakeId " +
        "WHERE sest.studentId = ? " +
        "AND (s.subjectCode LIKE ? " +
        "OR s.subjectName LIKE ?) " +
        "AND (? = 0 OR pi.semester = ?) ",
        [
          studentId,
          "%" + query + "%",
          "%" + query + "%",
          semester,
          semester,
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0].totalCount);
        }
      );
    });
  }
}

export default new UserRepository();
