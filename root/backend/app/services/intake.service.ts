import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { IntakeData } from "../models/intake-model";
import IntakeRepository from "../repositories/intake.repository";

interface IIntakeService {
  getAllIntakes(query: string, pageSize: number, page: number): Promise<Result<IntakeData[]>>;
  getIntakeById(intakeId: number): Promise<Result<IntakeData>>;
  createIntake(intakeId: number): Promise<Result<IntakeData>>;
  updateIntakeById(intakeId: number, newIntakeId: number): Promise<Result<IntakeData>>;
  deleteIntakeById(intakeId: number): Promise<Result<null>>;
  getIntakeCount(query: string): Promise<Result<number>>;
}

class IntakeService implements IIntakeService {
  async getAllIntakes(query: string = "", pageSize: number, page: number): Promise<Result<IntakeData[]>> {
    const intakes: IntakeData[] = await IntakeRepository.getAllIntakes(query, pageSize, page);

    return Result.succeed(intakes, "Intakes retrieve success");
  }

  async getIntakeById(intakeId: number): Promise<Result<IntakeData>> {
    const intake: IntakeData | undefined = await IntakeRepository.getIntakeById(intakeId);

    if (!intake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Intake not found");
    }

    return Result.succeed(intake, "Intake retrieve success");
  }

  async createIntake(intakeId: number): Promise<Result<IntakeData>> {
    const response = await IntakeRepository.createIntake(intakeId);

    const intake: IntakeData | undefined = await IntakeRepository.getIntakeById(response.insertId);

    if (!intake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Intake created not found");
    }

    return Result.succeed(intake, "Intake create success");
  }

  async updateIntakeById(intakeId: number, newIntakeId: number): Promise<Result<IntakeData>> {
    await IntakeRepository.updateIntakeById(intakeId, newIntakeId);

    const intake: IntakeData | undefined = await IntakeRepository.getIntakeById(newIntakeId);

    if (!intake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Intake updated not found");
    }

    return Result.succeed(intake, "Intake update success");
  }

  async deleteIntakeById(intakeId: number): Promise<Result<null>> {
    await IntakeRepository.deleteIntakeById(intakeId);

    return Result.succeed(null, "Intake delete success");
  }

  async getIntakeCount(query: string = ""): Promise<Result<number>> {
    const intakeCount: number = await IntakeRepository.getIntakeCount(query);

    return Result.succeed(intakeCount ? intakeCount : 0, "Intake count retrieve success");
  }
}

export default new IntakeService();
