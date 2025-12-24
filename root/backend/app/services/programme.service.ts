import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData } from "../models/programme-model";
import programmeRepository from "../repositories/programme.repository";

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
  getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>>;
  getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>>;
  getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>>;
  createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<Result<ProgrammeIntakeData>>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<Result<ProgrammeIntakeData>>;
  deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>>;
  updateProgrammeIntakeEnrollmentIdById(programmeIntakeId: number, enrollmentId: number): Promise<Result<ProgrammeIntakeData>>;
  deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<Result<null>>;
  getProgrammeCount(query: string): Promise<Result<number>>;
  getProgrammeIntakeCount(query: string): Promise<Result<number>>;
  getProgrammeHistoryByStudentId(studentId: number, status: number): Promise<Result<ProgrammeHistoryData[]>>;
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
    const response: ResultSetHeader = await programmeRepository.createProgramme(programmeName);

    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeById(response.insertId);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme created not found");
    }

    return Result.succeed(programme, "Programme create success");
  }

  async updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>> {
    await programmeRepository.updateProgrammeById(programmeId, programmeName);
    const programme: ProgrammeData | undefined = await programmeRepository.getProgrammeById(programmeId);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme updated not found");
    }

    return Result.succeed(programme, "Programme update success");
  }

  async deleteProgrammeById(programmeId: number): Promise<Result<null>> {
    await programmeRepository.deleteProgrammeById(programmeId);

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

  async getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    return Result.succeed(programmeIntake, "Programme retrieve success");
  }

  async getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    return Result.succeed(programmeIntake, "Programme retrieve success");
  }

  async getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId, programmeId, intakeId, semester);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake not found");
    }

    return Result.succeed(programmeIntake, "Programme retrieve success");
  }

  async createProgrammeIntake(programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<Result<ProgrammeIntakeData>> {
    const response: ResultSetHeader = await programmeRepository.createProgrammeIntake(programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate);

    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeById(response.insertId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake created not found");
    }

    return Result.succeed(programmeIntake, "Programme Intake create success");
  }

  async updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: Date, semesterEndDate: Date): Promise<Result<ProgrammeIntakeData>> {
    await programmeRepository.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate);

    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake updated not found");
    }

    return Result.succeed(programmeIntake, "Programme Intake update success");
  }

  async deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>> {
    await programmeRepository.deleteProgrammeIntakeById(programmeIntakeId);

    return Result.succeed(null, "Programme Intake delete success");
  }

  async updateProgrammeIntakeEnrollmentIdById(programmeIntakeId: number, enrollmentId: number): Promise<Result<ProgrammeIntakeData>> {
    await programmeRepository.updateProgrammeIntakeEnrollmentIdById(programmeIntakeId, enrollmentId);
    const programmeIntake: ProgrammeIntakeData | undefined = await programmeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme intake updated not found");
    }

    return Result.succeed(programmeIntake, "Programme intake update success");
  }

  async deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId: number): Promise<Result<null>> {
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
}

export default new ProgrammeService();
