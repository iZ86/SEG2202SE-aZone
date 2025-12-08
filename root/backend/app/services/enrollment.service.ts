import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { EnrollmentData, EnrollmentProgrammeIntakeData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData, EnrollmentSubjectTypeData } from "../models/enrollment-model";
import enrollmentRepository from "../repositories/enrollment.repository";

interface IEnrollmentService {
  getAllEnrollments(query: string, pageSize: number | null, page: number | null): Promise<Result<EnrollmentData[]>>;
  getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>>;
  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  deleteEnrollmentById(enrollmentId: number): Promise<Result<null>>;
  getEnrollmentCount(query: string): Promise<Result<number>>;
  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<EnrollmentProgrammeIntakeData[]>>;
  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<Result<EnrollmentProgrammeIntakeData>>;
  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<Result<null>>;
  getAllEnrollmentSubjects(query: string, pageSize: number | null, page: number | null): Promise<Result<EnrollmentSubjectData[]>>;
  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectByEnrollmentIdAndSubjectIdAndLecturerId(enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectIdAndLecturerId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>>;
  createEnrollmentSubject(enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>>;
  updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>>;
  deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<null>>;
  getEnrollmentSubjectCount(query: string): Promise<Result<number>>;
  getEnrollmentScheduleByStudentId(studentId: number): Promise<Result<StudentEnrollmentSchedule>>;
  getEnrollmentSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }>>;
  getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypeData[]>>;
  createEnrollmentSubjectType(enrollmentSubjectId: number, classTypeId: number, venueId: number, startTime: Date, endTime: Date, dayId: number, numberOfSeats: number, grouping: number): Promise<Result<EnrollmentSubjectTypeData>>;
  deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<null>>;
}

class EnrollmentService implements IEnrollmentService {
  async getAllEnrollments(query: string = "", pageSize: number | null, page: number | null): Promise<Result<EnrollmentData[]>> {
    const enrollments: EnrollmentData[] = await enrollmentRepository.getAllEnrollments(query, pageSize, page);

    return Result.succeed(enrollments, "Enrollments retrieve success");
  }

  async getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(enrollmentId);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  async createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    const response = await enrollmentRepository.createEnrollment(enrollmentStartDateTime, enrollmentEndDateTime);

    const enrollmentResponse: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(response.insertId);

    if (!enrollmentResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment created not found");
    }

    return Result.succeed(enrollmentResponse, "Enrollment create success");
  }

  async updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    await enrollmentRepository.updateEnrollmentById(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);

    const enrollmentResponse: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(enrollmentId);

    if (!enrollmentResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment updated not found");
    }

    return Result.succeed(enrollmentResponse, "Enrollment update success");
  }

  async deleteEnrollmentById(enrollmentId: number): Promise<Result<null>> {
    await enrollmentRepository.deleteEnrollmentById(enrollmentId);

    return Result.succeed(null, "Enrollment delete success");
  }

  async getEnrollmentCount(query: string = ""): Promise<Result<number>> {
    const enrollmentCount: number = await enrollmentRepository.getEnrollmentCount(query);

    return Result.succeed(enrollmentCount ? enrollmentCount : 0, "Enrollment count retrieve success");
  }

  async getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<EnrollmentProgrammeIntakeData[]>> {
    const enrollmentProgrammeIntakes: EnrollmentProgrammeIntakeData[] = await enrollmentRepository.getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId);

    if (!enrollmentProgrammeIntakes) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment programme intake not found");
    }

    return Result.succeed(enrollmentProgrammeIntakes, "Enrollment programme intake retrieve success");
  }

  async getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  async createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<Result<EnrollmentProgrammeIntakeData>> {
    await enrollmentRepository.createEnrollmentProgrammeIntake(enrollmentId, programmeIntakeId);

    const enrollmentProgrammeIntakeResponse: EnrollmentProgrammeIntakeData | undefined = await enrollmentRepository.getEnrollmentProgrammeIntakeByEnrollmentIdAndProgrammeIntakeId(enrollmentId, programmeIntakeId);

    if (!enrollmentProgrammeIntakeResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment programme intake created not found");
    }

    return Result.succeed(enrollmentProgrammeIntakeResponse, "Enrollment programme intake create success");
  }

  async deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<Result<null>> {
    await enrollmentRepository.deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId);

    return Result.succeed(null, "Enrollment programme intake delete success");
  }

  async getAllEnrollmentSubjects(query: string = "", pageSize: number | null, page: number | null): Promise<Result<EnrollmentSubjectData[]>> {
    const enrollmentSubjects: EnrollmentSubjectData[] = await enrollmentRepository.getAllEnrollmentSubjects(query, pageSize, page);

    return Result.succeed(enrollmentSubjects, "Enrollment subjects retrieve success");
  }

  async getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  async getEnrollmentSubjectByEnrollmentIdAndSubjectIdAndLecturerId(enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectByEnrollmentIdAndSubjectIdAndLecturerId(enrollmentId, subjectId, lecturerId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  async getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectIdAndLecturerId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectIdAndLecturerId(enrollmentSubjectId, enrollmentId, subjectId, lecturerId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  async createEnrollmentSubject(enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>> {
    const response = await enrollmentRepository.createEnrollmentSubject(enrollmentId, subjectId, lecturerId);

    const enrollmentSubjectResponse: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectById(response.insertId);

    if (!enrollmentSubjectResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject created not found");
    }

    return Result.succeed(enrollmentSubjectResponse, "Enrollment subject create success");
  }

  async updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>> {
    await enrollmentRepository.updateEnrollmentSubjectById(enrollmentSubjectId, enrollmentId, subjectId, lecturerId);

    const enrollmentSubjectResponse: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubjectResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject updated not found");
    }

    return Result.succeed(enrollmentSubjectResponse, "Enrollment subject update success");
  }

  async deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<null>> {
    await enrollmentRepository.deleteEnrollmentSubjectById(enrollmentSubjectId);

    return Result.succeed(null, "Enrollment subject delete success");
  }

  async getEnrollmentSubjectCount(query: string = ""): Promise<Result<number>> {
    const enrollmentSubjectCount: number = await enrollmentRepository.getEnrollmentSubjectCount(query);

    return Result.succeed(enrollmentSubjectCount ? enrollmentSubjectCount : 0, "Enrollment subject count retrieve success");
  }

  async getEnrollmentSubjectsByStudentId(studentId: number):
    Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }>> {

    const studentEnrollmentSchedule: StudentEnrollmentSchedule | undefined = await enrollmentRepository.getEnrollmentScheduleByStudentId(studentId);

    if (!studentEnrollmentSchedule) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "No enrollment at the moment");
    }

    const studentEnrollmentSubjects: StudentEnrollmentSubjectData[] = await enrollmentRepository.getEnrollmentSubjectsByStudentId(studentId);


    const studentEnrollmentSubjectsOrganizedMap:
      {
        [subjectId: number]: {
          subjectId: StudentEnrollmentSubjectData["subjectId"],
          subjectCode: StudentEnrollmentSubjectData["subjectCode"],
          subjectName: StudentEnrollmentSubjectData["subjectName"],
          creditHours: StudentEnrollmentSubjectData["creditHours"],
          lectureId: StudentEnrollmentSubjectData["lectureId"],
          firstName: StudentEnrollmentSubjectData["firstName"],
          lastName: StudentEnrollmentSubjectData["lastName"],
          lectureTitleId: StudentEnrollmentSubjectData["lectureTitleId"],
          lectureTitle: StudentEnrollmentSubjectData["lectureTitle"],
          classTypes: {
            [classTypeId: number]: {
              classTypeId: StudentEnrollmentSubjectData["classTypeId"],
              classType: StudentEnrollmentSubjectData["classType"],
              classTypeDetails: {
                enrollmentSubjectTypeId: StudentEnrollmentSubjectData["enrollmentSubjectTypeId"],
                grouping: StudentEnrollmentSubjectData["grouping"],
                dayId: StudentEnrollmentSubjectData["dayId"],
                day: StudentEnrollmentSubjectData["day"],
                startTime: StudentEnrollmentSubjectData["startTime"],
                endTime: StudentEnrollmentSubjectData["endTime"],
              }[];
            };
          };
        };
      } = {};


    // Loop through all the enrollment subjects.
    for (const studentEnrollmentSubject of studentEnrollmentSubjects) {

      // If the subject does not exist in the new map datastructure add it with empty classTypes.
      if (!studentEnrollmentSubjectsOrganizedMap[studentEnrollmentSubject.subjectId]) {
        studentEnrollmentSubjectsOrganizedMap[studentEnrollmentSubject.subjectId] = {
          subjectId: studentEnrollmentSubject.subjectId,
          subjectCode: studentEnrollmentSubject.subjectCode,
          subjectName: studentEnrollmentSubject.subjectName,
          creditHours: studentEnrollmentSubject.creditHours,
          lectureId: studentEnrollmentSubject.lectureId,
          firstName: studentEnrollmentSubject.firstName,
          lastName: studentEnrollmentSubject.lastName,
          lectureTitleId: studentEnrollmentSubject.lectureTitleId,
          lectureTitle: studentEnrollmentSubject.lectureTitle,
          classTypes: {}
        };
      }

      // If the subject does exist. However, the classType does not, add the class type.
      if (!studentEnrollmentSubjectsOrganizedMap[studentEnrollmentSubject.subjectId].classTypes[studentEnrollmentSubject.classTypeId]) {
        studentEnrollmentSubjectsOrganizedMap[studentEnrollmentSubject.subjectId].classTypes[studentEnrollmentSubject.classTypeId] = {
          classTypeId: studentEnrollmentSubject.classTypeId,
          classType: studentEnrollmentSubject.classType,
          classTypeDetails: []
        };
      }

      // If the class type exist, add the respective class detail.
      studentEnrollmentSubjectsOrganizedMap[studentEnrollmentSubject.subjectId].classTypes[studentEnrollmentSubject.classTypeId].classTypeDetails.push({
        enrollmentSubjectTypeId: studentEnrollmentSubject.enrollmentSubjectTypeId,
        grouping: studentEnrollmentSubject.grouping,
        dayId: studentEnrollmentSubject.dayId,
        day: studentEnrollmentSubject.day,
        startTime: studentEnrollmentSubject.startTime,
        endTime: studentEnrollmentSubject.endTime
      });
    }

    // The response data.
    const studentEnrollmentSubjectsOrganized: any = [];

    // Since everything is in Key-Value datastructure format, this will convert it to array for response.
    for (let subjectId in studentEnrollmentSubjectsOrganizedMap) {
      let classTypes = [];
      for (let classTypeId in studentEnrollmentSubjectsOrganizedMap[subjectId].classTypes) {
        classTypes.push(studentEnrollmentSubjectsOrganizedMap[subjectId].classTypes[classTypeId]);
      }
      studentEnrollmentSubjectsOrganizedMap[subjectId].classTypes = classTypes;
      studentEnrollmentSubjectsOrganized.push(studentEnrollmentSubjectsOrganizedMap[subjectId]);
    }


    return Result.succeed({ studentEnrollmentSchedule: studentEnrollmentSchedule, studentEnrollmentSubjects: studentEnrollmentSubjectsOrganized }, "Student enrollment subject retrieve success");
  }

  async getEnrollmentScheduleByStudentId(studentId: number): Promise<Result<StudentEnrollmentSchedule>> {
    const studentEnrollmentSchedule: StudentEnrollmentSchedule | undefined = await enrollmentRepository.getEnrollmentScheduleByStudentId(studentId);
    return Result.succeed(
      studentEnrollmentSchedule ?? {
        programmeIntakeId: null,
        enrollmentId: null,
        enrollmentStartDateTime: null,
        enrollmentEndDateTime: null
      },
      "Student enrollment schedule retrieve success"
    );
  }

  async getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypeData[]>> {
    const enrollmentSubjectType: EnrollmentSubjectTypeData[] | undefined = await enrollmentRepository.getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    if (!enrollmentSubjectType) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject type not found");
    }

    return Result.succeed(enrollmentSubjectType, "Enrollment subject type retrieve success");
  }

  async createEnrollmentSubjectType(enrollmentSubjectId: number, classTypeId: number, venueId: number, startTime: Date, endTime: Date, dayId: number, numberOfSeats: number, grouping: number): Promise<Result<EnrollmentSubjectTypeData>> {
    const response = await enrollmentRepository.createEnrollmentSubjectType(enrollmentSubjectId, classTypeId, venueId, startTime, endTime, dayId, numberOfSeats, grouping);

    const enrollmentSubjectTypeResponse: EnrollmentSubjectTypeData | undefined = await enrollmentRepository.getEnrollmentSubjectTypeById(response.insertId);

    if (!enrollmentSubjectTypeResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject type created not found");
    }

    return Result.succeed(enrollmentSubjectTypeResponse, "Enrollment subject type create success");
  }

  async deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<null>> {
    await enrollmentRepository.deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    return Result.succeed(null, "Enrollment subject type delete success");
  }
}

export default new EnrollmentService();
