import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { SubjectData, StudentSubjectData } from "../models/subject-model";
import subjectRepository from "../repositories/subject.repository";
import courseRepository from "../repositories/course.repository";
import { CourseSubjectData } from "../models/course-model";

interface ISubjectService {
  getSubjects(query: string, pageSize: number | null, page: number | null): Promise<Result<SubjectData[]>>;
  getSubjectById(subjectId: number): Promise<Result<SubjectData>>;
  getSubjectBySubjectCode(subjectCode: string): Promise<Result<SubjectData>>;
  getSubjectByIdAndSubjectCode(subjectId: number, subjectCode: string): Promise<Result<SubjectData>>;
  createSubject(subjectName: string, subjectCode: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<CourseSubjectData[]>>;
  deleteSubjectById(subjectId: number): Promise<Result<null>>;
  getSubjectCount(query: string): Promise<Result<number>>;
  getSubjectsByStudentId(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<Result<StudentSubjectData[]>>;
  getSubjectsCountByStudentId(studentId: number, semester: number, query: string): Promise<Result<number>>;
}

class SubjectService implements ISubjectService {
  async getSubjects(query: string = "", pageSize: number | null, page: number | null): Promise<Result<SubjectData[]>> {
    const subjects: SubjectData[] = await subjectRepository.getSubjects(query, pageSize, page);

    return Result.succeed(subjects, "Subjects retrieve success");
  }

  async getSubjectById(subjectId: number): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectById(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async getSubjectBySubjectCode(subjectCode: string): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectBySubjectCode(subjectCode);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async getSubjectByIdAndSubjectCode(subjectId: number, subjectCode: string): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectByIdAndSubjectCode(subjectId, subjectCode);

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

  async getSubjectsByStudentId(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<Result<StudentSubjectData[]>> {
    const studentEnrollmentSubject: StudentSubjectData[] = await subjectRepository.getSubjectsByStudentId(studentId, semester, query, pageSize, page);

    return Result.succeed(studentEnrollmentSubject, "Student subjects retrieve success");
  }

  async getSubjectsCountByStudentId(studentId: number, semester: number, query: string = ""): Promise<Result<number>> {
    const studentEnrollmentSubjectCount: number = await subjectRepository.getSubjectsCountByStudentId(studentId, semester, query);

    return Result.succeed(studentEnrollmentSubjectCount ? studentEnrollmentSubjectCount : 0, "Student Enrollment Subject count retrieve success");
  }
}

export default new SubjectService();
