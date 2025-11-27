import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { SubjectData } from "../models/subject-model";
import subjectRepository from "../repositories/subject.repository";
import courseRepository from "../repositories/course.repository";
import { CourseSubjectData } from "../models/course-model";

interface ISubjectService {
  getAllSubjects(query: string, pageSize: number, page: number): Promise<Result<SubjectData[]>>;
  getSubjectById(subjectId: number): Promise<Result<SubjectData>>;
  getSubjectByName(subjectName: string): Promise<Result<SubjectData>>;
  createSubject(subjectName: string, subjectCode: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>>;
  deleteSubjectById(subjectId: number): Promise<Result<null>>; getSubjectCount(query: string): Promise<Result<number>>;
}

class SubjectService implements ISubjectService {
  async getAllSubjects(query: string = "", pageSize: number, page: number): Promise<Result<SubjectData[]>> {
    const subjects: SubjectData[] = await subjectRepository.getAllSubjects(query, pageSize, page);

    return Result.succeed(subjects, "Subjects retrieve success");
  }

  async getSubjectById(subjectId: number): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectById(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async getSubjectByName(subjectName: string): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectByName(subjectName);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async createSubject(subjectName: string, subjectCode: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>> {
    const response: ResultSetHeader = await subjectRepository.createSubject(subjectCode, subjectName, description, creditHours);

    if (courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map((courseId) =>
          courseRepository.createCourseSubject(courseId, response.insertId)
        )
      );
    }

    const subject: CourseSubjectData[] | undefined = await courseRepository.getCourseSubjectBySubjectId(response.insertId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject created not found");
    }

    return Result.succeed(subject, "Subject create success");
  }

  async updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>> {
    await subjectRepository.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours);
    await courseRepository.deleteCourseSubjectByAndSubjectId(subjectId);

    if (courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map((courseId) =>
          courseRepository.createCourseSubject(courseId, subjectId)
        )
      );
    }

    const subject: CourseSubjectData[] | undefined = await courseRepository.getCourseSubjectBySubjectId(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject created not found");
    }

    return Result.succeed(subject, "Subject update success");
  }

  async deleteSubjectById(subjectId: number): Promise<Result<null>> {
    await subjectRepository.deleteSubjectById(subjectId);

    return Result.succeed(null, "Subject delete success");
  }

  async getSubjectCount(query: string = ""): Promise<Result<number>> {
    const subjectCount: number = await subjectRepository.getSubjectCount(query);

    return Result.succeed(subjectCount ? subjectCount : 0, "Subject count retrieve success");
  }
}

export default new SubjectService();
