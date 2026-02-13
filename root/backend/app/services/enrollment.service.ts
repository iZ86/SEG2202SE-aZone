import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_CLASS_TYPE, ENUM_DAY, ENUM_ERROR_CODE } from "../enums/enums";
import { EnrollmentData, EnrollmentProgrammeIntakeData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData, EnrollmentSubjectTypeData, StudentEnrolledSubjectTypeIds, StudentEnrolledSubject, MonthlyEnrollmentData, EnrollmentSubjectTypesData, EnrollmentSubjectWithTypesData, CreateEnrollmentSubjectTypeData } from "../models/enrollment-model";
import { ProgrammeIntakeData } from "../models/programme-model";
import enrollmentRepository from "../repositories/enrollment.repository";
import { isTimeRangeColliding } from "../utils/utils";
import programmeService from "./programme.service";
import subjectService from "./subject.service";
import lecturerService from "./lecturer.service";
import { SubjectData } from "../models/subject-model";
import { LecturerData } from "../models/lecturer-model";
import venueService from "./venue.service";
import { VenueData } from "../models/venue-model";

interface IEnrollmentService {
  getEnrollments(query: string, pageSize: number | null, page: number | null): Promise<Result<EnrollmentData[]>>;
  getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>>;
  createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentData>>;
  updateEnrollmentWithProgrammeIntakesById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentData>>;
  deleteEnrollmentById(enrollmentId: number): Promise<Result<null>>;
  getEnrollmentCount(query: string): Promise<Result<number>>;
  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<EnrollmentProgrammeIntakeData[]>>;
  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<Result<EnrollmentProgrammeIntakeData>>;
  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<Result<null>>;
  getEnrollmentSubjects(query: string, pageSize: number | null, page: number | null): Promise<Result<EnrollmentSubjectData[]>>;
  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectWithTypesData>>
  getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>>;
  createEnrollmentSubjectWithEnrollmentSubjectTypes(enrollmentId: number, subjectId: number, lecturerId: number, createEnrollmentSubjectTypes: CreateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>>;
  updateEnrollmentSubjectById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number): Promise<Result<EnrollmentSubjectData>>;
  deleteEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<null>>;
  getEnrollmentSubjectCount(query: string): Promise<Result<number>>;
  getEnrollmentScheduleByStudentId(studentId: number): Promise<Result<StudentEnrollmentSchedule>>;
  getEnrollmentSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }>>;
  getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypesData>>;
  getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime: Date, endTime: Date, venueId: number, dayId: number): Promise<Result<EnrollmentSubjectTypeData>>;
  createEnrollmentSubjectType(enrollmentSubjectId: number, classTypeId: number, venueId: number, startTime: Date, endTime: Date, dayId: number, numberOfSeats: number, grouping: number): Promise<Result<EnrollmentSubjectTypeData>>;
  deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<null>>;
  enrollStudentSubjects(studentId: number, studentEnrolledSubjectTypeIds: StudentEnrolledSubjectTypeIds, isAdmin: boolean): Promise<Result<StudentEnrolledSubjectTypeIds>>;
  getEnrolledSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrolledSubjects: StudentEnrolledSubject[]; }>>;
  getMonthlyEnrollmentCount(duration: number): Promise<Result<MonthlyEnrollmentData[]>>;
}

class EnrollmentService implements IEnrollmentService {
  async getEnrollments(query: string = "", pageSize: number | null, page: number | null): Promise<Result<EnrollmentData[]>> {
    const enrollments: EnrollmentData[] = await enrollmentRepository.getEnrollments(query, pageSize, page);

    return Result.succeed(enrollments, "Enrollments retrieve success");
  }

  async getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(enrollmentId);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  async createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentData>> {

    // Check parameters duplicated.
    const isDateTimeDuplicated: Result<EnrollmentData> = await this.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (isDateTimeDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "enrollmentStartDateTime and enrollmentEndDateTime already exists");
    }


    if (programmeIntakeIds.length > 0) {

      // Check programIntakeIds exist.
      const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByIds(programmeIntakeIds);
      if (!programmeIntakesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
      }

      // Check if they already have an enrollmentId.
      const programmeIntakeIdsWithEnrollmentId: number[] = [];
      const enrollmentIds: number[] = [];

      programmeIntakesResult.getData().map(p => {
        if (p.enrollmentId) {
          programmeIntakeIdsWithEnrollmentId.push(p.programmeIntakeId);
          enrollmentIds.push(p.enrollmentId);
        }
      })

      if (programmeIntakeIdsWithEnrollmentId.length > 0) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `programmeIntakeIds: [${programmeIntakeIdsWithEnrollmentId.join(", ")}] already belongs to enrollmentIds: [${enrollmentIds.join(", ")}]`);
      }
    }


    // Create enrollment.
    const createEnrollmentResult: ResultSetHeader = await enrollmentRepository.createEnrollment(enrollmentStartDateTime, enrollmentEndDateTime);
    if (createEnrollmentResult.affectedRows === 0) {
      throw new Error("createEnrollmentWithProgrammeIntakes failed to insert");
    }

    const enrollment: Result<EnrollmentData> = await this.getEnrollmentById(createEnrollmentResult.insertId);
    if (!enrollment.isSuccess()) {
      throw new Error("createEnrollmentWithProgrammeIntakes created enrollment not found");
    }


    if (programmeIntakeIds.length > 0) {

      // Enroll programmeIntakeIds provided to the newly created enrollmentId.
      const updateProgrammeIntakeEnrollmentIdByIdsResult: Result<ProgrammeIntakeData[]> = await programmeService.updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds, createEnrollmentResult.insertId);
      if (!updateProgrammeIntakeEnrollmentIdByIdsResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, updateProgrammeIntakeEnrollmentIdByIdsResult.getMessage());
      }
    }

    return Result.succeed(enrollment.getData(), "Enrollment create success");
  }

  async updateEnrollmentWithProgrammeIntakesById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentData>> {

    // Check enrollment exist
    const enrollmentResult: Result<EnrollmentData> = await this.getEnrollmentById(enrollmentId);

    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    /**
     * Because enrollmentStartDateTime and enrollmentEndDateTime is unique, check if its tied to the enrollmentId or not.
     * If not tied, check if other enrollmentId has the combination of time or not.
     */
    const currentEnrollmentData: EnrollmentData = enrollmentResult.getData();
    if (new Date(enrollmentStartDateTime).getTime() !== new Date(currentEnrollmentData.enrollmentStartDateTime).getTime() && new Date(enrollmentEndDateTime).getTime() !== new Date(currentEnrollmentData.enrollmentEndDateTime).getTime()) {
      const isDateTimeDuplicated: Result<EnrollmentData> = await this.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);


      if (isDateTimeDuplicated.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "enrollmentStartDateTime and enrollmentEndDateTime already exists");
      }
    }

    if (programmeIntakeIds.length > 0) {

      // Check programIntakeIds exist.
      const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByIds(programmeIntakeIds);
      if (!programmeIntakesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
      }

      // Check if they already have an enrollmentId.
      const programmeIntakeIdsWithEnrollmentId: number[] = [];
      const enrollmentIds: number[] = [];

      programmeIntakesResult.getData().map(p => {
        if (p.enrollmentId && p.enrollmentId !== enrollmentId) {
          programmeIntakeIdsWithEnrollmentId.push(p.programmeIntakeId);
          enrollmentIds.push(p.enrollmentId);
        }
      })

      if (programmeIntakeIdsWithEnrollmentId.length > 0) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `programmeIntakeIds: [${programmeIntakeIdsWithEnrollmentId.join(", ")}] already belongs to enrollmentIds: [${enrollmentIds.join(", ")}]`);
      }
    }


    // Update enrollment.
    const updateEnrollmentResult: ResultSetHeader = await enrollmentRepository.updateEnrollmentById(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);
    if (updateEnrollmentResult.affectedRows === 0) {
      throw new Error("updateEnrollmentById failed to update");
    }


    const enrollment: Result<EnrollmentData> = await this.getEnrollmentById(enrollmentId);

    if (!enrollment) {
      throw new Error("updateEnrollmentById updated enrollment not found");
    }


    // Remove all the programmeIntakes that has this enrollmentId.
    const deleteProgrammeIntakeEnrollmentIdByEnrollmentIdResult: Result<null> = await programmeService.deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId);
    if (!deleteProgrammeIntakeEnrollmentIdByEnrollmentIdResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, deleteProgrammeIntakeEnrollmentIdByEnrollmentIdResult.getMessage());
    }

    // Update the programmeIntakes.
    if (programmeIntakeIds.length > 0) {

      // Enroll programmeIntakeIds provided to the newly created enrollmentId.
      const updateProgrammeIntakeEnrollmentIdByIdsResult: Result<ProgrammeIntakeData[]> = await programmeService.updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds, enrollmentId);
      if (!updateProgrammeIntakeEnrollmentIdByIdsResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, updateProgrammeIntakeEnrollmentIdByIdsResult.getMessage());
      }
    }

    return Result.succeed(enrollment.getData(), "Enrollment update success");
  }

  async deleteEnrollmentById(enrollmentId: number): Promise<Result<null>> {

    // Check if enrollmentId exists.
    const enrollmentResult: Result<EnrollmentData> = await this.getEnrollmentById(enrollmentId);

    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    // Check if any programmeIntakes are under this enrollmentId.
    const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByEnrollmentId(enrollmentId);
    if (!programmeIntakesResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
    }

    const programmeIntakes: ProgrammeIntakeData[] = programmeIntakesResult.getData();
    if (programmeIntakes.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Enrollment cannot be deleted because it is still linked to programme intakes. Please remove the enrollment from all programme intakes before deleting");
    }

    const deleteEnrollmentResult: ResultSetHeader = await enrollmentRepository.deleteEnrollmentById(enrollmentId);
    if (deleteEnrollmentResult.affectedRows === 0) {
      throw new Error("deleteEnrollmentById failed to delete")
    }

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

  async getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);

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

  async getEnrollmentSubjects(query: string = "", pageSize: number | null, page: number | null): Promise<Result<EnrollmentSubjectData[]>> {
    const enrollmentSubjects: EnrollmentSubjectData[] = await enrollmentRepository.getEnrollmentSubjects(query, pageSize, page);

    return Result.succeed(enrollmentSubjects, "Enrollment subjects retrieve success");
  }

  async getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  async getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectWithTypesData>> {
    const enrollmentSubject: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubject.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubject.getMessage());
    }

    const enrollmentSubjectTypes: Result<EnrollmentSubjectTypesData> = await this.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

    return Result.succeed({ ...enrollmentSubject.getData(), enrollmentSubjectTypes: enrollmentSubjectTypes.getData().enrollmentSubjectTypes }, "Enrollment subject retrieve success");
  }

  async getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId, subjectId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  async getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId, enrollmentId, subjectId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }


  async createEnrollmentSubjectWithEnrollmentSubjectTypes(enrollmentId: number, subjectId: number, lecturerId: number, createEnrollmentSubjectTypes: CreateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>> {


    // Check parameters exist.
    const enrollmentResult: Result<EnrollmentData> = await this.getEnrollmentById(enrollmentId);
    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }


    const subjectResult: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }

    const lecturerResult: Result<LecturerData> = await lecturerService.getLecturerById(lecturerId);
    if (!lecturerResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, lecturerResult.getMessage());
    }

    // Check if an enrollment already contains the subject
    const isEnrollmentSubjectDuplicated: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId, subjectId);

    if (isEnrollmentSubjectDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "enrollmentSubject existed");
    }

    let index: number = 0;
    // Check if all the class session data is valid. When the array is not empty
    if (createEnrollmentSubjectTypes.length > 0) {
      for (const createEnrollmentSubjectType of createEnrollmentSubjectTypes) {
        // Check if their foreign keys are valid.
        const isDayIdValid: boolean =
          createEnrollmentSubjectType.dayId >= ENUM_DAY.MONDAY &&
          createEnrollmentSubjectType.dayId <= ENUM_DAY.SUNDAY;

        if (!isDayIdValid) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid dayId at at index: ${index}`)
        }

        const isClassTypeIdValid: boolean =
          createEnrollmentSubjectType.classTypeId >= ENUM_CLASS_TYPE.LECTURE &&
          createEnrollmentSubjectType.classTypeId <= ENUM_CLASS_TYPE.WORKSHOP;

        if (!isClassTypeIdValid) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid classTypeId at at index: ${index}`)
        }

        const venueResult: Result<VenueData> = await venueService.getVenueById(createEnrollmentSubjectType.venueId);
        if (!venueResult.isSuccess()) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid venueId at at index: ${index}`)
        }


        const isClassSessionDuplicated: Result<EnrollmentSubjectTypeData> = await this.getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(
          createEnrollmentSubjectType.startTime,
          createEnrollmentSubjectType.endTime,
          createEnrollmentSubjectType.venueId,
          createEnrollmentSubjectType.dayId
        );

        if (isClassSessionDuplicated.isSuccess()) {
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType at index: ${index} already exists.`);
        }
        index++;
      }
    }


    // Create enrollment subject.
    const createEnrollmentSubjectResult: ResultSetHeader = await enrollmentRepository.createEnrollmentSubject(enrollmentId, subjectId, lecturerId);
    if (createEnrollmentSubjectResult.affectedRows === 0) {
      throw new Error("createEnrollmentSubject failed to insert");
    }

    const enrollmentSubjectId: number = createEnrollmentSubjectResult.insertId;


    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      throw new Error("createEnrollmentSubject created enrollment subject not found");
    }


    // Add enrollmentSubjectTypes with enrollmentSubjectId.
    if (createEnrollmentSubjectTypes.length > 0) {
      const insertEnrollmentSubjectTypes: (string | number | Date)[][] = createEnrollmentSubjectTypes.map(
        (createEnrollmentSubjectType) => [
          enrollmentSubjectId,
          createEnrollmentSubjectType.classTypeId,
          createEnrollmentSubjectType.venueId,
          createEnrollmentSubjectType.startTime,
          createEnrollmentSubjectType.endTime,
          createEnrollmentSubjectType.dayId,
          createEnrollmentSubjectType.numberOfSeats,
          createEnrollmentSubjectType.grouping
        ]
      );


      const createEnrollmentSubjectTypesResult: ResultSetHeader = await enrollmentRepository.createEnrollmentSubjectTypes(insertEnrollmentSubjectTypes);
      if (createEnrollmentSubjectTypesResult.affectedRows === 0) {
        throw new Error("createEnrollmentSubjectTypes failed to insert");
      }

      const enrollmentSubjectTypesResult: Result<EnrollmentSubjectTypesData> = await this.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

      if (!enrollmentSubjectTypesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypesResult.getMessage());
      }

      const enrollmentSubjectTypesData: EnrollmentSubjectTypeData[] = enrollmentSubjectTypesResult.getData().enrollmentSubjectTypes;
      if (enrollmentSubjectTypesData.length === 0) {
        throw new Error("createEnrollmentSubjectTypes created enrollment subject types not found");
      }
    }

    const enrollmentSubjectTypesResult: Result<EnrollmentSubjectWithTypesData> = await this.getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId);

    return Result.succeed(enrollmentSubjectTypesResult.getData(), "Enrollment subject create success");
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
                numberOfSeats: StudentEnrollmentSubjectData["numberOfSeats"];
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

    if (!studentEnrollmentSchedule) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "No enrollment at the moment");
    }

    return Result.succeed(studentEnrollmentSchedule, "Student enrollment schedule retrieve success");
  }


  async getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypesData>> {

    // Check if parameter exist.
    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectResult.getMessage());
    }

    const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

    return Result.succeed({ enrollmentSubjectId: enrollmentSubjectId, enrollmentSubjectTypes: enrollmentSubjectTypes }, "Enrollment subject type retrieve success");
  }

  async getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime: Date, endTime: Date, venueId: number, dayId: number): Promise<Result<EnrollmentSubjectTypeData>> {
    const enrollmentSubjectType: EnrollmentSubjectTypeData | undefined = await enrollmentRepository.getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime, endTime, venueId, dayId);

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

    // Check if parameter exist.
    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectResult.getMessage());
    }

    await enrollmentRepository.deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    return Result.succeed(null, "Enrollment subject type delete success");
  }

  async enrollStudentSubjects(studentId: number, studentEnrolledSubjectTypeIds: StudentEnrolledSubjectTypeIds, isAdmin: boolean): Promise<Result<StudentEnrolledSubjectTypeIds>> {
    const currDate: Date = new Date();

    const enrollmentSubjectsResult: Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }> = await this.getEnrollmentSubjectsByStudentId(studentId);

    // Check if the student enroll or not.
    if (!isAdmin) {
      if (!enrollmentSubjectsResult.isSuccess() || currDate < new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentStartDateTime) || currDate > new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentEndDateTime)) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found" + currDate + " " + new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentStartDateTime) + " " + new Date(enrollmentSubjectsResult.getData().studentEnrollmentSchedule.enrollmentEndDateTime));
      }
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
      };
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

    const subjectIdAndClassTypeId: { [subjectId: number]: { [classTypeId: number]: boolean; }; } = {};
    const dayIdAndTime: { [dayId: number]: { startTime: Date; endTime: Date; }[]; } = {};
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
      const { dayId, startTime, endTime } = studentEnrollmentSubject;

      if (!dayIdAndTime[dayId]) {
        dayIdAndTime[dayId] = [];
      }

      const hasClash = dayIdAndTime[dayId].some(existingTime =>
        isTimeRangeColliding(
          existingTime.startTime,
          existingTime.endTime,
          startTime,
          endTime
        )
      );

      if (hasClash) {
        errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);
      } else {
        dayIdAndTime[dayId].push({ startTime, endTime });
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

    const enrolledSubjectDataMap: { [enrolmentSubjectTypeId: number]: StudentEnrolledSubject; } = {};

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
      ]);
    }

    const createStudentEnrollmentSubjectTypes = await enrollmentRepository.createStudentEnrollmentSubjectType(studentEnrolledSubjects);
    if (createStudentEnrollmentSubjectTypes.affectedRows === 0) {
      throw new Error("createStudentEnrollmentSubjectType failed to insert");
    }

    return Result.succeed(studentEnrolledSubjectTypeIds, "Student enrolled successfully.");
  }

  async getEnrolledSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrolledSubjects: StudentEnrolledSubject[]; }>> {

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

  async getMonthlyEnrollmentCount(duration: number = 6): Promise<Result<MonthlyEnrollmentData[]>> {
    const enrollments: MonthlyEnrollmentData[] = await enrollmentRepository.getMonthlyEnrollmentCount(duration);

    return Result.succeed(enrollments, "Enrollments retrieve success");
  }
}

export default new EnrollmentService();
