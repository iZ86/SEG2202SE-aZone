import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { SubjectData } from "../models/subject-model";
import SubjectRepository from "../repositories/subject.repository";

interface ISubjectService {
  getAllSubjects(query: string, pageSize: number, page: number): Promise<Result<SubjectData[]>>;
  getSubjectById(subjectId: number): Promise<Result<SubjectData>>;
  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<SubjectData>>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<SubjectData>>;
  deleteSubjectById(subjectId: number): Promise<Result<null>>;
}

class SubjectService implements ISubjectService {
  async getAllSubjects(query: string = "", pageSize: number, page: number): Promise<Result<SubjectData[]>> {
    const subjects: SubjectData[] = await SubjectRepository.getAllSubjects(query, pageSize, page);

    return Result.succeed(subjects, "Subjects retrieve success");
  }

  async getSubjectById(subjectId: number): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await SubjectRepository.getSubjectById(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<SubjectData>> {
    const response: ResultSetHeader = await SubjectRepository.createSubject(subjectCode, subjectName, description, creditHours);
    const subject: SubjectData | undefined = await SubjectRepository.getSubjectById(response.insertId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject created not found");
    }

    return Result.succeed(subject, "Subject create success");
  }

  async updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number): Promise<Result<SubjectData>> {
    await SubjectRepository.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours);
    const subject: SubjectData |undefined = await SubjectRepository.getSubjectById(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject updated not found");
    }

    return Result.succeed(subject, "Subject update success");
  }

  async deleteSubjectById(subjectId: number): Promise<Result<null>> {
    await SubjectRepository.deleteSubjectById(subjectId);

    return Result.succeed(null, "Subject delete success");
  }
}

export default new SubjectService();
