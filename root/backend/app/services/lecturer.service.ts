import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { LecturerData, LecturerTitleData } from "../models/lecturer-model";
import lecturerRepository from "../repositories/lecturer.repository";

interface ILecturerService {
  getAllLecturers(query: string, pageSize: number, page: number): Promise<Result<LecturerData[]>>;
  getLecturerById(lecturerId: number): Promise<Result<LecturerData>>;
  getLecturerByEmail(email: string): Promise<Result<LecturerData>>;
  getLecturerByIdAndEmail(lecturerId: number, email: string): Promise<Result<LecturerData>>;
  createLecturer(firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>>;
  updateLecturerById(lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>>;
  deleteLecturerById(lecturerId: number): Promise<Result<null>>;
  getLecturerCount(query: string): Promise<Result<number>>;
  getAllLecturerTitles(): Promise<Result<LecturerTitleData[]>>;
  getLecturerTitleById(lecturerTitleId: number): Promise<Result<LecturerTitleData>>;
}

class LecturerService implements ILecturerService {
  async getAllLecturers(query: string = "", pageSize: number, page: number): Promise<Result<LecturerData[]>> {
    const lecturers: LecturerData[] = await lecturerRepository.getAllLecturers(query, pageSize, page);

    return Result.succeed(lecturers, "Lecturers retrieve success");
  }

  async getLecturerById(lecturerId: number): Promise<Result<LecturerData>> {
    const lecturer: LecturerData | undefined = await lecturerRepository.getLecturerById(lecturerId);

    if (!lecturer) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer not found");
    }

    return Result.succeed(lecturer, "Lecturer retrieve success");
  }

  async getLecturerByEmail(email: string): Promise<Result<LecturerData>> {
    const lecturerData: LecturerData | undefined = await lecturerRepository.getLecturerByEmail(email);

    if (!lecturerData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer not found");
    }

    return Result.succeed(lecturerData, "Lecturer retrieve success");
  }

  async getLecturerByIdAndEmail(lecturerId: number, email: string): Promise<Result<LecturerData>> {
    const lecturerData: LecturerData | undefined = await lecturerRepository.getLecturerByIdAndEmail(lecturerId, email);

    if (!lecturerData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer not found");
    }

    return Result.succeed(lecturerData, "Lecturer retrieve success");
  }

  async createLecturer(firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>> {
    const response = await lecturerRepository.createLecturer(firstName, lastName, lecturerTitleId, email, phoneNumber);

    if (!response.insertId) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to create lecturer");
    }

    const lecturerResponse: LecturerData | undefined = await lecturerRepository.getLecturerById(response.insertId);

    if (!lecturerResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer created not found");
    }

    return Result.succeed(lecturerResponse, "Lecturer create success");
  }

  async updateLecturerById(lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Result<LecturerData>> {
    const updateLecturerResponse = await lecturerRepository.updateLecturerById(lecturerId, firstName, lastName, lecturerTitleId, email, phoneNumber);

    if (updateLecturerResponse.affectedRows === 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to update lecturer");
    }

    const lecturerResponse: LecturerData | undefined = await lecturerRepository.getLecturerById(lecturerId);

    if (!lecturerResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer updated not found");
    }

    return Result.succeed(lecturerResponse, "Lecturer update success");
  }

  async deleteLecturerById(lecturerId: number): Promise<Result<null>> {
    await lecturerRepository.deleteLecturerById(lecturerId);

    return Result.succeed(null, "Lecturer delete success");
  }

  async getLecturerCount(query: string = ""): Promise<Result<number>> {
    const lecturerCount: number = await lecturerRepository.getLecturerCount(query);

    return Result.succeed(lecturerCount ? lecturerCount : 0, "Lecturer count retrieve success");
  }

  async getAllLecturerTitles(): Promise<Result<LecturerTitleData[]>> {
    const lecturerTitle: LecturerTitleData[] = await lecturerRepository.getAllLecturerTitles();

    return Result.succeed(lecturerTitle, "Lecturer title retrieve success");
  }

  async getLecturerTitleById(lecturerTitleId: number): Promise<Result<LecturerTitleData>> {
    const lecturerTitle: LecturerTitleData | undefined = await lecturerRepository.getLecturerTitleById(lecturerTitleId);

    if (!lecturerTitle) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Lecturer title not found");
    }

    return Result.succeed(lecturerTitle, "Lecturer title retrieve success");
  }
}

export default new LecturerService();
