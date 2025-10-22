import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { SubjectData } from "../models/subject-model";
import SubjectRepository from "../repositories/subject.repository";

interface ISubjectService {
  getAllSubjects(query: string, pageSize: number, page: number): Promise<Result<SubjectData[]>>;
  getSubjectById(subjectId: number): Promise<Result<SubjectData>>;
  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<null>>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<null>>;
  deleteSubjectById(subjectId: number): Promise<Result<null>>;
}

class SubjectService implements ISubjectService {
  async getAllSubjects(query: string = "", pageSize: number, page: number): Promise<Result<SubjectData[]>> {
    const subjects: SubjectData[] = await SubjectRepository.getSubjects(query, pageSize, page);

    return Result.succeed(subjects, "Subjects retrieve success");
  }

  async getSubjectById(subjectId: number): Promise<Result<SubjectData>> {
    const subject: SubjectData = await SubjectRepository.getSubjectById(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<null>> {

    await SubjectRepository.createSubject(subjectCode, subjectName, description, creditHours);

    return Result.succeed(null, "Subject create success");
  }

  async updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<null>> {
    const subjectResponse: Result<SubjectData> = await this.getSubjectById(subjectId);

    if (!subjectResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid subjectId");
    }

    await SubjectRepository.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours);

    return Result.succeed(null, "Subject update success");
  }

  async deleteSubjectById(subjectId: number): Promise<Result<null>> {
    const subjectResponse: Result<SubjectData> = await this.getSubjectById(subjectId);

    if (!subjectResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid subjectId");
    }

    await SubjectRepository.deleteSubjectById(subjectId);

    return Result.succeed(null, "Subject delete success");
  }
}

export default new SubjectService();