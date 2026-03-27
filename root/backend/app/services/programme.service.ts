import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_PROGRAMME_INTAKE_STATUS_ID, ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID, ENUM_STUDY_MODE_ID } from "../enums/enums";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData, StudentCourseProgrammeIntakeData, ProgrammeDistribution, ProgrammeWithCountData, ProgrammeIntakeWithCountData } from "../models/programme-model";
import programmeRepository from "../repositories/programme.repository";
import courseService from "./course.service";
import { CourseProgrammeData } from "../models/course-model";
import userService from "./user.service";
import { UserData } from "../models/user-model";
import enrollmentService from "./enrollment.service";
import { EnrollmentData } from "../models/enrollment-model";
import { IsExist } from "../models/general-model";
import intakeService from "./intake.service";
import { IntakeData } from "../models/intake-model";

interface IProgrammeService {
  getProgrammes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeWithCountData>>;
  getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>>;
  createProgramme(programmeName: string): Promise<Result<ProgrammeData>>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>>;
  deleteProgrammeById(programmeId: number): Promise<Result<null>>;
  getProgrammeIntakes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeIntakeWithCountData>>;
  getProgrammeIntakesByProgrammeId(programmeId: number): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>>;
  getProgrammeIntakesByIds(programmeIntakeIds: number[]): Promise<Result<ProgrammeIntakeData[]>>;
  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<Result<ProgrammeIntakeData>>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<Result<ProgrammeIntakeData>>;
  deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>>;
  updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds: number[], enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>>;
  deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<Result<null>>;
  getProgrammeHistoryByStudentId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<Result<ProgrammeHistoryData[]>>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  deleteStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<null>>;
  getProgrammeDistribution(): Promise<Result<ProgrammeDistribution[]>>;
  getProgrammeIntakesByProgrammeIntakeStatusId(programmeIntakeStatusId: number): Promise<Result<ProgrammeIntakeData[]>>;
  getStudentCourseProgrammeIntakeByStudentIdAndStatusId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
}

class ProgrammeService implements IProgrammeService {
  public async getProgrammes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeWithCountData>> {
    const programmes: ProgrammeData[] = await programmeRepository.getProgrammes(query, pageSize, page);

    const programmeCount: Result<number> = await this.getProgrammeCount(query);

    return Result.succeed({ programmes, programmeCount: programmeCount.getData() }, "Programmes retrieve success");
  }

  public async getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeById(programmeId);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  private async getProgrammeByName(programmeName: string): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeByName(programmeName);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  public async createProgramme(programmeName: string): Promise<Result<ProgrammeData>> {

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

  public async updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>> {

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

  public async deleteProgrammeById(programmeId: number): Promise<Result<null>> {
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

  public async getProgrammeIntakes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeIntakeWithCountData>> {
    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakes(query, pageSize, page);

    for (const programmeIntake of programmeIntakes) {

      const studyMode = ENUM_STUDY_MODE_ID[programmeIntake.studyModeId];
      programmeIntake.studyMode = studyMode
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
      programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();
    }

    const programmeIntakeCount: Result<number> = await this.getProgrammeIntakeCount(query);
    return Result.succeed({ programmeIntakes, programmeIntakeCount: programmeIntakeCount.getData() }, "Programme retrieve success");
  }

  public async getProgrammeIntakesByProgrammeId(programmeId: number): Promise<Result<ProgrammeIntakeData[]>> {

    // Check param exist.
    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }


    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByProgrammeId(programmeId);

    for (const programmeIntake of programmeIntakes) {

      const studyMode = ENUM_STUDY_MODE_ID[programmeIntake.studyModeId];
      programmeIntake.studyMode = studyMode
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');


      const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
      programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();
    }

    return Result.succeed(programmeIntakes, "Programme retrieve success");
  }

  public async getProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>> {

    // Check enrollmentId exists.
    const enrollmentResult: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    // Get Programme Intakes.
    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByEnrollmentId(enrollmentId);

    for (const programmeIntake of programmeIntakes) {

      const studyMode = ENUM_STUDY_MODE_ID[programmeIntake.studyModeId];
      programmeIntake.studyMode = studyMode
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');


      const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
      programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();
    }

    return Result.succeed(programmeIntakes, "Programme intakes retrieve success");
  }

  public async getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    const studyMode = ENUM_STUDY_MODE_ID[programmeIntake.studyModeId];
    programmeIntake.studyMode = studyMode
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
    programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();


    return Result.succeed(programmeIntake, "Programme intake retrieve success");
  }

  public async getProgrammeIntakesByIds(programmeIntakeIds: number[]): Promise<Result<ProgrammeIntakeData[]>> {

    const duplicateProgrammeIntakesIds: { [programmeIntakeId: number]: boolean } = {};
    for (const programmeIntakeId of programmeIntakeIds) {
      if (duplicateProgrammeIntakesIds[programmeIntakeId]) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Duplicate programmeIntakeId found: ${programmeIntakeId}`)
      }
      duplicateProgrammeIntakesIds[programmeIntakeId] = true;
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

    for (const programmeIntake of programmeIntakes) {

      const studyMode = ENUM_STUDY_MODE_ID[programmeIntake.studyModeId];
      programmeIntake.studyMode = studyMode
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');


      const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
      programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();
    }

    return Result.succeed(programmeIntakes, "Programme intakes retrieve success");
  }


  private async getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>> {

    // Check param exist.
    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }

    const intakeResult: Result<IntakeData> = await intakeService.getIntakeById(intakeId);
    if (!intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, intakeResult.getMessage());
    }


    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    const studyMode = ENUM_STUDY_MODE_ID[programmeIntake.studyModeId];
    programmeIntake.studyMode = studyMode
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
    programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();


    return Result.succeed(programmeIntake, "Programme intake retrieve success");
  }

  public async createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<Result<ProgrammeIntakeData>> {


    // Check param exists or not.
    const programmeResult: Result<ProgrammeData> = await this.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }

    const intakeResult: Result<IntakeData> = await intakeService.getIntakeById(intakeId);
    if (!intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, intakeResult.getMessage());
    }

    if (!(studyModeId in ENUM_STUDY_MODE_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "studyModeId not found");
    }

    if (!(programmeIntakeStatusId in ENUM_PROGRAMME_INTAKE_STATUS_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "programmeIntakeStatusId not found");
    }


    // Check if there is a programmeIntake that exists with the same programmeId, intakeId, and semester.
    const isProgrammeIntakeDuplicated: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

    if (isProgrammeIntakeDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "A programme intake with the same programmeId, intakeId, and semester already exists");
    }

    const createProgrammeIntakeResult: ResultSetHeader = await programmeRepository.createProgrammeIntake(programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, programmeIntakeStatusId);
    if (createProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("createProgrammeIntake failed to insert")
    }

    const programmeIntake: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(createProgrammeIntakeResult.insertId);
    if (!programmeIntake.isSuccess()) {
      throw new Error("createProgrammeIntake created programmeIntake not found");
    }

    return Result.succeed(programmeIntake.getData(), "Programme intake create success");
  }

  public async updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date, programmeIntakeStatusId: number): Promise<Result<ProgrammeIntakeData>> {

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

    if (!(studyModeId in ENUM_STUDY_MODE_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "studyModeId not found");
    }

    if (!(programmeIntakeStatusId in ENUM_PROGRAMME_INTAKE_STATUS_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "programmeIntakeStatusId not found");
    }

    // Check if there is an existing programmeIntake with the same programmeId, intakeId, and semester.
    const programmeIntakeData: ProgrammeIntakeData = programmeIntakeResult.getData();
    if (programmeIntakeData.programmeId !== programmeId || programmeIntakeData.intakeId !== intakeId || programmeIntakeData.semester !== semester) {
      const isProgrammeIntakeDuplicated: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

      if (isProgrammeIntakeDuplicated.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "A programme intake with the same programmeId, intakeId, and semester already exists");
      }
    }

    const updateProgrammeIntakeResult: ResultSetHeader = await programmeRepository.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, programmeIntakeStatusId);
    if (updateProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("updateProgrammeIntakeById failed to update");
    }

    const programmeIntake: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntake.isSuccess()) {
      throw new Error("updateProgrammeIntakeById updated programmeIntake not found");
    }

    return Result.succeed(programmeIntake.getData(), "Programme intake update success");
  }

  public async deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>> {

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

  public async updateProgrammeIntakeEnrollmentIdByIds(programmeIntakeIds: number[], enrollmentId: number): Promise<Result<ProgrammeIntakeData[]>> {

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

  public async deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<Result<null>> {

    const enrollmentResult: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);
    if (!enrollmentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, enrollmentResult.getMessage());
    }

    // It can be 0 rows affected. Therefore, no checks needed.
    await programmeRepository.deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId);

    return Result.succeed(null, "Programme intake enrollmentId delete success");
  }

  private async getProgrammeCount(query: string = ""): Promise<Result<number>> {
    const programmeCount: number = await programmeRepository.getProgrammeCount(query);

    return Result.succeed(programmeCount, "Programme count retrieve success");
  }

  private async getProgrammeIntakeCount(query: string = ""): Promise<Result<number>> {
    const programmeIntakeCount: number = await programmeRepository.getProgrammeIntakeCount(query);

    return Result.succeed(programmeIntakeCount, "Programme intake count retrieve success");
  }

  public async getProgrammeHistoryByStudentId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<Result<ProgrammeHistoryData[]>> {

    // Check if params exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }


    // Check status valid or not.
    if (!(studentCourseProgrammeIntakeStatusId in ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid studentCourseProgrammeIntakeStatusId");
    }

    const programmeHistoryList: ProgrammeHistoryData[] = await programmeRepository.getProgrammeHistoryByStudentId(studentId, studentCourseProgrammeIntakeStatusId);
    if (programmeHistoryList.length > 0) {
      programmeHistoryList.map((programmeHistory) => {
        const statusText = ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID[programmeHistory.studentCourseProgrammeIntakeStatusId];
        programmeHistory.studentCourseProgrammeIntakeStatus = statusText.charAt(0) + statusText.slice(1).toLowerCase();
      })
    }
    return Result.succeed(programmeHistoryList, "Students course programme intakes retrieve success");
  }

  private async getStudentCourseProgrammeIntakeById(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {

    // Check if params exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }

    const courseResult: Result<CourseProgrammeData> = await courseService.getCourseById(courseId);
    if (!courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResult.getMessage());
    }

    const programmeIntakeResult: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResult.getMessage());
    }


    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await programmeRepository.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }


    const studentCourseProgrammeIntakeStatus = ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID[studentCourseProgrammeIntake.studentCourseProgrammeIntakeStatusId]
    studentCourseProgrammeIntake.studentCourseProgrammeIntakeStatus = studentCourseProgrammeIntakeStatus.charAt(0) + studentCourseProgrammeIntakeStatus.slice(1).toLowerCase();

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  // Enroll the student into a course, and specify a programme intake.
  public async createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {

    // Check if parameters exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }


    const courseResult: Result<CourseProgrammeData> = await courseService.getCourseById(courseId);
    if (!courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResult.getMessage());
    }


    const programmeIntakeResult: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResult.getMessage());
    }

    // Check if student course programme intake exists.
    const studentCourseProgrammeIntakeResult: Result<StudentCourseProgrammeIntakeData> = await this.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);
    if (studentCourseProgrammeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Student already enrolled into this course programme intake");
    }


    // Update old student course programme intake.
    await programmeRepository.updateStudentCourseProgrammeIntakeStatusByStudentIdAndStatus(studentId, ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID.ACTIVE, ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID.COMPLETED);

    // Create new student course programme intake.
    const createStudentCourseProgrammeIntakeResult: ResultSetHeader = await programmeRepository.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId, ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID.ACTIVE);
    if (createStudentCourseProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("createStudentCourseProgrammeIntake failed to insert");
    }

    const studentCrouseProgrammeIntake: Result<StudentCourseProgrammeIntakeData> = await this.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);

    if (!studentCrouseProgrammeIntake.isSuccess()) {
      throw new Error("createStudentCourseProgrammeIntake student course programme intake created not found");
    }

    return Result.succeed(studentCrouseProgrammeIntake.getData(), "Student course programme intake create success");
  }

  // Delete enrolled/history of programme intake.
  public async deleteStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<null>> {

    // Check if the parameters exist or not.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }

    const courseResult: Result<CourseProgrammeData> = await courseService.getCourseById(courseId);
    if (!courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResult.getMessage());
    }

    const programmeIntakeResult: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);
    if (!programmeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeIntakeResult.getMessage());
    }


    // Check if student course programe intake exist or not.
    const studentCourseProgrammeIntakeResult: Result<StudentCourseProgrammeIntakeData> = await this.getStudentCourseProgrammeIntakeById(studentId, courseId, programmeIntakeId);
    if (!studentCourseProgrammeIntakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentCourseProgrammeIntakeResult.getMessage());
    }


    // Delete.
    const deleteCourseProgrammeIntakeResult: ResultSetHeader = await programmeRepository.deleteStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);

    if (deleteCourseProgrammeIntakeResult.affectedRows === 0) {
      throw new Error("deleteStudentCourseProgrammeIntake failed to delete StudentCourseProgrammeIntake")
    }


    return Result.succeed(null, "Student course programme intake delete success");
  }

  public async getProgrammeDistribution(): Promise<Result<ProgrammeDistribution[]>> {
    const ProgrammeDistribution: ProgrammeDistribution[] = await programmeRepository.getProgrammeDistribution();

    return Result.succeed(ProgrammeDistribution, "Programme retrieve success");
  }

  public async getProgrammeIntakesByProgrammeIntakeStatusId(programmeIntakeStatusId: number): Promise<Result<ProgrammeIntakeData[]>> {

    if (!(programmeIntakeStatusId in ENUM_PROGRAMME_INTAKE_STATUS_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeIntakeStatusId");
    }
    // Get Programme Intakes.
    const programmeIntakes: ProgrammeIntakeData[] = await programmeRepository.getProgrammeIntakesByProgrammeIntakeStatusId(programmeIntakeStatusId);

    for (const programmeIntake of programmeIntakes) {
      const programmeIntakeStatus = ENUM_PROGRAMME_INTAKE_STATUS_ID[programmeIntake.programmeIntakeStatusId]
      programmeIntake.programmeIntakeStatus = programmeIntakeStatus.charAt(0) + programmeIntakeStatus.slice(1).toLowerCase();
    }

    return Result.succeed(programmeIntakes, "Programme intakes retrieve success");
  }

  public async getStudentCourseProgrammeIntakeByStudentIdAndStatusId(studentId: number, studentCourseProgrammeIntakeStatusId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {

    // Check if params exist.
    const studentResult: Result<UserData> = await userService.getStudentById(studentId);
    if (!studentResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, studentResult.getMessage());
    }

    if (!(studentCourseProgrammeIntakeStatusId in ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID)) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "studentCourseProgrammeIntakeStatusId not found");
    }


    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await programmeRepository.getStudentCourseProgrammeIntakeByIdAndStatusId(studentId, studentCourseProgrammeIntakeStatusId);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }


    const studentCourseProgrammeIntakeStatus = ENUM_STUDENT_COURSE_PROGRAMME_INTAKE_STATUS_ID[studentCourseProgrammeIntake.studentCourseProgrammeIntakeStatusId]
    studentCourseProgrammeIntake.studentCourseProgrammeIntakeStatus = studentCourseProgrammeIntakeStatus.charAt(0) + studentCourseProgrammeIntakeStatus.slice(1).toLowerCase();

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

}

export default new ProgrammeService();
