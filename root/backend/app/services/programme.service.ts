import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { IntakeData } from "../models/intake-model";
import { ProgrammeData, ProgrammeIntakeData } from "../models/programme-model";
import ProgrammeRepository from "../repositories/programme.repository";
import IntakeService from "./intake.service";

interface IProgrammeService {
  getProgrammes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeData[]>>;
  getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>>;
  createProgramme(programmeName: string): Promise<Result<null>>;
  updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<null>>;
  deleteProgrammeById(programmeId: number): Promise<Result<null>>;
  getProgrammeIntakes(query: string, pageSize: number, page: number): Promise<Result<ProgrammeIntakeData[]>>;
  getProgrammeIntakeById(programmeIntakeId: number): Promise<Result<ProgrammeIntakeData>>;
  createProgrammeIntake(programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<null>>;
  updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<null>>;
  deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>>;
}

class ProgrammeService implements IProgrammeService {
  async getProgrammes(query: string = "", pageSize: number, page: number): Promise<Result<ProgrammeData[]>> {
    const programmes: ProgrammeData[] = await ProgrammeRepository.getProgrammes(query, pageSize, page);

    return Result.succeed(programmes, "Programmes retrieve success");
  }

  async getProgrammeById(programmeId: number): Promise<Result<ProgrammeData>> {
    const programme: ProgrammeData = await ProgrammeRepository.getProgrammeById(programmeId);

    if (!programme) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(programme, "Programme retrieve success");
  }

  async createProgramme(programmeName: string): Promise<Result<null>> {
    await ProgrammeRepository.createProgramme(programmeName);

    return Result.succeed(null, "Programme create success");
  }

  async updateProgrammeById(programmeId: number, programmeName: string): Promise<Result<null>> {
    const programme: Result<ProgrammeData> = await this.getProgrammeById(programmeId);

    if (!programme.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId");
    }

    await ProgrammeRepository.updateProgrammeById(programmeId, programmeName);

    return Result.succeed(null, "Programme update success");
  }

  async deleteProgrammeById(programmeId: number): Promise<Result<null>> {
    const programme: Result<ProgrammeData> = await this.getProgrammeById(programmeId);

    if (!programme.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId");
    }

    await ProgrammeRepository.deleteProgrammeById(programmeId);

    return Result.succeed(null, "Programme delete success");
  }

  async getProgrammeIntakes(query: string = "", pageSize: number, page: number): Promise<Result<ProgrammeIntakeData[]>> {
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

  async createProgrammeIntake(programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<null>> {
    const programmeIdResponse: Result<ProgrammeData> = await this.getProgrammeById(programmeId);

    const intakeIdResponse: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (!programmeIdResponse.isSuccess() || !intakeIdResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId or intakeId");
    }

    await ProgrammeRepository.createProgrammeIntake(programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod);

    return Result.succeed(null, "Programme Intake create success");
  }

  async updateProgrammeIntakeById(programmeIntakeId: number, programmeId: number, intakeId: number, semester: number, semesterStartPeriod: Date, semesterEndPeriod: Date): Promise<Result<null>> {
    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);

    const programmeIdResponse: Result<ProgrammeData> = await this.getProgrammeById(programmeId);

    const intakeIdResponse: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (!programmeIntakeResponse.isSuccess() || !programmeIdResponse.isSuccess() || !intakeIdResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeIntakeId, or programmeId, or intakeId");
    }

    await ProgrammeRepository.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod);

    return Result.succeed(null, "Programme Intake update success");
  }

  async deleteProgrammeIntakeById(programmeIntakeId: number): Promise<Result<null>> {
    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await this.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeIntakeId");
    }

    await ProgrammeRepository.deleteProgrammeIntakeById(programmeIntakeId);

    return Result.succeed(null, "Programme Intake delete success");
  }
}

export default new ProgrammeService();