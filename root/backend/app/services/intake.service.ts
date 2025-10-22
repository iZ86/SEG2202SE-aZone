import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { IntakeData } from "../models/intake-model";
import IntakeRepository from "../repositories/intake.repository";

interface IInterfaceService {
  getAllIntakes(query: string, pageSize: number, page: number): Promise<Result<IntakeData[]>>;
  getIntakeById(intakeId: number): Promise<Result<IntakeData>>;
  createIntake(intakeId: number): Promise<Result<null>>;
  updateIntakeById(intakeId: number, newIntakeId: number): Promise<Result<null>>;
  deleteIntakeById(intakeId: number): Promise<Result<null>>;
}

class InterfaceService implements IInterfaceService {
  async getAllIntakes(query: string = "", pageSize: number, page: number): Promise<Result<IntakeData[]>> {
    const intakes: IntakeData[] = await IntakeRepository.getIntakes(query, pageSize, page);

    return Result.succeed(intakes, "Intakes retrieve success");
  }

  async getIntakeById(intakeId: number): Promise<Result<IntakeData>> {
    const intake: IntakeData = await IntakeRepository.getIntakeById(intakeId);

    if (!intake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Intake not found");
    }

    return Result.succeed(intake, "Intake retrieve success");
  }

  async createIntake(intakeId: number): Promise<Result<null>> {
    await IntakeRepository.createIntake(intakeId);

    return Result.succeed(null, "Intake create success");
  }

  async updateIntakeById(intakeId: number, newIntakeId: number): Promise<Result<null>> {
    const intakeResponse: Result<IntakeData> = await this.getIntakeById(intakeId);

    if (!intakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid intakeId");
    }

    await IntakeRepository.updateIntakeById(intakeId, newIntakeId);

    return Result.succeed(null, "Intake update success");
  }

  async deleteIntakeById(intakeId: number): Promise<Result<null>> {
    const intakeResponse: Result<IntakeData> = await this.getIntakeById(intakeId);

    if (!intakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid intakeId");
    }
    
    await IntakeRepository.deleteIntakeById(intakeId);

    return Result.succeed(null, "Intake delete success");
  }
}

export default new InterfaceService();