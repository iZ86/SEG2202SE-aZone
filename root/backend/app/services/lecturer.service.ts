import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { LecturerWithCountData, LecturerData, LecturerTitleData } from "../models/lecturer-model";
import lecturerRepository from "../repositories/lecturer.repository";

interface ILecturerService {
  getLecturers(query: string, pageSize: number, page: number): Promise<Result<LecturerWithCountData>>;
  getLecturerById(lecturerId: number): Promise<Result<LecturerData>>;
  createLecturer(firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>>;
  updateLecturerById(lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>>;
  deleteLecturerById(lecturerId: number): Promise<Result<null>>;
  getLecturerTitles(): Promise<Result<LecturerTitleData[]>>;
  getLecturerTitleById(lecturerTitleId: number): Promise<Result<LecturerTitleData>>;
}

class LecturerService implements ILecturerService {
  public async getLecturers(query: string, pageSize: number, page: number): Promise<Result<LecturerWithCountData>> {
    const lecturers: LecturerData[] = await lecturerRepository.getLecturers(query, pageSize, page);

    const lecturerCount: Result<number> = await this.getLecturerCount(query);

    return Result.succeed({lecturers, lecturerCount: lecturerCount.getData()}, "Lecturers retrieve success");
  }

  public async getLecturerById(lecturerId: number): Promise<Result<LecturerData>> {
    const lecturer: LecturerData | undefined = await lecturerRepository.getLecturerById(lecturerId);

    if (!lecturer) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer not found");
    }

    return Result.succeed(lecturer, "Lecturer retrieve success");
  }

  private async getLecturerByEmail(email: string): Promise<Result<LecturerData>> {
    const lecturerData: LecturerData | undefined = await lecturerRepository.getLecturerByEmail(email);

    if (!lecturerData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer not found");
    }

    return Result.succeed(lecturerData, "Lecturer retrieve success");
  }

  public async createLecturer(firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>> {

    // Check param exist.
    const lecturerTitleResult: Result<LecturerTitleData> = await this.getLecturerTitleById(lecturerTitleId);
    if (!lecturerTitleResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, lecturerTitleResult.getMessage());
    }

    const lecturerResult: Result<LecturerData> = await this.getLecturerByEmail(email);

    if (lecturerResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Lecturer email already exists");
    }

    const createLecturerResult: ResultSetHeader = await lecturerRepository.createLecturer(firstName, lastName, lecturerTitleId, email, phoneNumber);

    if (createLecturerResult.affectedRows === 0) {
      throw new Error("createLecturer failed to insert");
    }

    const lecturer: Result<LecturerData> = await this.getLecturerById(createLecturerResult.insertId);

    if (!lecturer.isSuccess()) {
      throw new Error("createCourse created course created not found");
    }

    return Result.succeed(lecturer.getData(), "Lecturer create success");
  }

  public async updateLecturerById(lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>> {

    // Check param exist.
    const lecturerTitleResult: Result<LecturerTitleData> = await this.getLecturerTitleById(lecturerTitleId);
    if (!lecturerTitleResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, lecturerTitleResult.getMessage());
    }

    const lecturerResult: Result<LecturerData> = await this.getLecturerById(lecturerId);
    if (!lecturerResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, lecturerResult.getMessage());
    }
    

    if (lecturerResult.getData().email !== email) {
      const isLecturerEmailExistResult: Result<LecturerData> = await this.getLecturerByEmail(email);

      if (isLecturerEmailExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Lecturer email already exists");
      }
    }

    const updateLecturerResult: ResultSetHeader = await lecturerRepository.updateLecturerById(lecturerId, firstName, lastName, lecturerTitleId, email, phoneNumber);

    if (updateLecturerResult.affectedRows === 0) {
      throw new Error("updateLecturerById failed to update");
    }

    const lecturer: Result<LecturerData> = await this.getLecturerById(lecturerId);

    if (!lecturer.isSuccess()) {
      throw new Error("createCourse created course created not found");
    }

    return Result.succeed(lecturer.getData(), "Lecturer update success");
  }

  public async deleteLecturerById(lecturerId: number): Promise<Result<null>> {
    const lecturerResult: Result<LecturerData> = await this.getLecturerById(lecturerId);

    if (!lecturerResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, lecturerResult.getMessage());
    }

    const deleteLecturerResult: ResultSetHeader = await lecturerRepository.deleteLecturerById(lecturerId);

    if (deleteLecturerResult.affectedRows === 0) {
      throw new Error("deleteLecturerById failed to delete");
    }

    return Result.succeed(null, "Lecturer delete success");
  }

  private async getLecturerCount(query: string = ""): Promise<Result<number>> {
    const lecturerCount: number = await lecturerRepository.getLecturerCount(query);

    return Result.succeed(lecturerCount, "Lecturer count retrieve success");
  }

  public async getLecturerTitles(): Promise<Result<LecturerTitleData[]>> {
    const lecturerTitle: LecturerTitleData[] = await lecturerRepository.getLecturerTitles();

    return Result.succeed(lecturerTitle, "Lecturer title retrieve success");
  }

  public async getLecturerTitleById(lecturerTitleId: number): Promise<Result<LecturerTitleData>> {
    const lecturerTitle: LecturerTitleData | undefined = await lecturerRepository.getLecturerTitleById(lecturerTitleId);

    if (!lecturerTitle) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer title not found");
    }

    return Result.succeed(lecturerTitle, "Lecturer title retrieve success");
  }
}

export default new LecturerService();
