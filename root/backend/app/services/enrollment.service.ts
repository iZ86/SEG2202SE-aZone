import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_CLASS_TYPE, ENUM_DAY, ENUM_ERROR_CODE, ENUM_PROGRAMME_INTAKE_STATUS } from "../enums/enums";
import { EnrollmentData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData, EnrollmentSubjectTypeData, StudentEnrolledSubjectTypeIds, StudentEnrolledSubject, MonthlyEnrollmentData, EnrollmentSubjectWithTypesData, CreateEnrollmentSubjectTypeData, EnrollmentWithProgrammeIntakesData, UpdateEnrollmentSubjectTypeData } from "../models/enrollment-model";
import { ProgrammeIntakeData, SemesterSchedule } from "../models/programme-model";
import enrollmentRepository from "../repositories/enrollment.repository";
import { isTimeClashing, isDateRangeClashing } from "../utils/utils";
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
  getEnrollmentWithProgrammeIntakesById(enrollmentId: number): Promise<Result<EnrollmentWithProgrammeIntakesData>>;
  createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>>;
  updateEnrollmentWithProgrammeIntakesById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>>;
  deleteEnrollmentById(enrollmentId: number): Promise<Result<null>>;
  getEnrollmentCount(query: string): Promise<Result<number>>;
  getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  getEnrollmentSubjects(query: string, pageSize: number | null, page: number | null): Promise<Result<EnrollmentSubjectData[]>>;
  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectWithTypesData>>
  getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId: number, enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>>;
  createEnrollmentSubjectWithEnrollmentSubjectTypes(enrollmentId: number, subjectId: number, lecturerId: number, createEnrollmentSubjectTypes: CreateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>>;
  updateEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number, updateEnrollmentSubjectTypes: UpdateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>>;
  deleteEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<null>>;
  getEnrollmentSubjectCount(query: string): Promise<Result<number>>;
  getEnrollmentScheduleByStudentId(studentId: number): Promise<Result<StudentEnrollmentSchedule>>;
  getEnrollmentSubjectsByStudentId(studentId: number): Promise<Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }>>;
  getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypeData[]>>;
  getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime: Date, endTime: Date, venueId: number, dayId: number): Promise<Result<EnrollmentSubjectTypeData>>;
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

  async getEnrollmentWithProgrammeIntakesById(enrollmentId: number): Promise<Result<EnrollmentWithProgrammeIntakesData>> {
    const enrollmentResult: Result<EnrollmentData> = await this.getEnrollmentById(enrollmentId);

    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByEnrollmentId(enrollmentId);
    if (!programmeIntakesResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
    }

    return Result.succeed({ ...enrollmentResult.getData(), programmeIntakes: programmeIntakesResult.getData() }, "Enrollment retrieve success");
  }

  async createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>> {

    // Check parameters duplicated.
    const isDateTimeDuplicated: Result<EnrollmentData> = await this.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (isDateTimeDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "enrollmentStartDateTime and enrollmentEndDateTime already exists");
    }


    if (programmeIntakeIds.length > 0) {

      // Check programIntakeIds exist.
      const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByIds(programmeIntakeIds);
      if (!programmeIntakesResult.isSuccess()) {
        switch (programmeIntakesResult.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
          case ENUM_ERROR_CODE.CONFLICT:
            return Result.fail(ENUM_ERROR_CODE.CONFLICT, programmeIntakesResult.getMessage());
        }
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

    const enrollmentWithProgrammeIntakes: Result<EnrollmentWithProgrammeIntakesData> = await this.getEnrollmentWithProgrammeIntakesById(createEnrollmentResult.insertId);

    return Result.succeed(enrollmentWithProgrammeIntakes.getData(), "Enrollment create success");
  }

  async updateEnrollmentWithProgrammeIntakesById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>> {

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
        switch (programmeIntakesResult.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
          case ENUM_ERROR_CODE.CONFLICT:
            return Result.fail(ENUM_ERROR_CODE.CONFLICT, programmeIntakesResult.getMessage());
        }
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

    if (!enrollment.isSuccess()) {
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

    const enrollmentWithProgrammeIntakes: Result<EnrollmentWithProgrammeIntakesData> = await this.getEnrollmentWithProgrammeIntakesById(enrollmentId);

    return Result.succeed(enrollmentWithProgrammeIntakes.getData(), "Enrollment update success");
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
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Enrollment cannot be deleted because there are still programme intakes linked to it. Please remove all the programme intakes before deleting");
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

    const enrollmentSubjectTypes: Result<EnrollmentSubjectTypeData[]> = await this.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);
    if (!enrollmentSubjectTypes.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypes.getMessage())
    }

    return Result.succeed({ ...enrollmentSubject.getData(), enrollmentSubjectTypes: enrollmentSubjectTypes.getData() }, "Enrollment subject retrieve success");
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




    // Check if all the class session data is valid. When the array is not empty
    if (createEnrollmentSubjectTypes.length > 0) {

      const classTypeIdAndGroupingDictionary: { [classTypeId: number]: { [grouping: number]: number } } = {};
      const venueIdAndEnrollmentSubjectTypeDictionary: { [venueId: number]: { ["index"]: number;["enrollmentSubjectType"]: CreateEnrollmentSubjectTypeData }[] } = {};
      const lecturerIdAndEnrollmentSubjectTypeDictionary: { [lecturerId: number]: { ["index"]: number;["enrollmentSubjectType"]: CreateEnrollmentSubjectTypeData }[] } = {};

      let index: number = 0;

      for (const createEnrollmentSubjectType of createEnrollmentSubjectTypes) {
        // Check if their foreign keys are valid.

        if (!(createEnrollmentSubjectType.dayId in ENUM_DAY)) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid dayId at at index: ${index}`)
        }

        if (!(createEnrollmentSubjectType.classTypeId in ENUM_CLASS_TYPE)) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid classTypeId at at index: ${index}`)
        }

        const venueResult: Result<VenueData> = await venueService.getVenueById(createEnrollmentSubjectType.venueId);
        if (!venueResult.isSuccess()) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid venueId at at index: ${index}`)
        }

        // Check if there is any grouping clashing within the enrollmentSubjectTypes.
        // Because this is create, it wont exist in db.
        if (!classTypeIdAndGroupingDictionary[createEnrollmentSubjectType.classTypeId]) {
          classTypeIdAndGroupingDictionary[createEnrollmentSubjectType.classTypeId] = {};
          classTypeIdAndGroupingDictionary[createEnrollmentSubjectType.classTypeId][createEnrollmentSubjectType.grouping] = index;
        } else {
          if (classTypeIdAndGroupingDictionary[createEnrollmentSubjectType.classTypeId][createEnrollmentSubjectType.grouping] === undefined) {
            classTypeIdAndGroupingDictionary[createEnrollmentSubjectType.classTypeId][createEnrollmentSubjectType.grouping] = index;
          } else {
            return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType classType and grouping at index [${index}] is clashing with enrollmentSubjectType at index [${classTypeIdAndGroupingDictionary[createEnrollmentSubjectType.classTypeId][createEnrollmentSubjectType.grouping]}]`);
          }
        }

        // Check if there is any clashing with place and time with provided enrollmentSubjectTypes.
        if (!venueIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.venueId]) {
          venueIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.venueId] = [];
          venueIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.venueId].push({ index: index, enrollmentSubjectType: createEnrollmentSubjectType });
        } else {
          for (const venueIdAndEnrollmentSubjectType of venueIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.venueId]) {
            if (isTimeClashing(createEnrollmentSubjectType.startTime, createEnrollmentSubjectType.endTime, venueIdAndEnrollmentSubjectType.enrollmentSubjectType.startTime,
              venueIdAndEnrollmentSubjectType.enrollmentSubjectType.endTime) && (createEnrollmentSubjectType.dayId === venueIdAndEnrollmentSubjectType.enrollmentSubjectType.dayId)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType venue and class schedule at index [${index}] is clashing with enrollmentSubjectType at index [${venueIdAndEnrollmentSubjectType.index}]`);
            }
          }
          venueIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.venueId].push({ index: index, enrollmentSubjectType: createEnrollmentSubjectType });
        }

        // Check if there is any clashing with lecturer and time with provided enrollmentSubjectTypes.
        if (!lecturerIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.lecturerId]) {
          lecturerIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.lecturerId] = [];
          lecturerIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.lecturerId].push({ index: index, enrollmentSubjectType: createEnrollmentSubjectType });
        } else {
          for (const lecturerIdAndEnrollmentSubjectType of lecturerIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.lecturerId]) {
            if (isTimeClashing(createEnrollmentSubjectType.startTime, createEnrollmentSubjectType.endTime, lecturerIdAndEnrollmentSubjectType.enrollmentSubjectType.startTime,
              lecturerIdAndEnrollmentSubjectType.enrollmentSubjectType.endTime) && (createEnrollmentSubjectType.dayId === lecturerIdAndEnrollmentSubjectType.enrollmentSubjectType.dayId)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType lecturer and class schedule at index [${index}] is clashing with enrollmentSubjectType at index [${lecturerIdAndEnrollmentSubjectType.index}]`);
            }
          }
          lecturerIdAndEnrollmentSubjectTypeDictionary[createEnrollmentSubjectType.lecturerId].push({ index: index, enrollmentSubjectType: createEnrollmentSubjectType });
        }
        index++;
      }

      // Below here is all database checks for enrollmentSubjectTypes.

      // Now checking the enrollmentSubjectTypes if there is any existing clashing for venue and schedule AND lecturer and schedule in database.
      // Check enrollmentSubjectTypes with the same enrollmentId first.
      const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByEnrollmentId(enrollmentId);

      if (enrollmentSubjectTypes.length > 0) {
        let index: number = 0;
        for (const createEnrollmentSubjectType of createEnrollmentSubjectTypes) {
          for (const enrollmentSubjectType of enrollmentSubjectTypes) {

            if ((createEnrollmentSubjectType.venueId === enrollmentSubjectType.venueId) &&
              (createEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
              isTimeClashing(createEnrollmentSubjectType.startTime, createEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType venue and class schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
            }
          }
          index++;
        }

        index = 0;

        for (const createEnrollmentSubjectType of createEnrollmentSubjectTypes) {
          for (const enrollmentSubjectType of enrollmentSubjectTypes) {
            if ((createEnrollmentSubjectType.lecturerId === enrollmentSubjectType.lecturerId) &&
              (createEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
              isTimeClashing(createEnrollmentSubjectType.startTime, createEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType lecturer and class schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
            }
          }
          index++;
        }
      }

      // Below onwards check enrollmentSubjectTypes of different enrollmentId.
      // However, their programIntake semesterStartDate and semesterEndDate must overlap with the provided enrollmentId.
      // Otherwise, there is no clashing occur.

      // Get programmeIntakes by enrollmentId and active status.
      const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByStatus(ENUM_PROGRAMME_INTAKE_STATUS.ACTIVE);
      if (!programmeIntakesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
      }

      const programmeIntakes: ProgrammeIntakeData[] = programmeIntakesResult.getData();
      if (programmeIntakes.length > 0) {

        // Filter by enrollmentId
        const programmeIntakeByEnrollmentId = programmeIntakes.filter(intake => intake.enrollmentId === enrollmentId);

        // Get the semester schedule ranges.
        const semesterDateRanges: { semesterStartDate: Date; semesterEndDate: Date }[] = this.mergeSemesterScheduleRanges(programmeIntakeByEnrollmentId);

        // Filter out the current enrollmentId
        const otherProgrammeIntakes = programmeIntakes.filter(intake => intake.enrollmentId !== enrollmentId);

        // Get other enrollmentIds from the clashing semesterStartDate and semesterEndDate.
        const enrollmentIds: number[] = this.findEnrollmentIdsFromOverlappingSemesterSchedule(otherProgrammeIntakes, semesterDateRanges);

        if (enrollmentIds.length > 0) {
          const enrollmentSubjectTypesByEnrollmentIdsResult: Result<EnrollmentSubjectTypeData[]> = await this.getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds);

          if (!enrollmentSubjectTypesByEnrollmentIdsResult.isSuccess()) {
            return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypesByEnrollmentIdsResult.getMessage());
          }

          const enrollmentSubjectTypesByEnrollmentIds: EnrollmentSubjectTypeData[] = enrollmentSubjectTypesByEnrollmentIdsResult.getData();

          if (enrollmentSubjectTypesByEnrollmentIds.length > 0) {
            let index: number = 0;
            for (const createEnrollmentSubjectType of createEnrollmentSubjectTypes) {
              for (const enrollmentSubjectType of enrollmentSubjectTypesByEnrollmentIds) {
                if ((createEnrollmentSubjectType.venueId === enrollmentSubjectType.venueId) &&
                  (createEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
                  isTimeClashing(createEnrollmentSubjectType.startTime, createEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)
                ) {
                  return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType venue and schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
                }
              }
              index++;
            }

            index = 0;
            for (const createEnrollmentSubjectType of createEnrollmentSubjectTypes) {
              for (const enrollmentSubjectType of enrollmentSubjectTypesByEnrollmentIds) {
                if ((createEnrollmentSubjectType.lecturerId === enrollmentSubjectType.lecturerId) &&
                  (createEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
                  isTimeClashing(createEnrollmentSubjectType.startTime, createEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)
                ) {
                  return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType lecturer and schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
                }
              }
              index++;
            }
          }
        }
      }
    }


    // Create enrollment subject.
    const createEnrollmentSubjectResult: ResultSetHeader = await enrollmentRepository.createEnrollmentSubject(enrollmentId, subjectId, lecturerId);
    if (createEnrollmentSubjectResult.affectedRows === 0) {
      throw new Error("createEnrollmentSubjectWithSubjectTypes failed to insert enrollment subject");
    }

    const enrollmentSubjectId: number = createEnrollmentSubjectResult.insertId;


    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      throw new Error("createEnrollmentSubjectWithSubjectTypes created enrollment subject not found");
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
          createEnrollmentSubjectType.grouping,
          createEnrollmentSubjectType.lecturerId
        ]
      );


      const createEnrollmentSubjectTypesResult: ResultSetHeader = await enrollmentRepository.createEnrollmentSubjectTypes(insertEnrollmentSubjectTypes);
      if (createEnrollmentSubjectTypesResult.affectedRows === 0) {
        throw new Error("createEnrollmentSubjectWithSubjectTypes failed to insert enrollment subject types");
      }

      const enrollmentSubjectTypesResult: Result<EnrollmentSubjectTypeData[]> = await this.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

      if (!enrollmentSubjectTypesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypesResult.getMessage());
      }

      const enrollmentSubjectTypesData: EnrollmentSubjectTypeData[] = enrollmentSubjectTypesResult.getData();
      if (enrollmentSubjectTypesData.length === 0) {
        throw new Error("createEnrollmentSubjectWithSubjectTypes created enrollment subject types not found");
      }
    }

    const enrollmentSubjectWithEnrollmentSubjectTypes: Result<EnrollmentSubjectWithTypesData> = await this.getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId);

    if (!enrollmentSubjectWithEnrollmentSubjectTypes.isSuccess()) {
      throw new Error("createEnrollmentSubjectWithEnrollmentSubjectTypes failed to get created data");
    }


    return Result.succeed(enrollmentSubjectWithEnrollmentSubjectTypes.getData(), "Enrollment subject create success");
  }


  /**
   * Finds enrollmentIds from programmeIntakes where their semesterStartDate and semesterEndDate is overlapping,
   * with any of the semesterDateRanges provided.
   * @param enrollmentId
   * @param programmeIntakes 
   * @param semesterDateRanges 
   * @returns number[]
   */
  findEnrollmentIdsFromOverlappingSemesterSchedule(programmeIntakes: ProgrammeIntakeData[], semesterDateRanges: SemesterSchedule[]): number[] {
    const overlappingIds = new Set<number>();

    // Check each intake against all semester date ranges
    for (const programmeIntake of programmeIntakes) {
      if (!programmeIntake.enrollmentId) {
        continue;
      }

      const semesterStartDate = new Date(programmeIntake.semesterStartDate);
      const semesterEndDate = new Date(programmeIntake.semesterEndDate);

      // Check if this intake overlaps with any of the ranges
      for (const range of semesterDateRanges) {
        // Two ranges overlap if: start1 <= end2 AND start2 <= end1
        if (
          semesterStartDate <= range.semesterEndDate &&
          semesterEndDate >= range.semesterStartDate
        ) {
          overlappingIds.add(programmeIntake.enrollmentId);
          break; // No need to check other ranges for this intake
        }
      }
    }

    return Array.from(overlappingIds);
  }

  /**
   * Retrieves the date ranges of the semester from every programe intake and input it into an array and return it.
   * If the programmeIntake semester schedule is overlapping combine it into one bigger range.
   * Otherwise, set it into a new a item in the list.
   * If there is two item in the list and the new semester schedules overlaps, combine them into both.
   * @param enrollmentId 
   * @param programmeIntakes 
   * @returns SemesterSchedule[]
   */
  mergeSemesterScheduleRanges(programmeIntakes: ProgrammeIntakeData[]): SemesterSchedule[] {

    const semesterRanges = programmeIntakes.map(intake => ({
      semesterStartDate: new Date(intake.semesterStartDate),
      semesterEndDate: new Date(intake.semesterEndDate)
    }))
      .sort((a, b) => a.semesterStartDate.getTime() - b.semesterStartDate.getTime());

    if (semesterRanges.length === 0) return [];

    const merged: SemesterSchedule[] = [];
    let current = { ...semesterRanges[0] };

    for (let i = 1; i < semesterRanges.length; i++) {
      const next = semesterRanges[i];

      // Check if ranges overlap or are adjacent (touch each other)
      // If next start is before or equal to current end, they can be merged
      if (next.semesterStartDate <= current.semesterEndDate) {
        // Merge by extending the end date if necessary
        current.semesterEndDate = new Date(
          Math.max(current.semesterEndDate.getTime(), next.semesterEndDate.getTime())
        );
      } else {
        // No overlap, push current and start a new range
        merged.push(current);
        current = { ...next };
      }
    }

    // Don't forget the last range
    merged.push(current);

    return merged;
  }


  async updateEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number, updateEnrollmentSubjectTypes: UpdateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>> {


    // Check parameters exist.
    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectResult.getMessage());
    }

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
      const enrollmentSubjectDuplicated: EnrollmentSubjectData = isEnrollmentSubjectDuplicated.getData();
      if (enrollmentSubjectDuplicated.enrollmentSubjectId !== enrollmentSubjectId) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `subjectId [${subjectId}] already belongs to enrollmentId [${enrollmentId}]`);
      }
    }




    // Check if all the class session data is valid. When the array is not empty
    if (updateEnrollmentSubjectTypes.length > 0) {

      const classTypeIdAndGroupingDictionary: { [classTypeId: number]: { [grouping: number]: number } } = {};
      const venueIdAndEnrollmentSubjectTypeDictionary: { [venueId: number]: { ["index"]: number;["enrollmentSubjectType"]: CreateEnrollmentSubjectTypeData }[] } = {};
      const lecturerIdAndEnrollmentSubjectTypeDictionary: { [lecturerId: number]: { ["index"]: number;["enrollmentSubjectType"]: CreateEnrollmentSubjectTypeData }[] } = {};

      let index: number = 0;

      for (const updateEnrollmentSubjectType of updateEnrollmentSubjectTypes) {
        // Check if their foreign keys are valid.

        if (!(updateEnrollmentSubjectType.dayId in ENUM_DAY)) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid dayId at at index: ${index}`)
        }

        if (!(updateEnrollmentSubjectType.classTypeId in ENUM_CLASS_TYPE)) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid classTypeId at at index: ${index}`)
        }

        const venueResult: Result<VenueData> = await venueService.getVenueById(updateEnrollmentSubjectType.venueId);
        if (!venueResult.isSuccess()) {
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `Invalid venueId at at index: ${index}`)
        }

        // Check if there is any grouping clashing within the enrollmentSubjectTypes.
        /**
         * In createEnrollmentWithSubjectTypesById, this classTypeId and grouping validation did not need to enter the database for checks.
         * That was because there wasn't any existing enrollmentSubjectType under the enrollmentSubject because enrollmentSubject also didnt exist.
         * However, in update's case, there is also no need to do a database check. This is because, the update will affect ALL enrollmentSubjectType under enrollmentSubject,
         * So if there is any clashing this validation check here will cover it. IF there is a clashing row, but it isn't in the client's request, it also doesn't matter.
         * Because if it isn't in the client's request, it will be deleted. Therefore, there is no need to check in the database.
         */
        if (!classTypeIdAndGroupingDictionary[updateEnrollmentSubjectType.classTypeId]) {
          classTypeIdAndGroupingDictionary[updateEnrollmentSubjectType.classTypeId] = {};
          classTypeIdAndGroupingDictionary[updateEnrollmentSubjectType.classTypeId][updateEnrollmentSubjectType.grouping] = index;
        } else {
          if (classTypeIdAndGroupingDictionary[updateEnrollmentSubjectType.classTypeId][updateEnrollmentSubjectType.grouping] === undefined) {
            classTypeIdAndGroupingDictionary[updateEnrollmentSubjectType.classTypeId][updateEnrollmentSubjectType.grouping] = index;
          } else {
            return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType classType and grouping at index [${index}] is clashing with enrollmentSubjectType at index [${classTypeIdAndGroupingDictionary[updateEnrollmentSubjectType.classTypeId][updateEnrollmentSubjectType.grouping]}]`);
          }
        }

        // Check if there is any clashing with place and time with provided enrollmentSubjectTypes.
        if (!venueIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.venueId]) {
          venueIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.venueId] = [];
          venueIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.venueId].push({ index: index, enrollmentSubjectType: updateEnrollmentSubjectType });
        } else {
          for (const venueIdAndEnrollmentSubjectType of venueIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.venueId]) {
            if (isTimeClashing(updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime, venueIdAndEnrollmentSubjectType.enrollmentSubjectType.startTime,
              venueIdAndEnrollmentSubjectType.enrollmentSubjectType.endTime) && (updateEnrollmentSubjectType.dayId === venueIdAndEnrollmentSubjectType.enrollmentSubjectType.dayId)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType venue and class schedule at index [${index}] is clashing with enrollmentSubjectType at index [${venueIdAndEnrollmentSubjectType.index}]`);
            }
          }
          venueIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.venueId].push({ index: index, enrollmentSubjectType: updateEnrollmentSubjectType });
        }

        // Check if there is any clashing with lecturer and time with provided enrollmentSubjectTypes.
        if (!lecturerIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.lecturerId]) {
          lecturerIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.lecturerId] = [];
          lecturerIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.lecturerId].push({ index: index, enrollmentSubjectType: updateEnrollmentSubjectType });
        } else {
          for (const lecturerIdAndEnrollmentSubjectType of lecturerIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.lecturerId]) {
            if (isTimeClashing(updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime, lecturerIdAndEnrollmentSubjectType.enrollmentSubjectType.startTime,
              lecturerIdAndEnrollmentSubjectType.enrollmentSubjectType.endTime) && (updateEnrollmentSubjectType.dayId === lecturerIdAndEnrollmentSubjectType.enrollmentSubjectType.dayId)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType lecturer and class schedule at index [${index}] is clashing with enrollmentSubjectType at index [${lecturerIdAndEnrollmentSubjectType.index}]`);
            }
          }
          lecturerIdAndEnrollmentSubjectTypeDictionary[updateEnrollmentSubjectType.lecturerId].push({ index: index, enrollmentSubjectType: updateEnrollmentSubjectType });
        }
        index++;
      }

      // Below here is all database checks for enrollmentSubjectTypes.

      // Now checking the enrollmentSubjectTypes if there is any existing clashing for venue and schedule AND lecturer and schedule in database.
      // Check enrollmentSubjectTypes with the same enrollmentId first.
      const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByEnrollmentIdAndNotEnrollmentSubjectId(enrollmentId, enrollmentSubjectId);

      if (enrollmentSubjectTypes.length > 0) {
        let index: number = 0;
        for (const updateEnrollmentSubjectType of updateEnrollmentSubjectTypes) {
          for (const enrollmentSubjectType of enrollmentSubjectTypes) {

            if ((updateEnrollmentSubjectType.venueId === enrollmentSubjectType.venueId) &&
              (updateEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
              isTimeClashing(updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType venue and class schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
            }
          }
          index++;
        }

        index = 0;

        for (const updateEnrollmentSubjectType of updateEnrollmentSubjectTypes) {
          for (const enrollmentSubjectType of enrollmentSubjectTypes) {
            if ((updateEnrollmentSubjectType.lecturerId === enrollmentSubjectType.lecturerId) &&
              (updateEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
              isTimeClashing(updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)) {
              return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType lecturer and class schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
            }
          }
          index++;
        }
      }

      // Below onwards check enrollmentSubjectTypes of different enrollmentId.
      // However, their programIntake semesterStartDate and semesterEndDate must overlap with the provided enrollmentId.
      // Otherwise, there is no clashing occur.

      // Get programmeIntakes by enrollmentId and active status.
      const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakesByStatus(ENUM_PROGRAMME_INTAKE_STATUS.ACTIVE);
      if (!programmeIntakesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
      }

      const programmeIntakes: ProgrammeIntakeData[] = programmeIntakesResult.getData();
      if (programmeIntakes.length > 0) {

        // Filter by enrollmentId
        const programmeIntakeByEnrollmentId = programmeIntakes.filter(intake => intake.enrollmentId === enrollmentId);

        // Get the semester schedule ranges.
        const semesterDateRanges: { semesterStartDate: Date; semesterEndDate: Date }[] = this.mergeSemesterScheduleRanges(programmeIntakeByEnrollmentId);

        // Filter out the current enrollmentId
        const otherProgrammeIntakes = programmeIntakes.filter(intake => intake.enrollmentId !== enrollmentId);

        // Get other enrollmentIds from the clashing semesterStartDate and semesterEndDate.
        const enrollmentIds: number[] = this.findEnrollmentIdsFromOverlappingSemesterSchedule(otherProgrammeIntakes, semesterDateRanges);

        if (enrollmentIds.length > 0) {
          const enrollmentSubjectTypesByEnrollmentIdsResult: Result<EnrollmentSubjectTypeData[]> = await this.getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds);

          if (!enrollmentSubjectTypesByEnrollmentIdsResult.isSuccess()) {
            return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypesByEnrollmentIdsResult.getMessage());
          }

          const enrollmentSubjectTypesByEnrollmentIds: EnrollmentSubjectTypeData[] = enrollmentSubjectTypesByEnrollmentIdsResult.getData();

          if (enrollmentSubjectTypesByEnrollmentIds.length > 0) {
            let index: number = 0;
            for (const updateEnrollmentSubjectType of updateEnrollmentSubjectTypes) {
              for (const enrollmentSubjectType of enrollmentSubjectTypesByEnrollmentIds) {
                if ((updateEnrollmentSubjectType.venueId === enrollmentSubjectType.venueId) &&
                  (updateEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
                  isTimeClashing(updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)
                ) {
                  return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType venue and schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
                }
              }
              index++;
            }

            index = 0;
            for (const updateEnrollmentSubjectType of updateEnrollmentSubjectTypes) {
              for (const enrollmentSubjectType of enrollmentSubjectTypesByEnrollmentIds) {
                if ((updateEnrollmentSubjectType.lecturerId === enrollmentSubjectType.lecturerId) &&
                  (updateEnrollmentSubjectType.dayId === enrollmentSubjectType.dayId) &&
                  isTimeClashing(updateEnrollmentSubjectType.startTime, updateEnrollmentSubjectType.endTime, enrollmentSubjectType.startTime, enrollmentSubjectType.endTime)
                ) {
                  return Result.fail(ENUM_ERROR_CODE.CONFLICT, `enrollmentSubjectType lecturer and schedule at index [${index}] is clashing with existing enrollmentSubjectTypeId: ${enrollmentSubjectType.enrollmentSubjectTypeId}`)
                }
              }
              index++;
            }
          }
        }
      }
    }


    const updateEnrollmentSubjectResult: ResultSetHeader = await enrollmentRepository.updateEnrollmentSubjectById(enrollmentSubjectId, enrollmentId, subjectId, lecturerId);
    if (updateEnrollmentSubjectResult.affectedRows === 0) {
      throw new Error("updateEnrollmentSubjectWithSubjectTypesById failed to update enrollment subject");
    }

    const enrollmentSubject: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubject.isSuccess()) {
      throw new Error("updateEnrollmentSubjectWithSubjectTypesById updated enrollmentSubject not found");
    }


    // Update all existing enrollmentSubjectTypes that exist.
    const updateEnrollmentSubjectTypeIds: number[] = [];
    const updateEnrollmentSubjectTypeWithoutId: UpdateEnrollmentSubjectTypeData[] = [];
    for (const updateEnrollmentSubjectType of updateEnrollmentSubjectTypes) {
      if (updateEnrollmentSubjectType.enrollmentSubjectTypeId) {
        const updateEnrollmentSubjectTypeResult: ResultSetHeader = await enrollmentRepository.updateEnrollmentSubjectTypeById(updateEnrollmentSubjectType);
        if (updateEnrollmentSubjectTypeResult.affectedRows === 0) {
          throw new Error("updateEnrollmentSubjectWithSubjectTypesById failed to update enrollmentSubjectType");
        }
        updateEnrollmentSubjectTypeIds.push(updateEnrollmentSubjectType.enrollmentSubjectTypeId);
      } else {
        updateEnrollmentSubjectTypeWithoutId.push(updateEnrollmentSubjectType);
      }
    }


    // The affected rows can be 0, so no need to check.
    // This condition needs to be done as you can't bulk delete or insert an empty array.
    if (updateEnrollmentSubjectTypeIds.length > 0) {
      await enrollmentRepository.deleteEnrollmentSubjectTypesByEnrollmentSubjectIdAndNotIds(enrollmentSubjectId, updateEnrollmentSubjectTypeIds);
    } else {
      await enrollmentRepository.deleteEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);
    }



    // Add enrollmentSubjectTypes with enrollmentSubjectId.
    if (updateEnrollmentSubjectTypeWithoutId.length > 0) {
      const insertEnrollmentSubjectTypes: (string | number | Date)[][] = updateEnrollmentSubjectTypeWithoutId.map(
        (updateEnrollmentSubjectTypeWithoutId) => [
          enrollmentSubjectId,
          updateEnrollmentSubjectTypeWithoutId.classTypeId,
          updateEnrollmentSubjectTypeWithoutId.venueId,
          updateEnrollmentSubjectTypeWithoutId.startTime,
          updateEnrollmentSubjectTypeWithoutId.endTime,
          updateEnrollmentSubjectTypeWithoutId.dayId,
          updateEnrollmentSubjectTypeWithoutId.numberOfSeats,
          updateEnrollmentSubjectTypeWithoutId.grouping,
          updateEnrollmentSubjectTypeWithoutId.lecturerId
        ]
      );


      const createEnrollmentSubjectTypesResult: ResultSetHeader = await enrollmentRepository.createEnrollmentSubjectTypes(insertEnrollmentSubjectTypes);
      if (createEnrollmentSubjectTypesResult.affectedRows === 0) {
        throw new Error("updateEnrollmentSubjectWithSubjectTypes failed to insert enrollmentSubjectTypes");
      }

      const enrollmentSubjectTypesResult: Result<EnrollmentSubjectTypeData[]> = await this.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

      if (!enrollmentSubjectTypesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypesResult.getMessage());
      }

      const enrollmentSubjectTypesData: EnrollmentSubjectTypeData[] = enrollmentSubjectTypesResult.getData();
      if (enrollmentSubjectTypesData.length === 0) {
        throw new Error("updateEnrollmentSubjectWithSubjectTypes created enrollment subject types not found");
      }
    }


    const enrollmentSubjectWithEnrollmentSubjectTypes: Result<EnrollmentSubjectWithTypesData> = await this.getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId);
    if (!enrollmentSubjectWithEnrollmentSubjectTypes.isSuccess()) {
      throw new Error("updateEnrollmentSubjectWithSubjectTypes failed to get updated data");
    }


    return Result.succeed(enrollmentSubjectWithEnrollmentSubjectTypes.getData(), "Enrollment subject update success");
  }

  async deleteEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<null>> {

    // Check if enrollmentSubjectId
    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectResult.getMessage());
    }

    // ON DELETE CASCADE is active on ENROLLMENT_SUBJECT_TYPE, so deleting this will delete all the related enrollment subject types.
    const deleteEnrollmentSubjectResult: ResultSetHeader = await enrollmentRepository.deleteEnrollmentSubjectById(enrollmentSubjectId);
    if (deleteEnrollmentSubjectResult.affectedRows === 0) {
      throw new Error("deleteEnrollmentSubjectById failed to delete");
    }

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


  async getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypeData[]>> {

    // Check if parameter exist.
    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectResult.getMessage());
    }

    const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

    return Result.succeed(enrollmentSubjectTypes, "Enrollment subject type retrieve success");
  }

  async getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds: number[]): Promise<Result<EnrollmentSubjectTypeData[]>> {

    // Check if parameter exist.
    const enrollmentsResult: Result<EnrollmentData[]> = await this.getEnrollmentsByIds(enrollmentIds);
    if (!enrollmentsResult.isSuccess()) {
      switch (enrollmentsResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentsResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, enrollmentsResult.getMessage());
      }
    }

    const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds);

    return Result.succeed(enrollmentSubjectTypes, "Enrollment subject type retrieve success");
  }

  async getEnrollmentsByIds(enrollmentIds: number[]): Promise<Result<EnrollmentData[]>> {


    const duplicateEnrollmentId: { [enrollmentId: number]: boolean } = {};
    for (const enrollmentId of enrollmentIds) {
      if (duplicateEnrollmentId[enrollmentId]) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Duplicate enrollmentId found: ${enrollmentId}`)
      }
    }

    const enrollments: EnrollmentData[] = await enrollmentRepository.getEnrollmentsByIds(enrollmentIds);

    if (enrollments.length === 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `enrollmentIds not found: [${enrollmentIds.join(", ")}]`);
    }


    const foundIds = new Set(
      enrollments.map(e => e.enrollmentId)
    );

    const missingIds = enrollmentIds.filter(
      id => !foundIds.has(id)
    );

    if (missingIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `enrollmentIds not found: [${missingIds.join(", ")}]`);
    }

    return Result.succeed(enrollments, "Enrollments retrieve success");
  }


  async getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime: Date, endTime: Date, venueId: number, dayId: number): Promise<Result<EnrollmentSubjectTypeData>> {
    const enrollmentSubjectType: EnrollmentSubjectTypeData | undefined = await enrollmentRepository.getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(startTime, endTime, venueId, dayId);

    if (!enrollmentSubjectType) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject type not found");
    }

    return Result.succeed(enrollmentSubjectType, "Enrollment subject type retrieve success");
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
        isDateRangeClashing(
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
