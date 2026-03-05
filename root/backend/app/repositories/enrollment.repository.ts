import { EnrollmentData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, EnrollmentSubjectTypeData, MonthlyEnrollmentData, UpdateEnrollmentSubjectTypeData } from "../models/enrollment-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";
import { TotalCount } from "../models/general-model";

interface IEnrollmentRepository {
  getEnrollments(query: string, pageSize: number, page: number): Promise<EnrollmentData[]>;
  getEnrollmentsByIds(enrollmentIds: number[]): Promise<EnrollmentData[]>;
  getEnrollmentById(enrollmentId: number): Promise<EnrollmentData | undefined>;
  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader>;
  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader>;
  deleteEnrollmentById(enrollmentId: number): Promise<ResultSetHeader>;
  getEnrollmentCount(query: string): Promise<number>;
  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined>;
  getEnrollmentSubjects(query: string, pageSize: number, page: number): Promise<EnrollmentSubjectData[]>;
  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<EnrollmentSubjectData | undefined>;
  getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<EnrollmentSubjectData | undefined>;
  createEnrollmentSubject(enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader>;
  updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader>;
  deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<ResultSetHeader>;
  getEnrollmentSubjectCount(query: string): Promise<number>;
  getEnrollmentScheduleByStudentId(studentId: number): Promise<StudentEnrollmentSchedule | undefined>;
  getEnrollmentSubjectsByStudentId(studentId: number): Promise<StudentEnrollmentSubjectData[]>;
  getEnrollmentSubjectTypesByIds(enrollmentSubjectTypeIds: number[]): Promise<EnrollmentSubjectTypeData[]>;
  getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<EnrollmentSubjectTypeData[]>;
  getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds: number[]): Promise<EnrollmentSubjectTypeData[]>;
  createEnrollmentSubjectTypes(enrollmentSubjectTypes: (string | number | Date)[][]): Promise<ResultSetHeader>;
  deleteStudentEnrollmentSubjectTypeByStudentId(studentId: number, enrollmentId: number): Promise<ResultSetHeader>;
  createStudentEnrollmentSubjectType(studentEnrollmentSubjectTypes: number[][]): Promise<ResultSetHeader>;
  getEnrolledSubjectsByStudentIdAndEnrollmentId(studentId: number, enrollmentId: number): Promise<StudentEnrollmentSubjectData[]>;
  getMonthlyEnrollmentCount(duration: number): Promise<MonthlyEnrollmentData[]>;
  getEnrollmentSubjectTypesByEnrollmentId(enrollmentId: number): Promise<EnrollmentSubjectTypeData[]>;
  updateEnrollmentSubjectTypeById(updateEnrollmentSubjectType: UpdateEnrollmentSubjectTypeData): Promise<ResultSetHeader>;
  deleteEnrollmentSubjectTypesByEnrollmentSubjectIdAndNotIds(enrollmentSubjectId: number, enrollmentSubjectTypeIds: number[]): Promise<ResultSetHeader>;
  deleteEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<ResultSetHeader>;
  getEnrollmentSubjectTypesByEnrollmentIdAndNotEnrollmentSubjectId(enrollmentId: number, enrollmentSubjectId: number): Promise<EnrollmentSubjectTypeData[]>;
}

class EnrollmentRepository implements IEnrollmentRepository {
  public getEnrollments(query: string, pageSize: number, page: number): Promise<EnrollmentData[]> {
    const offset: number = (page - 1) * pageSize;
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT e.enrollmentId, e.enrollmentStartDateTime, e.enrollmentEndDateTime " +
        "FROM ENROLLMENT e " +
        "WHERE e.enrollmentId LIKE ? " +
        "ORDER BY e.enrollmentStartDateTime ASC " +
        "LIMIT ? OFFSET ?;",
        ["%" + query + "%",
          pageSize,
          offset
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentsByIds(enrollmentIds: number[]): Promise<EnrollmentData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId IN (?);",
        [enrollmentIds],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentById(enrollmentId: number): Promise<EnrollmentData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT (enrollmentStartDateTime, enrollmentEndDateTime) " +
        "VALUES (?, ?);",
        [enrollmentStartDateTime, enrollmentEndDateTime],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE ENROLLMENT SET enrollmentStartDateTime = ?, enrollmentEndDateTime = ? " +
        "WHERE enrollmentId = ?;",
        [enrollmentStartDateTime, enrollmentEndDateTime, enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public deleteEnrollmentById(enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT WHERE enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId LIKE ? ",
        [
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]?.totalCount ?? 0);
        }
      );
    });
  }

  public getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT * " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentStartDateTime = ? " +
        "AND enrollmentEndDateTime = ?;",
        [
          enrollmentStartDateTime, enrollmentEndDateTime
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public getEnrollmentSubjects(query: string, pageSize: number, page: number): Promise<EnrollmentSubjectData[]> {
    const offset: number = (page - 1) * pageSize;

    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectData[]>(
        "SELECT es.enrollmentSubjectId, e.enrollmentId, e.enrollmentStartDateTime, e.enrollmentEndDateTime, " +
        "s.subjectId, s.subjectCode, s.subjectName, s.description, s.creditHours, " +
        "l.lecturerId, l.firstName, l.lastName, lt.lecturerTitleId, lt.lecturerTitle, l.email, l.phoneNumber " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectid = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE es.enrollmentSubjectId LIKE ? " +
        "OR s.subjectName LIKE ? " +
        "OR l.firstName LIKE ? " +
        "OR l.lastName LIKE ? " +
        "LIMIT ? OFFSET ?;",
        ["%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
        pageSize,
        offset
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<EnrollmentSubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectData[]>(
        "SELECT * " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectid = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE es.enrollmentSubjectId = ? ",
        [enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<EnrollmentSubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectData[]>(
        "SELECT * " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectid = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE es.enrollmentId = ? " +
        "AND es.subjectId = ?;",
        [enrollmentId, subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  public createEnrollmentSubject(enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT_SUBJECT (enrollmentId, subjectId, lecturerId) " +
        "VALUES (?, ?, ?);",
        [enrollmentId, subjectId, lecturerId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE ENROLLMENT_SUBJECT SET enrollmentId = ?, subjectId = ?, lecturerId = ? " +
        "WHERE enrollmentSubjectId = ?;",
        [enrollmentId, subjectId, lecturerId, enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT_SUBJECT WHERE enrollmentSubjectId = ?;",
        [enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentSubjectCount(query: string): Promise<number> {
    return new Promise((resolve, reject) => {
      databaseConn.query<TotalCount[]>(
        "SELECT COUNT(*) AS totalCount " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectid = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE es.enrollmentSubjectId LIKE ? " +
        " OR s.subjectName LIKE ? " +
        "OR l.firstName LIKE ? " +
        "OR l.lastName LIKE ?;",
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

  public getEnrollmentScheduleByStudentId(studentId: number): Promise<StudentEnrollmentSchedule | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentEnrollmentSchedule[]>(
        "SELECT scpi.programmeIntakeId, e.enrollmentId, e.enrollmentStartDateTime, e.enrollmentEndDateTime " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN ENROLLMENT e ON pi.enrollmentId = e.enrollmentId " +
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

  public getEnrolledSubjectsByStudentIdAndEnrollmentId(studentId: number, enrollmentId: number): Promise<StudentEnrollmentSubjectData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentEnrollmentSubjectData[]>(
        "SELECT s.subjectId, s.subjectCode, s.subjectName, s.creditHours, l.lecturerId, l.firstName, l.lastName, lt.lecturerTitleId, " +
        "lt.lecturerTitle, est.enrollmentSubjectTypeId, est.classTypeId, ct.classType, est.grouping, d.dayId, d.day, est.startTime, " +
        "est.endTime, COUNT(sest.enrollmentSubjectTypeId) as numberOfStudentsEnrolled, est.numberOfSeats " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN SUBJECT s on es.subjectId = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE es.enrollmentId = ? " +
        "AND sest.studentId = ? " +
        "GROUP BY est.enrollmentSubjectTypeId " +
        "ORDER BY est.grouping ASC;",
        [enrollmentId, studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }


  public getEnrollmentSubjectsByStudentId(studentId: number): Promise<StudentEnrollmentSubjectData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentEnrollmentSubjectData[]>(
        "SELECT s.subjectId, s.subjectCode, s.subjectName, s.creditHours, l.lecturerId, l.firstName, l.lastName, lt.lecturerTitleId, " +
        "lt.lecturerTitle, est.enrollmentSubjectTypeId, est.classTypeId, ct.classType, est.grouping, d.dayId, d.day, est.startTime, " +
        "est.endTime, COUNT(sest.enrollmentSubjectTypeId) as numberOfStudentsEnrolled, est.numberOfSeats " +
        "FROM STUDENT_COURSE_PROGRAMME_INTAKE scpi " +
        "INNER JOIN PROGRAMME_INTAKE pi ON scpi.programmeIntakeId = pi.programmeIntakeId " +
        "INNER JOIN ENROLLMENT e ON pi.enrollmentId = e.enrollmentId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON e.enrollmentId = es.enrollmentId " +
        "INNER JOIN SUBJECT s on es.subjectId = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON es.enrollmentSubjectId = est.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "LEFT JOIN STUDENT_ENROLLMENT_SUBJECT_TYPE sest ON est.enrollmentSubjectTypeId = sest.enrollmentSubjectTypeId " +
        "WHERE scpi.studentId = ? " +
        "AND scpi.status = 1 " +
        "GROUP BY est.enrollmentSubjectTypeId " +
        "ORDER BY est.grouping ASC;",
        [studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentSubjectTypesByIds(enrollmentSubjectTypeIds: number[]): Promise<EnrollmentSubjectTypeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.* " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "WHERE est.enrollmentSubjectTypeId IN (?);",
        [enrollmentSubjectTypeIds],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<EnrollmentSubjectTypeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping, est.lecturerId " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE est.enrollmentSubjectId = ?;",
        [enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds: number[]): Promise<EnrollmentSubjectTypeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping, est.lecturerId " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE es.enrollmentId IN (?);",
        [enrollmentIds],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public createEnrollmentSubjectTypes(enrollmentSubjectTypes: (string | number | Date)[][]): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT_SUBJECT_TYPE (enrollmentSubjectId, classTypeId, venueId, startTime, endTime, dayId, numberOfSeats, grouping, lecturerId) " +
        "VALUES ?;",
        [enrollmentSubjectTypes],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public deleteStudentEnrollmentSubjectTypeByStudentId(studentId: number, enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE sest " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "WHERE es.enrollmentId = ? " +
        "AND sest.studentId = ?;",
        [enrollmentId, studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public createStudentEnrollmentSubjectType(studentEnrollmentSubjectTypes: number[][]): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT_ENROLLMENT_SUBJECT_TYPE (studentId, enrollmentSubjectTypeId, subjectStatusId) VALUES ?;",
        [studentEnrollmentSubjectTypes],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getMonthlyEnrollmentCount(duration: number): Promise<MonthlyEnrollmentData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<MonthlyEnrollmentData[]>(
        "SELECT DATE_FORMAT(enrollmentStartDateTime, '%Y-%m') AS month, COUNT(*) AS enrollmentCount " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentStartDateTime >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) " +
        "GROUP BY month " +
        "ORDER BY month ASC;",
        [duration],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public getEnrollmentSubjectTypesByEnrollmentId(enrollmentId: number): Promise<EnrollmentSubjectTypeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping, est.lecturerId " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE es.enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  public updateEnrollmentSubjectTypeById(updateEnrollmentSubjectType: UpdateEnrollmentSubjectTypeData): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "UPDATE ENROLLMENT_SUBJECT_TYPE SET classTypeId = ?, venueId = ?, startTime = ?, endTime = ?, dayId = ?, numberOfSeats = ?, grouping = ?, lecturerId = ? " +
        "WHERE enrollmentSubjectTypeId = ?;",
        [updateEnrollmentSubjectType.classTypeId, updateEnrollmentSubjectType.venueId, updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime,
        updateEnrollmentSubjectType.dayId, updateEnrollmentSubjectType.numberOfSeats, updateEnrollmentSubjectType.grouping, updateEnrollmentSubjectType.lecturerId, updateEnrollmentSubjectType.enrollmentSubjectTypeId
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    })
  }

  public deleteEnrollmentSubjectTypesByEnrollmentSubjectIdAndNotIds(enrollmentSubjectId: number, enrollmentSubjectTypeIds: number[]): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT_SUBJECT_TYPE " +
        "WHERE enrollmentSubjectId = ? " +
        "AND enrollmentSubjectTypeId NOT IN (?);",
        [enrollmentSubjectId, enrollmentSubjectTypeIds],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    })
  }


  public deleteEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT_SUBJECT_TYPE " +
        "WHERE enrollmentSubjectId = ?;",
        [enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    })
  }

  public getEnrollmentSubjectTypesByEnrollmentIdAndNotEnrollmentSubjectId(enrollmentId: number, enrollmentSubjectId: number): Promise<EnrollmentSubjectTypeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping, est.lecturerId " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE es.enrollmentId = ? " +
        "AND est.enrollmentSubjectId != ?;",
        [enrollmentId, enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

}



export default new EnrollmentRepository();
