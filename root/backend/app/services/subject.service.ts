import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { SubjectData } from "../models/subject-model";
import SubjectRepository from "../repositories/subject.repository";
import CourseRepository from "../repositories/course.repository";
import { CourseSubjectData } from "../models/course-model";

interface ISubjectService {
  getAllSubjects(query: string, pageSize: number, page: number): Promise<Result<SubjectData[]>>;
  getSubjectById(subjectId: number): Promise<Result<SubjectData>>;
  createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>>;
  deleteSubjectById(subjectId: number): Promise<Result<null>>; getSubjectCount(query: string): Promise<Result<number>>;
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

  async createSubject(subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>> {
    const response: ResultSetHeader = await SubjectRepository.createSubject(subjectCode, subjectName, description, creditHours);

    if (courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map((courseId) =>
          CourseRepository.createCourseSubject(courseId, response.insertId)
        )
      );
    }

    const subject: CourseSubjectData[] | undefined = await CourseRepository.getCourseSubjectBySubjectId(response.insertId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject created not found");
    }

    return Result.succeed(subject, "Subject create success");
  }

  async updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>> {
    await SubjectRepository.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours);
    await CourseRepository.deleteCourseSubjectByAndSubjectId(subjectId);

    if (courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map((courseId) =>
          CourseRepository.createCourseSubject(courseId, subjectId)
        )
      );
    }

    const subject: CourseSubjectData[] | undefined = await CourseRepository.getCourseSubjectBySubjectId(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject created not found");
    }

    return Result.succeed(subject, "Subject update success");
  }

  async deleteSubjectById(subjectId: number): Promise<Result<null>> {
    await SubjectRepository.deleteSubjectById(subjectId);

    return Result.succeed(null, "Subject delete success");
  }

  async getSubjectCount(query: string = ""): Promise<Result<number>> {
    const subjectCount: number = await SubjectRepository.getSubjectCount(query);

    return Result.succeed(subjectCount ? subjectCount : 0, "Subject count retrieve success");
  }
}

export default new SubjectService();
