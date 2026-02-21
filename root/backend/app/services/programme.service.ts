import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_PROGRAMME_INTAKE_STATUS, ENUM_PROGRAMME_STATUS, ENUM_STUDY_MODE } from "../enums/enums";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData, StudentCourseProgrammeIntakeData, ProgrammeDistribution } from "../models/programme-model";
import programmeRepository from "../repositories/programme.repository";
import courseService from "./course.service";
import { CourseData } from "../models/course-model";
import userService from "./user.service";
import { UserData } from "../models/user-model";
import enrollmentService from "./enrollment.service";
import { EnrollmentData } from "../models/enrollment-model";
import { IsExist } from "../models/general-model";
import intakeService from "./intake.service";
import { IntakeData } from "../models/intake-model";

interface IProgrammeService {
  getProgrammes(query: string, pageSize: number | null, page: number | null): Promise<Result<ProgrammeData[]>>;
  getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>>;
  getProgrammeByName(programmeName: string): Promise<Result<ProgrammeData>>;
  getProgrammeByIdAndName(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>>;
  createProgramme(programmeName: string): Promise<Result<ProgrammeData>>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>>;
  deleteProgrammeById(programmeId: number): Promise<Result<null>>;
  getProgrammeIntakes(query: string, pageSize: number | null, page: number | null): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakesByProgrammeId(programmeId: number): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>>;
  getProgrammeIntakesByIds(programmeIntakeIds: number[]): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>>;
  getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>>;
  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, status: number): Promise<Result<ProgrammeIntakeData>>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, status: number): Promise<Result<ProgrammeIntakeData>>;
  deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>>;
  updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds: number[], enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>>;
  deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<Result<null>>;
  getProgrammeCount(query: string): Promise<Result<number>>;
  getProgrammeIntakeCount(query: string): Promise<Result<number>>;
  getProgrammeHistoryByStudentId(studentId: number, status: number): Promise<Result<ProgrammeHistoryData[]>>;
  getStudentCourseProgrammeIntakeById(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  deleteStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<null>>;
  getProgrammeDistribution(): Promise<Result<ProgrammeDistribution[]>>;
}

class ProgrammeService implements IProgrammeService {
  async getProgrammes(query: string = "", pageSize: number | null, page: number | null): Promise<Result<ProgrammeData[]>> {
    const programmes: ProgrammeData[] = await programmeRepository.getProgrammes(query, pageSize, page);

    return Result.succeed(programmes, "Programmes retrieve success");
  }

  async getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeById(programmeId);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  async getProgrammeByName(programmeName: string): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeByName(programmeName);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  async getProgrammeByIdAndName(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeByIdAndName(programmeId, programmeName);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  async createProgramme(programmeName: string): Promise<Result<ProgrammeData>> {

    // Check if programmeName is already used.
    const isProgrammeNameDuplicated: Result<ProgrammeData> = await this.getProgrammeByName(programmeName);

    if (isProgrammeNameDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Programme name already exists");
    }

    // create Programme
    const createProgrammeResult: ResultSetHeader = await programmeRepository.createProgramme(programmeName);
    if (createProgrammeResult.affectedRows === 0) {
      throw new Error("createProgramme failed to insert");
    }

    const programme: Result<ProgrammeData> = await this.getProgrammeById(createProgrammeResult.insertId);

    if (!programme.isSuccess()) {
      throw new Error("createProgramme created programme not found");
    }

    return Result.succeed(programme.getData(), "Programme create success");
  }

  async updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>> {

    // Check param exist.
    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);

    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }

    const programmeData: ProgrammeData = programmeResult.getData();

    // Check if programmeName is already occupied by other programme or not.
    if (programmeData.programmeName !== programmeName) {

      const isProgrammeNameDuplicated: Result<ProgrammeData> = await this.getProgrammeByName(programmeName);

      if (isProgrammeNameDuplicated.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Programme name already exists");
      }
    }

    // Update programme.
    const updateProgrammeResult: ResultSetHeader = await programmeRepository.updateProgrammeById(programmeId, programmeName);
    if (updateProgrammeResult.affectedRows === 0) {
      throw new Error("updateProgrammeById failed to update");
    }

    const programme: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programme.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme updated not found");
    }

    return Result.succeed(programme.getData(), "Programme update success");
  }

  async deleteProgrammeById(programmeId: number): Promise<Result<null>> {
    // Check param exist.
    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }


    // Make sure no programme intakes before deleting.
    const isExistProgrammeIntakeByProgrammeId: IsExist | undefined = await programmeRepository.isExistProgrammeIntakesByProgrammeId(programmeId);
    if (isExistProgrammeIntakeByProgrammeId && isExistProgrammeIntakeByProgrammeId.value) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Programme cannot be deleted because there are still programme intakes linked to it. Please remove all the programme intakes before deleting");
    }


    const deleteProgrammeResult: ResultSetHeader = await programmeRepository.deleteProgrammeById(programmeId);
    if (deleteProgrammeResult.affectedRows === 0) {
      throw new Error("deleteProgrammeById failed to delete");
    }

    return Result.succeed(null, "Programme delete success");
  }

  async getProgrammeIntakes(query: string = "", pageSize: number | null, page: number | null): Promise<Result<ProgrammeIntakeData[]>> {
    const programmeIntakesData: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakes(query, pageSize, page);

    return Result.succeed(programmeIntakesData, "Programme retrieve success");
  }

  async getProgrammeIntakesByProgrammeId(programmeId: number): Promise<Result<ProgrammeIntakeData[]>> {
    const programmeIntakesData: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByProgrammeId(programmeId);

    return Result.succeed(programmeIntakesData, "Programme retrieve success");
  }

  async getProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>> {

    // Check enrollmentId exists.
    const enrollmentResult: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    // Get Programme Intakes.
    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByEnrollmentId(enrollmentId)

    return Result.succeed(programmeIntakes, "Programme intakes retrieve success");
  }

  async getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    return Result.succeed(programmeIntake, "Programme intake retrieve success");
  }

  async getProgrammeIntakesByIds(programmeIntakeIds: number[]): Promise<Result<ProgrammeIntakeData[]>> {

    const duplicateProgrammeIntakesIds: { [programmeIntakeId: number]: boolean } = {};
    for (const programmeIntakeId of programmeIntakeIds) {
      if (duplicateProgrammeIntakesIds[programmeIntakeId]) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Duplicate programmeIntakeId found: ${programmeIntakeId}`)
      }
    }

    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByIds(programmeIntakeIds);

    if (programmeIntakes.length === 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `programmeIntakeIds not found: [${programmeIntakeIds.join(", ")}]`);
    }

    const foundIds = new Set(
      programmeIntakes.map(p => p.programmeIntakeId)
    );

    const missingIds = programmeIntakeIds.filter(
      id => !foundIds.has(id)
    );

    if (missingIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `programmeIntakeIds not found: [${missingIds.join(", ")}]`);
    }

    return Result.succeed(programmeIntakes, "Programme intakes retrieve success");
  }


  async getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    return Result.succeed(programmeIntake, "Programme intake retrieve success");
  }

  async getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId, programmeId, intakeId, semester);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    return Result.succeed(programmeIntake, "Programme intake retrieve success");
  }

  async createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, status: number): Promise<Result<ProgrammeIntakeData>> {


    // Check param exists or not.
    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }

    const intakeResult: Result<IntakeData> = await intakeService.getIntakeById(intakeId);
    if (!intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, intakeResult.getMessage());
    }

    if (!(studyModeId in ENUM_STUDY_MODE)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "studyModeId not found");
    }

    if (!(status in ENUM_PROGRAMME_INTAKE_STATUS)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "status not found");
    }


    // Check if there is a programmeIntake that exists with the same programmeId, intakeId, and semester.
    const isProgrammeIntakeDuplicated: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

    if (isProgrammeIntakeDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "A programme intake with the same programmeId, intakeId, and semester already exists");
    }

    const createProgrammeIntakeResult: ResultSetHeader = await programmeRepository.createProgrammeIntake(programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, status);
    if (createProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("createProgrammeIntake failed to insert")
    }

    const programmeIntake: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(createProgrammeIntakeResult.insertId);
    if (!programmeIntake.isSuccess()) {
      throw new Error("createProgrammeIntake created programmeIntake not found");
    }

    return Result.succeed(programmeIntake.getData(), "Programme intake create success");
  }

  async updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, status: number): Promise<Result<ProgrammeIntakeData>> {

    // Check param exist.
    const programmeIntakeResult: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResult.getMessage());
    }

    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }

    const intakeResult: Result<IntakeData> = await intakeService.getIntakeById(intakeId);
    if (!intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, intakeResult.getMessage());
    }

    if (!(studyModeId in ENUM_STUDY_MODE)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "studyModeId not found");
    }

    if (!(status in ENUM_PROGRAMME_INTAKE_STATUS)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "status not found");
    }

    // Check if there is an existing programmeIntake with the same programmeId, intakeId, and semester.
    const programmeIntakeData: ProgrammeIntakeData = programmeIntakeResult.getData();
    if (programmeIntakeData.programmeId !== programmeId || programmeIntakeData.intakeId !== intakeId || programmeIntakeData.semester !== semester) {
      const isProgrammeIntakeDuplicated: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

      if (isProgrammeIntakeDuplicated.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "A programme intake with the same programmeId, intakeId, and semester already exists");
      }
    }
    
    const updateProgrammeIntakeResult: ResultSetHeader = await programmeRepository.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, status);
    if (updateProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("updateProgrammeIntakeById failed to update");
    }

    const programmeIntake: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntake.isSuccess()) {
      throw new Error("updateProgrammeIntakeById updated programmeIntake not found");
    }

    return Result.succeed(programmeIntake.getData(), "Programme intake update success");
  }

  async deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>> {

    // Check if programmeIntake exists.
    const programmeIntakeResult: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResult.getMessage());
    }

    const deleteProgrammeIntakeResult: ResultSetHeader = await programmeRepository.deleteProgrammeIntakeById(programmeIntakeId);
    if (deleteProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("deleteProgrammeIntakeById failed to delete");
    }

    return Result.succeed(null, "Programme intake delete success");
  }

  async updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds: number[], enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>> {

    // Check programmeIntakeIds exist.
    const programmeIntakesResult: Result<ProgrammeIntakeData[]> = await this.getProgrammeIntakesByIds(programmeIntakeIds);
    if (!programmeIntakesResult.isSuccess()) {
      switch (programmeIntakesResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakesResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, programmeIntakesResult.getMessage());
      }
    }

    // Check if enrollmentId exist.
    const enrollmentResult: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);
    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    const updateProgrammeIntakeEnrollmentIdByIdsResult: ResultSetHeader = await programmeRepository.updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds, enrollmentId);
    if (updateProgrammeIntakeEnrollmentIdByIdsResult.affectedRows === 0) {
      throw new Error("updateProgrammeIntakeEnrollmentIdByIds failed to update");
    }

    const programmeIntakes: Result<ProgrammeIntakeData[]> = await this.getProgrammeIntakesByIds(programmeIntakeIds);
    if (!programmeIntakes.isSuccess()) {
      if (!programmeIntakesResult.isSuccess()) {
        switch (programmeIntakesResult.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            throw new Error("updateProgrammeIntakeEnrollmentIdByIds updated programme intakes not found");
          case ENUM_ERROR_CODE.CONFLICT:
            return Result.fail(ENUM_ERROR_CODE.CONFLICT, programmeIntakesResult.getMessage());
        }
      }
    }

    return Result.succeed(programmeIntakes.getData(), "Programme intake update success");
  }

  async deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<Result<null>> {

    const enrollmentResult: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);
    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    // It can be 0 rows affected. Therefore, no checks needed.
    await programmeRepository.deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId);

    return Result.succeed(null, "Programme intake enrollmentId delete success");
  }

  async getProgrammeCount(query: string = ""): Promise<Result<number>> {
    const programmeCount: number = await programmeRepository.getProgrammeCount(query);

    return Result.succeed(programmeCount ? programmeCount : 0, "Programme count retrieve success");
  }

  async getProgrammeIntakeCount(query: string = ""): Promise<Result<number>> {
    const programmeIntakeCount: number = await programmeRepository.getProgrammeIntakeCount(query);

    return Result.succeed(programmeIntakeCount ? programmeIntakeCount : 0, "Programme intake count retrieve success");
  }

  async getProgrammeHistoryByStudentId(studentId: number, status: number): Promise<Result<ProgrammeHistoryData[]>> {
    const studentCourseProgrammeIntake: ProgrammeHistoryData[] | undefined = await programmeRepository.getProgrammeHistoryByStudentId(studentId, status);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  async getStudentCourseProgrammeIntakeById(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await programmeRepository.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  // Enroll the student into a course, and specify a programme intake.
  async createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {

    // Check if parameters exist.
    const studentResponse: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResponse.getMessage());
    }


    const courseResponse: Result<CourseData> = await courseService.getCourseById(courseId);
    if (!courseResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResponse.getMessage());
    }


    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResponse.getMessage());
    }

    // Check if student course programme intake exists.
    const studentCourseProgrammeIntakeResponse: Result<StudentCourseProgrammeIntakeData> = await this.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);
    if (studentCourseProgrammeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Student already enrolled into this course programme intake");
    }


    // Update old student course programme intake.
    await programmeRepository.updateStudentCourseProgrammeIntakeStatusByStudentIdAndStatus(studentId, ENUM_PROGRAMME_STATUS.COMPLETED);

    // Create new student course programme intake.
    const createResult = await programmeRepository.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);
    if (createResult.affectedRows === 0) {
      throw new Error("createStudentCourseProgrammeIntake failed to insert");
    }

    const studentCrouseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await programmeRepository.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);

    if (!studentCrouseProgrammeIntake) {
      throw new Error("createStudentCourseProgrammeIntake student course programme intake created not found");
    }

    return Result.succeed(studentCrouseProgrammeIntake, "Student course programme intake create success");
  }

  // Delete enrolled/history of programme intake.
  async deleteStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<null>> {

    // Check if the parameters exist or not.
    const studentResponse: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResponse.getMessage());
    }

    const courseResponse: Result<CourseData> = await courseService.getCourseById(courseId);
    if (!courseResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResponse.getMessage());
    }


    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResponse.getMessage());
    }


    // Check if student course programe intake exist or not.
    const studentCourseProgrammeIntakeResponse: Result<StudentCourseProgrammeIntakeData> = await this.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);
    if (!studentCourseProgrammeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found.");
    }


    // Delete.
    const deleteCourseProgrammeIntake = await programmeRepository.deleteStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);

    if (deleteCourseProgrammeIntake.affectedRows === 0) {
      throw new Error("deleteStudentCourseProgrammeIntake failed to delete StudentCourseProgrammeIntake")
    }


    return Result.succeed(null, "Student course programme intake delete success");
  }

  async getProgrammeDistribution(): Promise<Result<ProgrammeDistribution[]>> {
    const ProgrammeDistribution: ProgrammeDistribution[] = await programmeRepository.getProgrammeDistribution();

    return Result.succeed(ProgrammeDistribution, "Programme retrieve success");
  }

  async getProgrammeIntakesByStatus(status: number): Promise<Result<ProgrammeIntakeData[]>> {

    if (!(status in ENUM_PROGRAMME_INTAKE_STATUS)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programme intake status");
    }
    // Get Programme Intakes.
    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByStatus(status)

    return Result.succeed(programmeIntakes, "Programme intakes retrieve success");
  }
}

export default new ProgrammeService();
