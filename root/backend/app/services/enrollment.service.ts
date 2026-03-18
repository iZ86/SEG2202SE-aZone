import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_CLASS_TYPE, ENUM_DAY, ENUM_ERROR_CODE, ENUM_PROGRAMME_INTAKE_STATUS } from "../enums/enums";
import { EnrollmentData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, EnrollmentSubjectTypeData, MonthlyEnrollmentData, EnrollmentSubjectWithTypesData, CreateEnrollmentSubjectTypeData, EnrollmentWithProgrammeIntakesData, UpdateEnrollmentSubjectTypeData, StudentEnrollmentScheduleWithSubjectData, EnrollmentWithCountData, EnrollmentSubjectWithCountData} from "../models/enrollment-model";
import { ProgrammeIntakeData, SemesterSchedule } from "../models/programme-model";
import enrollmentRepository from "../repositories/enrollment.repository";
import { isTimeClashing } from "../utils/utils";
import programmeService from "./programme.service";
import subjectService from "./subject.service";
import lecturerService from "./lecturer.service";
import { SubjectData } from "../models/subject-model";
import { LecturerData } from "../models/lecturer-model";
import venueService from "./venue.service";
import { VenueData } from "../models/venue-model";
import { UserData } from "../models/user-model";
import userService from "./user.service";

interface IEnrollmentService {
  getEnrollments(query: string, pageSize: number, page: number): Promise<Result<EnrollmentWithCountData>>;
  getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>>;
  getEnrollmentWithProgrammeIntakesById(enrollmentId: number): Promise<Result<EnrollmentWithProgrammeIntakesData>>;
  createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>>;
  updateEnrollmentWithProgrammeIntakesById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>>;
  deleteEnrollmentById(enrollmentId: number): Promise<Result<null>>;
  getEnrollmentSubjects(query: string, pageSize: number, page: number): Promise<Result<EnrollmentSubjectWithCountData>>;
  getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>>;
  getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectWithTypesData>>;
  createEnrollmentSubjectWithEnrollmentSubjectTypes(enrollmentId: number, subjectId: number, lecturerId: number, createEnrollmentSubjectTypes: CreateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>>;
  updateEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number, updateEnrollmentSubjectTypes: UpdateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>>;
  deleteEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<null>>;
  getEnrollmentScheduleByStudentId(studentId: number): Promise<Result<StudentEnrollmentSchedule>>;
  getEnrollmentSubjectsByStudentId(studentId: number): Promise<Result<StudentEnrollmentScheduleWithSubjectData>>;
  enrollStudentSubjects(studentId: number, enrollmentSubjectTypesIds: number[], isAdmin: boolean): Promise<Result<StudentEnrollmentScheduleWithSubjectData>>;
  getEnrolledSubjectsByStudentId(studentId: number): Promise<Result<StudentEnrollmentScheduleWithSubjectData>>;
  getMonthlyEnrollmentCount(duration: number): Promise<Result<MonthlyEnrollmentData[]>>;
}

class EnrollmentService implements IEnrollmentService {
  public async getEnrollments(query: string, pageSize: number, page: number): Promise<Result<EnrollmentWithCountData>> {
    const enrollments: EnrollmentData[] = await enrollmentRepository.getEnrollments(query, pageSize, page);

    const enrollmentCount: Result<number> = await this.getEnrollmentCount(query);

    return Result.succeed({enrollments: enrollments, enrollmentCount: enrollmentCount.getData()}, "Enrollments retrieve success");
  }

  public async getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(enrollmentId);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  public async getEnrollmentWithProgrammeIntakesById(enrollmentId: number): Promise<Result<EnrollmentWithProgrammeIntakesData>> {
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

  public async createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>> {

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

  public async updateEnrollmentWithProgrammeIntakesById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date, programmeIntakeIds: number[]): Promise<Result<EnrollmentWithProgrammeIntakesData>> {

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

  public async deleteEnrollmentById(enrollmentId: number): Promise<Result<null>> {

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

  private async getEnrollmentCount(query: string = ""): Promise<Result<number>> {
    const enrollmentCount: number = await enrollmentRepository.getEnrollmentCount(query);

    return Result.succeed(enrollmentCount, "Enrollment count retrieve success");
  }

  private async getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  public async getEnrollmentSubjects(query: string, pageSize: number, page: number): Promise<Result<EnrollmentSubjectWithCountData>> {
    const enrollmentSubjects: EnrollmentSubjectData[] = await enrollmentRepository.getEnrollmentSubjects(query, pageSize, page);

    const enrollmentSubjectCount: Result<number> = await this.getEnrollmentSubjectCount(query);

    return Result.succeed({enrollmentSubjects, enrollmentSubjectCount: enrollmentSubjectCount.getData()}, "Enrollment subjects retrieve success");
  }

  public async getEnrollmentSubjectById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectData>> {
    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  public async getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectWithTypesData>> {
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

  private async getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId: number, subjectId: number): Promise<Result<EnrollmentSubjectData>> {

    // Check params exist.
    const enrollmentResult: Result<EnrollmentData> = await this.getEnrollmentById(enrollmentId);
    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    const subjectResult: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }

    const enrollmentSubject: EnrollmentSubjectData | undefined = await enrollmentRepository.getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId, subjectId);

    if (!enrollmentSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment subject not found");
    }

    return Result.succeed(enrollmentSubject, "Enrollment subject retrieve success");
  }

  public async createEnrollmentSubjectWithEnrollmentSubjectTypes(enrollmentId: number, subjectId: number, lecturerId: number, createEnrollmentSubjectTypes: CreateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>> {


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
  private findEnrollmentIdsFromOverlappingSemesterSchedule(programmeIntakes: ProgrammeIntakeData[], semesterDateRanges: SemesterSchedule[]): number[] {
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
  private mergeSemesterScheduleRanges(programmeIntakes: ProgrammeIntakeData[]): SemesterSchedule[] {

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


  public async updateEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number, enrollmentId: number, subjectId: number, lecturerId: number, updateEnrollmentSubjectTypes: UpdateEnrollmentSubjectTypeData[]): Promise<Result<EnrollmentSubjectWithTypesData>> {


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

  public async deleteEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId: number): Promise<Result<null>> {

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

  private async getEnrollmentSubjectCount(query: string = ""): Promise<Result<number>> {
    const enrollmentSubjectCount: number = await enrollmentRepository.getEnrollmentSubjectCount(query);

    return Result.succeed(enrollmentSubjectCount, "Enrollment subject count retrieve success");
  }

  public async getEnrollmentSubjectsByStudentId(studentId: number): Promise<Result<StudentEnrollmentScheduleWithSubjectData>> {

    // Check if params exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }

    // Check if student has enrollment or not
    const studentEnrollmentScheduleResult: Result<StudentEnrollmentSchedule> = await this.getEnrollmentScheduleByStudentId(studentId);
    if (!studentEnrollmentScheduleResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentEnrollmentScheduleResult.getMessage());
    }

    const studentEnrollmentSubjects: StudentEnrollmentSubjectData[] = await enrollmentRepository.getEnrollmentSubjectsByStudentId(studentId);

    return Result.succeed({ ...studentEnrollmentScheduleResult.getData(), enrollmentSubjectTypes: studentEnrollmentSubjects }, "Student enrollment subject retrieve success");
  }


  public async getEnrollmentScheduleByStudentId(studentId: number): Promise<Result<StudentEnrollmentSchedule>> {

    // Check if params exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }


    const studentEnrollmentSchedule: StudentEnrollmentSchedule | undefined = await enrollmentRepository.getEnrollmentScheduleByStudentId(studentId);

    if (!studentEnrollmentSchedule) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "No enrollment at the moment");
    }

    return Result.succeed(studentEnrollmentSchedule, "Student enrollment schedule retrieve success");
  }


  private async getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId: number): Promise<Result<EnrollmentSubjectTypeData[]>> {

    // Check if parameter exist.
    const enrollmentSubjectResult: Result<EnrollmentSubjectData> = await this.getEnrollmentSubjectById(enrollmentSubjectId);
    if (!enrollmentSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectResult.getMessage());
    }

    const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByEnrollmentSubjectId(enrollmentSubjectId);

    return Result.succeed(enrollmentSubjectTypes, "Enrollment subject type retrieve success");
  }

  private async getEnrollmentSubjectTypesByEnrollmentIds(enrollmentIds: number[]): Promise<Result<EnrollmentSubjectTypeData[]>> {

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

  private async getEnrollmentsByIds(enrollmentIds: number[]): Promise<Result<EnrollmentData[]>> {


    const duplicateEnrollmentIds: { [enrollmentId: number]: boolean } = {};
    for (const enrollmentId of enrollmentIds) {
      if (duplicateEnrollmentIds[enrollmentId]) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Duplicate enrollmentId found: ${enrollmentId}`)
      }
      duplicateEnrollmentIds[enrollmentId] = true;
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


  private async getEnrollmentSubjectTypesByIds(enrollmentSubjectTypesIds: number[]): Promise<Result<EnrollmentSubjectTypeData[]>> {


    const duplicateEnrollmentSubjectTypeIds: { [enrollmentSubjectTypeId: number]: boolean } = {};
    for (const enrollmentSubjectTypeId of enrollmentSubjectTypesIds) {
      if (duplicateEnrollmentSubjectTypeIds[enrollmentSubjectTypeId]) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Duplicate enrollmentSubjectTypeIds found: ${enrollmentSubjectTypeId}`)
      }
      duplicateEnrollmentSubjectTypeIds[enrollmentSubjectTypeId] = true;
    }

    const enrollmentSubjectTypes: EnrollmentSubjectTypeData[] = await enrollmentRepository.getEnrollmentSubjectTypesByIds(enrollmentSubjectTypesIds);
    if (enrollmentSubjectTypes.length === 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `enrollmentSubjectTypeIds not found: [${enrollmentSubjectTypesIds.join(", ")}]`);
    }


    const foundIds = new Set(
      enrollmentSubjectTypes.map(e => e.enrollmentSubjectTypeId)
    );

    const missingIds = enrollmentSubjectTypesIds.filter(
      id => !foundIds.has(id)
    );

    if (missingIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `enrollmentSubjectTypeIds not found: [${missingIds.join(", ")}]`);
    }

    return Result.succeed(enrollmentSubjectTypes, "Enrollment subject types retrieve success");
  }

  public async enrollStudentSubjects(studentId: number, enrollmentSubjectTypesIds: number[], isAdmin: boolean): Promise<Result<StudentEnrollmentScheduleWithSubjectData>> {

    // Check if params exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }

    if (enrollmentSubjectTypesIds.length > 0) {
      const enrollmentSubjectTypesResult: Result<EnrollmentSubjectTypeData[]> = await this.getEnrollmentSubjectTypesByIds(enrollmentSubjectTypesIds);
      if (!enrollmentSubjectTypesResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentSubjectTypesResult.getMessage());
      }
    }



    const currDate: Date = new Date();

    const studentEnrollmentSubjectsResult: Result<StudentEnrollmentScheduleWithSubjectData> = await this.getEnrollmentSubjectsByStudentId(studentId);

    // If it is the student enrolling, must be within schedule.
    // Admin can enroll for student any time.
    if (!isAdmin) {
      if (!studentEnrollmentSubjectsResult.isSuccess() || currDate < new Date(studentEnrollmentSubjectsResult.getData().enrollmentStartDateTime) || currDate > new Date(studentEnrollmentSubjectsResult.getData().enrollmentEndDateTime)) {
        return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found" + currDate + " " + new Date(studentEnrollmentSubjectsResult.getData().enrollmentStartDateTime) + " " + new Date(studentEnrollmentSubjectsResult.getData().enrollmentEndDateTime));
      }
    }

    const studentEnrollmentSubjects: StudentEnrollmentSubjectData[] = studentEnrollmentSubjectsResult.getData().enrollmentSubjectTypes;


    const studentEnrollmentSubjectsMap: {
      [enrollmentSubjectTypeId: number]: {
        dayId: number,
        startTime: string,
        endTime: string,
        classTypeId: number,
        subjectId: number,
        numberOfStudentsEnrolled: number,
        numberOfSeats: number,
      };
    } = {};

    // Place all the enrollmentSubjectTypeIds connected to studentId into a dictionary for easier lookup.
    for (const studentEnrollmentSubject of studentEnrollmentSubjects) {
      studentEnrollmentSubjectsMap[studentEnrollmentSubject.enrollmentSubjectTypeId] = {
        dayId: studentEnrollmentSubject.dayId,
        startTime: studentEnrollmentSubject.startTime,
        endTime: studentEnrollmentSubject.endTime,
        classTypeId: studentEnrollmentSubject.classTypeId,
        subjectId: studentEnrollmentSubject.subjectId,
        numberOfStudentsEnrolled: studentEnrollmentSubject.numberOfStudentsEnrolled,
        numberOfSeats: studentEnrollmentSubject.numberOfSeats
      };
    }

    const subjectIdAndClassTypeId: { [subjectId: number]: { [classTypeId: number]: boolean; }; } = {};
    const dayIdAndTime: { [dayId: number]: { startTime: string; endTime: string; }[]; } = {};
    const errorEnrollmentSubjectTypeIds: number[] = [];

    // Checks if the enrollmentSubjectTypeId provided is valid or not.
    for (const enrollmentSubjectTypeId of enrollmentSubjectTypesIds) {

      if (!studentEnrollmentSubjectsMap[enrollmentSubjectTypeId]) {

        errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);

      }
    }

    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `enrollmentSubjectTypeIds: [${errorEnrollmentSubjectTypeIds.join(", ")}] does not exist`);
    }

    // Checks if the enrollmentSubjectTypeId has multiple of the same classTypes for the subject.
    for (const enrollmentSubjectTypeId of enrollmentSubjectTypesIds) {

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

    // Not sure if this should return data.
    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Cannot enroll to multiple enrollment subject types of the same class types: [${errorEnrollmentSubjectTypeIds.join(", ")}]`);
    }

    // Checks if the enrollmentSubjectTypeId has day and time schedule has collided with other enrollmentSubjectTypeIds
    for (const enrollmentSubjectTypeId of enrollmentSubjectTypesIds) {
      const studentEnrollmentSubject = studentEnrollmentSubjectsMap[enrollmentSubjectTypeId];
      const { dayId, startTime, endTime } = studentEnrollmentSubject;

      if (!dayIdAndTime[dayId]) {
        dayIdAndTime[dayId] = [];
      }

      const hasClash = dayIdAndTime[dayId].some(existingTime =>
        isTimeClashing(
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
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, `There is a class schedule clash with the following enrollmentSubjectIds: [${errorEnrollmentSubjectTypeIds.join(", ")}]`)
    }

    // Get enrolled subjects of student.
    const enrolledSubjectsResult: Result<StudentEnrollmentScheduleWithSubjectData> = await this.getEnrolledSubjectsByStudentId(studentId);

    if (!enrolledSubjectsResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrolledSubjectsResult.getMessage());
    }

    const enrolledSubjectsData: StudentEnrollmentSubjectData[] = enrolledSubjectsResult.getData().enrollmentSubjectTypes;

    // Create a dictionary for enrolled subjects of student for easier lookup.
    const enrolledSubjectDataMap: { [enrolmentSubjectTypeId: number]: StudentEnrollmentSubjectData; } = {};

    for (const enrolledSubjectData of enrolledSubjectsData) {
      enrolledSubjectDataMap[enrolledSubjectData.enrollmentSubjectTypeId] = enrolledSubjectData;
    }

    // Checks if any of the enrollmentSubjectTypeId has reached full capacity of students.
    for (const enrollmentSubjectTypeId of enrollmentSubjectTypesIds) {

      const studentEnrollmentSubject = studentEnrollmentSubjectsMap[enrollmentSubjectTypeId];

      if (studentEnrollmentSubject.numberOfStudentsEnrolled === studentEnrollmentSubject.numberOfSeats && !enrolledSubjectDataMap[enrollmentSubjectTypeId]) {

        errorEnrollmentSubjectTypeIds.push(enrollmentSubjectTypeId);

      }
    }

    if (errorEnrollmentSubjectTypeIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, `The following enrollmentSubjectIds has reached full capacity: [${errorEnrollmentSubjectTypeIds.join(", ")}]`);
    }

    // Not checking for affected rows, because it can be 0.
    await enrollmentRepository.deleteStudentEnrollmentSubjectTypeByStudentId(studentId, studentEnrollmentSubjectsResult.getData().enrollmentId);


    if (enrollmentSubjectTypesIds.length === 0) {
      return Result.succeed({ ...studentEnrollmentSubjectsResult.getData(), enrollmentSubjectTypes: [] }, "Student enrolled successfully.");
    }


    const studentEnrolledSubjects: number[][] = [];

    for (const enrollmentSubjectTypeId of enrollmentSubjectTypesIds) {
      studentEnrolledSubjects.push([
        studentId,
        enrollmentSubjectTypeId,
        1
      ]);
    }

    const createStudentEnrollmentSubjectTypes = await enrollmentRepository.createStudentEnrollmentSubjectType(studentEnrolledSubjects);
    if (createStudentEnrollmentSubjectTypes.affectedRows === 0) {
      throw new Error("enrollStudentSubjects failed to insert");
    }

    const enrolledSubjects: Result<StudentEnrollmentScheduleWithSubjectData> = await this.getEnrolledSubjectsByStudentId(studentId);
    if (!enrolledSubjects.isSuccess()) {
      throw new Error("enrollStudentSubjects enrolled subjects not found");
    }

    return Result.succeed(enrolledSubjects.getData(), "Student enrolled successfully.");
  }

  // Make this return StudentEnrollmentSubjectData
  public async getEnrolledSubjectsByStudentId(studentId: number): Promise<Result<StudentEnrollmentScheduleWithSubjectData>> {

    // Check param exists.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }

    // Check if theres an existing enrollment open for student or not.
    // Cause can't get enrolled subjects for a non existant enrollment.
    const studentEnrollmentSchedule: Result<StudentEnrollmentSchedule> = await this.getEnrollmentScheduleByStudentId(studentId);

    const currDate = new Date();
    if (!studentEnrollmentSchedule.isSuccess() || !studentEnrollmentSchedule.getData().enrollmentId
      || currDate < new Date(studentEnrollmentSchedule.getData().enrollmentStartDateTime)
      || currDate > new Date(studentEnrollmentSchedule.getData().enrollmentEndDateTime)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentEnrollmentSchedule.getMessage());
    }

    const enrolledSubjects: StudentEnrollmentSubjectData[] = await enrollmentRepository.getEnrolledSubjectsByStudentIdAndEnrollmentId(studentId, studentEnrollmentSchedule.getData().enrollmentId);

    return Result.succeed({ ...studentEnrollmentSchedule.getData(), enrollmentSubjectTypes: enrolledSubjects }, "enrolled subjects retrieve success");
  }

  public async getMonthlyEnrollmentCount(duration: number): Promise<Result<MonthlyEnrollmentData[]>> {
    const enrollments: MonthlyEnrollmentData[] = await enrollmentRepository.getMonthlyEnrollmentCount(duration);

    return Result.succeed(enrollments, "Enrollments retrieve success");
  }
}

export default new EnrollmentService();
