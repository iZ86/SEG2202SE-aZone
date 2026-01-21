import { EnrollmentData, EnrollmentProgrammeIntakeData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, EnrollmentSubjectTypeData, StudentEnrolledSubject } from "../models/enrollment-model";
import databaseConn from "../database/db-connection";
import { ResultSetHeader } from "mysql2";
import { TotalCount } from "../models/general-model";

interface IEnrollmentRepository {
  getEnrollments(query: string, pageSize: number | null, page: number | null): Promise<EnrollmentData[]>;
  getEnrollmentById(enrollmentId: number): Promise<EnrollmentData | undefined>;
  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader>;
  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader>;
  deleteEnrollmentById(enrollmentId: number): Promise<ResultSetHeader>;
  getEnrollmentCount(query: string): Promise<number>;
  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined>;
  getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined>;
  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<EnrollmentProgrammeIntakeData[]>;
  getEnrollmentProgrammeIntakeByEnrollmentIdAndProgrammeIntakeId(enrollmentId: number, programmeIntakeId: number): Promise<EnrollmentProgrammeIntakeData | undefined>;
  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<ResultSetHeader>;
  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader>;
  getEnrollmentSubjects(query: string, pageSize: number | null, page: number | null): Promise<EnrollmentSubjectData[]>;
  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<EnrollmentSubjectData | undefined>;
  getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<EnrollmentSubjectData | undefined>;
  getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number): Promise<EnrollmentSubjectData | undefined>;
  createEnrollmentSubject(enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader>;
  updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader>;
  deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<ResultSetHeader>;
  getEnrollmentSubjectCount(query: string): Promise<number>;
  getEnrollmentScheduleByStudentId(studentId: number): Promise<StudentEnrollmentSchedule>;
  getEnrollmentSubjectsByStudentId(studentId: number): Promise<StudentEnrollmentSubjectData[]>;
  getEnrollmentSubjectTypeById(enrollmentSubjectTypeId: number): Promise<EnrollmentSubjectTypeData>;
  getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<EnrollmentSubjectTypeData[]>;
  getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime: Date, endTime: Date, venueId: number, dayId: number): Promise<EnrollmentSubjectTypeData | undefined>;
  createEnrollmentSubjectType(enrollmentSubjectId: number, classTypeId: number, venueId: number, startTime: Date, endTime: Date, dayId: number, numberOfSeats: number, grouping: number): Promise<ResultSetHeader>;
  deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<ResultSetHeader>;
  deleteStudentEnrollmentSubjectTypeByStudentId(studentId: number, enrollmentId: number): Promise<ResultSetHeader>;
  createStudentEnrollmentSubjectType(studentEnrollmentSubjectTypes: number[][]): Promise<ResultSetHeader>;
  getEnrolledSubjectsByStudentId(studentId: number, enrollmentId: number): Promise<StudentEnrolledSubject[]>;
}

class EnrollmentRepository implements IEnrollmentRepository {
  getEnrollments(query: string, pageSize: number | null, page: number | null): Promise<EnrollmentData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
      SELECT *
      FROM ENROLLMENT
      WHERE enrollmentId LIKE ?
      ORDER BY enrollmentStartDateTime ASC `;

      const params: any[] = [
        "%" + query + "%",
      ];

      if (page != null && pageSize != null) {
        const offset: number = (page - 1) * pageSize;
        sql += "LIMIT ? OFFSET ? ";
        params.push(pageSize, offset);
      }

      databaseConn.query<EnrollmentData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentById(enrollmentId: number): Promise<EnrollmentData | undefined> {
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

  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader> {
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

  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<ResultSetHeader> {
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

  deleteEnrollmentById(enrollmentId: number): Promise<ResultSetHeader> {
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

  getEnrollmentCount(query: string): Promise<number> {
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
          resolve(res[0].totalCount);
        }
      );
    });
  }

  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined> {
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

  getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<EnrollmentData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentData[]>(
        "SELECT enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime " +
        "FROM ENROLLMENT " +
        "WHERE enrollmentId = ? " +
        "AND enrollmentStartDateTime = ? " +
        "AND enrollmentEndDateTime = ?;",
        [enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<EnrollmentProgrammeIntakeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentProgrammeIntakeData[]>(
        "SELECT e.* , pi.*, p.programmeName, sm.studyMode " +
        "FROM ENROLLMENT e " +
        "INNER JOIN PROGRAMME_INTAKE pi ON e.enrollmentId = pi.enrollmentId " +
        "INNER JOIN PROGRAMME p ON pi.programmeId = p.programmeId " +
        "INNER JOIN STUDY_MODE sm ON pi.studyModeId = sm.studyModeId " +
        "WHERE e.enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentProgrammeIntakeByEnrollmentIdAndProgrammeIntakeId(enrollmentId: number, programmeIntakeId: number): Promise<EnrollmentProgrammeIntakeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentProgrammeIntakeData[]>(
        "SELECT * " +
        "FROM ENROLLMENT_PROGRAMME_INTAKE " +
        "WHERE enrollmentId = ? " +
        "AND programmeIntakeId = ?;",
        [enrollmentId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT_PROGRAMME_INTAKE (enrollmentId, programmeIntakeId) " +
        "VALUES (?, ?);",
        [enrollmentId, programmeIntakeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT_PROGRAMME_INTAKE " +
        "WHERE enrollmentId = ?;",
        [enrollmentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentSubjects(query: string, pageSize: number | null, page: number | null): Promise<EnrollmentSubjectData[]> {
    return new Promise((resolve, reject) => {
      let sql: string = `
      SELECT *
      FROM ENROLLMENT_SUBJECT es
      INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId
      INNER JOIN SUBJECT s ON es.subjectid = s.subjectId
      INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId
      INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId
      WHERE es.enrollmentSubjectId LIKE ?
      OR s.subjectName LIKE ?
      OR l.firstName LIKE ?
      OR l.lastName LIKE ? `;

      const params: any[] = [
        "%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
        "%" + query + "%",
      ];

      if (page != null && pageSize != null) {
        const offset: number = (page - 1) * pageSize;
        sql += "LIMIT ? OFFSET ? ";
        params.push(pageSize, offset);
      }

      databaseConn.query<EnrollmentSubjectData[]>(sql, params,
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<EnrollmentSubjectData | undefined> {
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

  getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<EnrollmentSubjectData | undefined> {
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

  getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number): Promise<EnrollmentSubjectData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectData[]>(
        "SELECT * " +
        "FROM ENROLLMENT_SUBJECT es " +
        "INNER JOIN ENROLLMENT e ON es.enrollmentId = e.enrollmentId " +
        "INNER JOIN SUBJECT s ON es.subjectid = s.subjectId " +
        "INNER JOIN LECTURER l ON es.lecturerId = l.lecturerId " +
        "INNER JOIN LECTURER_TITLE lt ON l.lecturerTitleId = lt.lecturerTitleId " +
        "WHERE es.enrollmentSubjectId = ? " +
        "AND es.enrollmentId = ? " +
        "AND es.subjectId = ?;",
        [enrollmentSubjectId, enrollmentId, subjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createEnrollmentSubject(enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader> {
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

  updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<ResultSetHeader> {
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

  deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<ResultSetHeader> {
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

  getEnrollmentSubjectCount(query: string): Promise<number> {
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
          resolve(res[0].totalCount);
        }
      );
    });
  }

  getEnrollmentScheduleByStudentId(studentId: number): Promise<StudentEnrollmentSchedule> {
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

  getEnrolledSubjectsByStudentId(studentId: number, enrollmentId: number): Promise<StudentEnrolledSubject[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<StudentEnrolledSubject[]>(
        "SELECT s.subjectId, s.subjectCode, s.subjectName, s.creditHours, l.lecturerId, l.firstName, l.lastName, lt.lecturerTitleId, " +
        "lt.lecturerTitle, est.enrollmentSubjectTypeId, est.classTypeId, ct.classType, est.grouping, d.dayId, d.day, est.startTime, " +
        "est.endTime " +
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
        "AND sest.studentId = ?; ",
        [enrollmentId, studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  getEnrollmentSubjectsByStudentId(studentId: number): Promise<StudentEnrollmentSubjectData[]> {
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

  getEnrollmentSubjectTypeById(enrollmentSubjectTypeId: number): Promise<EnrollmentSubjectTypeData> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE est.enrollmentSubjectTypeId = ?;",
        [enrollmentSubjectTypeId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<EnrollmentSubjectTypeData[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping " +
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

  getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime: Date, endTime: Date, venueId: number, dayId: number): Promise<EnrollmentSubjectTypeData | undefined> {
    return new Promise((resolve, reject) => {
      databaseConn.query<EnrollmentSubjectTypeData[]>(
        "SELECT est.enrollmentSubjectTypeId, est.enrollmentSubjectId, est.classTypeId, ct.classType, est.venueId, v.venue, est.dayId, d.day, est.startTime, est.endTime, est.numberOfSeats, est.grouping " +
        "FROM ENROLLMENT_SUBJECT_TYPE est " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "INNER JOIN CLASS_TYPE ct ON est.classTypeId = ct.classTypeId " +
        "INNER JOIN VENUE v ON est.venueId = v.venueId " +
        "INNER JOIN DAY d ON est.dayId = d.dayId " +
        "WHERE est.startTime < ? " +
        "AND est.endTime > ? " +
        "AND est.venueId = ? " +
        "AND est.dayId = ?;",
        [endTime, startTime, venueId, dayId],
        (err, res) => {
          if (err) reject(err);
          resolve(res[0]);
        }
      );
    });
  }

  createEnrollmentSubjectType(enrollmentSubjectId: number, classTypeId: number, venueId: number, startTime: Date, endTime: Date, dayId: number, numberOfSeats: number, grouping: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO ENROLLMENT_SUBJECT_TYPE (enrollmentSubjectId, classTypeId, venueId, startTime, endTime, dayId, numberOfSeats, grouping) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [enrollmentSubjectId, classTypeId, venueId, startTime, endTime, dayId, numberOfSeats, grouping],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE FROM ENROLLMENT_SUBJECT_TYPE WHERE enrollmentSubjectId = ?;",
        [enrollmentSubjectId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        });
    });
  }

  deleteStudentEnrollmentSubjectTypeByStudentId(studentId: number, enrollmentId: number): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "DELETE sest " +
        "FROM STUDENT_ENROLLMENT_SUBJECT_TYPE sest " +
        "INNER JOIN ENROLLMENT_SUBJECT_TYPE est ON sest.enrollmentSubjectTypeId = est.enrollmentSubjectTypeId " +
        "INNER JOIN ENROLLMENT_SUBJECT es ON est.enrollmentSubjectId = es.enrollmentSubjectId " +
        "WHERE es.enrollmentId = ? " +
        "AND sest.studentId = ?; ",
        [enrollmentId, studentId],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      );
    });
  }

  createStudentEnrollmentSubjectType(studentEnrollmentSubjectTypes: number[][]): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
      databaseConn.query<ResultSetHeader>(
        "INSERT INTO STUDENT_ENROLLMENT_SUBJECT_TYPE (studentId, enrollmentSubjectTypeId, subjectStatusId) VALUES ?;",
        [studentEnrollmentSubjectTypes],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    })
  }
}

export default new EnrollmentRepository();
