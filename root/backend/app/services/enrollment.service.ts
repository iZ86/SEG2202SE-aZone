import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { EnrollmentData, EnrollmentProgrammeIntakeData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData, EnrollmentSubjectTypeData, StudentEnrolledSubjectTypeIds, StudentEnrolledSubject } from "../models/enrollment-model";
import enrollmentRepository from "../repositories/enrollment.repository";
import { isTimeRangeColliding } from "../utils/utils";

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
  enrollStudentSubjects(studentId: number, studentEnrolledSubjectTypeIds: StudentEnrolledSubjectTypeIds): Promise<Result<StudentEnrolledSubjectTypeIds>>;
  getEnrolledSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrolledSubjects: StudentEnrolledSubject[] }>>
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
          lecturerId: StudentEnrollmentSubjectData["lecturerId"],
          firstName: StudentEnrollmentSubjectData["firstName"],
          lastName: StudentEnrollmentSubjectData["lastName"],
          lecturerTitleId: StudentEnrollmentSubjectData["lecturerTitleId"],
          lecturerTitle: StudentEnrollmentSubjectData["lecturerTitle"],
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
                numberOfStudentsEnrolled: StudentEnrollmentSubjectData["numberOfStudentsEnrolled"],
                numberOfSeats: StudentEnrollmentSubjectData["numberOfSeats"]
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
          lecturerId: studentEnrollmentSubject.lecturerId,
          firstName: studentEnrollmentSubject.firstName,
          lastName: studentEnrollmentSubject.lastName,
          lecturerTitleId: studentEnrollmentSubject.lecturerTitleId,
          lecturerTitle: studentEnrollmentSubject.lecturerTitle,
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
        endTime: studentEnrollmentSubject.endTime,
        numberOfStudentsEnrolled: studentEnrollmentSubject.numberOfStudentsEnrolled,
        numberOfSeats: studentEnrollmentSubject.numberOfSeats
      });
    }

    // The response data.
    const studentEnrollmentSubjectsOrganized: StudentEnrollmentSubjectOrganizedData[] = [];

    // Since everything is in Key-Value datastructure format, this will convert it to array for response.
    for (let subjectId in studentEnrollmentSubjectsOrganizedMap) {
      let studentEnrollmentSubject = studentEnrollmentSubjectsOrganizedMap[subjectId];
      let classTypes: StudentEnrollmentSubjectOrganizedData["classTypes"] = [];
      for (let classTypeId in studentEnrollmentSubjectsOrganizedMap[subjectId].classTypes) {
        classTypes.push(studentEnrollmentSubjectsOrganizedMap[subjectId].classTypes[classTypeId]);
      }
      studentEnrollmentSubjectsOrganizedMap[subjectId].classTypes = classTypes;
      studentEnrollmentSubjectsOrganized.push({
        subjectId: studentEnrollmentSubject.subjectId,
        subjectCode: studentEnrollmentSubject.subjectCode,
        subjectName: studentEnrollmentSubject.subjectName,
        creditHours: studentEnrollmentSubject.creditHours,
        lecturerId: studentEnrollmentSubject.lecturerId,
        firstName: studentEnrollmentSubject.firstName,
        lastName: studentEnrollmentSubject.lastName,
        lecturerTitleId: studentEnrollmentSubject.lecturerTitleId,
        lecturerTitle: studentEnrollmentSubject.lecturerTitle,
        classTypes: classTypes
      });
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

  async enrollStudentSubjects(studentId: number, studentEnrolledSubjectTypeIds: StudentEnrolledSubjectTypeIds): Promise<Result<StudentEnrolledSubjectTypeIds>> {
    const currDate: Date = new Date();

    const enrollmentSubjectsResult: Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }> = await this.getEnrollmentSubjectsByStudentId(studentId);


    // Check if the student enroll or not.
    if (!enrollmentSubjectsResult.isSuccess() || currDate < new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentStartDateTime) || currDate > new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentEndDateTime)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found" + currDate + " " + new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentStartDateTime) + " " + new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentEndDateTime));
    }

    const studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[] = enrollmentSubjectsResult.getData().studentEnrollmentSubjects;


    const studentEnrollmentSubjectsMap: {
      [enrollmentSubjectTypeId: number]: {
        dayId: number,
        startTime: Date,
        endTime: Date,
        classTypeId: number,
        subjectId: number,
        numberOfStudentsEnrolled: number,
        numberOfSeats: number,
      }
    } = {};

    // Place all the enrollmentSubjectTypeIds connected to studentId into a dictionary for easier lookup.
    for (const studentEnrollmentSubject of studentEnrollmentSubjects) {
      for (const classType of studentEnrollmentSubject.classTypes) {
        for (const classTypeDetail of classType.classTypeDetails) {
          studentEnrollmentSubjectsMap[classTypeDetail.enrollmentSubjectTypeId] = {
            dayId: classTypeDetail.dayId,
            startTime: classTypeDetail.startTime,
            endTime: classTypeDetail.endTime,
            classTypeId: classType.classTypeId,
            subjectId: studentEnrollmentSubject.subjectId,
            numberOfStudentsEnrolled: classTypeDetail.numberOfStudentsEnrolled,
            numberOfSeats: classTypeDetail.numberOfSeats
          };
        }
      }
    }


    const subjectIdAndClassTypeId: { [subjectId: number]: { [classTypeId: number]: boolean } } = {};
    const dayIdAndTime: { [dayId: number]: { startTime: Date; endTime: Date }[] } = {};
    const errorEnrollmentSubjectTypeIds: number[] = [];



    // Checks if the enrollmentSubjectTypeId provided is valid or not.
    for (const enrollmentSubjectTypeId of studentEnrolledSubjectTypeIds.enrollmentSubjectTypeIds) {

      if (!studentEnrollmentSubjectsMap[enrollmentSubjectTypeId]) {

        errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);

      }
    }

    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject type does not exist", { enrollmentSubjectTypeIds: errorEnrollmentSubjectTypeIds });
    }

    // Checks if the enrollmentSubjectTypeId has multiple of the same classTypes for the subject.
    for (const enrollmentSubjectTypeId of studentEnrolledSubjectTypeIds.enrollmentSubjectTypeIds) {

      const studentEnrollmentSubject = studentEnrollmentSubjectsMap[enrollmentSubjectTypeId];

      if (subjectIdAndClassTypeId[studentEnrollmentSubject.subjectId]) {
        if ((subjectIdAndClassTypeId[studentEnrollmentSubject.subjectId][studentEnrollmentSubject.classTypeId])) {
          errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);
        } else {
          subjectIdAndClassTypeId[studentEnrollmentSubject.subjectId][studentEnrollmentSubject.classTypeId] = true;
        }

      } else {
        subjectIdAndClassTypeId[studentEnrollmentSubject.subjectId] = {};
        subjectIdAndClassTypeId[studentEnrollmentSubject.subjectId][studentEnrollmentSubject.classTypeId] = true;
      }

    }

    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Can only enroll to one enrollment subject type of one class type for one subject", { enrollmentSubjectTypeIds: errorEnrollmentSubjectTypeIds });
    }


    // Checks if the enrollmentSubjectTypeId has day and time schedule has collided with other enrollmentSubjectTypeIds
    for (const enrollmentSubjectTypeId of studentEnrolledSubjectTypeIds.enrollmentSubjectTypeIds) {

      const studentEnrollmentSubject = studentEnrollmentSubjectsMap[enrollmentSubjectTypeId];

      if (dayIdAndTime[studentEnrollmentSubject.dayId]) {
        for (const subjectTime of dayIdAndTime[studentEnrollmentSubject.dayId]) {

          if (isTimeRangeColliding(subjectTime.startTime, subjectTime.endTime, new Date(studentEnrollmentSubject.startTime), new Date(studentEnrollmentSubject.endTime))) {

            errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);
          } else {
            dayIdAndTime[studentEnrollmentSubject.dayId].push({ startTime: new Date(studentEnrollmentSubject.startTime), endTime: new Date(studentEnrollmentSubject.endTime) });
          }
        }
      } else {
        dayIdAndTime[studentEnrollmentSubject.dayId] = [];
        dayIdAndTime[studentEnrollmentSubject.dayId].push({ startTime: new Date(studentEnrollmentSubject.startTime), endTime: new Date(studentEnrollmentSubject.endTime) });
      }


    }

    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "enrollmentSubjectId time clash", { enrollmentSubjectTypeIds: errorEnrollmentSubjectTypeIds });
    }

    const enrolledSubjects: Result<{
      studentEnrollmentSchedule: StudentEnrollmentSchedule;
      studentEnrolledSubjects: StudentEnrolledSubject[];
    }> = await this.getEnrolledSubjectsByStudentId(studentId);

    if (!enrolledSubjects.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrolledSubjects.getMessage());
    }

    const enrolledSubjectsData: StudentEnrolledSubject[] = enrolledSubjects.getData().studentEnrolledSubjects;

    const enrolledSubjectDataMap: { [enrolmentSubjectTypeId: number]: StudentEnrolledSubject } = {};

    for (const enrolledSubjectData of enrolledSubjectsData) {
      enrolledSubjectDataMap[enrolledSubjectData.enrollmentSubjectTypeId] = enrolledSubjectData;
    }

    // Checks if any of the enrollmentSubjectTypeId has reached full capacity of students.
    for (const enrollmentSubjectTypeId of studentEnrolledSubjectTypeIds.enrollmentSubjectTypeIds) {

      const studentEnrollmentSubject = studentEnrollmentSubjectsMap[enrollmentSubjectTypeId];

      if (studentEnrollmentSubject.numberOfStudentsEnrolled === studentEnrollmentSubject.numberOfSeats && !enrolledSubjectDataMap[enrollmentSubjectTypeId]) {

        errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);

      }
    }

    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "One of multiple enrollmentSubjectId has reached full capacity", { enrollmentSubjectTypeIds: errorEnrollmentSubjectTypeIds });
    }

    // Delete existing studentEnrollmentSubjectType
    const deleteStudentEnrollmentSubjectType = await enrollmentRepository.deleteStudentEnrollmentSubjectTypeByStudentId(studentId, enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentId);

    if (studentEnrolledSubjectTypeIds.enrollmentSubjectTypeIds.length === 0) {
      return Result.succeed(studentEnrolledSubjectTypeIds, "Student enrolled successfully.");
    }

    const studentEnrolledSubjects: number[][] = [];

    for (const enrollmentSubjectTypeId of studentEnrolledSubjectTypeIds.enrollmentSubjectTypeIds) {
      studentEnrolledSubjects.push([
        studentId,
        enrollmentSubjectTypeId,
        1
      ])
    }

    const createStudentEnrollmentSubjectTypes = await enrollmentRepository.createStudentEnrollmentSubjectType(studentEnrolledSubjects);
    if (createStudentEnrollmentSubjectTypes.affectedRows === 0) {
      throw new Error("createStudentEnrollmentSubjectType failed to insert");
    }

    return Result.succeed(studentEnrolledSubjectTypeIds, "Student enrolled successfully.");
  }

  async getEnrolledSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrolledSubjects: StudentEnrolledSubject[] }>> {

    const studentEnrollmentSchedule: Result<StudentEnrollmentSchedule> = await this.getEnrollmentScheduleByStudentId(studentId);

    const currDate = new Date();
    if (!studentEnrollmentSchedule.isSuccess() || !studentEnrollmentSchedule.getData().enrollmentId
      || currDate < new Date(studentEnrollmentSchedule.getData().enrollmentStartDateTime)
      || currDate > new Date(studentEnrollmentSchedule.getData().enrollmentEndDateTime)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "No enrollment at this time.");
    }

    const enrolledSubjects: StudentEnrolledSubject[] = await enrollmentRepository.getEnrolledSubjectsByStudentId(studentId, studentEnrollmentSchedule.getData().enrollmentId);

    return Result.succeed({ studentEnrollmentSchedule: studentEnrollmentSchedule.getData(), studentEnrolledSubjects: enrolledSubjects }, "enrolled subjects retrieve success");
  }
}

export default new EnrollmentService();
