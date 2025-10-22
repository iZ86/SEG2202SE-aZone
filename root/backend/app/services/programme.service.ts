import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { ProgrammeData, ProgrammeIntakeData } from "../models/programme-model";
import ProgrammeRepository from "../repositories/programme.repository";

interface IProgrammeService {
  getAllProgrammes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeData[]>>;
  getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>>;
  createProgramme(programmeName: string): Promise<Result<ProgrammeData>>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>>;
  deleteProgrammeById(programmeId: number): Promise<Result<null>>;
  getAllProgrammeIntakes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>>;
  createProgrammeIntake(programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<ProgrammeIntakeData>>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<ProgrammeIntakeData>>;
  deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>>;
}

class ProgrammeService implements IProgrammeService {
  async getAllProgrammes(query: string = "", pageSize: number, page: number): Promise<Result<ProgrammeData[]>> {
    const programmes: ProgrammeData[] = await ProgrammeRepository.getProgrammes(query, pageSize, page);

    return Result.succeed(programmes, "Programmes retrieve success");
  }

  async getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData = await ProgrammeRepository.getProgrammeById(programmeId);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Programme not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  async createProgramme(programmeName: string): Promise<Result<ProgrammeData>> {
    const response: ResultSetHeader = await ProgrammeRepository.createProgramme(programmeName);

    const programme: ProgrammeData = await ProgrammeRepository.getProgrammeById(response.insertId);

    return Result.succeed(programme, "Programme create success");
  }

  async updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<ProgrammeData>> {
    await ProgrammeRepository.updateProgrammeById(programmeId, programmeName);
    const programme: ProgrammeData = await ProgrammeRepository.getProgrammeById(programmeId);

    return Result.succeed(programme, "Programme update success");
  }

  async deleteProgrammeById(programmeId: number): Promise<Result<null>> {
    await ProgrammeRepository.deleteProgrammeById(programmeId);

    return Result.succeed(null, "Programme delete success");
  }

  async getAllProgrammeIntakes(query: string = "", pageSize: number, page: number): Promise<Result<ProgrammeIntakeData[]>> {
    const programmeIntakesData: ProgrammeIntakeData[] = await ProgrammeRepository.getProgrammeIntakes(query, pageSize, page);

    return Result.succeed(programmeIntakesData, "Programme delete success");
  }

  async getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>> {
    const programmeIntake: ProgrammeIntakeData = await ProgrammeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(programmeIntake, "Programme retrieve success");
  }

  async createProgrammeIntake(programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<ProgrammeIntakeData>> {
    const response: ResultSetHeader = await ProgrammeRepository.createProgrammeIntake(programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod);

    const programmeIntake: ProgrammeIntakeData = await ProgrammeRepository.getProgrammeIntakeById(response.insertId);

    return Result.succeed(programmeIntake, "Programme Intake create success");
  }

  async updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<ProgrammeIntakeData>> {
    await ProgrammeRepository.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod);

    const programmeIntake: ProgrammeIntakeData = await ProgrammeRepository.getProgrammeIntakeById(programmeIntakeId);

    return Result.succeed(programmeIntake, "Programme Intake update success");
  }

  async deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>> {
    await ProgrammeRepository.deleteProgrammeIntakeById(programmeIntakeId);

    return Result.succeed(null, "Programme Intake delete success");
  }
}

export default new ProgrammeService();
