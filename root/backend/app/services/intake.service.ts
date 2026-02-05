import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { IntakeData } from "../models/intake-model";
import intakeRepository from "../repositories/intake.repository";

interface IIntakeService {
  getIntakes(query: string, pageSize: number | null, page: number | null): Promise<Result<IntakeData[]>>;
  getIntakeById(intakeId: number): Promise<Result<IntakeData>>;
  createIntake(intakeId: number): Promise<Result<IntakeData>>;
  updateIntakeById(intakeId: number, newIntakeId: number): Promise<Result<IntakeData>>;
  deleteIntakeById(intakeId: number): Promise<Result<null>>;
  getIntakeCount(query: string): Promise<Result<number>>;
}

class IntakeService implements IIntakeService {
  async getIntakes(query: string = "", pageSize: number | null, page: number | null): Promise<Result<IntakeData[]>> {
    const intakes: IntakeData[] = await intakeRepository.getIntakes(query, pageSize, page);

    return Result.succeed(intakes, "Intakes retrieve success");
  }

  async getIntakeById(intakeId: number): Promise<Result<IntakeData>> {
    const intake: IntakeData | undefined = await intakeRepository.getIntakeById(intakeId);

    if (!intake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Intake not found");
    }

    return Result.succeed(intake, "Intake retrieve success");
  }

  async createIntake(intakeId: number): Promise<Result<IntakeData>> {
    const intakeResult: Result<IntakeData> = await this.getIntakeById(intakeId);

    if (intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Intake already exists");
    }

    const createIntakeResult: ResultSetHeader = await intakeRepository.createIntake(intakeId);

    if (createIntakeResult.affectedRows === 0) {
      throw new Error("createIntake failed to insert");
    }

    const intake: Result<IntakeData> = await this.getIntakeById(createIntakeResult.insertId);

    if (!intake.isSuccess()) {
      throw new Error("createIntake created intake not found");
    }

    return Result.succeed(intake.getData(), "Intake create success");
  }

  async updateIntakeById(intakeId: number, newIntakeId: number): Promise<Result<IntakeData>> {
    const intakeResult: Result<IntakeData> = await this.getIntakeById(intakeId);

    if (!intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, intakeResult.getMessage());
    }

    if (intakeResult.getData().intakeId !== newIntakeId) {
      const isIntakeExistResult: Result<IntakeData> = await this.getIntakeById(newIntakeId);

      if (isIntakeExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Intake already exists");
      }
    }

    const updateIntakeResult: ResultSetHeader = await intakeRepository.updateIntakeById(intakeId, newIntakeId);

    if (updateIntakeResult.affectedRows === 0) {
      throw new Error("updateIntakeById failed to update");
    }

    const intake: Result<IntakeData> = await this.getIntakeById(newIntakeId);

    if (!intake.isSuccess()) {
      throw new Error("updateIntakeById updated intake not found");
    }

    return Result.succeed(intake.getData(), "Intake update success");
  }

  async deleteIntakeById(intakeId: number): Promise<Result<null>> {
    const intakeResult: Result<IntakeData> = await this.getIntakeById(intakeId);

    if (!intakeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, intakeResult.getMessage());
    }

    const deleteIntakeResult: ResultSetHeader = await intakeRepository.deleteIntakeById(intakeId);

    if (deleteIntakeResult.affectedRows === 0) {
      throw new Error("deleteIntakeById failed to delete");
    }

    return Result.succeed(null, "Intake delete success");
  }

  async getIntakeCount(query: string = ""): Promise<Result<number>> {
    const intakeCount: number = await intakeRepository.getIntakeCount(query);

    return Result.succeed(intakeCount ? intakeCount : 0, "Intake count retrieve success");
  }
}

export default new IntakeService();
